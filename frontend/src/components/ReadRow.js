import { columns } from "./TableColumns";
import * as React from "react";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";

const ReadRow = ({ data, handleEditClick }) => {

  return (
    <TableRow hover role="checkbox" tabIndex={-1} key={data.batchID}>
      {columns.map((column) => {
        const value = data[column.id];
        return (
          <TableCell key={column.id} align={column.align}>
            { value }
          </TableCell>
        );
      })}
          <TableCell key={"action"} align={"center"}>
          <>
              <button
                type="button"
                onClick={(event) => handleEditClick(event, data)}
              >
                Edit
              </button>
          </>
          </TableCell>
    </TableRow>
  );
};

export default ReadRow;
