FROM node:22-alpine as builder
WORKDIR /usr/src/app

RUN corepack enable \
    && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml ./

COPY package.json package-lock.json* pnpm-lock.yaml* ./

COPY . . 

RUN pnpm install --frozen-lockfile

RUN pnpm build

FROM nginx:alpine
COPY --from=builder . .

EXPOSE 3000

CMD ["true"]