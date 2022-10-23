# Mordente

[![Deploy](https://github.com/daniharo/mordente/actions/workflows/deploy.yml/badge.svg?branch=main)](https://github.com/daniharo/mordente/actions/workflows/deploy.yml)

This Telegram bot helps people manage their musical ensemble seamlessly, without leaving their Telegram app.

You can try it by using the demo instance at [@mordente_bot](https://t.me/mordente_bot).

## Installation

1. First, copy the environment variables template file and name it `.env`:

```shell
cp env_template .env
```

2. You'll have to write your bot token obtained from [@BotFather](https://t.me/botfather) in the `.env` file.

3. For file storage, add `S3_ENDPOINT`, `S3_REGION`, `S3_BUCKET`, `S3_KEY` and `S3_SECRET` in `.env`. You may use any S3-compatible tool. Some of them include [Digital Ocean Spaces](https://www.digitalocean.com/products/spaces), [AWS S3](https://aws.amazon.com/es/s3/) or even [MinIO](https://min.io/), which you can [self-host](https://min.io/docs/minio/container/index.html).

4. Then, run either of these commands to start the bot:

```shell
# For production:
docker compose -f docker-compose.yml -f docker-compose.prod.yml up

# For development:
docker-compose up
```

5. Don't forget to apply database migrations with either of these commands:

```shell
# For production:
docker compose exec app yarn run migrate:prod

# For development:
docker compose exec app yarn run migrate:dev
```

6. You now have the bot running!

## Stack

Following stack is used for this project:

- [TypeScript](https://www.typescriptlang.org/)
- [Node](https://nodejs.dev/) 16
- [PostgreSQL](https://www.postgresql.org/) 14.1
- [Prisma](https://www.prisma.io/) (Typescript ORM)
- [grammY](https://grammy.dev/) (bot framework for Node)
