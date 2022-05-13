import { columns } from "./TableColumns";
import * as React from "react";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import ReactLoading from "react-loading";

const ReadRow = ({ keyValue, columnLoading, data, handleEditClick }) => {
  // console.log(`readrow colm load: ${columnLoading}`);
  const handleDynamicValue = (columnName, value) => {
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
    <TableRow
      hover
      role="checkbox"
      tabIndex={-1}
      key={keyValue}
      selected={columnLoading}
    >
      {columns.map((column, i) => {
        const value = data[column.id];
        return (
          <TableCell align={column.align} key={`${keyValue}-${i}`}>
            {columnLoading && column.id === "GEOMEAN" ? (
              <ReactLoading
                type="spin"
                color="#2E86C1"
                height={30}
                width={30}
                margin="auto"
                padding="0px"
              />
            ) : (
              handleDynamicValue(column.id, value)
            )}
          </TableCell>
        );
      })}
      {data && (
        <TableCell
          align={"center"}
          key={`ACTION-${keyValue}-${
            parseInt(keyValue.split("-")[2].replace(/^\D+/g, "")) + 5000
          }`}
        >
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
