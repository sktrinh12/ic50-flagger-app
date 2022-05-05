import { useEffect, useState } from "react";
import ReadRow from "./ReadRow";
// import NotFound from "./NotFound";
import EditableRow from "./EditableRow";
import EnchancedTableHead from "./EnhancedTableHead";
import * as React from "react";
import axios from "axios";
import { useSearchParams } from "react-router-dom";
import ReactLoading from "react-loading";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import TablePagination from "@mui/material/TablePagination";
import Box from "@mui/material/Box";
import { sortedRowInformation, getComparator } from "./TableSortFunctions";

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
  // eslint-disable-next-line
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  // MUI TABLE
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("BATCH_ID");
  const getURL = `${REACT_APP_BACKEND_URL}/v1/fetch-data?compound_id=`;

  const axiosConfig = {
    withCredentials: false,
    headers: {
      "Content-Type": "application/json;charset=UTF-8",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,PUT,POST",
    },
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
          setLoading(false);
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
    // console.log(`the target value: ${flagValue}`);

    const index = tableData.findIndex((tdata) => tdata.ID === editFlag);
    const newTableData = [...tableData];
    newTableData[index]["FLAG"] = flagValue;
    // console.log(newTableData);

    setFlag(flagValue);
    setTableData(newTableData);
  };

  const handleEditFormSubmit = (event) => {
    event.preventDefault();

    const url = `${REACT_APP_BACKEND_URL}/v1/change-data`;
    const newTableData = [...tableData];

    const index = tableData.findIndex((tdata) => tdata.ID === editFlag);

    // console.log(`flag: ${flag}`);
    newTableData[index]["FLAG"] = flag;
    setTableData(newTableData);
    setEditFlag(null);
    let postData = Object.assign({}, newTableData[index]);
    postData["TYPE"] = "biochem";
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

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  return (
    <>
      {loading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
          }}
        >
          <ReactLoading
            type="spin"
            color="#2E86C1"
            height={667}
            width={375}
            margin="auto"
            padding="10px"
          />
        </Box>
      ) : (
        <Box sx={{ width: "100%" }}>
          <form onSubmit={handleEditFormSubmit}>
            <Paper sx={{ width: "100%", overflow: "hidden" }}>
              <TableContainer sx={{ maxHeight: 740 }}>
                <Table stickyHeader aria-label="sticky table">
                  <EnchancedTableHead
                    order={order}
                    orderBy={orderBy}
                    onRequestSort={handleRequestSort}
                  />
                  <TableBody>
                    {sortedRowInformation(
                      tableData,
                      getComparator(order, orderBy)
                    )
                      .slice(
                        page * rowsPerPage,
                        page * rowsPerPage + rowsPerPage
                      )
                      .map((tdata, i) => (
                        <React.Fragment key={i}>
                          {editFlag === tdata.ID ? (
                            <EditableRow
                              keyValue={`${tdata.BATCH_ID}-${i}`}
                              data={tdata}
                              handleEditFormChange={handleEditFormChange}
                              flagValue={flag}
                              handleCancelClick={handleCancelClick}
                            />
                          ) : (
                            <ReadRow
                              keyValue={`${tdata.BATCH_ID}-${i}`}
                              data={tdata}
                              handleEditClick={handleEditClick}
                            />
                          )}
                        </React.Fragment>
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
        </Box>
      )}
    </>
  );
}
