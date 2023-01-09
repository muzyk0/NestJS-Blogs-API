FROM node:lts-alpine
RUN apk add yarn
WORKDIR /app

# parameters to run this Dockerfile
# ARG.......

COPY ["package.json", "yarn.lock", "./"]
RUN yarn --frozen-lockfile

# Source
COPY . .

# RUN ["chmod", "+x", "wait-for-it.sh"]

# RUN
CMD yarn start:debug

EXPOSE 5000
