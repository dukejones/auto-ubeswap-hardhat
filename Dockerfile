FROM node:14.16.0-alpine
RUN apk add --no-cache git

WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .

RUN CELO_PRIVATE_KEY=0c23ab87c626102b0b1c0487f88612e6135a0e82840990970d0f299626b54c29 yarn build
CMD [ "yarn", "hardhat", "ube-service" ]
