import { Button } from "@/components/ui/button";
import { IoMdArrowBack } from "react-icons/io";

export default async function Page() {
    return (
        <div className="p-15 bg-slate w-full h-screen">
            <div className="flex row gap-5"> 
                <Button size="icon">
                    <IoMdArrowBack/>
                </Button>
            <h1 className = "text-charcoal text-3xl font-bold"> Notifications </h1>
            </div>

        </div>
    )
}
