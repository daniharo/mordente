FROM node:16 as base

WORKDIR /opt/project
RUN yarn global add pm2
COPY package.json yarn.lock ./
RUN yarn --frozen-lockfile
COPY ./prisma/schema.prisma ./prisma/
RUN ["yarn", "run", "prisma", "generate"]
COPY . .

FROM base as dev

CMD ["yarn", "dev"]

FROM base AS prod

RUN ["yarn", "build"]
CMD ["yarn", "pm2"]
