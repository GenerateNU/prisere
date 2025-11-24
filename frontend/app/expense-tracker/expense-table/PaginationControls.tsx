import { ChevronLeft, ChevronRight } from "lucide-react";

type PaginationProps = {
    page: number;
    resultsPerPage: number;
    onPageChange: (page: number) => void;
    totalNumPurchases?: number;
};

export default function PaginationControls({ page, resultsPerPage, onPageChange, totalNumPurchases }: PaginationProps) {
    const isFirstPage = page === 0;
    const total = totalNumPurchases ?? 0;
    const isLastPage = (page + 1) * resultsPerPage >= total;

    const start = total === 0 ? 0 : page * resultsPerPage + 1;
    const end = Math.min(total, (page + 1) * resultsPerPage);

    return (
        <div className="flex w-full items-center justify-end gap-1 px-4 py-2">
            <span className="whitespace-nowrap text-sm">
                {start}-{end} of {total}
            </span>

            <button
                type="button"
                onClick={() => !isFirstPage && onPageChange(page - 1)}
                disabled={isFirstPage}
                className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
            >
                <ChevronLeft className="h-4 w-4" />
            </button>

            <button
                type="button"
                onClick={() => !isLastPage && onPageChange(page + 1)}
                disabled={isLastPage}
                className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
            >
                <ChevronRight className="h-4 w-4" />
            </button>
        </div>
    );
}
