import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ResultsPerPageSelect({
    value,
    onValueChange,
}: {
    value: number;
    onValueChange: (value: number) => void;
}) {
    const pageSizeOptions = [5, 10, 15, 20];
    return (
        <div className="flex items-center gap-2">
            <p className="text-sm">Results per page</p>
            <Select value={value.toString()} onValueChange={(val) => onValueChange(Number(val))}>
                <SelectTrigger>
                    <SelectValue placeholder={value.toString()} />
                </SelectTrigger>
                <SelectContent>
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
