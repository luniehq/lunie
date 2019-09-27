const { RedisCache } = require("apollo-server-cache-redis");

let redis_uri;
if (process.env.NODE_ENV === "development") {
  redis_uri = {
    hostname: `localhost`,
    port: 6379
  };
} else {
  redis_uri = url.parse(process.env.REDIS_URL || "");
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
