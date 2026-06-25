FROM nginx:alpine-slim
RUN apk upgrade --no-cache
COPY nginx.conf /etc/nginx/nginx.conf
COPY security-headers.conf /etc/nginx/security-headers.conf
COPY dist/btrain/browser /usr/share/nginx/html
