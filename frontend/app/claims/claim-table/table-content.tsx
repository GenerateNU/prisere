import { createClaimPDF, deleteClaim } from "@/api/claim";
import { Table } from "@/components/table";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { GetCompanyClaimResponse } from "@/types/claim";
import { useMutation, useQueryClient, UseQueryResult } from "@tanstack/react-query";
import { getCoreRowModel, getExpandedRowModel, useReactTable } from "@tanstack/react-table";
import { PropsWithChildren, useState } from "react";
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
    const [dialogToDeleteClaimId, setDialogToDeleteClaimId] = useState<string | null>(null);

    const queryClient = useQueryClient();
    const claimDelete = useMutation({
        mutationFn: deleteClaim,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["company-claims"] });
        },
    });

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
                            <IconButton
                                onClick={() => {
                                    setDialogToDeleteClaimId(row.original.id);
                                }}
                            >
                                <TfiTrash size={18} />
                            </IconButton>
                        </div>
                    );
                },
            },
        ],
    });

    if (claims.error) return <div>Error loading claims</div>;

    return (
        <div>
            <Table table={table} isLoading={claims.isLoading} />
            <Dialog
                open={!!dialogToDeleteClaimId}
                onOpenChange={(open) => {
                    if (open) return;
                    setDialogToDeleteClaimId(null);
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete claim</DialogTitle>
                    </DialogHeader>
                    <DialogDescription>Are you sure you want to delete this claim?</DialogDescription>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button className="text-sm bg-light-fuchsia text-fuchsia w-[70px]" size="lg">
                                Cancel
                            </Button>
                        </DialogClose>

                        <Button
                            size="lg"
                            onClick={() => {
                                claimDelete.mutate(dialogToDeleteClaimId!);
                                setDialogToDeleteClaimId(null);
                            }}
                            className="bg-fuchsia text-white px-[20px] py-[12px] w-fit h-[42px] text-[14px] rounded-50"
                        >
                            Yes, delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
