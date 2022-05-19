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
  const [flag, setFlag] = useState("");
  const [editFlag, setEditFlag] = useState(null);
  // eslint-disable-next-line
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [columnLoading, setColumnLoading] = useState(false);
  // MUI TABLE
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("ID");
  const getURL = `${REACT_APP_BACKEND_URL}/v1/fetch-data?compound_id=`;

  const axiosConfig = {
    withCredentials: false,
    headers: {
      "Content-Type": "application/json;charset=UTF-8",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,PUT,POST",
    },
  };

  const fetchData = async (getMRows = false, mRows = null, indices = null) => {
    const compound_id = searchParams.get("compound_id");
    let newURL = getURL + compound_id;
    newURL = newURL + "&type=" + searchParams.get("type");
    newURL = newURL + "&sql_type=" + searchParams.get("sql_type");
    newURL = newURL + "&get_mnum_rows=" + getMRows;
    if (mRows) {
      newURL += `&target=${mRows.TARGET}`;
      newURL += `&variant=${mRows.VARIANT}`;
      newURL += `&cofactors=${mRows.COFACTORS}`;
      newURL += `&assay=${mRows.ASSAY_TYPE}`;
      newURL += `&atp_conc=${mRows.ATP_CONC_UM}`;
      newURL += `&modifier=${mRows.MODIFIER}`;
      newURL += `&cro=${mRows.CRO}`;
    }
    // console.log(`url: ${newURL}`);

    await axios
      .get(newURL, axiosConfig)
      .then(async (res) => {
        const json = res.data;
        // console.log(json);
        if (res.status === 200) {
          getMRows ? setMrowsData(json, indices) : setTableData(json);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.log("AXIOS ERROR: ", err);
      });
  };

  useEffect(() => {
    // alert('testing');
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setMrowsData = (rows, indices) => {
    console.log(rows);
    console.log("------------");
    // console.log(columnLoading);
    for (let i = 0; i < indices.length; i++) {
      let idx = indices[i];
      // console.log(idx);
      tableData[idx].GEOMEAN = rows.filter((e) =>
        e.PROP1 === tableData[idx].PROP1 &&
        e.FLAG === (tableData[idx].FLAG === "include")
          ? 0
          : 1 &&
            e.IC50_NM === tableData[idx].IC50_NM &&
            e.TARGET === tableData[idx].TARGET &&
            e.VARIANT === tableData[idx].VARIANT &&
            e.BATCH_ID === tableData[idx].BATCH_ID &&
            e.EXPERIMENT_ID === tableData[idx].EXPERIMENT_ID
      )[0].GEOMEAN;
    }
    // console.log(tableData);
    setTableData(tableData);
    setColumnLoading(false);
  };

  const handleEditFormChange = (event) => {
    event.preventDefault();
    const flagValue = event.target.value;
    // console.log(`the target value: ${flagValue}`);
    // const index = tableData.findIndex((tdata) => tdata.ID === editFlag);
    // const newTableData = [...tableData];
    // newTableData[index]["FLAG"] = flagValue;
    // console.log(newTableData);
    setFlag(flagValue);
  };

  const handleEditFormSubmit = (event) => {
    event.preventDefault();
    const type = searchParams.get("type");
    // console.log(`type: ${type}`);

    const url = `${REACT_APP_BACKEND_URL}/v1/change-data?sql_type=update&type=${type}`;
    const newTableData = [...tableData];
    const index = tableData.findIndex((tdata) => tdata.ID === editFlag);

    // console.log(`flag: ${flag}`);
    newTableData[index]["FLAG"] = flag;
    setEditFlag(null);
    let postData = Object.assign({}, newTableData[index]);
    postData["TYPE"] = type; //"biochem";
    postData["FLAG"] = postData["FLAG"] === "include" ? 0 : 1;
    console.log(postData);

    let indices = newTableData
      .map((td, i) =>
        td.COMPOUND_ID === postData.COMPOUND_ID &&
        td.CRO === postData.CRO &&
        td.ASSAY_TYPE === postData.ASSAY_TYPE &&
        td.TARGET === postData.TARGET &&
        td.VARIANT === postData.VARIANT &&
        td.MODIFIER === postData.MODIFIER &&
        td.COFACTORS === postData.COFACTORS
          ? i
          : null
      )
      .filter((e) => e !== null);
    console.log("indices");
    console.log(indices);
    setColumnLoading(true);

    axios
      .post(url, postData, axiosConfig)
      .then((res) => {
        if (res.status === 200) {
          fetchData(true, postData, indices);
          // fetchData();
        }
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
                    type={searchParams.get("type")}
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
                              keyValue={`${tdata.BATCH_ID}-EDIT-${i}`}
                              data={tdata}
                              handleEditFormChange={handleEditFormChange}
                              flagValue={flag}
                              handleCancelClick={handleCancelClick}
                            />
                          ) : (
                            <ReadRow
                              keyValue={`${tdata.BATCH_ID}-READ-${i}`}
                              data={tdata}
                              columnLoading={columnLoading}
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
