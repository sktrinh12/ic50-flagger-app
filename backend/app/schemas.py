from pydantic import BaseModel
from typing import Union, Optional


class GetDataSchema(BaseModel):
    compound_id: str
    type: str
    sql_type: str
    get_mnum_rows: str
    cro: Optional[str] = None
    assay: Optional[str] = None
    variant: Optional[str] = None
    # BIOCHEM
    atp_conc: Union[float, str] = "NULL"
    target: Optional[str] = None
    cofactors: Optional[str] = None
    modifier: Optional[str] = None
    # CELLULAR
    cell_line: Optional[str] = None
    pct_serum: Optional[int] = None
    washout: Optional[str] = None
    passage_nbr: Optional[str] = None
    cell_incu_hr: Union[int, str] = "NULL"


class PostDataResponseSchema(BaseModel):
    FLAG: int
    PID: str
    BATCH_ID: str
    COMMENT_TEXT: str
