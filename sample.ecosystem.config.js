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
    },
  ],
};
