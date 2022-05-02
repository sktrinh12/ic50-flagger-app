from fastapi import FastAPI, Response, Request, HTTPException, status
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
async def get_data(compound_id: str, type: str) -> Response:
    if not compound_id.startswith('FT') and len(compound_id) != 8:
        raise HTTPException(status_code=404, detail=f"{compound_id} is invalid")
    results = get_table_data(compound_id, type)
    return results

@app.post("/v1/change-data", tags=["post-data"])
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
