# Script Runner

To avoid having CPU intense tasks run on our API instance we run them on a different instance we can scale better.

## Run

```
$ yarn build
$ AUTHENTICATION_TOKEN=password docker-compose up
```

## Run Scripts

Do a POST with the data against the endpoints:

POST http://localhost:9000/polkadotrewards { era: 907 }

### Authentication

If setting AUTHENTICATION_TOKEN all requests need to send a header:

Authorization: $AUTHENTICATION_TOKEN