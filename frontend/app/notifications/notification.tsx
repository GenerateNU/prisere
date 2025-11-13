import { Button } from "@/components/ui/button";
import { Notification as NotificationType } from "@/types/notifications";
import { getDeclarationTypeMeanings } from "@/utils/formatting";
import { RiMore2Fill } from "react-icons/ri";
import formatDescription from "./utils";
import { dateFormatter } from "@/utils/formatting";

interface NotificationProps {
    notification: NotificationType;
}
export default function Notification({ notification }: NotificationProps) {
    return (
        <div className="rounded-2xl p-6 max-w-full bg-white">
            <div className="w-full flex justify-between">
                <h2 className="text-2xl font-bold text-charcoal-900 mb-2">{getDeclarationTypeMeanings(notification.femaDisaster.declarationType)}</h2>
                <Button
                    rounded="icon"
                    variant="secondary"
                    size="icon"
                    onClick={() => console.log("clicked")}
                    className="text-charcoal"
                    aria-label="More options"
                >
                    <RiMore2Fill />
                </Button>
            </div>
            <p className="text-sm text-fuchsia font-medium mb-4">{dateFormatter.format(new Date(notification.femaDisaster.declarationDate))}</p>
            <p className="text-charcoal leading-relaxed">{formatDescription(notification)}</p>
            <p className="text-[#8E8E8E] text-sm"> FEMA-ID:{notification.femaDisaster.disasterNumber}</p>
        </div>
    );
}

export function LoadingNotification() {
    return (
        <div className="rounded-2xl p-6 max-w-full bg-white">
            <div className="flex items-start justify-between mb-3">
                <Button
                    disabled
                    rounded="icon"
                    variant="secondary"
                    size="icon"
                    onClick={() => console.log("clicked")}
                    className="text-charcoal"
                    aria-label="More options"
                >
                    <RiMore2Fill />
                </Button>
            </div>
            <h2 className="text-2xl font-bold text-charcoal-900 mb-2">Loading...</h2>
            <p className="text-sm text-fuchsia font-medium mb-4">Time Declared</p>
            <p className="text-charcoal leading-relaxed">Description</p>
        </div>
    );
}
