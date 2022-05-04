import { columns } from "./TableColumns";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableSortLabel from "@mui/material/TableSortLabel";
import Box from "@mui/material/Box";
import { visuallyHidden } from "@mui/utils";

export default function EnhancedTableHead(props) {
  const {
    order,
    orderBy,
    onRequestSort,
  } = props;

  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        {columns.map((column) => (
          <TableCell
            key={column.id}
            align={column.align}
            sortDirection={orderBy === column.id ? order : false}
            style={{
              minWidth: column.minWidth,
              fontWeight: column.fontWeight,
              backgroundColor: column.backgroundColor,
              color: column.color,
            }}
          >
            <TableSortLabel
              active={orderBy === column.id}
              direction={orderBy === column.id ? order : "asc"}
              onClick={createSortHandler(column.id)}
            >
              {column.label}
              {orderBy === column.id ? (
                <Box component="span" sx={visuallyHidden}>
                  {order === "desc" ? "sorted descending" : "sorted ascending"}
                </Box>
              ) : null}
            </TableSortLabel>
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
