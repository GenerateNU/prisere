import { createClaimPDF } from "@/api/claim";
import { Table } from "@/components/table";
import { GetCompanyClaimResponse } from "@/types/claim";
import { UseQueryResult } from "@tanstack/react-query";
import { getCoreRowModel, getExpandedRowModel, useReactTable } from "@tanstack/react-table";
import { PropsWithChildren } from "react";
import { PiDownloadSimpleLight } from "react-icons/pi";
import { TfiTrash } from "react-icons/tfi";

function IconButton({ onClick, children }: PropsWithChildren<{ onClick: () => void }>) {
    return (
        <button onClick={onClick} className="p-2.5 rounded-full bg-slate hover:bg-slate/80 cursor-pint">
            {children}
        </button>
    );
}

export default function TableContent({ claims }: { claims: UseQueryResult<GetCompanyClaimResponse | undefined> }) {
    const table = useReactTable({
        getCoreRowModel: getCoreRowModel(),
        getExpandedRowModel: getExpandedRowModel(),
        data: claims?.data?.data ?? [],
        manualSorting: true,
        columns: [
            {
                id: "name",
                header: () => "Name",
                accessorFn: (row) => row.name,
            },
            {
                id: "creationDate",
                header: () => "Creation Date",
                accessorFn: (row) => new Date(row.createdAt).toLocaleDateString(),
            },
            {
                id: "actions",
                cell: ({ row }) => {
                    return (
                        <div className="flex items-center justify-end pr-2 gap-2">
                            <IconButton
                                onClick={async () => {
                                    try {
                                        const { url } = await createClaimPDF(row.original.id);
                                        window.open(url, "_blank");
                                    } catch (error) {
                                        console.error(error);
                                    }
                                }}
                            >
                                <PiDownloadSimpleLight size={18} />
                            </IconButton>
                            <IconButton onClick={() => {}}>
                                <TfiTrash size={18} />
                            </IconButton>
                        </div>
                    );
                },
            },
        ],
    });

    if (claims.error) return <div>Error loading claims</div>;

    return <Table table={table} isLoading={claims.isLoading} />;
}
