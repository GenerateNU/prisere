import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";

export default function PaginationControls({ page, onPageChange}:
{ page: number; onPageChange: (page: number) => void}) {
    return (
        <Pagination>
            <PaginationContent>
                <PaginationItem>
                    <PaginationPrevious className="text-sm"
                                        onClick={() => onPageChange(Math.max(0, page - 1))}
                    />
                </PaginationItem>
                <PaginationItem>
                    <PaginationNext  className="text-sm"
                                     onClick={() => onPageChange(page + 1)}
                    />
                </PaginationItem>
            </PaginationContent>
        </Pagination>
    );
}