import cx_Oracle
from os import getenv


oracle_dir = getenv(
    "ORACLE_HOME", "/Users/spencer.trinhkinnate.com/instantclient_12_2/"
)

cx_Oracle.init_oracle_client(lib_dir=oracle_dir)


class OracleConnection(object):
    """
    Oracle DB Connection
    allows a context to be used on the oracle connection
    initialise the object and pass in connection details
    """

    def __init__(self, username, password, hostname, port, sid):
        self.username = username
        self.password = password
        self.hostname = hostname
        self.port = port
        self.sid = sid
        self.con = None
        self.dsn = cx_Oracle.makedsn(self.hostname, self.port, self.sid)

    def output_type_handler(self, cursor, name, default_type, size, precision, scale):
        if default_type == cx_Oracle.DB_TYPE_CLOB:
            return cursor.var(cx_Oracle.DB_TYPE_LONG, arraysize=cursor.arraysize)
        if default_type == cx_Oracle.DB_TYPE_BLOB:
            return cursor.var(cx_Oracle.DB_TYPE_LONG_RAW, arraysize=cursor.arraysize)
        if default_type == cx_Oracle.DB_TYPE_NCLOB:
            return cursor.var(
                cx_Oracle.DB_TYPE_LONG_NVARCHAR, arraysize=cursor.arraysize
            )

    def __enter__(self):
        try:
            self.con = cx_Oracle.connect(
                user=self.username, password=self.password, dsn=self.dsn
            )

            self.con.outputtypehandler = self.output_type_handler
            return self.con
        except cx_Oracle.DatabaseError as e:
            raise

    def __exit__(self, exc_type, exc_val, exc_tb):
        try:
            self.con.close()
        except cx_Oracle.DatabaseError:
            pass
