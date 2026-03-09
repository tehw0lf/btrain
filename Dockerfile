FROM nginx:alpine
RUN apk upgrade --no-cache
COPY nginx.conf /etc/nginx/nginx.conf
COPY dist/btrain/browser /usr/share/nginx/html
