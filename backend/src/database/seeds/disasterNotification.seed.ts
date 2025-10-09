import { describe, beforeAll, beforeEach } from "bun:test";
import { startTestApp } from "../../tests/setup-tests";
import { IBackup } from "pg-mem";
import { randomUUID } from "crypto";
import { DataSource } from "typeorm";
import { User } from "../../entities/User";
import { FemaDisaster } from "../../entities/FemaDisaster";
import { DisasterNotification } from "../../entities/DisasterNotification";
import { NotificationType } from "../../types/NotificationEnums";

describe("Test acknowledge disaster notifications", () => {
    // let app: Hono;
    let backup: IBackup;
    let dataSource: DataSource;
    let seedUserId1: string;
    let seedUserId2: string;
    let seedDisasterId1: string;
    let seedDisasterId2: string;

    const seedUsers = [
        {
            id: randomUUID(),
            firstName: "John",
            lastName: "Pork",
            email: "john.doe@example.com",
        },
        {
            id: randomUUID(),
            firstName: "Jane",
            lastName: "Porke",
            email: "jane.smith@example.com",
        },
    ];

    const seedDisasters = [
        {
            id: randomUUID(),
            disasterNumber: 12345,
            fipsStateCode: 6,
            declarationDate: new Date(),
            incidentBeginDate: new Date(),
            incidentEndDate: new Date(),
            incidentType: "Flood",
            fipsCountyCode: 1,
            declarationType: "Major Disaster",
            designatedArea: "Test Area",
            designatedIncidentTypes: "Flooding",
        },
        {
            id: randomUUID(),
            disasterNumber: 67890,
            fipsStateCode: 12,
            declarationDate: new Date(),
            incidentBeginDate: new Date(),
            incidentEndDate: new Date(),
            incidentType: "Hurricane",
            fipsCountyCode: 2,
            declarationType: "Medium",
            designatedArea: "Test Area 2",
            designatedIncidentTypes: "Wind",
        },
    ];

    beforeAll(async () => {
        const testAppData = await startTestApp();
        // app = testAppData.app;
        backup = testAppData.backup;
        dataSource = testAppData.dataSource;

        const userRepository = dataSource.getRepository(User);
        await userRepository.insert(seedUsers);

        const disasterRepository = dataSource.getRepository(FemaDisaster);
        await disasterRepository.insert(seedDisasters);

        seedUserId1 = seedUsers[0].id;
        seedUserId2 = seedUsers[1].id;
        seedDisasterId1 = seedDisasters[0].id;
        seedDisasterId2 = seedDisasters[1].id;
    });

    beforeEach(async () => {
        backup.restore();

        const notificationRepository = dataSource.getRepository(DisasterNotification);

        const notifications = [
            {
                id: randomUUID(),
                userId: seedUserId1,
                femaDisasterId: seedDisasterId1,
                notificationType: NotificationType.WEB,
                firstSentAt: new Date(),
                lastSentAt: new Date(),
            },
            {
                id: randomUUID(),
                userId: seedUserId2,
                femaDisasterId: seedDisasterId2,
                notificationType: NotificationType.EMAIL,
                firstSentAt: new Date(),
                lastSentAt: new Date(),
            },
        ];

        await notificationRepository.insert(notifications);
    });
});
