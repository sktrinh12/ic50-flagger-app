from .oracle_class import OracleConnection
from .credentials import cred_dct
from os import getenv


def get_table_data(cmp_id, type):

    output = None
    with OracleConnection(cred_dct['USERNAME'],
                          cred_dct['PASSWORD'],
                          cred_dct['HOST'],
                          cred_dct['PORT'],
                          cred_dct['SID']) as con:

        sql_stmt = """SELECT T0.EXPERIMENT_ID, T0.BATCH_ID,
                        CAST(SUBSTR(T0.BATCH_ID, 10,2) AS INT) AS BATCH_NUMBER,
                        T0.TARGET, T0.VARIANT, T0.FLAG, T0.PROP1,
                        ROUND(T1.IC50_NM, 2),
                        T1.COFACTORS,
                        BASE64ENCODE(T1.GRAPH)
                        FROM DS3_USERDATA."""
        if type == 'cellular':
            sql_stmt += "TEST_CELLULAR_IC50_FLAGS T0"
        elif type == 'biochem':
            sql_stmt += "TEST_BIOCHEM_IC50_FLAGS T0"

        sql_stmt += f""" INNER JOIN DS3_USERDATA.ENZYME_INHIBITION_VW T1
                        ON T0.EXPERIMENT_ID = T1.EXPERIMENT_ID
                        AND T0.BATCH_ID = T1.BATCH_ID
                        AND NVL(T0.TARGET, '-') = NVL(T1.TARGET, '-')
                        AND NVL(T0.VARIANT,'-') = NVL(T1.VARIANT,'-')
                        WHERE T0.BATCH_ID LIKE '{cmp_id}%' ORDER BY BATCH_NUMBER,
                        EXPERIMENT_ID, TARGET
                    """
        if getenv("INSTANCE_TYPE", None) is None:
            print(sql_stmt)

        with con.cursor() as cursor:
            cursor.execute(sql_stmt)
            output = cursor.fetchall()
            if not output:
                print(f"No data fetched for {cmp_id}")
                return []
            output_lst = []
            for i, r in enumerate(output):
                output_dct = {}
                output_dct['ID'] = i
                output_dct['EXPERIMENT_ID'] = r[0]
                output_dct['BATCH_ID'] = r[1]
                output_dct['TARGET'] = r[3]
                output_dct['VARIANT'] = r[4]
                output_dct['FLAG'] = r[5]
                output_dct['PROP1'] = r[6]
                output_dct['IC50_NM'] = r[7]
                output_dct['COFACTORS'] = r[8]
                output_dct['PLOT'] = r[9].read().rstrip().replace("\r\n", "")
                output_lst.append(output_dct)
        # print(output_lst)
        return output_lst


def update_table_data(payload):

    with OracleConnection(cred_dct['USERNAME'],
                          cred_dct['PASSWORD'],
                          cred_dct['HOST'],
                          cred_dct['PORT'],
                          cred_dct['SID']) as con:

        sql_stmt = "UPDATE DS3_USERDATA."
        if payload['TYPE'] == 'cellular':
            sql_stmt += "TEST_CELLULAR_IC50_FLAGS"
        elif payload['TYPE'] == 'biochem':
            sql_stmt += "TEST_BIOCHEM_IC50_FLAGS"

        sql_stmt += f""" SET FLAG = {payload["FLAG"]}
                         WHERE BATCH_ID = '{payload["BATCH_ID"]}'
                         AND EXPERIMENT_ID = '{payload["EXPERIMENT_ID"]}'
                         AND TARGET = '{payload["TARGET"]}'
                         AND VARIANT {'IS NULL' if payload["VARIANT"] == 'None' or payload["VARIANT"] is None else f"= '{payload['VARIANT']}'"}
                         AND PROP1 = {payload["PROP1"]}
                     """
        if getenv("INSTANCE_TYPE", None) is None:
            print(sql_stmt)

        with con.cursor() as cursor:
            cursor.execute(sql_stmt)
            con.commit()
        return payload
