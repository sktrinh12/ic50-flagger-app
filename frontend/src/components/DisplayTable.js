import { useEffect, useState } from "react";
import ReadRow from "./ReadRow";
// import NotFound from "./NotFound";
import EditableRow from "./EditableRow";
import { columns } from "./TableColumns";
import * as React from "react";
import axios from "axios";
import { useSearchParams } from "react-router-dom";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";

export default function DisplayTable() {
  const { REACT_APP_BACKEND_URL } = process.env;
  const [tableData, setTableData] = useState([
    {
      ID: null,
      EXPERIMENT_ID: null,
      BATCH_ID: null,
      TARGET: null,
      VARIANT: null,
      FLAG: null,
    },
  ]);
  // console.log(REACT_APP_BACKEND_URL);

  const [flag, setFlag] = useState("");

  const [editFlag, setEditFlag] = useState(null);

  const [searchParams, setSearchParams] = useSearchParams();

  const getURL = `${REACT_APP_BACKEND_URL}/v1/get-data?compound_id=`;

  const axiosConfig = {
      withCredentials: false,
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods":"GET,PUT,POST"
      }
  };

  useEffect(() => {
  const fetchData = async () => {
    let newURL = getURL + searchParams.get("compound_id");
    newURL = newURL + "&type=" + searchParams.get("type");
    // console.log(`url: ${newURL}`);

    await axios
      .get(newURL, axiosConfig)
      .then((res) => {
        const json = res.data;
        // console.log(json);
        setTableData(json);
      })
      .catch((err) => {
        console.log("AXIOS ERROR: ", err);
      });
  };
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleEditFormChange = (event) => {
    event.preventDefault();

    // console.log(tableData);
    const flagValue = event.target.value;
    console.log(`the target value: ${flagValue}`);

    const index = tableData.findIndex((tdata) => tdata.ID === editFlag);
    const newTableData = [...tableData];
    newTableData[index]["FLAG"] = flagValue;
    // console.log(newTableData);

    setFlag(flagValue);

    setTableData(newTableData);
  };

  const handleEditFormSubmit = (event) => {
    event.preventDefault();

    const url = `${REACT_APP_BACKEND_URL}/v1/update-data`;
    const newTableData = [...tableData];

    const index = tableData.findIndex((tdata) => tdata.ID === editFlag);

    // console.log(`flag: ${flag}`);
    newTableData[index]["FLAG"] = flag;
    setTableData(newTableData);
    setEditFlag(null);
    let postData = Object.assign({}, newTableData[index]);
    postData["TYPE"] = "biochem";
    // postData["PROP1"] = 12;
    postData["FLAG"] = postData["FLAG"] === "include" ? 0 : 1;
    console.log(postData);

    axios
      .post(url, postData, axiosConfig)
      .then((res) => {
        console.log("RESPONSE RECEIVED: ", res);
      })
      .catch((err) => {
        console.log("AXIOS ERROR: ", err);
      });
  };

  const handleEditClick = (event, tdata) => {
    event.preventDefault();
    setEditFlag(tdata.ID);

    let flagValue = tdata.FLAG;
    flagValue = flagValue === 0 ? "include" : "exclude";
    // console.log(flagValue);

    setFlag(flagValue);
  };

  const handleCancelClick = () => {
    setEditFlag(null);
  };

  // MUI TABLE
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  return (
    <div className="app-container">
      <form onSubmit={handleEditFormSubmit}>
        <Paper sx={{ width: "100%", overflow: "hidden" }}>
          <TableContainer sx={{ maxHeight: 440 }}>
            <Table stickyHeader aria-label="sticky table">
              <TableHead>
                <TableRow>
                  {columns.map((column) => (
                    <TableCell
                      key={column.id}
                      align={column.align}
                      style={{
                        minWidth: column.minWidth,
                        fontWeight: column.fontWeight,
                        backgroundColor: column.backgroundColor,
                        color: column.color,
                      }}
                    >
                      {column.label}
                    </TableCell>
                  ))}
                  <TableCell
                    key={"ACTION"}
                    align={"center"}
                    style={{
                      minWidth: 170,
                      fontWeight: "bold",
                      backgroundColor: "#343990ff",
                      color: "#efeff6ff",
                    }}
                  >
                    Action
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tableData
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((tdata) => (
                    <>
                      {editFlag === tdata.ID ? (
                        <EditableRow
                          data={tdata}
                          handleEditFormChange={handleEditFormChange}
                          flagValue={flag}
                          handleCancelClick={handleCancelClick}
                        />
                      ) : (
                        <ReadRow
                          data={tdata}
                          handleEditClick={handleEditClick}
                        />
                      )}
                    </>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[10, 25, 100]}
            component="div"
            count={tableData.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      </form>
    </div>
  );
}
