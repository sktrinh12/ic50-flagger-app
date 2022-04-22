import RadioButtonsGroup from "./RadioButton";
import { columns } from "./TableColumns";
import * as React from "react";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";

const EditableRow = ({ data, handleEditFormChange, handleCancelClick }) => {
  const renderContent = (param) => {
    return (
      <>
        { [0, 1, "include", "exclude"].includes(param) ? (
				<RadioButtonsGroup handleEditFormChange={handleEditFormChange} />
        ) : (
          param
        )}
      </>
    );
  };

  return (
    <TableRow hover role="checkbox" tabIndex={-1} key={data.BATCH_ID}>
      {columns.map((column) => {
        const value = data[column.id];
        return (
          <TableCell key={column.id} align={column.align}>
            {renderContent(value)}
          </TableCell>
        );
      })}
          <TableCell key={"ACTION"} align={"center"}>
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
