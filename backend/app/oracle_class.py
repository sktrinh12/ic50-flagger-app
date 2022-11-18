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

    def __enter__(self):
        try:
            self.con = cx_Oracle.connect(
                user=self.username, password=self.password, dsn=self.dsn
            )
            return self.con
        except cx_Oracle.DatabaseError as e:
            raise

    def __exit__(self, exc_type, exc_val, exc_tb):
        try:
            self.con.close()
        except cx_Oracle.DatabaseError:
            pass
