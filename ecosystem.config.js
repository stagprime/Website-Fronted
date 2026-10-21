// PM2: single fork-mode instance (live chat uses an in-process event bus; see lib/chat.ts before scaling to >1 instance).
module.exports = {
  apps: [{
    name: "stagprime",
    cwd: __dirname,
    script: ".next/standalone/server.js",
    exec_mode: "fork",
    instances: 1,
    env: { NODE_ENV: "production", PORT: 3000, HOSTNAME: "127.0.0.1" },
    env_file: ".env",          // PM2 ≥5.3 loads this; otherwise `set -a; . ./.env; set +a` before `pm2 start`
    max_memory_restart: "800M",
    time: true,
  }],
};
