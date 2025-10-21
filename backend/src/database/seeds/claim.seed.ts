import { DataSource } from "typeorm";
import { Seeder, SeederFactoryManager } from "typeorm-extension";
import { Claim } from "../../entities/Claim";
import { ClaimStatusType } from "../../types/ClaimStatusType";

const seededClaims = [
    {
        // Claim 1 - NEU to Disaster 1
        id: "4b3a2f1e-0d9c-8b7a-6f5e-4d3c2b1a0f9e",
        createdAt: new Date(),
        updatedAt: new Date(),
        companyId: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
        femaDisasterId: "1f2e3d4c-5b6a-7f8e-9d0c-1b2a3f4e5d6c",
        status: ClaimStatusType.ACTIVE,
    },
    {
        // Claim 2 - NEU to Disaster 4
        id: "7e8f9a0b-1c2d-3e4f-5a6b-7c8d9e0f1a2b",
        createdAt: new Date(),
        updatedAt: new Date(),
        companyId: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
        femaDisasterId: "8a9b0c1d-2e3f-4a5b-6c7d-8e9f0a1b2c3d",
        status: ClaimStatusType.ACTIVE,
    },
    {
        // Claim 3 - Big Corp to Disaster 5
        id: "0c1d2e3f-4a5b-6c7d-8e9f-0a1b2c3d4e5f",
        createdAt: new Date(),
        updatedAt: new Date(),
        companyId: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
        femaDisasterId: "1f2e3d4c-5b6a-7f8e-9d0c-1b2a3f4e5d6c",
        status: ClaimStatusType.ACTIVE,
    },
    {
        // Claim 4 - Small LLC to Disaster 3
        id: "3f4e5d6c-7b8a-9f0e-1d2c-3b4a5f6e7d8c",
        createdAt: new Date(),
        updatedAt: new Date(),
        companyId: "0b6d17e5-37fa-4fe6-bca5-1a18051ae222",
        femaDisasterId: "5d4c3b2a-1f0e-9d8c-7b6a-5f4e3d2c1b0a",
        status: ClaimStatusType.ACTIVE,
    },
    {
        // Claim 5 - Business to Disaster 3
        id: "bdf8bcfe-23e1-41b6-ba4f-e846efbaaebe",
        createdAt: new Date(),
        updatedAt: new Date(),
        companyId: "7f8e9d0c-1b2a-3c4d-5e6f-7a8b9c0d1e2f",
        femaDisasterId: "5d4c3b2a-1f0e-9d8c-7b6a-5f4e3d2c1b0a",
        status: ClaimStatusType.ACTIVE,
    },
];

export class ClaimSeeder implements Seeder {
    track = false;
    public async run(dataSource: DataSource, _factoryManager: SeederFactoryManager): Promise<void> {
        const repository = dataSource.getRepository(Claim);
        await repository.insert(seededClaims);
    }
}
