import { sumInvoicesByCompanyAndDateRange } from "@/api/invoice";
import { sumPurchasesByCompanyAndDateRange } from "@/api/purchase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardTitle } from "@/components/ui/card";
import NavBarCircle from "@/icons/NavBarCircle";
import { useQuery } from "@tanstack/react-query";

export default function RevenueAndExpenses() {

    const getMonthStart = () => {
        const today = new Date();
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth();
        return new Date(currentYear, currentMonth, 1);
    }

    const startOfMonth = getMonthStart();
    const endOfMonth = new Date();

    const { data: totalMonthRevenue } = useQuery({
        queryKey: ['totalRevenue'],
        queryFn: () => sumInvoicesByCompanyAndDateRange(startOfMonth, endOfMonth),
    });

    const { data: totalMonthExpenses } = useQuery({
        queryKey: ['totalExpenses'],
        queryFn: () => sumPurchasesByCompanyAndDateRange(startOfMonth, endOfMonth),
    });

    return (
        <Card className="h-[371] p-[25px] border-[1px] border-black">
            <CardTitle className="text-[25px]">Revenue & Expenses</CardTitle>
            <CardContent className="flex-1 p-0">
                <div className="flex">
                    <div className="basis-1/2">
                        <div className="flex items-center gap-[8px] mb-[4px]">
                            <NavBarCircle size={10} />
                            Total Revenue this Month
                        </div>
                        <div className="flex text-[25px] font-bold mb-[29px]">
                            ${totalMonthRevenue?.total ?? 0}
                        </div>
                        <div className="flex items-center gap-[8px] mb-[4px]">
                            <NavBarCircle size={10} />
                            Total Expenses this Month
                        </div>
                        <div className="flex text-[25px] font-bold">
                            ${totalMonthExpenses?.total ?? 0}
                        </div>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="p-0">
                <Button className="h-[32px] text-[10px] rounded-[10px] w-fit">View Expense Tracker</Button>
            </CardFooter>
        </Card>
    );
}