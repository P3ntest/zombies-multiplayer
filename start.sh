#! /bin/sh
bunx prisma migrate deploy
node build/index.js