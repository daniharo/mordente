#!/bin/bash
source ./.env

if [ "$NODE_ENV" = "production" ] ; then
  yarn pm2
else
  yarn dev
fi
