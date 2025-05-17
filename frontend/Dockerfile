FROM node:22-alpine as builder
# WORKDIR /usr/src/app
# 
# RUN corepack enable \
#     && corepack prepare pnpm@latest --activate
# 
# COPY package.json pnpm-lock.yaml ./
# 
# COPY package.json package-lock.json* pnpm-lock.yaml* ./
# 
# COPY . . 
# 
# RUN pnpm install --frozen-lockfile
# 
# RUN pnpm build
### Ak static export
# && pnpm export
# FROM nginx:alpine
# COPY --from=builder /app/out /usr/src/app/out

### Ak server Mode 
## Production image
#FROM node:22-alpine
#WORKDIR /app
#RUN corepack enable && corepack prepare pnpm@latest --activate
#
## Only copy what's needed for production
#COPY --from=builder /app/.next .next
#COPY --from=builder /app/public public
#COPY --from=builder /app/package.json package.json
#COPY --from=builder /app/pnpm-lock.yaml pnpm-lock.yaml
#COPY --from=builder /app/node_modules node_modules
#COPY --from=builder /app/next.config.js ./
#COPY --from=builder /app/pages ./pages
#COPY --from=builder /app/app ./app # if using the new app directory
#
#EXPOSE 3000
#CMD ["pnpm", "start"]