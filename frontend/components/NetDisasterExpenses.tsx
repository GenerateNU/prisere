import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardTitle } from "@/components/ui/card";

export default function NetDisasterExpenses() {
    const disasterName = "Hurricane Sandy"; // Example disaster name

    return (
        <Card className="h-[331px] p-[25px] border-[1px] border-black gap-[10px]">
            <CardTitle className="text-[25px]">Net Disaster Expense</CardTitle>
            <CardDescription className="text-black">Expenses for {disasterName}</CardDescription>
            <CardContent className="flex-1 p-0">
                <div className="text-[25px] font-bold">$5,776</div>
            </CardContent>
            <CardFooter className="p-0 justify-center">
                <Button className="h-[32px] text-[10px] rounded-[10px] w-fit">See Business Risk</Button>
            </CardFooter>
        </Card>
    );
}
