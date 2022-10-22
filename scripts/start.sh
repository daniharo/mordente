#!/bin/bash
source ./.env

yarn run prisma migrate deploy

if [ "$NODE_ENV" = "production" ] ; then
  yarn pm2
else
  yarn dev
fi
