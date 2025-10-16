import { DataSource } from "typeorm";
import { User } from "../../entities/User";
import { FemaDisaster } from "../../entities/FemaDisaster";
import { DisasterNotification } from "../../entities/DisasterNotification";
import { NotificationType } from "../../types/NotificationEnums";
import { randomUUID } from "crypto";

export interface TestDataSetup {
    users: {
        user1: User;
        user2: User;
        user3: User;
    };
    disasters: {
        disaster1: FemaDisaster;
        disaster2: FemaDisaster;
    };
    notifications?: {
        notification1: DisasterNotification;
        notification2: DisasterNotification;
    };
}

export const createTestData = async (dataSource: DataSource, includeNotifications = true): Promise<TestDataSetup> => {
    const seedUsers = [
        {
            id: "0199e585-621d-744a-81e2-8cc93d48b23d",
            firstName: "Alice",
            lastName: "Bob",
            email: "alice@prisere.com",
        },
        {
            id: "0199e585-a52b-7bcf-982d-a1c5230b3d40",
            firstName: "Jane",
            lastName: "Smith",
            email: "jane@prisere.com",
        },
        {
            id: "0189e585-a52b-7bcf-982d-a1c5230b3d40",
            firstName: "Jane",
            lastName: "Buddy",
            email: "janeB@prisere.com",
        },
    ];

    const userRepository = dataSource.getRepository(User);
    await userRepository.insert(seedUsers);

    const seedDisasters = [
        {
            id: "0199e585-d79d-785d-86fe-a51d51d4739f",
            disasterNumber: 1011,
            fipsStateCode: 23,
            declarationDate: new Date("2025-09-28T00:00:00.000Z"),
            incidentBeginDate: new Date("2025-09-29T00:00:00.000Z"),
            incidentEndDate: new Date("2025-10-05T00:00:00.000Z"),
            incidentType: "bad",
            fipsCountyCode: 999,
            declarationType: "11",
            designatedArea: "County A",
            designatedIncidentTypes: "1",
        },
        {
            id: "0199e585-ef55-7ea5-beec-f786e389d967",
            disasterNumber: 1012,
            fipsStateCode: 24,
            declarationDate: new Date("2025-09-28T00:00:00.000Z"),
            incidentBeginDate: new Date("2025-09-29T00:00:00.000Z"),
            incidentEndDate: new Date("2025-10-05T00:00:00.000Z"),
            incidentType: "worse",
            fipsCountyCode: 888,
            declarationType: "12",
            designatedArea: "County B",
            designatedIncidentTypes: "2",
        },
    ];

    const disasterRepository = dataSource.getRepository(FemaDisaster);
    await disasterRepository.insert(seedDisasters);

    const result: TestDataSetup = {
        users: {
            user1: { ...seedUsers[0] } as User,
            user2: { ...seedUsers[1] } as User,
            user3: { ...seedUsers[2] } as User,
        },
        disasters: {
            disaster1: { ...seedDisasters[0], disasterNotifications: [] } as FemaDisaster,
            disaster2: { ...seedDisasters[1], disasterNotifications: [] } as FemaDisaster,
        },
    };

    // Optionally create notifications
    if (includeNotifications) {
        const seedNotifications = [
            {
                id: randomUUID(),
                userId: seedUsers[0].id,
                femaDisasterId: seedDisasters[0].id,
                notificationType: NotificationType.WEB,
                firstSentAt: new Date(),
                lastSentAt: new Date(),
            },
            {
                id: randomUUID(),
                userId: seedUsers[1].id,
                femaDisasterId: seedDisasters[1].id,
                notificationType: NotificationType.EMAIL,
                firstSentAt: new Date(),
                lastSentAt: new Date(),
            },
            {
                id: randomUUID(),
                userId: seedUsers[1].id,
                femaDisasterId: seedDisasters[1].id,
                notificationType: NotificationType.EMAIL,
                firstSentAt: new Date(),
                lastSentAt: new Date(),
            },
            {
                id: randomUUID(),
                userId: seedUsers[1].id,
                femaDisasterId: seedDisasters[1].id,
                notificationType: NotificationType.EMAIL,
                firstSentAt: new Date(),
                lastSentAt: new Date(),
            },
            {
                id: randomUUID(),
                userId: seedUsers[1].id,
                femaDisasterId: seedDisasters[1].id,
                notificationType: NotificationType.WEB,
                firstSentAt: new Date(),
                lastSentAt: new Date(),
            },
        ];
        for (let i = 0; i < 25; i++) {
            seedNotifications.push({
                id: randomUUID(),
                userId: seedUsers[2].id,
                femaDisasterId: seedDisasters[1].id,
                notificationType: NotificationType.WEB,
                firstSentAt: new Date(),
                lastSentAt: new Date(),
            });
        }

        const notificationRepository = dataSource.getRepository(DisasterNotification);
        await notificationRepository.insert(seedNotifications);

        result.notifications = {
            notification1: { ...seedNotifications[0] } as DisasterNotification,
            notification2: { ...seedNotifications[1] } as DisasterNotification,
        };
    }

    return result;
};
