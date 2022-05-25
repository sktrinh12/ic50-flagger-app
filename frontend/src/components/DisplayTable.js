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
  const [columnLoading, setColumnLoading] = useState([]);
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
    let dtype = searchParams.get("type");
    newURL = newURL + "&type=" + dtype;
    newURL = newURL + "&sql_type=" + searchParams.get("sql_type");
    newURL = newURL + "&get_mnum_rows=" + getMRows;
    if (mRows) {
      newURL += `&variant=${mRows.VARIANT}`;
      newURL += `&cro=${mRows.CRO}`;
      newURL += `&assay=${mRows.ASSAY_TYPE}`;
      if (dtype === "biochem") {
        newURL += `&target=${mRows.TARGET}`;
        newURL += `&cofactors=${mRows.COFACTORS}`;
        newURL += `&atp_conc=${mRows.ATP_CONC_UM}`;
        newURL += `&modifier=${mRows.MODIFIER}`;
      }
      if (dtype === "cellular") {
        newURL += `&cell_line=${mRows.CELL_LINE}`;
        newURL += `&pct_serum=${mRows.PCT_SERUM}`;
        newURL += `&washout=${mRows.WASHOUT}`;
        newURL += `&cell_incu_hr=${mRows.CELL_INCUBATION_HR}`;
        newURL += `&passage_nbr=${mRows.PASSAGE_NUMBER}`;
      }
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
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setMrowsData = (rows, indices) => {
    console.log('ROWS');
    console.log(rows);
    console.log("------------");
    console.log('TABLEDATA');
    console.log(tableData);
    for (let i = 0; i < indices.length; i++) {
      let idx = indices[i];
      tableData[idx].GEOMEAN = rows.filter((e) =>
        e.PROP1 === tableData[idx].PROP1 &&
        e.FLAG === (tableData[idx].FLAG === "include")
          ? 0
          : 1 &&
            e.IC50_NM === tableData[idx].IC50_NM &&
            ("CELL_LINE" in e
              ? e.CELL_LINE === tableData[idx].CELL_LINE
              : e.TARGET === tableData[idx].TARGET) &&
            ("PCT_SERUM" in e
              ? e.PCT_SERUM === tableData[idx].PCT_SERUM
              : e.ATP_CONC_UM === tableData[idx].ATP_CONC_UM) &&
            e.VARIANT === tableData[idx].VARIANT &&
            ("WASHOUT" in e
              ? e.WASHOUT === tableData[idx].WASHOUT
              : e.COFACTORS === tableData[idx].COFACTORS) &&
            ("CELL_INCUBATION_HR" in e
              ? e.CELL_INCUBATION_HR === tableData[idx].CELL_INCUBATION_HR
              : e.MODIFIER === tableData[idx].MODIFIER) &&
            ("PASSAGE_NUMBER" in e
               && e.PASSAGE_NUMBER === tableData[idx].PASSAGE_NUMBER ) &&
            e.BATCH_ID === tableData[idx].BATCH_ID &&
            e.EXPERIMENT_ID === tableData[idx].EXPERIMENT_ID
      )[0].GEOMEAN;
    }
    // console.log(tableData);
    setTableData(tableData);
    setColumnLoading([]);
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
    postData["TYPE"] = type;
    postData["FLAG"] = postData["FLAG"] === "include" ? 0 : 1;
    console.log(postData);

    let indices = newTableData
      .map((td, i) =>
        td.COMPOUND_ID === postData.COMPOUND_ID &&
        td.CRO === postData.CRO &&
        td.ASSAY_TYPE === postData.ASSAY_TYPE &&
        td.VARIANT === postData.VARIANT &&
        ("CELL_LINE" in td
          ? td.CELL_LINE === postData.CELL_LINE &&
            td.PCT_SERUM === postData.PCT_SERUM &&
            td.WASHOUT === postData.WASHOUT &&
            td.CELL_INCUBATION_HR === postData.CELL_INCUBATION_HR
          : td.TARGET === postData.TARGET &&
            td.MODIFIER === postData.MODIFIER &&
            td.COFACTORS === postData.COFACTORS &&
            td.ATP_CONC_UM === postData.ATP_CONC_UM)
          ? i
          : null
      )
      .filter((e) => e !== null);
    console.log(`indices: ${indices}`);
    setColumnLoading(indices);

    axios
      .post(url, postData, axiosConfig)
      .then((res) => {
        if (res.status === 200) {
          fetchData(true, postData, indices);
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
              <TableContainer sx={{ maxHeight: 1000 }}>
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
                              columnLoading={
                                columnLoading.includes(i) ? true : false
                              }
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
