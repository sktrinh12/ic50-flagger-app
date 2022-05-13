from fastapi import FastAPI, Response, Request, HTTPException, status
from typing import Optional
from .db import *
from fastapi.middleware.cors import CORSMiddleware

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
async def get_data(compound_id: str,
                   type: str,
                   sql_type: str,
                   get_mnum_rows: str,
                   cro: Optional[str] = None,
                   assay: Optional[str] = None,
                   atp_conc: Optional[float] = None,
                   target: Optional[str] = None,
                   variant: Optional[str] = None,
                   cofactors: Optional[str] = None,
                   modifier: Optional[str] = None
                   ) -> Response:
    if not compound_id.startswith('FT') and len(compound_id) != 8:
        raise HTTPException(status_code=404, detail=f"{compound_id} is invalid")
    payload = {}
    payload['COMPOUND_ID'] = compound_id
    payload['GET_M_NUM_ROWS'] = eval(get_mnum_rows.title())
    payload['TYPE'] = type.upper()
    payload['SQL_TYPE'] = sql_type.upper()
    if cro:
        payload['CRO'] = cro
    if target:
        payload['TARGET'] = target.upper()
    if variant:
        payload['VARIANT'] = variant.upper()
    if cofactors:
        payload['COFACTORS'] = cofactors.upper()
    if assay:
        payload['ASSAY_TYPE'] = assay
    if atp_conc:
        payload['ATP_CONC_UM'] = atp_conc
    if modifier:
        payload['MODIFIER'] = modifier.upper()
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
