/* eslint-disable camelcase */

module.exports = {
  apps: [
    {
      name: "NDNts-video",
      script: "./cli.cjs",
      args: "serve",
      env: {
        NODE_ENV: "production",
      },
      watch: false,
      max_restarts: 1000,
      restart_delay: 60000,
    },
  ],
};
