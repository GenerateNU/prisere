FROM oven/bun:1 AS base
WORKDIR /app

COPY . .

RUN bun install

# Pass forward other environmental vars
ARG SUPABASE_PROD_DB_URL
ENV SUPABASE_PROD_DB_URL=$SUPABASE_PROD_DB_URL

ARG SUPABASE_DB_URL
ENV SUPABASE_DB_URL=$SUPABASE_DB_URL

EXPOSE 3000

CMD ["sh", "-c", "echo ${MODE} && if [ \"$MODE\" = \"prod\" ]; then bun run start; else bun run dev; fi"]
