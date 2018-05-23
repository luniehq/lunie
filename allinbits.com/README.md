# [allinbits.com](https://allinbits.com)

> The website for All In Bits, Inc. AIB projects include Cosmos and Tendermint.

## Production

Please ask the team for deployment privileges.

``` bash
# add the production server if you haven't already
git remote add production ubuntu@cosmos.network:~/aib-website.git
```

``` bash
# deploy it!
git checkout master
git merge develop
git push production master
```

## Development

Make sure you're running Node 6 LTS or higher.

``` bash
# install dependencies
yarn install

# write some required files
yarn run build

# serve with hot reload at localhost:8700
yarn run dev
```
