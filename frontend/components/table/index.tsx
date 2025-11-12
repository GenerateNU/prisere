import { flexRender, Table as ReactTable } from "@tanstack/react-table";
import { Table as CTable, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";

export function Table<T>({ table }: { table: ReactTable<T> }) {
    return (
        <CTable>
            <TableHeader>
                {table.getHeaderGroups().map((group) => (
                    <TableRow key={group.id}>
                        {group.headers.map((header) => (
                            <TableHead key={header.id}>
                                {typeof header.column.columnDef.header === "string"
                                    ? header.column.columnDef.header
                                    : header.column.columnDef.header?.(header.getContext())}
                            </TableHead>
                        ))}
                    </TableRow>
                ))}
            </TableHeader>
            <TableBody>
                {table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
                        {row.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id}>
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </TableCell>
                        ))}
                    </TableRow>
                ))}
            </TableBody>
        </CTable>
    );
}
