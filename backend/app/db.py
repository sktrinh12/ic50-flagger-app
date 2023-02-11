from .oracle_class import OracleConnection, cx_Oracle
from .credentials import cred_dct
from .sql import sql_cmds, field_names_dct
from datetime import datetime
from os import getenv
import re

ENV = getenv("INSTANCE_TYPE", None)
CREDS_ARG = getenv("ORACLE_CREDS_ARG", "dev")


def generate_sql_stmt(payload):
    """
    dynamically build sql statement string based on
    conditions. Builds from sql module to inject the
    base statement and appends as where clauses
    """
    sql_stmt = None
    if payload["SQL_TYPE"] == "GET":
        if payload["TYPE"] == "BIOCHEM_ALL":
            sql_stmt = sql_cmds["GEOMEAN_BIO_ALL"]

            if payload["PIDS"]:
                sql_stmt += f""" WHERE t3.PID IN ({','.join(["'"+p+"'" for p in payload["PIDS"]])})"""
            else:
                sql_stmt += f"WHERE t3.COMPOUND_ID = '{payload['COMPOUND_ID']}'"
                if payload["GET_MNUM_ROWS"]:
                    sql_stmt += f""" AND t3.CRO = '{payload["CRO"]}'
                      AND t3.ATP_CONC_UM {'IS NULL' if re.search('null', payload["ATP_CONC_UM"], re.IGNORECASE) else f"= {payload['ATP_CONC_UM']}"}
                      AND t3.ASSAY_TYPE = '{payload["ASSAY_TYPE"]}'
                      AND t3.TARGET = '{payload["TARGET"]}'
                      AND t3.VARIANT {'IS NULL' if payload["VARIANT"].upper() == 'NULL' or payload["VARIANT"] is None else f"= '{payload['VARIANT']}'"}
                      AND t3.COFACTORS {'IS NULL' if payload["COFACTORS"].upper() == 'NULL' or payload["COFACTORS"] is None else f"= '{payload['COFACTORS']}'"}
                   """

        elif payload["TYPE"] == "BIOCHEM_AGG":
            sql_stmt = sql_cmds["GEOMEAN_BIO_ALL"]

            if payload["PIDS"]:
                sql_stmt += f""" WHERE t3.PID IN ({','.join(["'"+p+"'" for p in payload["PIDS"]])})"""
            else:
                sql_stmt += f" WHERE t3.COMPOUND_ID = '{payload['COMPOUND_ID']}'"

                if payload["GET_MNUM_ROWS"] or payload["TYPE"] == "BIOCHEM_AGG":
                    sql_stmt += f"""
                  AND t3.CRO = '{payload["CRO"]}'
                  AND t3.TARGET {'IS NULL' if payload["TARGET"] == 'NULL' or payload["TARGET"] is None else f"= '{payload['TARGET']}'"}
                  AND t3.ATP_CONC_UM = {payload["ATP_CONC_UM"]}
                  AND t3.ASSAY_TYPE = '{payload["ASSAY_TYPE"]}'
                  AND t3.COFACTORS {'IS NULL' if re.search('null',
                                                      payload["COFACTORS"], re.IGNORECASE) or payload["COFACTORS"] is None else f"= '{payload['COFACTORS']}'"}
                  AND t3.VARIANT {'IS NULL' if bool(re.search('null', payload["VARIANT"], re.IGNORECASE)) else f"= '{payload['VARIANT']}'"}
                  """

        elif payload["TYPE"] == "BIOCHEM_STATS":
            sql_stmt = sql_cmds["GEOMEAN_BIO_STATS"].format(payload["COMPOUND_ID"])

        elif payload["TYPE"].startswith("CELLULAR"):
            if payload["TYPE"].endswith("STATS"):
                sql_stmt = sql_cmds["GEOMEAN_CELL_STATS"].format(payload["COMPOUND_ID"])
            else:
                sql_stmt = sql_cmds["GEOMEAN_CELL_ALL"]

                if payload["PIDS"]:
                    sql_stmt += f""" WHERE t3.PID IN ({','.join(["'"+p+"'" for p in payload["PIDS"]])})"""
                else:
                    sql_stmt += f" WHERE t3.COMPOUND_ID = '{payload['COMPOUND_ID']}'"

                    if payload["GET_MNUM_ROWS"] or payload["TYPE"] == "CELLULAR_AGG":
                        sql_stmt += f"""
                      AND t3.CRO = '{payload["CRO"]}'
                      AND t3.CELL_LINE {'IS NULL' if payload["CELL_LINE"] == 'NULL' or payload["CELL_LINE"] is None else f"= '{payload['CELL_LINE']}'"}
                      AND t3.PCT_SERUM = {payload["PCT_SERUM"]}
                      AND t3.ASSAY_TYPE = '{payload["ASSAY_TYPE"]}'
                      AND t3.CELL_INCUBATION_HR {'IS NULL' if
                           re.search('null', str(payload["CELL_INCUBATION_HR"]),
                                re.IGNORECASE) or payload["CELL_INCUBATION_HR"] is None else f"= {payload['CELL_INCUBATION_HR']}"}
                      AND t3.VARIANT {'IS NULL' if re.search('null', payload["VARIANT"], re.IGNORECASE) else f"= '{payload['VARIANT']}'"}
                      """
        elif payload["TYPE"] == "MSR_DATA":
            if payload["ATP_CONC_UM"]:
                param1 = payload["TARGET"]
                param2 = payload["ATP_CONC_UM"]
                param3 = (
                    "-"
                    if re.search("null", payload["COFACTORS"], re.IGNORECASE)
                    or payload["COFACTORS"] is None
                    else payload["COFACTORS"]
                )
                dsname = "su_biochem_drc"
            else:
                param1 = payload["CELL_LINE"]
                param2 = payload["CELL_INCUBATION_HR"]
                param3 = payload["PCT_SERUM"]
                dsname = "su_cellular_growth_drc"
            variant = (
                "-"
                if re.search("null", payload["VARIANT"], re.IGNORECASE)
                or not payload["VARIANT"]
                else payload["VARIANT"]
            )

            sql_stmt = sql_cmds[payload["TYPE"]].format(
                dsname=dsname,
                cro=payload["CRO"],
                assay_type=payload["ASSAY_TYPE"],
                param1=param1,
                param2=param2,
                param3=param3,
                variant=variant,
                n_limit=payload["N_LIMIT"],
            )

    elif payload["SQL_TYPE"].upper() == "UPDATE":
        sql_stmt = "ds3_userdata.update_ic50_flag"

    return sql_stmt, payload


def insert_update_flag(cur, payload, sql_stmt):
    v_result = cur.var(cx_Oracle.NUMBER)
    cur.callproc(
        sql_stmt,
        (
            payload["PID"],
            payload["FLAG"],
            payload["USER_NAME"],
            payload["COMMENT_TEXT"],
            payload["TYPE"],
            v_result,
        ),
    )
    result = v_result.getvalue()
    return result


def extract_data(output, payload):
    """
    helper function to extract data from sql output into
    a py dict to generate response object
    """
    if not output:
        print(f"No data fetched for {payload['COMPOUND_ID']}")
        return []
    output_lst = []
    prefix_type = payload["TYPE"].lower()
    if prefix_type.endswith("agg"):
        prefix_type = prefix_type.split("_")[0] + "_all"
    field_names = field_names_dct[f"{prefix_type}_fields"].copy()

    for i, r in enumerate(output):
        output_dct = {}
        output_dct["ID"] = i
        for j, n in enumerate(field_names):
            if n == "PLOT":
                output_dct[n] = r[j].read().rstrip().replace("\r\n", "")
            else:
                output_dct[n] = r[j]
        output_lst.append(output_dct)
    return output_lst


def generic_oracle_query(sql_stmt, payload):
    """
    connect to oracle db and execute the sql statement
    return as response, aka the output
    """
    try:
        with OracleConnection(
            cred_dct["USERNAME"],
            cred_dct["PASSWORD"],
            cred_dct["HOST" if CREDS_ARG.startswith("p") else "HOST-DEV"],
            cred_dct["PORT"],
            cred_dct["SID"],
        ) as con:

            if ENV is None:
                print("-" * 35)
                print(sql_stmt)
                print("-" * 35)

            with con.cursor() as cursor:
                if payload["SQL_TYPE"].upper() == "UPDATE":
                    res = insert_update_flag(con.cursor(), payload, sql_stmt)
                    return {"STATUS": f'{payload["PID"]} row updated', "RETURN": res}
                elif payload["SQL_TYPE"].upper() == "GET":
                    cursor.execute(sql_stmt)
                    result = extract_data(cursor.fetchall(), payload)
                    if ENV is None:
                        print(result)
                    return result
                else:
                    result = cursor.fetchone()
                    return result
    except Exception as e:
        print(f"ERROR {e}")
