from pydantic import BaseModel
from typing import Optional

# get and post schemas for data integrity and validation


class GetDataSchema(BaseModel):
    type: str
    sql_type: str
    cro: Optional[str] = None
    assay_type: Optional[str] = None
    n_limit: Optional[int] = 20
    compound_id: Optional[str]
    get_mnum_rows: Optional[str] = "false"
    variant: Optional[str] = None
    washout: Optional[str] = None
    passage_nbr: Optional[str] = None
    # BIOCHEM
    atp_conc_um: Optional[str] = None
    target: Optional[str] = "null"
    cofactors: Optional[str] = "null"
    # CELLULAR
    cell_line: Optional[str] = None
    pct_serum: Optional[int] = None
    cell_incubation_hr: Optional[int] = None
