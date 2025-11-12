import { ChevronDown, ChevronRight } from "lucide-react";

export function CollapsibleArrow({ isOpen, onClick }: { isOpen: boolean; onClick: () => void }) {
    return (
        <button
            className="p-1 hover:bg-muted rounded"
            onClick={(e) => {
                e.stopPropagation();
                onClick();
            }}
        >
            {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>
    );
}
