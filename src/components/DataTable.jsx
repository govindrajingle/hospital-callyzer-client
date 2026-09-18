import { useState } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TextField,
  InputAdornment,
  Typography,
  Stack,
  MenuItem,
  TablePagination,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";

// Table logic (sorting, filtering) adapted from the licensed Materialize
// template's react-table views, which use @tanstack/react-table under a
// raw HTML <table> + CSS module. Rebuilt here on real MUI Table components
// (proper semantics/accessibility) styled to the same row-height and
// uppercase-header spec their CSS defined, driven by our own theme colors.
//
// This is the single shared table used by every list page in the app
// (patients, appointments, users, roles) — pagination and the generic
// column-filter row live here so every page that renders records gets
// both automatically, rather than each page reimplementing them.
//
// `filters` (optional): [{ columnId, label, options: [{ value, label }] }]
// renders one "All <label>" select per entry, wired to that column's
// react-table filter value. `columnId` must match a column's `id` (or its
// accessor key when no explicit id was given).
export default function DataTable({
  columns,
  data,
  searchPlaceholder,
  emptyMessage = "No records found.",
  filters = [],
  pageSizeOptions = [10, 25, 50],
  initialPageSize = 10,
}) {
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnFilters, setColumnFilters] = useState([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: initialPageSize });

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter, columnFilters, pagination },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const rows = table.getRowModel().rows;
  const totalFilteredRows = table.getFilteredRowModel().rows.length;

  return (
    <Box>
      {(searchPlaceholder || filters.length > 0) && (
        <Stack
          direction="row"
          spacing={1.5}
          flexWrap="wrap"
          useFlexGap
          sx={{ p: 2.5, borderBottom: "1px solid", borderColor: "divider" }}
        >
          {searchPlaceholder && (
            <TextField
              size="small"
              placeholder={searchPlaceholder}
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{ width: { xs: "100%", sm: 280 } }}
            />
          )}
          {filters.map(({ columnId, label, options }) => {
            const column = table.getColumn(columnId);
            if (!column) return null;
            return (
              <TextField
                key={columnId}
                select
                size="small"
                label={label}
                value={column.getFilterValue() ?? ""}
                onChange={(e) => column.setFilterValue(e.target.value || undefined)}
                sx={{ width: { xs: "100%", sm: 180 } }}
              >
                <MenuItem value="">All {label}</MenuItem>
                {options.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                ))}
              </TextField>
            );
          })}
        </Stack>
      )}

      <TableContainer sx={{ overflowX: "auto" }}>
        <Table sx={{ minWidth: 640 }}>
          <TableHead>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableCell
                    key={header.id}
                    align={header.column.columnDef.meta?.align || "left"}
                    sx={{
                      height: 56,
                      textTransform: "uppercase",
                      fontWeight: 700,
                      fontSize: "0.7rem",
                      letterSpacing: "0.06em",
                      color: "text.secondary",
                      bgcolor: "rgba(11, 14, 20, 0.03)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {header.isPlaceholder ? null : header.column.getCanSort() ? (
                      <TableSortLabel
                        active={Boolean(header.column.getIsSorted())}
                        direction={header.column.getIsSorted() || "asc"}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </TableSortLabel>
                    ) : (
                      flexRender(header.column.columnDef.header, header.getContext())
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableHead>

          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" sx={{ py: 8, border: 0 }}>
                  <Typography color="text.secondary">{emptyMessage}</Typography>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={row.id} hover>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      align={cell.column.columnDef.meta?.align || "left"}
                      sx={{ height: 60 }}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {totalFilteredRows > 0 && (
        <TablePagination
          component="div"
          count={totalFilteredRows}
          page={table.getState().pagination.pageIndex}
          rowsPerPage={table.getState().pagination.pageSize}
          rowsPerPageOptions={pageSizeOptions}
          onPageChange={(e, page) => table.setPageIndex(page)}
          onRowsPerPageChange={(e) => table.setPageSize(Number(e.target.value))}
          sx={{ borderTop: "1px solid", borderColor: "divider" }}
        />
      )}
    </Box>
  );
}
