FROM oven/bun:1 AS base
WORKDIR /app

COPY . .

RUN bun install

# If no NODE_ENV build arg provided, default is 'development'
ARG NODE_ENV=development
ENV NODE_ENV=$NODE_ENV

# Pass forward other environmental vars
ARG SUPABASE_PROD_DB_URL
ENV SUPABASE_PROD_DB_URL=$SUPABASE_PROD_DB_URL

ARG SUPABASE_DB_URL
ENV SUPABASE_DB_URL=$SUPABASE_DB_URL

EXPOSE 3000

# CMD ["sh", "-c", "if [ \"$NODE_ENV\" = \"production\" ]; then bun run start; else bun run dev; fi"]
