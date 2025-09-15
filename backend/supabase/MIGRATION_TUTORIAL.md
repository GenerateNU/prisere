# Supabase Migration Tutorial

We are using a Supabase-hosted Postgres database. Our schema is relational and we handle changes by making migration scripts so that we have a changelog of the database schema history. Because we are using TypeORM a lot of this work is done for you!

The following pathway allows you to make and test schema changes locally via migration script without affecting the shared database until you're ready. More information on local development best practices can be found in the [Supabase docs](https://supabase.com/docs/guides/cli/local-development). **Note that running the DB locally requires Docker to be installed and running.**

0. Install the Supabase CLI by following directions [here](https://supabase.com/docs/guides/local-development/cli/getting-started?queryGroups=access-method&access-method=postgres&queryGroups=platform&platform=macos).
1. Create a new feature branch off of main to make sure you are up-to-date with any recently-added migration scripts.
2. `cd` into `./backend`
3. With Docker running, run:
   ```bash
   bun run supabase start`
   ```
   - This will take some time on the first run, because the CLI needs to download the Docker images to your local machine. The CLI includes the entire Supabase toolset, and a few additional images that are useful for local development
3. Create/Edit entities in the `./src/entities` directory
4. Create a new migration script by running:
   ```bash
   bun run migration:gen ./src/migrations/<migration-name> -d ./src/typeorm-config.ts
   ``` 
   Your migration-name should be concise but descriptive of what's going on!
   - Ex. `bun run migration:gen ./src/migrations/UpdateTrackAddURL -d ./src/typeorm-config.ts` if adding a URL column to the track table.
5. Then apply your db changes locally with:
   ```bash
   bun run migration:dev
   ```
6. If applying the db changes goes smoothly, go to <http://localhost:54323> to see a local version of the Supabase dashboard, where your sample data will be visible. Feel free to add/update data to test out your new schema and any constraints.
   - Anything you do in this local database won't impact our shared instance
7. Test the changes against a locally running DB.
8. When done, run `bun run supabase stop` to stop the local instance of the DB.

### After script is approved/merged:

0. If this is your first time pushing to our shared database, you might need to link the supabase-cli to our specific project. Do this via `supabase link --project-ref [PROJECT-REF-VALUE]`
   - Our specific project ref can be found in the Supabase UI (look at the string in the URL following `/project/` or slack a TL if you're stuck)
   - It will also prompt you for a DB password - slack a TL to get this
   - It'll also prompt you to log in to Supabase
1. Run the actual script(s) against the supabase db running:
   ```bash
   bun run migration:prod
   ```
