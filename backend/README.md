## Setup

- Run `bun  install` to install the dependencies.
- Run `cp .env.example .env`.
- Set the required environment vairables in your `.env` file.

## Commands

Start a local supabase instance:

```bash
bun run supabase start
```
See MIGRATION_TUTOTORIAL.md for more information on how to handle migrations with local/remote Supabase.


Run the server in dev mode (uses the local supabase instance):

LOG_VOLUME_MOUNT will change where the logging middleware will sending logging to. That's up to you if you want to change it, just make sure it's not checked into git. `./log` is in the .gitignore, so anything in there works. If you don't want your logs to be re-routed to your local checkout, just exclude the LOG_VOLUME_MOUNT option and they will stay in the Docker container. 
```bash
# Powershell
$env:MODE="dev"; $env:LOG_VOLUME_MOUNT="./backend/log"; docker-compose up --build --watch

# Unix
MODE=dev LOG_VOLUME_MOUNT=./backend/log docker-compose up --build --watch
```
NOTE: you need to have SUPABASE_DB_URL defined properly in your .env


Run the server in production mode (uses the remote supabase instance):

```bash
docker compose up --build

# optionally add --watch to automatically sync changes to code
```
NOTE: you need to have SUPABASE_PROD_DB_URL defined properly in your .env


Run the linter to see failures and warnings:
```bash
bun run lint
```

Run the linter to automatically fix "fixable" issues (such as spacing):
```bash
bun run lint:fix
```


