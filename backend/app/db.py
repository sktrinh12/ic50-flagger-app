from .oracle_class import OracleConnection
from .credentials import cred_dct
from .sql import sql_cmds, field_names_dct
from datetime import datetime
from os import getenv
import re


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
                if payload["GET_M_NUM_ROWS"]:
                    sql_stmt += f""" AND t3.CRO = '{payload["CRO"]}'
                      AND t3.MODIFIER {'IS NULL' if payload["MODIFIER"].upper() == 'NULL' or payload["MODIFIER"] is None else f"= '{payload['MODIFIER']}'"}
                      AND t3.ATP_CONC_UM {'IS NULL' if bool(re.search('null', payload["ATP_CONC_UM"], re.IGNORECASE)) else f"= {payload['ATP_CONC_UM']}"}
                      AND t3.ASSAY_TYPE = '{payload["ASSAY_TYPE"]}'
                      AND t3.TARGET = '{payload["TARGET"]}'
                      AND t3.VARIANT {'IS NULL' if payload["VARIANT"].upper() == 'NULL' or payload["VARIANT"] is None else f"= '{payload['VARIANT']}'"}
                      AND t3.COFACTORS {'IS NULL' if payload["COFACTORS"].upper() == 'NULL' or payload["COFACTORS"] is None else f"= '{payload['COFACTORS']}'"}
                   """

        elif payload["TYPE"] == "BIOCHEM_AGG":
            sql_stmt = sql_cmds["GEOMEAN_BIO_AGG"].format(
                payload["COMPOUND_ID"],
                payload["CRO"],
                payload["ASSAY_TYPE"],
                payload["COFACTORS"],
                payload["ATP_CONC_UM"],
                payload["VARIANT"],
                payload["MODIFIER"],
            )

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

                    if payload["GET_M_NUM_ROWS"] or payload["TYPE"] == "CELLULAR_AGG":
                        sql_stmt += f"""
                      AND t3.CRO = '{payload["CRO"]}'
                      AND t3.CELL_LINE {'IS NULL' if payload["CELL_LINE"] == 'NULL' or payload["CELL_LINE"] is None else f"= '{payload['CELL_LINE']}'"}
                      AND t3.PCT_SERUM = {payload["PCT_SERUM"]}
                      AND t3.ASSAY_TYPE = '{payload["ASSAY_TYPE"]}'
                      AND t3.CELL_INCUBATION_HR {'IS NULL' if payload["CELL_INCUBATION_HR"] == 'NULL' or payload["CELL_INCUBATION_HR"] is None else f"= '{payload['CELL_INCUBATION_HR']}'"}
                      AND t3.VARIANT {'IS NULL' if bool(re.search('null', payload["VARIANT"], re.IGNORECASE)) else f"= {payload['VARIANT']}"}
                      """
                        # if payload["TYPE"].endswith("ALL"):
                        #     sql_stmt += f"""AND t3.WASHOUT {'IS NULL' if payload["WASHOUT"] == 'NULL' or payload["WASHOUT"] is None else f"= '{payload['WASHOUT']}'"}
                        #               AND t3.PASSAGE_NUMBER {'IS NULL' if payload["PASSAGE_NUMBER"] == 'NULL' or payload["PASSAGE_NUMBER"] is None else f"= '{payload['PASSAGE_NUMBER']}'"}
                        #               """

    elif payload["SQL_TYPE"].upper() == "UPDATE":
        sql_stmt = "UPDATE DS3_USERDATA."
        if payload["TYPE"].upper().startswith("CELLULAR"):
            sql_stmt += "CELLULAR_IC50_FLAGS"
        elif payload["TYPE"].upper().startswith("BIOCHEM"):
            sql_stmt += "BIOCHEM_IC50_FLAGS"

        sql_stmt += f""" SET FLAG = {payload["FLAG"]},
                             USER_NAME = '{payload['USER_NAME']}',
                             CHANGE_DATE = TO_TIMESTAMP('{datetime.now().strftime('%d-%b-%Y %H:%M:%S')}', 'DD-MON-YYYY HH24:MI:SS'),
                             COMMENT_TEXT = '{payload['COMMENT_TEXT']}'
                         WHERE PID = '{payload["PID"]}'
                     """

    return sql_stmt, payload


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
            cred_dct["HOST" if getenv("ORACLE_CREDS_ARG") else "HOST-DEV"],
            cred_dct["PORT"],
            cred_dct["SID"],
        ) as con:

            if getenv("INSTANCE_TYPE", None) is None:
                print("-" * 35)
                print(sql_stmt)
                print("-" * 35)

            with con.cursor() as cursor:
                cursor.execute(sql_stmt)
                if payload["SQL_TYPE"].upper() == "UPDATE":
                    con.commit()
                    return {"STATUS": f'{payload["PID"]} row updated'}
                elif payload["SQL_TYPE"].upper() == "GET":
                    result = extract_data(cursor.fetchall(), payload)
                    if getenv("INSTANCE_TYPE", None) is None:
                        print(result)
                    return result
                else:
                    result = cursor.fetchone()
                    return result
    except Exception as e:
        raise Exception(f"ERROR {e}")
