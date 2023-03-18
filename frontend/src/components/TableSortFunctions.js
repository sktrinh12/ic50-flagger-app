function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1
  }
  if (b[orderBy] > a[orderBy]) {
    return 1
  }

  return 0
}

export function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy)
}

export const sortedRowInformation = (rowArray, comparator) => {
  const stabilisedRowArray = rowArray.map((el, index) => [el, index])
  stabilisedRowArray.sort((a, b) => {
    const order = comparator(a[0], b[0])

    if (order !== 0) return order
    return a[1] - b[1]
  })
  return stabilisedRowArray.map((el) => el[0])
}
