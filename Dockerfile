FROM node:16.8.0 as production

RUN mkdir -p /usr/src/sosile-server
RUN chmod -R 777 /usr/src/sosile-server
WORKDIR /usr/src/sosile-server


COPY package*.json ./
# RUN npm i
COPY prisma ./prisma/
RUN npm ci --only=production

COPY . .
RUN npm run build
# COPY .env* ./

FROM node:16.8.0

COPY --from=production /usr/src/sosile-server/node_modules ./node_modules
COPY --from=production /usr/src/sosile-server/package*.json ./
COPY --from=production /usr/src/sosile-server/dist ./dist

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

ARG PORT=8000
ENV PORT=${PORT}

EXPOSE ${PORT}

CMD ["npm" "run", "start:prod"]
