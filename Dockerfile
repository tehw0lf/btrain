FROM nginx:alpine
COPY nginx.conf /etc/nginx/nginx.conf
COPY dist/btrain/browser /usr/share/nginx/html
