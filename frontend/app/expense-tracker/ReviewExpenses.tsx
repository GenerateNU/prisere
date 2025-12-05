import { Card, CardContent, CardFooter, CardHeader } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { FaRegChartBar } from "react-icons/fa";
import { FaArrowDown } from "react-icons/fa6";
import ErrorDisplay from "@/components/ErrorDisplay";
import { LargeLoading } from "@/components/loading";

type Props = {
    lineItemsPending: number;
    lineItemsConfirmed: number;
    totalConfirmedExpenses: number | undefined;
    filterPending: () => void;
    handleSwitchToNetDisaster?: () => void;
    isLoading: boolean;
    error: boolean;
};

export default function ReviewExpenses({
    handleSwitchToNetDisaster,
    lineItemsPending,
    lineItemsConfirmed,
    totalConfirmedExpenses,
    filterPending,
    isLoading,
    error,
}: Props) {
    const totalItems = lineItemsPending + lineItemsConfirmed;

    return (
        <Card className="h-full p-[24px] gap-[24px] flex flex-col border-none shadow-none">
            <CardHeader className="w-full p-0">
                <div className="flex items-center justify-between">
                    <div className="">
                        <h2 className="text-[24px] text-nowrap font-bold">Review Expenses</h2>
                        <p className="text-[15px] text-nowrap text-charcoal">Track Disaster Related Expenses</p>
                    </div>
                    <Button
                        className="w-[35px] h-[35px] bg-[var(--slate)] hover:bg-fuchsia hover:text-white self-start"
                        onClick={handleSwitchToNetDisaster}
                    >
                        <FaRegChartBar className="hover:text-white" style={{ fontSize: "18px", width: "18px" }} />
                    </Button>
                </div>
            </CardHeader>

            {isLoading ? (
                <CardContent className="h-[200px] w-full p-0">
                    <LargeLoading />
                </CardContent>
            ) : error ? (
                <CardContent className="h-[200px] w-full p-0">
                    <ErrorDisplay />
                </CardContent>
            ) : (
                <>
                    <CardContent className="p-0 flex flex-col flex-1 gap-[24px]">
                        <div className="p-0 flex mb-[14px]">
                            <div className="w-1/2">
                                <p className="text-[16px] text-nowrap text-charcoal">Confirmed</p>
                                <p className="text-[22px] text-charcoal font-bold">
                                    ${totalConfirmedExpenses?.toLocaleString() ?? 0}
                                </p>
                            </div>
                            <div className="w-1/2">
                                <p className="text-[16px] text-nowrap text-charcoal">Needs Review</p>
                                <p className="text-[22px] text-charcoal font-bold">
                                    {lineItemsPending} Transaction{lineItemsPending !== 1 && "s"}
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-col gap-[12px] ">
                            <div className={`flex w-full ${lineItemsPending > 0 && "gap-[4px]"}`}>
                                <div
                                    className="h-[29px] rounded-[4px] bg-[var(--fuchsia)]"
                                    style={{ flex: lineItemsConfirmed }}
                                />
                                <div
                                    className="w-full h-[29px] rounded-[4px] bg-[var(--light-fuchsia)]"
                                    style={{ flex: lineItemsPending }}
                                />
                            </div>
                            <p>
                                Reviewed {lineItemsConfirmed} of {totalItems}
                            </p>
                        </div>
                    </CardContent>
                    <CardFooter className="p-0">
                        <Button
                            className="group h-[34px] w-fit bg-[var(--fuchsia)] hover:bg-pink hover:text-fuchsia"
                            onClick={filterPending}
                        >
                            <FaArrowDown
                                className="text-white group-hover:text-fuchsia"
                                size={"10px"}
                                style={{ strokeWidth: 0.5, width: "10px" }}
                            />
                            <p className="text-white group-hover:text-fuchsia text-[14px]">Go to Pending</p>
                        </Button>
                    </CardFooter>
                </>
            )}
        </Card>
    );
}
