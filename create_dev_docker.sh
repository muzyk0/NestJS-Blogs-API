#!/usr/bin/bash

# Скрипт запускается для разворачивания докера и базы.

#cd ./deploy/dev && \
docker-compose -p blogs_nest_server build && \
docker-compose -p blogs_nest_server up -d postgres && \
# Ожидаем пока база завершит подготовку к работе (Если не работает, заменить на sleep)
./wait-for-it.sh -p postgres:5432 -- node index.js && \
sleep 5
echo mysecretpassword | docker-compose -p blogs_nest_server run --rm --no-deps postgres psql -h postgres -U postgres -c "CREATE DATABASE blogs_nest;"
echo 'rm -rf dist/* && yarn tsc && yarn migration:run' | docker-compose -p blogs_nest_server run --rm server sh
#docker-compose -p blogs_nest_server down
 docker-compose -p blogs_nest_server up
