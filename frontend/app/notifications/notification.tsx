import { updateNotificationStatus } from "@/api/notifications";
import Loading from "@/components/loading";
import { Button } from "@/components/ui/button";
import { Notification as NotificationType } from "@/types/notifications";
import { dateFormatter, getDeclarationTypeMeanings } from "@/utils/formatting";
import { useServerActionMutation } from "@/api/requestHandlers";
import { useState } from "react";
import { RiMore2Fill } from "react-icons/ri";
import formatDescription from "./utils";
import { Spinner } from "@/components/ui/spinner";

interface NotificationProps {
    notification: NotificationType;
}
export default function Notification({ notification }: NotificationProps) {
    const [error, setError] = useState(false);
    const [title, setTitle] = useState(notification.notificationStatus);
    const { mutate, isPending } = useServerActionMutation({
        mutationFn: () => updateNotificationStatus(notification.id, title == "read" ? "unread" : "read"),
        onError: () => {
            setError(false);
        },
        onSuccess: () => {
            setTitle(title == "read" ? "unread" : "read");
        },
    });

    return (
        <div className={`rounded-2xl p-6 max-w-full bg-white `}>
            <h2 className="text-2xl font-bold text-charcoal-900 mb-2">
                {getDeclarationTypeMeanings(notification.femaDisaster.declarationType)}
            </h2>
            <p className="text-sm text-fuchsia font-medium mb-4">
                {dateFormatter.format(new Date(notification.femaDisaster.declarationDate))}
            </p>
            <div className="flex justify-between">
                <div>
                    <p className="text-charcoal leading-relaxed">{formatDescription(notification)}</p>
                    <p className="text-[#8E8E8E] text-sm"> FEMA-ID:{notification.femaDisaster.disasterNumber}</p>
                </div>
                {title === "unread" && (
                    <div className="self-end">
                        <Button
                            variant="secondary"
                            className="w-fit bg-fuchsia text-white hover:bg-fuchsia/80"
                            size="sm"
                            disabled={isPending}
                            onClick={() => mutate()}
                        >
                            {isPending ? <Spinner /> : <></>}
                            Mark as unread
                        </Button>
                        {error && <p className="text-sm text-fuchsia">Error Setting Status</p>}
                    </div>
                )}
            </div>
        </div>
    );
}

export function LoadingNotification() {
    return (
        <div className="rounded-2xl p-6 max-w-full bg-white">
            <div className="w-full flex justify-between pb-2">
                <h2 className="text-2xl font-bold text-charcoal-900 mb-2">Notification</h2>

                <Button
                    rounded="icon"
                    variant="secondary"
                    size="icon"
                    className="text-charcoal hover:bg-fuchsia hover:text-white"
                    aria-label="More options"
                >
                    <RiMore2Fill />
                </Button>
            </div>
            <Loading lines={2} />
        </div>
    );
}
