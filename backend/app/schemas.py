from pydantic import BaseModel
from typing import Optional

# get and post schemas for data integrity and validation


class GetDataSchema(BaseModel):
    compound_id: str
    type: str
    sql_type: str
    get_mnum_rows: str
    cro: Optional[str] = None
    assay: Optional[str] = None
    variant: Optional[str] = None
    # BIOCHEM
    atp_conc_um: Optional[int] = 0
    target: Optional[str] = None
    cofactors: Optional[str] = None
    modifier: Optional[str] = None
    # CELLULAR
    cell_line: Optional[str] = None
    pct_serum: Optional[int] = None
    washout: Optional[str] = None
    passage_nbr: Optional[str] = None
    cell_incu_hr: Optional[int] = 0


# class PostDataResponseSchema(BaseModel):
#     FLAG: int
#     PID: str
#     BATCH_ID: str
#     COMMENT_TEXT: str
