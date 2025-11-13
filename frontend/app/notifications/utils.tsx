import { Notification } from "@/types/notifications";
import { getIncidentTypeMeanings } from "@/utils/formatting";

export default function formatDescription(notification: Notification): string {
    const formatter = new Intl.ListFormat("en", { style: "long", type: "conjunction" });
    const disasterList: string = formatter.format(
        getIncidentTypeMeanings(notification.femaDisaster.designatedIncidentTypes || "")
    );

    return (
        (notification.locationAddress ? notification.locationAddress.streetAddress : "Your business") +
        " was recently affected by " +
        disasterList +
        ". Please register with FEMA as soon as possible. "
    );
}
