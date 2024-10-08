FROM registry.access.redhat.com/ubi9/nodejs-20

USER root

WORKDIR /scim_app

COPY ./package.json .

RUN npm cache clear --force

# install pm2 (approved versions)
RUN npm install -g pm2@5.4.2 \
  && pm2 install pm2-logrotate@2.6.0 \
  && pm2 set pm2-logrotate:max_size 100M \
  && pm2 set pm2-logrotate:retain 10 \
  && pm2 set pm2-logrotate:rotateInterval '0 0 1 1 0'

RUN mkdir -p /scim_app/logs && chmod -R 777 /scim_app

RUN npm install

COPY src /scim_app

RUN mkdir -p /scim_app/logs && chmod -R 777 /scim_app

RUN chmod -R 777 /opt/app-root/src

EXPOSE 443

# Start Node server using pm2
CMD pm2-runtime ecosystem.config.js
