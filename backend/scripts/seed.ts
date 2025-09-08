import { runDatabaseSeeders } from "../src/typeorm-config.js";


const seedDatabase = async () => {
    try {
        await runDatabaseSeeders();
        console.log("Sucessfully Seeded Database");
    } catch(_err) {
        console.log("Error Seeding Database");
    } finally {
        process.exit(0);
    }
}
await seedDatabase();
