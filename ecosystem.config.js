module.exports = {
  apps : [{
    name: "subscription_api",
    script: "./bin/www",
    env: {
      NODE_ENV: "development",
    },
    env_production: {
      PORT: 3002,
      NODE_ENV: "production",
    },
    env_staging: {
      PORT: 3003,
      NODE_ENV: "staging",
    }
  }]
}