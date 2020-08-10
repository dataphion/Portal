FROM node:12.2.0-stretch as build
WORKDIR /app

ARG HOST
ARG API_EXEC_HOST
ARG SOCKET_HOST
ARG IMAGE_HOST
ARG ERROR_IMAGE_HOST
ARG DEBUG

 
ENV HOST ${HOST}
ENV API_EXEC_HOST ${API_EXEC_HOST}
ENV SOCKET_HOST ${SOCKET_HOST}
ENV IMAGE_HOST ${IMAGE_HOST}
ENV ERROR_IMAGE_HOST ${ERROR_IMAGE_HOST}
ENV DEBUG ${DEBUG}

RUN env

COPY . /app
RUN rm -rf node_modules package-lock.json
RUN npm install

RUN ls
RUN npm run build

# production environment
FROM nginx:1.16.0-alpine
COPY --from=build /app/dist /usr/share/nginx/html/dist
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

RUN mkdir -p /opt/images
WORKDIR /opt
RUN ln -s /opt/images/ p_images

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
#CMD ["tail","-f","/dev/null"]

