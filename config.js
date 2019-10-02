module.exports = {
  env: process.env.NODE_ENV || "development",
  port: process.env.PORT || "4000",
  chain_url: process.env.CHAIN_URL,
  chain_ws_url: process.env.CHAIN_URL_WS,
  apollo_engine_api_key: process.env.ENGINE_API_KEY || "",
  enable_cache: process.env.ENABLE_CACHE || false,
  redis_url: process.env.REDIS_URL || ""
};
