module.exports = {
  apps: [
    {
      name: "sqlcms",
      script: "node",
      args: "./dist/app.js",
      watch: ["dist"],
      ignore_watch: ["node_modules"],
      instances: 1,
      exec_mode: "fork",
      vizion: false,
      env: {
        NODE_ENV: "production",
      },
      env_development: {
        NODE_ENV: "development",
      },
    },
  ],
};
