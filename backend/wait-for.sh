#!/usr/bin/env sh
host="$1"
port="$2"
shift 2

if [ "$1" = "--" ]; then
  shift
fi

while ! nc -z "$host" "$port"; do
  echo "Waiting for $host:$port…"
  sleep 1
done

exec "$@"