FROM node:16

WORKDIR /opt/project
ADD https://github.com/ufoscout/docker-compose-wait/releases/download/2.9.0/wait /wait
RUN ["chmod", "+x", "/wait"]
COPY package.json yarn.lock ./
RUN yarn global add pm2
RUN yarn --frozen-lockfile
COPY ./prisma/schema.prisma ./prisma/
RUN ["yarn", "run", "prisma", "generate"]
COPY ./scripts ./scripts/
RUN ["chmod", "+x", "./scripts/start.sh"]
COPY . .

CMD /wait && ./scripts/start.sh
