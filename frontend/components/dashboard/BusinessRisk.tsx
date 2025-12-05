import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardTitle } from "@/components/ui/card";

export default function BusinessRisk() {
    return (
        <Card className="h-[193px] p-[25px] border-[1px] border-black">
            <CardTitle className="text-[25px] " style={{ display: "none" }}>
                Location Based Risk
            </CardTitle>
            <CardContent className="flex-1 p-0"></CardContent>
            <CardFooter className="p-0">
                <Button className="h-[32px] text-[10px] rounded-[10px] w-fit hover:bg-fuchsia hover:text-white">
                    See Business Risk
                </Button>
            </CardFooter>
        </Card>
    );
}
