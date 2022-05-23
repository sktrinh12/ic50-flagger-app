// import { columns } from "./TableColumns";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableSortLabel from "@mui/material/TableSortLabel";

// var columns = [];

export default function EnhancedTableHead(props) {
  const { order, orderBy, onRequestSort, type } = props;

  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };
  var DataFields = null;

  if (type === "cellular") {
    DataFields = require("./TableColumnsCellular");
  } else {
    DataFields = require("./TableColumnsBiochem");
  }

  return (
    <TableHead>
      <TableRow>
        {DataFields.columns.map((column) => (
          <TableCell
            key={column.id}
            align={column.align}
            style={{
              minWidth: column.minWidth,
              fontWeight: column.fontWeight,
              backgroundColor: column.backgroundColor,
              color: column.color,
            }}
          >
            {["PLOT", "FLAG"].includes(column.id) ? (
              column.label
            ) : (
              <TableSortLabel
                active={orderBy === column.id}
                direction={orderBy === column.id ? order : "asc"}
                onClick={createSortHandler(column.id)}
              >
                {column.label}
              </TableSortLabel>
            )}
          </TableCell>
        ))}
        <TableCell
          key={"ACTION"}
          align={"center"}
          style={{
            minWidth: 30,
            fontWeight: "bold",
            backgroundColor: "#343990ff",
            color: "#efeff6ff",
          }}
        >
          Action
        </TableCell>
      </TableRow>
    </TableHead>
  );
}
