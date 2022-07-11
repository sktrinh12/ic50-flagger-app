from .oracle_class import OracleConnection
from .credentials import cred_dct
from os import getenv
import re

cellular_fields = [
    'PID',
    'CRO',
    'ASSAY_TYPE',
    'COMPOUND_ID',
    'EXPERIMENT_ID',
    'BATCH_ID',
    'CELL_LINE',
    'VARIANT',
    'PCT_SERUM',
    'PASSAGE_NUMBER',
    'WASHOUT',
    'CELL_INCUBATION_HR',
    'PLOT',
    'IC50_NM',
    'FLAG',
    'GEOMEAN',
]


biochem_fields = [
    'PID',
    'CRO',
    'ASSAY_TYPE',
    'COMPOUND_ID',
    'EXPERIMENT_ID',
    'BATCH_ID',
    'TARGET',
    'VARIANT',
    'COFACTORS',
    'ATP_CONC_UM',
    'MODIFIER',
    'PLOT',
    'IC50_NM',
    'FLAG',
    'GEOMEAN'
]


def generate_sql_stmt(payload):
    sql_stmt = None
    if payload["SQL_TYPE"] == "GET":
        if payload["TYPE"] == "BIOCHEM":
            sql_stmt = """SELECT
                t3.PID,
                t3.CRO,
                t3.ASSAY_TYPE,
                t3.COMPOUND_ID,
                t3.EXPERIMENT_ID,
                t3.BATCH_ID,
                t3.TARGET,
                t3.VARIANT,
                t3.COFACTORS,
                t3.ATP_CONC_UM,
                t3.MODIFIER,
                BASE64ENCODE(t3.GRAPH) as GRAPH,
                ROUND(t3.ic50_nm,2) as IC50_NM,
                t3.flag,
             ROUND( POWER(10,
               AVG( LOG(10, t3.ic50) ) OVER(PARTITION BY
                    t3.CRO,
                    t3.ASSAY_TYPE,
                    t3.COMPOUND_ID,
                    t3.TARGET,
                    t3.VARIANT,
                    t3.COFACTORS,
                    t3.ATP_CONC_UM,
                    t3.MODIFIER,
                    t3.flag
                )) * TO_NUMBER('1.0e+09'), 1) AS GEOMEAN
                FROM (
              SELECT t1.CRO,
                     t1.ASSAY_TYPE,
                     t1.experiment_id,
                     t1.COMPOUND_ID,
                     t1.BATCH_ID,
                     t1.TARGET,
                     t1.VARIANT,
                     t1.COFACTORS,
                     t1.ATP_CONC_UM,
                     t1.MODIFIER,
                     t1.GRAPH,
                     t2.flag,
                     t1.ic50,
                     t1.ic50_nm,
                     t1.PID
               FROM DS3_USERDATA.ENZYME_INHIBITION_VW t1
              INNER JOIN DS3_USERDATA.TEST2_BIOCHEM_IC50_FLAGS t2
                 ON t1.pid = t2.pid
              ) t3
              """
            if payload['PIDS']:
                sql_stmt += f""" WHERE t3.PID IN ({','.join(["'"+p+"'" for p in payload["PIDS"]])})"""
            else:
                sql_stmt += f"WHERE t3.COMPOUND_ID = '{payload['COMPOUND_ID']}'"
                if payload['GET_M_NUM_ROWS']:
                    sql_stmt += f""" AND t3.CRO = '{payload["CRO"]}'
                      AND t3.MODIFIER {'IS NULL' if payload["MODIFIER"].upper() == 'NULL' or payload["MODIFIER"] is None else f"= '{payload['MODIFIER']}'"}
                      AND t3.ATP_CONC_UM {'IS NULL' if bool(re.search('null', payload["ATP_CONC_UM"], re.IGNORECASE)) else f"= {payload['ATP_CONC_UM']}"}
                      AND t3.ASSAY_TYPE = '{payload["ASSAY_TYPE"]}'
                      AND t3.TARGET = '{payload["TARGET"]}'
                      AND t3.VARIANT {'IS NULL' if payload["VARIANT"].upper() == 'NULL' or payload["VARIANT"] is None else f"= '{payload['VARIANT']}'"}
                      AND t3.COFACTORS {'IS NULL' if payload["COFACTORS"] == 'NULL' or payload["COFACTORS"] is None else f"= '{payload['COFACTORS']}'"}
                   """

        elif payload["TYPE"] == "CELLULAR":
            sql_stmt = """SELECT
                t3.PID,
                t3.CRO,
                t3.ASSAY_TYPE,
                t3.COMPOUND_ID,
                t3.EXPERIMENT_ID,
                t3.BATCH_ID,
                t3.CELL_LINE,
                t3.VARIANT,
                t3.PCT_SERUM,
                t3.PASSAGE_NUMBER,
                t3.WASHOUT,
                t3.CELL_INCUBATION_HR,
                BASE64ENCODE(t3.GRAPH) as GRAPH,
                ROUND(t3.ic50_nm,2) as IC50_NM,
                t3.flag,
                ROUND( POWER(10,
                   AVG( LOG(10, t3.ic50) ) OVER(PARTITION BY
                    t3.CRO,
                    t3.ASSAY_TYPE,
                    t3.COMPOUND_ID,
                    t3.CELL_LINE,
                    t3.VARIANT,
                    t3.PCT_SERUM,
                    t3.WASHOUT,
                    t3.PASSAGE_NUMBER,
                    t3.CELL_INCUBATION_HR,
                    t3.flag
                )) * TO_NUMBER('1.0e+09'), 2) AS GEOMEAN
                FROM (
              SELECT t1.CRO,
                     t1.ASSAY_TYPE,
                     t1.experiment_id,
                     t1.COMPOUND_ID,
                     t1.BATCH_ID,
                     t1.CELL_LINE,
                     t1.VARIANT,
                     t1.PCT_SERUM,
                     t1.WASHOUT,
                     t1.PASSAGE_NUMBER,
                     t1.CELL_INCUBATION_HR,
                     t1.GRAPH,
                     t2.flag,
                     t1.ic50,
                     t1.PID,
                     t1.ic50_nm
               FROM DS3_USERDATA.CELLULAR_GROWTH_DRC t1
              INNER JOIN DS3_USERDATA.TEST2_CELLULAR_IC50_FLAGS t2
                 ON t1.pid = t2.pid
              ) t3
              """
            if payload['PIDS']:
                sql_stmt += f""" WHERE t3.PID IN ({','.join(["'"+p+"'" for p in payload["PIDS"]])})"""
            else:
                sql_stmt += f"WHERE t3.COMPOUND_ID = '{payload['COMPOUND_ID']}'"
                if payload['GET_M_NUM_ROWS']:
                    sql_stmt += f""" AND t3.CRO = '{payload["CRO"]}'
                  AND t3.CELL_LINE {'IS NULL' if payload["CELL_LINE"] == 'NULL' or payload["CELL_LINE"] is None else f"= '{payload['CELL_LINE']}'"}
                  AND t3.PCT_SERUM = {payload["PCT_SERUM"]}
                  AND t3.ASSAY_TYPE = '{payload["ASSAY_TYPE"]}'
                  AND t3.CELL_INCUBATION_HR {'IS NULL' if payload["CELL_INCUBATION_HR"] == 'NULL' or payload["CELL_INCUBATION_HR"] is None else f"= '{payload['CELL_INCUBATION_HR']}'"}
                  AND t3.VARIANT {'IS NULL' if payload["VARIANT"] == 'NULL' or payload["VARIANT"] is None else f"= '{payload['VARIANT']}'"}
                  AND t3.WASHOUT {'IS NULL' if payload["WASHOUT"] == 'NULL' or payload["WASHOUT"] is None else f"= '{payload['WASHOUT']}'"}
                  AND t3.PASSAGE_NUMBER {'IS NULL' if payload["PASSAGE_NUMBER"] == 'NULL' or payload["PASSAGE_NUMBER"] is None else f"= '{payload['PASSAGE_NUMBER']}'"}
               """

    elif payload["SQL_TYPE"] == 'UPDATE':
        sql_stmt = "UPDATE DS3_USERDATA."
        if payload['TYPE'] == 'CELLULAR':
            sql_stmt += "TEST2_CELLULAR_IC50_FLAGS"
        elif payload['TYPE'] == 'BIOCHEM':
            sql_stmt += "TEST2_BIOCHEM_IC50_FLAGS"

        sql_stmt += f""" SET FLAG = {payload["FLAG"]}
                         WHERE PID = '{payload["PID"]}'
                     """

    return sql_stmt, payload


def get_table_data(sql_stmt, payload):

    output = None
    with OracleConnection(cred_dct['USERNAME'],
                          cred_dct['PASSWORD'],
                          cred_dct['HOST' if getenv('ORACLE_CREDS_ARG') else 'HOST-DEV'],
                          cred_dct['PORT'],
                          cred_dct['SID']) as con:

        if getenv("INSTANCE_TYPE", None) is None:
            print(sql_stmt)

        with con.cursor() as cursor:
            cursor.execute(sql_stmt)
            output = cursor.fetchall()
            if not output:
                print(f"No data fetched for {payload['COMPOUND_ID']}")
                return []
            output_lst = []
            field_names = cellular_fields.copy()
            if payload["TYPE"] == 'BIOCHEM':
                field_names = biochem_fields.copy()
            for i, r in enumerate(output):
                output_dct = {}
                output_dct['ID'] = i
                for j, n in enumerate(field_names):
                    if n == 'PLOT':
                        output_dct[n] = r[j].read().rstrip().replace("\r\n", "")
                    else:
                        output_dct[n] = r[j]
                output_lst.append(output_dct)
        return output_lst


def generic_oracle_query(sql_stmt, payload):

    with OracleConnection(cred_dct['USERNAME'],
                          cred_dct['PASSWORD'],
                          cred_dct['HOST' if getenv('ORACLE_CREDS_ARG') else 'HOST-DEV'],
                          cred_dct['PORT'],
                          cred_dct['SID']) as con:

        if getenv("INSTANCE_TYPE", None) is None:
            print(sql_stmt)

        with con.cursor() as cursor:
            cursor.execute(sql_stmt)
            con.commit()
        return payload
