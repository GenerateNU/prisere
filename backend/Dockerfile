FROM oven/bun:1 AS base
WORKDIR /app

COPY . .

RUN bun install

EXPOSE 3000

CMD ["sh", "-c", "echo ${MODE} && if [ \"$MODE\" = \"prod\" ]; then bun run start; else bun run dev; fi"]
