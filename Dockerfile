FROM node:22.13 AS build

WORKDIR /app

COPY package.json package-lock.json ./


RUN npm install -g @angular/cli@
RUN npm install

COPY . .

RUN ng build --configuration=production

FROM nginx:1.25

COPY --from=build /app/dist/smartbill_ang-18 /usr/share/nginx/html

EXPOSE 8085

CMD ["nginx", "-g", "daemon off;"]