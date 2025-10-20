import { DataSource } from "typeorm";
import { Seeder, SeederFactoryManager } from "typeorm-extension";
import { DisasterNotification } from "../../entities/DisasterNotification";
import { NotificationType } from "../../types/NotificationEnums";
import { FemaDisaster } from "../../entities/FemaDisaster";

export const seededFemaDisasters = [
    {
        id: "94c00695-39f9-4c92-a4cb-76ccb8664516",
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
        id: "a36dc729-c2ee-411d-8291-3b7e4f9c4d80",
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

export const seededDisasterNotifications = [
    {
        id: "d16424ca-d389-4f17-8138-2a6a62923a23",
        userId: "c34197fc-b944-4291-89ee-2e47ea77dc27",
        femaDisasterId: seededFemaDisasters[0].id,
        notificationType: NotificationType.WEB,
        firstSentAt: new Date(),
        lastSentAt: new Date(),
    },
    {
        id: "5ef04fd1-e342-4d8a-8d1a-6d14efcea5f0",
        userId: "c34197fc-b944-4291-89ee-2e47ea77dc27",
        femaDisasterId: seededFemaDisasters[1].id,
        notificationType: NotificationType.EMAIL,
        firstSentAt: new Date(),
        lastSentAt: new Date(),
    },
];

export class DisasterNotificationSeeder implements Seeder {
    track = false;
    public async run(dataSource: DataSource, _factoryManager: SeederFactoryManager): Promise<void> {
        // c34197fc-b944-4291-89ee-2e47ea77dc27
        await dataSource.manager.insert(FemaDisaster, seededFemaDisasters);
        await dataSource.manager.insert(DisasterNotification, seededDisasterNotifications);
    }
}
