#!/bin/bash
source ./.env

yarn run prisma migrate deploy

if [ "$NODE_ENV" = "production" ] ; then
  yarn start
else
  yarn dev
fi
