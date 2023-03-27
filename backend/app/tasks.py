# from celery import Celery
# from celery.schedules import crontab
from json import dumps
from os import getenv
from app.db import generic_oracle_query
from app.redis_connection import redis_conn

ENV = getenv("ENV", "DEV")

# celery = Celery(
#     __name__,
#     broker=f"redis://:{getenv('REDIS_PASSWD')}@{getenv('REDIS_HOST')}:6379/0",
#     backend=f"redis://:{getenv('REDIS_PASSWD')}@{getenv('REDIS_HOST')}:6379/0",
# )
# celery.conf.timezone = "UTC"


def update_redis_cache(sql, key):
    payload = generic_oracle_query(
        sql,
        {"SQL_TYPE": "blank"},
    )
    if ENV == "DEV":
        print(payload)
    if not payload:
        raise ValueError("No payload returned")
    if redis_conn.exists(key):
        redis_conn.delete(key)
    for it in payload:
        redis_conn.lpush(key, dumps(it[0]))


tasks_freq = [
    (
        """SELECT DISTINCT FORMATTED_ID FROM
        C$PINPOINT.REG_DATA WHERE FORMATTED_ID LIKE 'FT%'
        """,
        "compound_ids",
    ),
]

tasks_infreq = [
    (
        """SELECT DISTINCT CRO FROM
        DS3_USERDATA.SU_CELLULAR_GROWTH_DRC
        """,
        "cros",
    ),
    (
        """SELECT DISTINCT VARIANT FROM
        DS3_USERDATA.SU_CELLULAR_GROWTH_DRC
        WHERE VARIANT IS NOT NULL
        """,
        "variant",
    ),
    (
        """SELECT DISTINCT CELL_LINE FROM
        DS3_USERDATA.SU_CELLULAR_GROWTH_DRC
        WHERE CELL_LINE IS NOT NULL
        """,
        "cell_line",
    ),
    (
        """SELECT DISTINCT ASSAY_TYPE FROM
        DS3_USERDATA.SU_CELLULAR_GROWTH_DRC
        WHERE ASSAY_TYPE IS NOT NULL
        """,
        "cell_assay_type",
    ),
    (
        """SELECT DISTINCT CELL_INCUBATION_HR FROM
        DS3_USERDATA.SU_CELLULAR_GROWTH_DRC
        WHERE CELL_INCUBATION_HR IS NOT NULL
        """,
        "cell_incub",
    ),
    (
        """SELECT DISTINCT PCT_SERUM FROM
        DS3_USERDATA.SU_CELLULAR_GROWTH_DRC
        """,
        "pct_serum",
    ),
]

# for task in tasks:
#     task_name = f"update_redis_cache_{task[1]}"
#     schedule_name = f"{task[1]}_schedule"
#     celery.conf.beat_schedule[schedule_name] = {
#         "task": task_name,
#         "schedule": crontab(hour=task[2], day_of_week="0-4"),
#     }

#     # @celery.task(name=task_name)
#     def update_redis_task():
#         update_redis_cache(task[0], task[1])

# Get a list of registered tasks
# registered_tasks = celery.control.inspect()

# # Print the list of registered tasks
# if registered_tasks:
#     print("The following tasks are registered:")
#     print(registered_tasks.scheduled())
# else:
#     print("No tasks are registered.")

# # Get a list of active tasks and their status
# active_tasks = registered_tasks.active()

# # Print the status of each active task
# if active_tasks:
#     print("The following tasks are active:")
#     print(active_tasks)
#     print(registered_tasks.resererved())
# else:
#     print("No tasks are active.")
