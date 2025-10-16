import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardTitle } from "@/components/ui/card";
import NavBarCircle from "@/icons/NavBarCircle";
import Link from "next/link";

export default function NextSteps() {
    return (
        <Card className="h-[371] p-[25px] border-[1px] border-black">
            <CardTitle className="text-[25px]">Next Steps</CardTitle>
            <CardContent className="flex-1 p-0">
                <ul className="flex flex-col gap-[15px]">
                    <li>
                        <Link href="/dashboard">
                            <div className="flex text-[15px] items-center gap-[10px] rounded-[10px] border-[1px] border-[#bfbfbf] p-[10px]">
                                <NavBarCircle size={20} />
                                Review Expenses in the Expense Tracker
                            </div>
                        </Link>
                    </li>
                    <li>
                        <Link href="/dashboard">
                            <div className="flex text-[15px] items-center gap-[10px] rounded-[10px] border-[1px] border-[#bfbfbf] p-[10px]">
                                <NavBarCircle size={20} />
                                Review Profits in the Expense Tracker
                            </div>
                        </Link>
                    </li>
                    <li>
                        <Link href="/dashboard">
                            <div className="flex text-[15px] items-center gap-[10px] rounded-[10px] border-[1px] border-[#bfbfbf] p-[10px]">
                                <NavBarCircle size={20} />
                                Review FEMA resources near Boston, Massachusetts
                            </div>
                        </Link>
                    </li>
                </ul>
            </CardContent>
            <CardFooter className="p-0 flex justify-end">
                <Button className="h-[32px] text-[10px] rounded-[10px] w-fit ">See Business Risk</Button>
            </CardFooter>
        </Card>
    );
}
