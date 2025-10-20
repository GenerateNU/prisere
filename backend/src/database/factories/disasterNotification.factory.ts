import { setSeederFactory } from "typeorm-extension";
import { DisasterNotification } from "../../entities/DisasterNotification.js";
import { NotificationType, NotificationStatus } from "../../types/NotificationEnums.js";

export default setSeederFactory(DisasterNotification, (faker) => {
    const notification = new DisasterNotification();
    notification.id = faker.string.uuid();
    notification.userId = faker.string.uuid(); // This should be set to actual user IDs in tests to work
    notification.femaDisasterId = faker.string.uuid(); // This should be set to actual disaster IDs in tests to work
    notification.notificationType = faker.helpers.enumValue(NotificationType);
    notification.notificationStatus = faker.helpers.enumValue(NotificationStatus);
    notification.firstSentAt = faker.date.recent();
    notification.lastSentAt = faker.date.recent();
    notification.readAt = faker.datatype.boolean() ? faker.date.recent() : undefined;

    return notification;
});
