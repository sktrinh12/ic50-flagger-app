from fastapi import FastAPI, Response, Request, HTTPException, Depends, status
from fastapi_utils.session import FastAPISessionMaker
from fastapi_utils.tasks import repeat_every
from .db import generic_oracle_query, generate_sql_stmt
from fastapi.middleware.cors import CORSMiddleware
from .schemas import GetDataSchema
from fastapi import Query
from typing import List
from .functions import get_msr_stats
from .redis_connection import redis_conn
from .tasks import update_redis_cache, tasks_freq, tasks_infreq
from json import loads


app = FastAPI()


# for cors
origins = [
    "http://localhost:3000",
    "http://localhost",
    "http://geomean.frontend.kinnate",
    "http://msr-viz.kinnate",
    "https://compound-comparison.kinnate.net",
    "http://compound.comparison.kinnate",
    "https://msr.kinnate.net",
    "https://geomean.kinnate.net",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# main root endpoint
@app.get("/")
def read_root():
    payload = generic_oracle_query("SELECT * FROM v$version", {"SQL_TYPE": "blank"})
    if payload:
        return {"Database Info": payload} | dict(STATUS_CODE=status.HTTP_200_OK)
    return {"Error Code": status.HTTP_400_BAD_REQUEST, "INFO": f"payload: {payload}"}


# get redis ft numbers
@app.get("/compound_ids")
def get_compound_ids():
    compound_ids = redis_conn.lrange("compound_ids", 0, -1)
    return {"data": list(map(lambda x: loads(x.decode("utf-8")), compound_ids))}


# get redis cro
@app.get("/cros")
def get_cros():
    cros = redis_conn.lrange("cros", 0, -1)
    return {"data": list(map(lambda x: loads(x.decode("utf-8")), cros))}


@app.get("/cell_assay_type")
def get_cell_assay_type():
    cell_assay_type = redis_conn.lrange("cell_assay_type", 0, -1)
    return {"data": list(map(lambda x: loads(x.decode("utf-8")), cell_assay_type))}


@app.get("/cell_line")
def get_cell_line():
    cell_line = redis_conn.lrange("cell_line", 0, -1)
    return {"data": list(map(lambda x: loads(x.decode("utf-8")), cell_line))}


@app.get("/cell_incubation_hr")
def get_cell_incubation_hr():
    cell_incubation_hr = redis_conn.lrange("cell_incub", 0, -1)
    return {"data": list(map(lambda x: loads(x.decode("utf-8")), cell_incubation_hr))}


@app.get("/pct_serum")
def get_pct_serum():
    pct_serum = redis_conn.lrange("pct_serum", 0, -1)
    return {"data": list(map(lambda x: loads(x.decode("utf-8")), pct_serum))}


@app.get("/variant")
def get_variant():
    variant = redis_conn.lrange("variant", 0, -1)
    return {"data": list(map(lambda x: loads(x.decode("utf-8")), variant))}


# fetch table data endpoint
@app.get("/v1/fetch-data", tags=["get-data"])
async def get_data(
    mdata: GetDataSchema = Depends(), pids: List[str] = Query(default=[])
) -> Response:
    if mdata.compound_id:
        if not mdata.compound_id.startswith("FT") and len(mdata.compound_id) != 8:
            raise HTTPException(
                status_code=404, detail=f"{mdata.compound_id} is invalid"
            )
        # payload["COMPOUND_ID"] = mdata.compound_id
    payload = {k.upper(): v for k, v in mdata.dict().items()}
    payload["TYPE"] = mdata.type.upper()
    payload["SQL_TYPE"] = mdata.sql_type.upper()
    payload["PIDS"] = pids
    payload["GET_MNUM_ROWS"] = eval(mdata.get_mnum_rows.title())
    payload["N_LIMIT"] = mdata.n_limit
    if pids:
        print(f"PIDS: {pids}")
    if mdata.washout:
        payload["WASHOUT"] = mdata.washout.upper()
    if mdata.cell_incubation_hr:
        payload["CELL_INCUBATION_HR"] = int(mdata.cell_incubation_hr)
    # print(mdata)
    print(payload)
    sql_stmt, return_payload = generate_sql_stmt(payload)
    # print(return_payload)
    # print("-" * 35)
    results = generic_oracle_query(sql_stmt, return_payload)
    if mdata.type == "msr_data":
        stats = get_msr_stats(results, payload["N_LIMIT"])
        results = {"data": results, "stats": stats}
    return results


# post data endpoint to update rows
@app.post("/v1/change-data", tags=["post-data"])
async def update_data(payload: Request, sql_type: str, type: str, user_name: str):
    payload = await payload.json()
    # payload = payload.dict()
    # print(payload)
    if not payload["BATCH_ID"].startswith("FT"):
        raise HTTPException(status_code=404, detail=f"{payload['BATCH_ID']} is invalid")
    if payload["FLAG"] not in [0, 1]:
        raise HTTPException(
            status_code=405, detail=f"{payload['FLAG']} is not acceptable"
        )
    payload["SQL_TYPE"] = sql_type.upper()
    payload["TYPE"] = type.upper()
    payload["USER_NAME"] = user_name
    sql_stmt, rtn_payload = generate_sql_stmt(payload)
    # print(f"PAYLOAD: {rtn_payload}")
    result = generic_oracle_query(sql_stmt, rtn_payload)
    if result:
        STATUS_CODE = status.HTTP_200_OK
    else:
        STATUS_CODE = status.HTTP_400_BAD_REQUEST
    post_result = rtn_payload | dict(STATUS_CODE=STATUS_CODE) | result
    return post_result


# @app.on_event("startup")
# @repeat_every(seconds=60 * 60 * 2)  # every 2 hours
# def update_redis_cach_freq():
#     for tk in tasks_freq:
#         update_redis_cache(tk[0], tk[1])


# @app.on_event("startup")
# @repeat_every(seconds=60 * 60 * 5)  # every 5 hours
# def update_redis_cach_infreq():
#     for tk in tasks_infreq:
#         update_redis_cache(tk[0], tk[1])
