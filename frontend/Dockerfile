FROM node:22-alpine as builder
WORKDIR /usr/src/app

ARG NEXT_PUBLIC_API_URL

ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

RUN corepack enable \
    && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

COPY . . 

RUN pnpm build

# Stage 2: Serve the application with Nginx
FROM node:22-alpine AS runner

# Odporúčam použiť špecifickú verziu Nginx
WORKDIR /usr/src/app

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

RUN corepack enable \
    && corepack prepare pnpm@latest --activate

# Skopírujeme zbuildené statické súbory z builder stage do predvoleného Nginx adresára
# !!! DÔLEŽITÉ: Zmeňte '/usr/src/app/dist' ak váš build adresár je iný !!!
# Napr. pre Next.js static export by to bolo '/usr/src/app/out'
# Alebo pre Next.js s vlastným serverom by ste tento Nginx stage vôbec nepoužili.
COPY --from=builder /usr/src/app/.next ./.next
COPY --from=builder /usr/src/app/public ./public
COPY --from=builder /usr/src/app/package.json ./package.json
COPY --from=builder /usr/src/app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /usr/src/app/next.config.js ./next.config.js 
# alebo .mjs/.cjs

# (Voliteľné) Skopírujte vlastnú Nginx konfiguráciu, ak ju potrebujete
# Napríklad pre SPA (Single Page Application) routing:
# COPY nginx.conf /etc/nginx/conf.d/default.conf
RUN pnpm install --frozen-lockfile
# Nginx štandardne počúva na porte 3000
EXPOSE 3000

# Spustíme Nginx v popredí
CMD ["pnpm", "start"]