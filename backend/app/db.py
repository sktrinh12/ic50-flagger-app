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

        sql_stmt = "SELECT * FROM DS3_USERDATA."
        if type == 'cellular':
            sql_stmt += "TEST_CELLULAR_IC50_FLAGS"
        elif type == 'biochem':
            sql_stmt += "TEST_BIOCHEM_IC50_FLAGS"

        sql_stmt += f" WHERE BATCH_ID LIKE '{cmp_id}%' ORDER BY EXPERIMENT_ID, TARGET"
        if getenv("INSTANCE_TYPE", None) == None: 
            print(sql_stmt)

        with con.cursor() as cursor:
            cursor.execute(sql_stmt)
            output = cursor.fetchall()
            if not output: 
                print(f"No data fetched for {cmp_id}")
                return []
            output_lst = []
            for i,r in enumerate(output):
                output_dct = {}
                output_dct['ID'] = i
                output_dct['EXPERIMENT_ID'] = r[0]
                output_dct['BATCH_ID'] = r[1]
                output_dct['TARGET'] = r[2]
                output_dct['VARIANT'] = r[3]
                output_dct['FLAG'] = r[4]
                output_dct['PROP1'] = r[5]
                output_lst.append(output_dct)
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
        if getenv("INSTANCE_TYPE", None) == None: 
            print(sql_stmt)

        with con.cursor() as cursor:
            cursor.execute(sql_stmt)
            con.commit()
        return payload
