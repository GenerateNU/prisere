import { runDatabaseSeeders } from "../typeorm-config.js";


const seedDatabase = async () => {
    try {
        await runDatabaseSeeders();
        console.log("Sucessfully Seeded Database");
    } catch(err:any) {
        console.log("Error Seeding Database");
    } finally {
        process.exit(0);
      }
}
await seedDatabase();
