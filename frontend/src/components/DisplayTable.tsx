import { useEffect, useState, useRef, createRef } from "react";
import ReadRow from "./ReadRow";
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
import { PurpleColour } from "./Colour";
import FilterTab from "./FilterTab";

interface TableDataType {
  ID: number;
  PID: string;
  EXPERIMENT_ID: string;
  BATCH_ID: string;
  TARGET: string;
  VARIANT: string;
  FLAG: number;
}

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
  // for comment and username references
  const commentRefs = useRef([]);
  // PARAMETERS
  const [flag, setFlag] = useState("");
  const [editFlag, setEditFlag] = useState(null);
  const [username, setUsername] = useState("TESTADMIN");
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [columnLoading, setColumnLoading] = useState([]);
  // MUI TABLE
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [filterFn, setFilterFn] = useState({
    fn: (items) => {
      return items;
    },
  });
  // PAGE CONTROLS
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("ID");
  const rootURL = `${REACT_APP_BACKEND_URL}/v1/fetch-data?compound_id=`;
  const [open, setOpen] = useState(false);

  const axiosConfig = {
    withCredentials: false,
    headers: {
      "Content-Type":
        "application/x-www-form-urlencoded;charset=UTF-8;application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,PUT,POST",
    },
  };

  let dtype = searchParams.get("type");
  let stype = searchParams.get("sql_type");
  // fetch the rows of data from db
  const fetchData = async (getMRows = false, postData = null) => {
    let newURL = [
      rootURL,
      searchParams.get("compound_id"),
      "&type=",
      dtype,
      "&sql_type=",
      stype,
      "&get_mnum_rows=",
      getMRows,
    ];

    if (dtype === "cellular_agg") {
      newURL.push(
        "&cro=",
        searchParams.get("cro") ?? "",
        "&assay=",
        searchParams.get("assay") ?? "",
        "&cell_line=",
        searchParams.get("cell_line") ?? "",
        "&pct_serum=",
        searchParams.get("pct_serum") ?? "",
        "&cell_incu_hr=",
        searchParams.get("cell_incu_hr") ?? "",
        "&variant=",
        (searchParams.get("variant") === "-"
          ? "null"
          : searchParams.get("variant")) ?? ""
      );
    }

    newURL = newURL.join("");

    // if (postData) {
    //   newURL += `&variant=${postData.VARIANT}`;
    //   newURL += `&cro=${postData.CRO}`;
    //   newURL += `&assay=${postData.ASSAY_TYPE}`;
    //   if (dtype.startsWith("biochem")) {
    //     newURL += `&target=${postData.TARGET}`;
    //     newURL += `&cofactors=${postData.COFACTORS}`;
    //     newURL += `&atp_conc=${postData.ATP_CONC_UM}`;
    //     newURL += `&modifier=${postData.MODIFIER}`;
    //   }
    //   if (dtype.startsWith("cellular")) {
    //     newURL += `&cell_line=${postData.CELL_LINE}`;
    //     newURL += `&pct_serum=${postData.PCT_SERUM}`;
    //     newURL += `&washout=${postData.WASHOUT}`;
    //     newURL += `&cell_incu_hr=${postData.CELL_INCUBATION_HR}`;
    //     newURL += `&passage_nbr=${postData.PASSAGE_NUMBER}`;
    //   }
    // }

    if (REACT_APP_BACKEND_URL.match(/localhost/g)) {
      console.log(`url: ${newURL}`);
    }

    await axios
      .get(newURL, axiosConfig)
      .then(async (res) => {
        const json = res.data;
        // console.log(json);
        if (res.status === 200) {
          getMRows ? setMrowsData(json) : setTableData(json);
          // create dynamic refs for comments
          const tableLength = tableData.length;
          // console.log(`table length: ${tableLength}`);
          if (commentRefs.current.length !== tableLength) {
            commentRefs.current = Array(tableLength)
              .fill()
              .map((_, i) => commentRefs.current[i] || createRef());
          }
          setUsername(searchParams.get("user_name"));
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

  // change only affected rows and values
  const setMrowsData = (postDataRows) => {
    console.log("ROWS");
    console.log(postDataRows);
    console.log("------------");
    console.log("TABLEDATA");

    const newTableData = tableData.map((a) => {
      postDataRows.forEach((e) => {
        if (a.PID === e.PID) {
          a.GEOMEAN = e.GEOMEAN;
          a.COMMENT_TEXT = e.COMMENT_TEXT;
          a.CHANGE_DATE = e.CHANGE_DATE;
          a.USER_NAME = e.USER_NAME;
        }
      });
      return a;
    });
    setTableData(newTableData);
    setColumnLoading([]);
  };

  const handleFilterIconClick = () => {
    setOpen(!open);
  };

  // set the flag value when click on radio button
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

  // post data to db
  const handleEditFormSubmit = (event) => {
    event.preventDefault();

    const url = [
      REACT_APP_BACKEND_URL,
      "/v1/change-data?sql_type=update&type=",
      dtype.split("_")[0],
      "&user_name=",
      username,
    ].join("");
    // console.log(`url: ${url}`);

    const newTableData = [...tableData];
    const index = tableData.findIndex((tdata) => tdata.ID === editFlag);

    // console.log(`flag: ${flag}`);
    newTableData[index]["FLAG"] = flag === "include" ? 0 : 1;
    setEditFlag(null);
    let tmpPostDataObj = Object.assign({}, newTableData[index]);

    /* use Babel you can use the following syntax to copy property 
				PLOT from tmpPostData into variable PLOT and then copy 
				rest of properties into variable postDataObj; to exclude in payload
		*/
    let { PLOT, ...postDataObj } = tmpPostDataObj;

    let pids = newTableData
      .map((td) =>
        td.COMPOUND_ID === postDataObj.COMPOUND_ID &&
        td.CRO === postDataObj.CRO &&
        td.ASSAY_TYPE === postDataObj.ASSAY_TYPE &&
        td.VARIANT === postDataObj.VARIANT &&
        ("CELL_LINE" in td
          ? td.CELL_LINE === postDataObj.CELL_LINE &&
            td.PCT_SERUM === postDataObj.PCT_SERUM &&
            td.WASHOUT === postDataObj.WASHOUT &&
            td.CELL_INCUBATION_HR === postDataObj.CELL_INCUBATION_HR &&
            td.PASSAGE_NUMBER === postDataObj.PASSAGE_NUMBER
          : td.TARGET === postDataObj.TARGET &&
            td.MODIFIER === postDataObj.MODIFIER &&
            td.COFACTORS === postDataObj.COFACTORS &&
            td.ATP_CONC_UM === postDataObj.ATP_CONC_UM)
          ? td.PID
          : null
      )
      .filter((e) => e !== null);
    console.log(`pids: ${pids}`);
    setColumnLoading(pids);

    tmpPostDataObj["COMMENT_TEXT"] = handleElmChangeFromRef(index);
    tmpPostDataObj["USER_NAME"] = username; // over-write the username
    // Using Object Destructuring and Property Shorthand to select certain keys
    tmpPostDataObj = (({ BATCH_ID, FLAG, PID, COMMENT_TEXT, USER_NAME }) => ({
      BATCH_ID,
      FLAG,
      PID,
      COMMENT_TEXT,
      USER_NAME,
    }))(tmpPostDataObj);
    console.log(tmpPostDataObj);

    axios
      .post(url, tmpPostDataObj, axiosConfig)
      .then((res) => {
        if (res.status === 200) {
          fetchData(true, postDataObj);
        }
        console.log("RESPONSE RECEIVED: ", res);
      })
      .catch((err) => {
        console.log("AXIOS ERROR: ", err);
      });
  };

  // grab the comment using vanilla js and indexing the elm ref
  const handleElmChangeFromRef = (idx: number) => {
    const parentElm = commentRefs.current[idx];
    const textValue = parentElm.getElementsByTagName("textarea")[0].value;
    return textValue;
  };

  // trigger change to edit mode for <ReadRow>
  const handleEditClick = (event, tdata) => {
    event.preventDefault();
    setEditFlag(tdata.ID);

    let flagValue = tdata.FLAG;
    flagValue = flagValue === 0 ? "include" : "exclude";
    // console.log(flagValue);

    setFlag(flagValue);
  };

  // cancel from edit mode
  const handleCancelClick = () => {
    setEditFlag(null);
  };

  // for pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // for number of pages
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  // sort the columns
  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  // filter rows based on input text
  const handleSearchFilter = (field) => (e) => {
    let target = e.target;
    setFilterFn({
      fn: (items) => {
        if (target.value === "") return items;
        else
          return items.filter(
            (x) => x[field].toLowerCase().startsWith(target.value.toLowerCase())
            // new RegExp(target.value, "i").test(x[field])
          );
      },
    });
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
            color={PurpleColour}
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
                <FilterTab
                  dtype={dtype}
                  open={open}
                  handleSearchFilter={handleSearchFilter}
                />
                <Table stickyHeader aria-label="sticky table">
                  <EnchancedTableHead
                    order={order}
                    orderBy={orderBy}
                    onRequestSort={handleRequestSort}
                    type={dtype}
                    handleFilterIconClick={handleFilterIconClick}
                  />
                  <TableBody>
                    {sortedRowInformation(
                      filterFn.fn(tableData),
                      getComparator(order, orderBy)
                    )
                      .slice(
                        page * rowsPerPage,
                        page * rowsPerPage + rowsPerPage
                      )
                      .map((tdata: TableDataType, i: number) => (
                        <React.Fragment key={i}>
                          {editFlag === tdata.ID ? (
                            <EditableRow
                              keyValue={`${tdata.PID}-EDIT-${i}`}
                              data={tdata}
                              handleEditFormChange={handleEditFormChange}
                              flag={flag}
                              commentRef={(el) => (commentRefs.current[i] = el)}
                              handleCancelClick={handleCancelClick}
                            />
                          ) : (
                            <ReadRow
                              keyValue={`${tdata.PID}-READ-${i}`}
                              data={tdata}
															username={username}
                              types={[dtype, stype]}
                              columnLoading={
                                columnLoading.includes(tdata.PID) ? true : false
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
