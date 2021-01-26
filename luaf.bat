@echo off
deno run --allow-all --unstable --import-map imports.json src/main.ts %*