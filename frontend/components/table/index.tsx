import { flexRender, Table as ReactTable } from "@tanstack/react-table";
import { Table as CTable, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Spinner } from "../ui/spinner";

export function Table<T>({ table, isLoading, onRowClick }: { table: ReactTable<T>; isLoading: boolean; onRowClick?: (row: T) => void }) {
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
            {isLoading ? (
                <TableBody>
                    <TableRow>
                        <TableCell colSpan={table.getAllColumns().length} className="text-center py-10">
                            <div className="flex items-center justify-center w-full">
                                <Spinner />
                            </div>
                        </TableCell>
                    </TableRow>
                </TableBody>
            ) : (
                <TableBody>
                    {table.getRowModel().rows.map((row) => (
                        <TableRow
                        key={row.id}
                        onClick={() => onRowClick?.(row.original)}
                        className={[
                            onRowClick ? "cursor-pointer hover:bg-muted/50" : "",
                            row.depth > 0 ? "bg-muted/100" : "",
                        ].join(" ")}
                    >
                            {row.getVisibleCells().map((cell) => (
                                <TableCell key={cell.id}>
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            )}
        </CTable>
    );
}
