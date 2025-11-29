import { BannerData } from "@/types/user";
import { Card, CardContent, CardFooter, CardHeader } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { FaRegChartBar } from "react-icons/fa";
import { FaArrowDown } from "react-icons/fa6";

type Props = {
    lineItemsPending: number;
    lineItemsConfirmed: number;
    totalConfirmedExpenses: number | undefined;
    filterPending: () => void;
    handleSwitchToNetDisaster?: () => void;
}

export default function ReviewExpenses({ handleSwitchToNetDisaster, lineItemsPending, lineItemsConfirmed, totalConfirmedExpenses, filterPending }: Props) {

    const totalItems = lineItemsPending + lineItemsConfirmed;

    return (
        <Card className="h-full p-[24px] gap-[24px] flex flex-col">
            <CardHeader className="w-full p-0">
                <div className="flex items-center justify-between">
                    <div className="">
                        <h2 className="text-[24px] text-nowrap font-bold">Review Expenses</h2>
                        <p className="text-[15px] text-nowrap text-charcoal">Expenses from your current claim</p>
                    </div>
                    <Button className="w-[35px] h-[35px] bg-[var(--slate)] self-start"
                        onClick={handleSwitchToNetDisaster}>
                        <FaRegChartBar style={{ fontSize: "18px", width: "18px" }} />
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="p-0 flex flex-col flex-1 gap-[24px]">
                <div className="p-0 flex mb-[14px]">
                    <div className="w-1/2">
                        <p className="text-[16px] text-nowrap text-charcoal">Confirmed</p>
                        <p className="text-[22px] text-charcoal font-bold">${totalConfirmedExpenses?.toLocaleString() ?? 0}</p>
                    </div>
                    <div className="w-1/2">
                        <p className="text-[16px] text-nowrap text-charcoal">Needs Review</p>
                        <p className="text-[22px] text-charcoal font-bold">{lineItemsPending} Transaction{lineItemsPending !== 1 && "s"}</p>
                    </div>
                </div>
                <div className="flex flex-col gap-[12px] ">
                    <div className={`flex w-full ${lineItemsPending > 0 && "gap-[4px]"}`}>
                        <div className="h-[29px] rounded-[4px] bg-[var(--fuchsia)]"
                            style={{ flex: lineItemsConfirmed }} />
                        <div className="w-full h-[29px] rounded-[4px] bg-[var(--light-fuchsia)]"
                            style={{ flex: lineItemsPending }} />
                    </div>
                    <p>Reviewed {lineItemsConfirmed} of {totalItems}</p>
                </div>
            </CardContent>
            <CardFooter className="p-0">
                <Button className="h-[34px] w-fit bg-[var(--fuchsia)]" onClick={filterPending}>
                    <FaArrowDown className="text-white" size={"10px"} style={{ strokeWidth: 0.5, width: "10px" }} /><p className="text-white text-[14px]">Go to Pending</p>
                </Button>
            </CardFooter>
        </Card>
    );
}