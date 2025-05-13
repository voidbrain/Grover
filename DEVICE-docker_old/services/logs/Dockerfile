FROM alpine:latest

RUN apk add --no-cache logrotate

COPY logrotate.conf /etc/logrotate.conf

CMD ["logrotate", "-f", "/etc/logrotate.conf"]