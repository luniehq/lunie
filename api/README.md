## Installation 
Clone the repository:

```
git clone https://github.com/luniehq/lunie-api.git
```

Install dependencies:

```
yarn install
```

## Run

Start with automatic restart on save:

```
yarn dev
```

Or start using Redis for the Apollo cache. You will need to set `REDIS_URL` environment variable with your Redis server URL.

```
yarn dev-cache
```

Or start in a docker container:

```
yarn dev-docker
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
| `GOOGLE_APPLICATION_CREDENTIALS` | Needs to contain the content of a service account credential file. |
| `RUN_ONLY_NETWORK` | Run only the network with this ID (allows scaling and better development) |
| `LOCAL_KUSAMA_API` | Use a local kusama API as the one here is only whitelisted for some IPs |

## Networks

A new network only requires 3 things:

 1. An entry in the `data/networks.json` array.
 2. A class to source information from an external endpoint.
 3. A class to 'listen' for block events.

For example, the Cosmos Hub classes are defined within the `networks.json` config like so:

 ```
"source_class_name": "source/cosmosV2-source",
"block_listener_class_name": "block-listeners/cosmos-node-subscription",
```

Be careful to prefix the path with `source` and `block-listeners` respectively.
These refer to folders underneath the root `lib` directory, and are where the
classes should be placed.

Some notes:

- Networks are automatically loaded and will begin fetching blocks once the application starts.
- To disable a network, set it's `enable` property to `false`.
- Network configurations are validated during testing.
