import { DataSource } from "typeorm";
import { SeederFactoryManager } from "typeorm-extension";
import { ClaimLocation } from "../../entities/ClaimLocation";

const seededClaimLocations = [
    {
        // Claim 1 - NEU to Disaster 1 - Location 1
        id: "6d5c4b3a-2f1e-0d9c-8b7a-6f5e4d3c2b1a",
        claimId: "4b3a2f1e-0d9c-8b7a-6f5e-4d3c2b1a0f9e",
        locationAddressId: "8c9d0e1f-2a3b-4c5d-6e7f-8a9b0c1d2e3f",
    },
    {
        // Claim 1 - NEU to Disaster 1 - Location 2
        id: "0f1a2b3c-4d5e-46f7-a8b9-c0d1e2f3a4b5",
        claimId: "4b3a2f1e-0d9c-8b7a-6f5e-4d3c2b1a0f9e",
        locationAddressId: "1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
    },
    {
        // Claim 2 - NEU to Disaster 4 - Location 1
        id: "9a0b1c2d-3e4f-5a6b-7c8d-9e0f1a2b3c4d",
        claimId: "7e8f9a0b-1c2d-3e4f-5a6b-7c8d9e0f1a2b",
        locationAddressId: "8c9d0e1f-2a3b-4c5d-6e7f-8a9b0c1d2e3f",
    },
    {
        // Claim 3 - Big Corp to Disaster 5 - Location 1
        id: "7b8c9d0e-1f2a-43b4-c5d6-e7f8a9b0c1d2",
        claimId: "0c1d2e3f-4a5b-6c7d-8e9f-0a1b2c3d4e5f",
        locationAddressId: "b4c5d6e7-f8a9-4b0c-1d2e-3f4a5b6c7d8e",
    },
    {
        // Claim 4 - Small LLC to Disaster 3 - Location 1
        id: "e5f6a7b8-c9d0-4e1f-2a3b-4c5d6e7f8a9b",
        claimId: "3f4e5d6c-7b8a-9f0e-1d2c-3b4a5f6e7d8c",
        locationAddressId: "e7f8a9b0-c1d2-4e3f-5a6b-7c8d9e0f1a2b",
    },
];

export class ClaimLocationSeeder {
    track = false;
    public async run(dataSource: DataSource, _factoryManager: SeederFactoryManager): Promise<void> {
        const claimLocationRepository = dataSource.getRepository(ClaimLocation);
        await claimLocationRepository.insert(seededClaimLocations);
    }
}
