import RadioButtonsGroup from "./RadioButton";
import { columns } from "./TableColumns";
import * as React from "react";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";

const EditableRow = ({
  keyValue,
  data,
  handleEditFormChange,
  handleCancelClick,
}) => {
  const renderContent = (param) => {
    return (
      <>
        {[0, 1, "include", "exclude"].includes(param) ? (
          <RadioButtonsGroup handleEditFormChange={handleEditFormChange} />
        ) : param ? (
          param.length > 60 ? (
            <img src={"data:image/png;base64, " + param} alt="EMPTY" />
          ) : (
            param
          )
        ) : (
          "-"
        )}
      </>
    );
  };

  return (
    <TableRow hover role="checkbox" tabIndex={-1} key={keyValue}>
      {columns.map((column, i) => {
        const value = data[column.id];
        return (
          <TableCell align={column.align} key={`${keyValue}-${i}`}>
            {renderContent(value)}
          </TableCell>
        );
      })}
      <TableCell
        align={"center"}
        key={`ACTION-${parseInt(keyValue.replace(/^\D+/g, "")) + 5000}`}
      >
        <>
          <button type="submit">Save</button>
          <button type="button" onClick={handleCancelClick}>
            Cancel
          </button>
        </>
      </TableCell>
    </TableRow>
  );
};

export default EditableRow;
