from pydantic import BaseModel
from typing import Optional, Union


class BasicSchema(BaseModel):
    compound_id: str
    type: str
    sql_type: str
    get_mnum_rows: str
    cro: Optional[str] = None
    assay: Optional[str] = None
    variant: Optional[str] = None
    # BIOCHEM
    atp_conc: Optional[float] = None
    target: Optional[str] = None
    cofactors: Optional[str] = None
    modifier: Optional[str] = None
    # CELLULAR
    cell_line: Optional[str] = None
    pct_serum: Optional[int] = None
    washout: Optional[str] = None
    passage_nbr: Optional[str] = None
    cell_incu_hr: Optional[int] = None
