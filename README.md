# Mordente

This Telegram bot helps people manage their musical ensemble seamlessly, without leaving their Telegram app.

## Installation

1. First, copy the environment variables template file and name it `.env`:

```shell
cp env_template .env
```

2. You'll have to write your bot token obtained from [BotFather](https://core.telegram.org/bots#6-botfather) in the `.env` file.

3. Then, run either of these commands to start the bot:

```shell
# For production:
docker compose -f docker-compose.yml -f docker-compose.prod.yml up

# For development:
docker-compose up
```

4. Don't forget to apply database migrations with either of these commands:

```shell
# For production:
docker compose exec app yarn run migrate:prod

# For development:
docker compose exec app yarn run migrate:dev
```

5. You now have the bot running!

## Stack

Following stack is used for this project:

- [TypeScript](https://www.typescriptlang.org/)
- [Node](https://nodejs.dev/) 16
- [PostgreSQL](https://www.postgresql.org/) 14.1
- [Prisma](https://www.prisma.io/) (Typescript ORM)
- [grammY](https://grammy.dev/) (bot framework for Node)
