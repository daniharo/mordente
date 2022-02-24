# MiBandaBot

## Installation

1. First, copy the environment variables template file and name it `.env`:
```shell
cp env_template .env
```

2. You'll have to write your bot token obtained from [BotFather](https://core.telegram.org/bots#6-botfather) in the `.env` file.

3. Then, just run this command to have everything running in your device:

```shell
docker-compose up
```

## Stack

Following stack is used for this project:

- [TypeScript](https://www.typescriptlang.org/)
- [Node](https://nodejs.dev/) 16
- [PostgreSQL](https://www.postgresql.org/) 14.1
- [Prisma](https://www.prisma.io/) (Typescript ORM)
- [grammY](https://grammy.dev/) (bot framework for Node)
