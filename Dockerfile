FROM oven/bun:1 as base

# install server
WORKDIR /app/server

COPY ./server/package.json ./server/bun.lockb ./
RUN bun install

FROM base as client

WORKDIR /app/client

COPY ./client/package.json ./client/bun.lockb ./
RUN bun install

COPY ./client ./
# COPY server source from ./server/src to ../server/src
COPY ./server/src ../server/src

RUN bun run build

FROM base as server

WORKDIR /app/server

COPY ./server ./

COPY --from=client /app/client/dist ./client/dist

RUN bun run build

ENV PORT=3000

EXPOSE 3000

ENV NODE_ENV=production

CMD ["bun", "run", "start:prod"]