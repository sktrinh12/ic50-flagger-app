from fastapi import FastAPI, Response, Request, HTTPException, Depends, status
from .db import *
from fastapi.middleware.cors import CORSMiddleware
from .schemas import BasicSchema
from fastapi import Query
from typing import List


app = FastAPI()

origins = [
    "http://localhost:3000",
    "localhost:3000",
    "http://geomean.frontend.kinnate",
    "geomean.frontend.kinnate"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.get("/v1/fetch-data", tags=["get-data"])
async def get_data(mdata: BasicSchema = Depends(), pids: List[str] = Query(default=[])) -> Response:
    if not mdata.compound_id.startswith('FT') and len(mdata.compound_id) != 8:
        raise HTTPException(status_code=404, detail=f"{mdata.compound_id} is invalid")
    payload = {}
    payload['COMPOUND_ID'] = mdata.compound_id
    payload['TYPE'] = mdata.type.upper()
    payload['SQL_TYPE'] = mdata.sql_type.upper()
    payload['PIDS'] = pids
    payload['GET_M_NUM_ROWS'] = eval(mdata.get_mnum_rows.title())
    if pids:
        print(f"PIDS: {pids}")
    if mdata.cro:
        payload['CRO'] = mdata.cro
    if mdata.target:
        payload['TARGET'] = mdata.target
    if mdata.variant:
        payload['VARIANT'] = mdata.variant
    if mdata.cofactors:
        payload['COFACTORS'] = mdata.cofactors
    if mdata.assay:
        payload['ASSAY_TYPE'] = mdata.assay
    if mdata.atp_conc:
        payload['ATP_CONC_UM'] = str(mdata.atp_conc)
    if mdata.modifier:
        payload['MODIFIER'] = mdata.modifier
    # CELLULAR
    if mdata.pct_serum:
        payload['PCT_SERUM'] = mdata.pct_serum
    if mdata.cell_line:
        payload['CELL_LINE'] = mdata.cell_line
    if mdata.washout:
        payload['WASHOUT'] = mdata.washout.upper()
    if mdata.passage_nbr:
        payload['PASSAGE_NUMBER'] = mdata.passage_nbr
    if mdata.cell_incu_hr:
        payload['CELL_INCUBATION_HR'] = mdata.cell_incu_hr
    print(mdata)
    print(payload)
    sql_stmt, return_payload = generate_sql_stmt(payload)
    results = get_table_data(sql_stmt, return_payload)
    return results


@app.post("/v1/change-data", tags=["post-data"])
async def update_data(sql_type: str, type: str, request: Request):
    payload = await request.json()
    if not payload["BATCH_ID"].startswith('FT'):
        raise HTTPException(status_code=404,
                            detail=f"{payload['BATCH_ID']} is invalid")
    if payload["FLAG"] not in [0, 1]:
        raise HTTPException(status_code=405,
                            detail=f"{payload['FLAG']} is not acceptable")
    payload['SQL_TYPE'] = sql_type.upper()
    payload['TYPE'] = type.upper()
    sql_stmt, rtn_payload = generate_sql_stmt(payload)
    print(f'PAYLOAD: {payload}')
    post_result = generic_oracle_query(sql_stmt, payload)
    post_result = post_result | dict(STATUS_CODE=status.HTTP_200_OK)
    return post_result
