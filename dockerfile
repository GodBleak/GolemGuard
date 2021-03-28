FROM node:14
WORKDIR /bot
COPY package*.json ./
RUN npm install
RUN npm install pm2@latest -g
RUN $(npm get prefix)/bin/pm2 install typescript
COPY  . .
ENV API_ID =
ENV API_HASH =
ENV MC_SERVER =
ENV MC_PORT =
ENV USERNAME = 
ENV PASSWORD =
ENV AUTH = 
ENV BOT_TOKEN =
ENV GROUP =
ENV DOMAIN = 
ENV PORT 3000

EXPOSE 3000
EXPOSE 3007 
RUN pm2 start golemGuard.json
CMD ["pm2", "logs"]