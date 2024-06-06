module.exports = {
  apps: [
    {
      name: "sqlcms",
      script: "node",
      args: "./dist/app.js",
      watch: ["src"],
      ignore_watch: ["node_modules", "src/**/*.spec.ts"],
      interpreter: "none",
      instances: 1,
      exec_mode: "fork",
      vizion: false,
    },
  ],
};
