## Installation

```
npm install
```

or 

## Development
```
npm run dev
```

or using Redis for the Apollo cache.

```
npm run dev-cache
```

You will need to set `REDIS_URL` to your redis instance host.

## Environment variables

- Set `CHAIN_URL` to the chain of your choice. Defaults to https://lcd.nylira.net.
- `REDIS_URL` contains the full `<auth>@hostname:port` URI.
- Set `ENABLE_CACHE` to turn on the ApolloServer RedisCache. You must have Redis available.
- Set `ENGINE_API_KEY` to optionally enable metrics through https://engine.apollographql.com/. 
