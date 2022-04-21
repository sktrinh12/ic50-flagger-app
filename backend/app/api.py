from fastapi import FastAPI, Response, HTTPException
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
