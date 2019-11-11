## Installation

Clone the repository:

```
git clone https://github.com/luniehq/lunie-api.git
```

Install dependencies:

```
npm install
```

## Run

Start with automatic restart on save:

```
npm run dev
```

Or start using Redis for the Apollo cache. You will need to set `REDIS_URL` environment variable with your Redis server URL.

```
npm run dev-cache
```

Or start in a docker container:

```
npm run dev-docker
```

## Development

When running you can access GraphQL Playground at http://localhost:4000/. You can use it to create/test GraphQL queries to the API.

## Environment variables

| Name | Description |
| ------------- | ------------- |
| `HASURA_URL` | Hasura backend URL |
| `HASURA_ADMIN_KEY` | Hasura backend admin password |
| `TESTNET` | Enable/disable testnet mode |
| `TESTNET_RPC_URL` | COSMOS full node RPC websocket URL |
| `TESTNET_API_URL` | COSMOS full node API URL |
| `ENABLE_CACHE` | Enable/disable Apollo Server RedisCache. You must have a Redis server available. |
| `REDIS_URL` | Redis server URI in `<auth>@hostname:port` format |
| `ENGINE_API_KEY` | Enable Apollo GraphQL metrics through https://engine.apollographql.com/  |
| `SENTRY_DSN` | Sentry (https://sentry.io) data source name in format `https://<key>@sentry.io/<project>` |

