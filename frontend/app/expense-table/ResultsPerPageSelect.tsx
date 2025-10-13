import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ResultsPerPageSelect({
    value,
    onValueChange,
}: {
    value: number;
    onValueChange: (value: number) => void;
}) {
    return (
        <div className="flex items-center gap-2">
            <p className="text-sm">Results per page</p>
            <Select value={value.toString()} onValueChange={(val) => onValueChange(Number(val))}>
                <SelectTrigger>
                    <SelectValue placeholder={value.toString()} />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="15">15</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                </SelectContent>
            </Select>
        </div>
    );
}
