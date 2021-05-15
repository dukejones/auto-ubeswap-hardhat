FROM node:14.16.0-alpine
RUN apk add --no-cache git

WORKDIR /app
COPY package.json yarn.lock ./
RUN SKIP_POSTINSTALL=1 yarn install --frozen-lockfile

COPY . .

RUN yarn build
CMD [ "yarn", "hardhat", "ube" ]
