// COLUMN TABLE SORTING
function descendingComparator(a, b, orderBy) {
  // console.log("a", a);
  // console.log("b", b);
  console.log("orderBy", orderBy);
  if (b[orderBy] < a[orderBy]) {
    // console.log("-1");
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    // console.log("1");
    return 1;
  }
  // console.log("0");
  return 0;
}

export function getComparator(order, orderBy) {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

export const sortedRowInformation = (rowArray, comparator) => {
  const stabilisedRowArray = rowArray.map((el, index) => [el, index]);
  stabilisedRowArray.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    // console.log('order', order);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilisedRowArray.map((el) => el[0]);
};
