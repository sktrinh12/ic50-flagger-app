from .oracle_class import OracleConnection
from .credentials import cred_dct


def update_flag(rowdata_dct):

    assert len(rowdata_dct.keys()) > 5,\
        f"The current row data seems empty, data length: {len(rowdata_dct)}"

    with OracleConnection(cred_dct['USERNAME'],
                          cred_dct['PASSWORD'],
                          cred_dct['HOST'],
                          cred_dct['PORT'],
                          cred_dct['SID']) as con:

        sql_stmt = """UPDATE TEST_BIOCHEM_IC50_FLAGS SET FLAG = :1,
                            WHERE EXPERIMENT_ID = :2
                            AND BATCH_ID = :3
                            AND TARGET = :4
                            AND VARIANT = :5
                            AND PROP1 = :6"""

        data_lst = [
            rowdata_dct['FLAG'],
            rowdata_dct['EXPERIMENT_ID'],
            rowdata_dct['BATCH_ID'],
            rowdata_dct['TARGET'],
            rowdata_dct['VARIANT'],
            rowdata_dct['PROP1']
        ]

        for d in data_lst:
            print(d)

        # assert all([isinstance(d, str) for d in data_lst]), \
        #     "Can only upload string type values"
        with con.cursor() as cursor:
            cursor.execute(sql_stmt, data_lst)
        con.commit()
        print(f'successfully uploaded data: {rowdata_dct.items()}')

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
        # print(sql_stmt)

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
                     """
        print(sql_stmt)

        with con.cursor() as cursor:
            cursor.execute(sql_stmt)
            con.commit()
        return payload
