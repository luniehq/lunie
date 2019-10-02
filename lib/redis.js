var url = require("url");
const { RedisCache } = require("apollo-server-cache-redis");
const config = require("../config");

let redis_uri = url.parse(config.redis_url || "");
if (config.env === "development") {
  redis_uri = {
    hostname: `localhost`,
    port: 6379
  };
}

const config = {
  host: redis_uri.hostname,
  port: redis_uri.port,
  password: redis_uri.auth && redis_uri.auth.split(":")[1]
};

function createCache() {
  return new RedisCache(config);
}

exports.createCache = createCache;
