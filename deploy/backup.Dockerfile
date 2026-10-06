FROM postgres:16-alpine
RUN apk add --no-cache age
COPY backup.sh /usr/local/bin/backup.sh
ENTRYPOINT ["/bin/sh", "/usr/local/bin/backup.sh"]
