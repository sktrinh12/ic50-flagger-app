import { useState } from "react";
import data from "../mock-data.json";
import ReadRow from "./ReadRow";
import EditableRow from "./EditableRow";
import { columns } from "./TableColumns";
import * as React from 'react';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';

export default function DisplayTable() {

  const [tableData, setTableData] = useState(data);

  const [flag, setFlag] = useState("");

  const [editFlag, setEditFlag] = useState(null);

  const handleEditFormChange = (event) => {
    event.preventDefault();

    // console.log(tableData);
    const flagValue = event.target.value;
    console.log(`the target value: ${flagValue}`);

    const index = tableData.findIndex((tdata) => tdata.id === editFlag);
    const newTableData = [...tableData]
    newTableData[index]["flag"] = flagValue;
    console.log(newTableData);

    setFlag(flagValue);
    // console.log(`flag val: ${flag}`);

    setTableData(newTableData);
  };

  const handleEditFormSubmit = (event) => {
    event.preventDefault();

    const newTableData = [...tableData];

    const index = tableData.findIndex((tdata) => tdata.id === editFlag);

    console.log(`flag: ${flag}`);
    newTableData[index]["flag"] = flag;
    setTableData(newTableData);
    setEditFlag(null);
  };

  const handleEditClick = (event, tdata) => {
    event.preventDefault();
    setEditFlag(tdata.id);

    const flagValue = tdata.flag;

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
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
          <TableContainer sx={{ maxHeight: 440 }}>
            <Table stickyHeader aria-label="sticky table">
              <TableHead>
                <TableRow>
                  {columns.map((column) => (
                    <TableCell
                      key={column.id}
                      align={column.align}
                      style={{ minWidth: column.minWidth, fontWeight: column.fontWeight, backgroundColor: column.backgroundColor, color: column.color }}
                    >
                      {column.label}
                    </TableCell>
                  ))}
                  <TableCell
                    key={"action"}
                    align={"center"}
                    style={{ minWidth: 170, fontWeight: 'bold', backgroundColor: '#343990ff', color: '#efeff6ff' }}
                  >
                    Action
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tableData
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((tdata) =>
                    <>
                      {editFlag === tdata.id ? (
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
                  )}
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
