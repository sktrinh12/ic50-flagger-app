import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableSortLabel from "@mui/material/TableSortLabel";
import { IconButton } from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import { PurpleColour } from "./Colour";

const styles = {
  minWidth: 30,
  fontWeight: "bold",
  backgroundColor: PurpleColour,
  color: "#efeff6ff",
};

export default function EnhancedTableHead(props) {
  const { order, orderBy, onRequestSort, type, handleFilterIconClick } = props;

  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };
  var DataFields = null;

  switch (type) {
    case "cellular_all":
      DataFields = require("./TableColumnsCellularAll");
      break;
    case "cellular_agg":
      DataFields = require("./TableColumnsCellularAll");
      break;
    case "biochem_all":
      DataFields = require("./TableColumnsBiochemAll");
      break;
    case "biochem_agg":
      DataFields = require("./TableColumnsBiochemAll");
      break;
    case "cellular_stats":
      DataFields = require("./TableColumnsCellularStats");
      break;
    default:
      DataFields = require("./TableColumnsBiochemStats");
  }

  return (
    <TableHead>
      <TableRow>
        {DataFields.columns.map((column) =>
          column.label === "GEOMEAN" && type.includes("stats") ? null : (
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
          )
        )}
        {type.includes("all") && (
          <TableCell key={"ACTION"} align={"center"} style={styles}>
            Action
          </TableCell>
        )}
        <TableCell key={"FILTER"} align={"center"} style={styles}>
          <IconButton
            color="inherit"
            aria-label="filterButton"
            onClick={handleFilterIconClick}
          >
            <FilterListIcon />
          </IconButton>
        </TableCell>
      </TableRow>
    </TableHead>
  );
}
