# Prisere 🪷

Prisere is an all-in-one platform to empower Small-Medium Sized Businesses (SMBs) during times of disaster by smoothing the business-interruption claims process.

## Table of Contents

1. [File Structure](#file-structure)
2. [Deployments](#deployments)

### File-Structure

The template repository is laid out as follows below.

```bash
├── .github
│   ├── pull_request_template.md
│   └── workflows
│       └── backend-deploy.yml
│       └── backend-lint.yml
│       └── backend-test.yml
├── backend # Backend source code
│   └── src # main folder
│       └── database # includes utilities for working with our database
│           └── factories  # factories for easily creating dummy data
│           └── seeds  # seeders for populating database with dummy data
│       └── entities # TypeORM entities used for migrations
│       └── migrations # Migrations created with typeORM
│       └── modules # API endpoint files
│       └── tests
│       └── types
│       └── utilities
│       └── eslint.config.ts # configuration for eslint
│       └── routes.ts # sets up routes for entire app
│       └── server.ts # sets up server
│       └── typeorm-config.ts # configuration for typeorm
│   └── supabase # includes config for local supabase
│       └── MIGRATION_TUTORIAL.md # guide to creating/running migrations
│   └── .gitignore
│   └── Dockerfile
│   └── package.json
│   └── README.md
│   └── tsconfig.json
├── CONTRIBUTING.md # Contribution documentation for engineers
├── docker-compose.yaml
├── frontend # Frontend source code
├── LICENSE
├── README.md
```

### Deployments
