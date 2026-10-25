#!/bin/sh
set -eu

npm start &
server_pid=$!

cleanup() {
  kill "$server_pid" 2>/dev/null || true
}
trap cleanup INT TERM

attempt=0
until node -e "fetch('http://127.0.0.1:3000/api/health').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"; do
  attempt=$((attempt + 1))
  if [ "$attempt" -ge 30 ]; then
    cleanup
    exit 1
  fi
  sleep 1
done

node scripts/warm-dashboard.mjs || true
wait "$server_pid"
