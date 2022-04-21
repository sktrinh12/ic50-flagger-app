from fastapi import FastAPI, Response, Request, HTTPException, status
from .db import *

app = FastAPI()


@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.get("/v1/get-data", tags=["get-data"])
async def get_data(ft_nbr: str, type: str) -> Response:
    if not ft_nbr.startswith('FT') and len(ft_nbr) != 8:
        raise HTTPException(status_code=404, detail=f"{ft_nbr} is invalid")
    results = get_table_data(ft_nbr, type)
    return results

@app.post("/v1/update-data", tags=["post-data"])
async def update_data(request: Request):
    payload = await request.json()
    if not payload["BATCH_ID"].startswith('FT') and \
        len(payload["BATCH_ID"]) != 8:
        raise HTTPException(status_code=404,
                            detail=f"{payload['BATCH_ID']} is invalid")
    if payload["FLAG"] not in [0, 1]:
        raise HTTPException(status_code=405,
                            detail=f"{payload['FLAG']} is not acceptable")
    post_result = update_table_data(payload)
    post_result = post_result | dict(STATUS_CODE=status.HTTP_200_OK)
    return post_result
