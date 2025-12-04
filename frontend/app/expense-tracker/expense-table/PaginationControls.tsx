import { ChevronLeft, ChevronRight } from "lucide-react";

type PaginationProps = {
    page: number;
    resultsPerPage: number;
    onPageChange: (page: number) => void;
    totalCount: number;
    hasMore?: boolean;
    hasPrevious?: boolean;
};

export default function PaginationControls({
    page,
    resultsPerPage,
    onPageChange,
    totalCount,
    hasMore,
    hasPrevious,
}: PaginationProps) {
    const disablePrevious = hasPrevious !== undefined ? !hasPrevious : page === 0;
    const disableNext = hasMore !== undefined ? !hasMore : (page + 1) * resultsPerPage >= totalCount;

    const start = totalCount === 0 ? 0 : page * resultsPerPage + 1;
    const end = Math.min(totalCount, (page + 1) * resultsPerPage);

    return (
        <div className="flex w-full items-center justify-end gap-1 px-4 py-2">
            <span className="whitespace-nowrap text-sm">
                {start}-{end} of {totalCount}
            </span>

            <button
                type="button"
                onClick={() => !disablePrevious && onPageChange(page - 1)}
                disabled={disablePrevious}
                className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
            >
                <ChevronLeft className="h-4 w-4" />
            </button>

            <button
                type="button"
                onClick={() => !disableNext && onPageChange(page + 1)}
                disabled={disableNext}
                className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
            >
                <ChevronRight className="h-4 w-4" />
            </button>
        </div>
    );
}
