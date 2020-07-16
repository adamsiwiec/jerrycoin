FROM nginx:alpine
ENV PORT=80
ENV VIRTUAL_HOST=jerry.siwiec.us
ENV LETSENCRYPT_HOST=jerry.siwiec.us
COPY build /usr/share/nginx/html
COPY nginx.conf /etc/nginx

EXPOSE $PORT
