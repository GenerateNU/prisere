import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function ResultsPerPageSelect({
                                                 value,
                                                 onValueChange,
                                             }: {
    value: number;
    onValueChange: (value: number) => void;
}) {
    const pageSizeOptions = [5, 10, 15, 20];

    return (
        <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground whitespace-nowrap">
        Rows per page:
      </span>
            <Select
                value={value.toString()}
                onValueChange={(val) => onValueChange(Number(val))}
            >
                <SelectTrigger
                    className="w-auto h-auto px-1 py-0 border-none bg-transparent shadow-none
                    focus-visible:ring-0 focus-visible:ring-offset-0"
                >
                    <SelectValue placeholder={value.toString()} />
                </SelectTrigger>

                <SelectContent className="min-w-[3rem]">
                    {pageSizeOptions.map((i) => (
                        <SelectItem key={i} value={i.toString()}>
                            {i}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
