from celery import Celery
from celery.schedules import crontab
from json import dumps
from os import getenv
from .db import generic_oracle_query
from .redis_connection import redis_conn

celery = Celery(
    __name__,
    broker=f"redis://:{getenv('REDIS_PASSWD')}@127.0.0.1:6379/0",
    backend=f"redis://:{getenv('REDIS_PASSWD')}@127.0.0.1:6379/0",
)
celery.conf.beat_schedule = {
    "update_redis_cache_every_hour": {
        "task": "update_redis_cache",
        "schedule": crontab(hour="0,2,4,6,8,10,12,14,16,18", day_of_week="0-4"),
    },
}
celery.conf.timezone = "UTC"


@celery.task
def update_redis_cache():
    payload = generic_oracle_query(
        """SELECT DISTINCT FORMATTED_ID FROM
        C$PINPOINT.REG_DATA WHERE FORMATTED_ID LIKE 'FT%'
        """,
        {"SQL_TYPE": "blank"},
    )
    if not payload:
        raise ValueError("No payload returned")
    if redis_conn.exists("compound_ids"):
        redis_conn.delete("compound_ids")
    else:
        redis_conn.set("compound_ids", dumps([]))
    for cmpids in payload:
        redis_conn.lpush("compound_ids", dumps(cmpids[0]))
