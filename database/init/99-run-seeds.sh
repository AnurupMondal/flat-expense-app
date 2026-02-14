#!/bin/bash
for file in /docker-entrypoint-initdb.d/seed/*.sql; do
    psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -f "$file"
done
