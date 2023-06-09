from .db import generic_oracle_query
from threading import Thread, Lock
from .db import generic_oracle_query
from .rdkit import chem_draw


class DatabaseWorker(Thread):
    __lock = Lock()

    def __init__(self, query, key, result_queue, select_columns, cmpd_id):
        Thread.__init__(self)
        self.query = query
        self.key = key
        self.result_queue = result_queue
        self.select_columns = select_columns
        self.payload = {}
        self.cmpd_id = cmpd_id

    def run(self):
        # print(f"Connecting to database...running select statement: '''{self.query}'''")
        try:
            results = generic_oracle_query(self.query, {"SQL_TYPE": "blank"})
            response = []
            for row in results:
                row_values = []
                for value in row:
                    if self.key == "mol_structure":
                        value = chem_draw(value, 250)
                        # logging.error(stderr)
                    row_values.append(value)
                response.append(
                    dict(
                        (key.strip(), value)
                        for key, value in zip(
                            self.select_columns[self.key].split(","), row_values
                        )
                    )
                )
            self.payload[self.key] = response
            self.payload["compound_id"] = [{"FT_NUM": self.cmpd_id}]
        except Exception as e:
            print("Unable to access database %s" % str(e))
        with self.__lock:
            self.result_queue.put((self.cmpd_id, self.payload))
