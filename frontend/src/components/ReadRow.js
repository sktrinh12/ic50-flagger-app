import { columns } from "./TableColumns";
import * as React from "react";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";

const ReadRow = ({ data, handleEditClick }) => {
  const convertFlagValue = (columnName, value) => {
    if (columnName === "FLAG") {
      switch (value) {
        case 0:
          value = "include";
          break;
        case 1:
          value = "exclude";
          break;
        default:
          break;
      }
    }

    if (["VARIANT", "COFACTORS"].includes(columnName)) {
      if (value == null) {
        value = "-";
      }
    }

    if (columnName === "PLOT") {
      return <img src={"data:image/png;base64, " + value} alt="EMPTY GRAPH" />;
    }
    return value;
  };

  return (
    <TableRow hover role="checkbox" tabIndex={-1} key={data.BATCH_ID}>
      {columns.map((column) => {
        const value = data[column.id];
        return (
          <TableCell key={column.id} align={column.align}>
            {convertFlagValue(column.id, value)}
          </TableCell>
        );
      })}
      {data && (
        <TableCell key={"ACTION"} align={"center"}>
          <>
            <button
              type="button"
              onClick={(event) => handleEditClick(event, data)}
            >
              Edit
            </button>
          </>
        </TableCell>
      )}
    </TableRow>
  );
};

export default ReadRow;
