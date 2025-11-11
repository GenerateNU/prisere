import { Button } from "@/components/ui/button";
import { RiMore2Fill } from "react-icons/ri";

export default function Notification() {
    return (
        <div className="rounded-2xl p-6 max-w-full bg-white">
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                    {true && (
                        <span className="bg-[#DDEFF1] text-teal text-xs font-semibold px-3 py-1 rounded">New</span>
                    )}
                </div>
                <Button rounded="icon" variant="secondary" size="icon" onClick={() => console.log("clicked")} className="text-charcoal" aria-label="More options">
                   <RiMore2Fill />
                </Button>
            </div>

            <h2 className="text-2xl font-bold text-charcoal-900 mb-2">Disaster Alert</h2>

            <p className="text-sm text-fuchsia font-medium mb-4">Updated Time</p>

            <p className="text-charcoal leading-relaxed">description</p>
        </div>
    );
}

export function LoadingNotification() {
    return (
        <div className="rounded-2xl p-6 max-w-full bg-white">
            <div className="flex items-start justify-between mb-3">
                <Button disabled rounded="icon" variant="secondary" size="icon" onClick={() => console.log("clicked")} className="text-charcoal" aria-label="More options">
                   <RiMore2Fill />
                </Button>
            </div>
            <h2 className="text-2xl font-bold text-charcoal-900 mb-2">Loading...</h2>
            <p className="text-sm text-fuchsia font-medium mb-4">Time Declared</p>
            <p className="text-charcoal leading-relaxed">Description</p>
        </div>
    )
}
