from fastapi import FastAPI, Response, Request, HTTPException, Depends, status
from .db import *
from fastapi.middleware.cors import CORSMiddleware
from .schemas import BasicSchema

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
async def get_data(mdata: BasicSchema = Depends()): #-> Response:
    if not mdata.compound_id.startswith('FT') and len(mdata.compound_id) != 8:
        raise HTTPException(status_code=404, detail=f"{mdata.compound_id} is invalid")
    payload = {}
    payload['COMPOUND_ID'] = mdata.compound_id
    payload['GET_M_NUM_ROWS'] = eval(mdata.get_mnum_rows.title())
    payload['TYPE'] = mdata.type.upper()
    payload['SQL_TYPE'] = mdata.sql_type.upper()
    if mdata.cro:
        payload['CRO'] = mdata.cro
    if mdata.target:
        payload['TARGET'] = mdata.target.upper()
    if mdata.variant:
        payload['VARIANT'] = mdata.variant.upper()
    if mdata.cofactors:
        payload['COFACTORS'] = mdata.cofactors.upper()
    if mdata.assay:
        payload['ASSAY_TYPE'] = mdata.assay
    if mdata.atp_conc:
        payload['ATP_CONC_UM'] = mdata.atp_conc
    if mdata.modifier:
        payload['MODIFIER'] = mdata.modifier.upper()
    # CELLULAR
    if mdata.pct_serum:
        payload['PCT_SERUM'] = mdata.pct_serum
    if mdata.cell_line:
        payload['CELL_LINE'] = mdata.cell_line.upper()
    if mdata.washout:
        payload['WASHOUT'] = mdata.washout.upper()
    if mdata.passage_nbr:
        payload['PASSAGE_NUMBER'] = mdata.passage_nbr.upper()
    if mdata.cell_incu_hr:
        payload['CELL_INCUBATION_HR'] = mdata.cell_incu_hr
    sql_stmt, return_payload = generate_sql_stmt(payload)
    results = get_table_data(sql_stmt, return_payload)
    return results


@app.post("/v1/change-data", tags=["post-data"])
async def update_data(sql_type: str, type: str, request: Request):
    payload = await request.json()
    if not payload["BATCH_ID"].startswith('FT') and \
        len(payload["BATCH_ID"]) != 8:
        raise HTTPException(status_code=404,
                            detail=f"{payload['BATCH_ID']} is invalid")
    if payload["FLAG"] not in [0, 1]:
        raise HTTPException(status_code=405,
                            detail=f"{payload['FLAG']} is not acceptable")
    payload['SQL_TYPE'] = sql_type.upper()
    payload['TYPE'] = type.upper()
    sql_stmt, rtn_payload = generate_sql_stmt(payload)
    print(payload)
    post_result = generic_oracle_query(sql_stmt, payload)
    post_result = post_result | dict(STATUS_CODE=status.HTTP_200_OK)
    return post_result
