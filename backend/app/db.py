from .oracle_class import OracleConnection
from .credentials import cred_dct
from os import getenv


def generate_sql_stmt(payload):
    sql_stmt = None
    if payload["SQL_TYPE"] == "GET":
        sql_stmt = f"""SELECT t0.CRO,
                t0.ASSAY_TYPE,
                t0.COMPOUND_ID,
                t0.EXPERIMENT_ID,
                t0.BATCH_ID,
                t0.TARGET,
                t0.VARIANT,
                t0.COFACTORS,
                t0.ATP_CONC_UM,
                t0.MODIFIER,
                t0.GRAPH,
                t0.prop1,
                ROUND(t0.ic50_nm,2),
                t0.GEOMEAN_NM,
                t0.flag,
                t0.PID
              FROM (
            SELECT
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
                t3.prop1,
                t3.ic50_nm,
                t3.flag,
                t3.PID,
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
                )) * TO_NUMBER('1.0e+09'), 1) AS geomean_nM
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
                     t2.prop1,
                     t1.ic50,
                     t1.ic50_nm,
                     t1.PID
               FROM DS3_USERDATA.COPY_ENZYME_INHIBITION_VW t1
              INNER JOIN DS3_USERDATA.TEST_BIOCHEM_IC50_FLAGS t2
                 ON t1.experiment_id = t2.experiment_id
                AND t1.batch_id = t2.batch_id
                AND nvl(t1.target,'-') = nvl(t2.target, '-')
                AND nvl(t1.variant, '-') = nvl(t2.variant, '-')
              WHERE
                    t1.ASSAY_INTENT = 'Screening'
                AND t1.VALIDATED = 'VALIDATED'
              ) t3
              ) t0
              WHERE t0.COMPOUND_ID = '{payload['COMPOUND_ID']}'
              """
        if payload['GET_M_NUM_ROWS']:
            sql_stmt += f""" AND t0.CRO = '{payload["CRO"]}'
              AND t0.MODIFIER {'IS NULL' if payload["MODIFIER"] == 'NULL' or payload["MODIFIER"] is None else f"= '{payload['MODIFIER']}'"}
              AND t0.ATP_CONC_UM = {payload["ATP_CONC_UM"]}
              AND t0.ASSAY_TYPE = '{payload["ASSAY_TYPE"]}'
              AND t0.TARGET = '{payload["TARGET"]}'
              AND t0.VARIANT {'IS NULL' if payload["VARIANT"] == 'NULL' or payload["VARIANT"] is None else f"= '{payload['VARIANT']}'"}
              AND t0.COFACTORS {'IS NULL' if payload["COFACTORS"] == 'NULL' or payload["COFACTORS"] is None else f"= '{payload['COFACTORS']}'"}
           """

    elif payload["SQL_TYPE"] == 'UPDATE':
        sql_stmt = "UPDATE DS3_USERDATA."
        if payload['TYPE'] == 'CELLULAR':
            sql_stmt += "TEST_CELLULAR_IC50_FLAGS"
        elif payload['TYPE'] == 'BIOCHEM':
            sql_stmt += "TEST_BIOCHEM_IC50_FLAGS"

        sql_stmt += f""" SET FLAG = {payload["FLAG"]}
                         WHERE BATCH_ID = '{payload["BATCH_ID"]}'
                         AND EXPERIMENT_ID = '{payload["EXPERIMENT_ID"]}'
                         AND TARGET = '{payload["TARGET"]}'
                         AND VARIANT {'IS NULL' if payload["VARIANT"] == 'None' or payload["VARIANT"] is None else f"= '{payload['VARIANT']}'"}
                         AND PROP1 = {payload["PROP1"]}
                     """

    return sql_stmt, payload


def get_table_data(sql_stmt, payload):

    output = None
    with OracleConnection(cred_dct['USERNAME'],
                          cred_dct['PASSWORD'],
                          cred_dct['HOST'],
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
            for i, r in enumerate(output):
                output_dct = {}
                output_dct['ID'] = i
                output_dct['CRO'] = r[0]
                output_dct['ASSAY_TYPE'] = r[1]
                output_dct['COMPOUND_ID'] = r[2]
                output_dct['EXPERIMENT_ID'] = r[3]
                output_dct['BATCH_ID'] = r[4]
                output_dct['TARGET'] = r[5]
                output_dct['VARIANT'] = r[6]
                output_dct['COFACTORS'] = r[7]
                output_dct['ATP_CONC_UM'] = r[8]
                output_dct['MODIFIER'] = r[9]
                output_dct['PLOT'] = r[10].read().rstrip().replace("\r\n", "")
                output_dct['PROP1'] = r[11]
                output_dct['IC50_NM'] = r[12]
                output_dct['GEOMEAN'] = r[13]
                output_dct['FLAG'] = r[14]
                output_lst.append(output_dct)

        print(output_dct['GEOMEAN'])
        return output_lst


def generic_oracle_query(sql_stmt, payload):

    with OracleConnection(cred_dct['USERNAME'],
                          cred_dct['PASSWORD'],
                          cred_dct['HOST'],
                          cred_dct['PORT'],
                          cred_dct['SID']) as con:

        if getenv("INSTANCE_TYPE", None) is None:
            print(sql_stmt)

        with con.cursor() as cursor:
            cursor.execute(sql_stmt)
            con.commit()
        return payload
