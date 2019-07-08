# Lunie browser extension

## Prepare

This repository uses Lunie core as a dependency. Install the submodule via:

```bash
$ git submodule init
$ git submodule update
```

Note: To reference components easily some aliases are set to the submodule in the webpack config.

## Develop

```bash
$ yarn watch:dev
```


## e2e setup

To maintain a static extension id for testing add the following PEM key to dst/manifest.json:
`"key": "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAvWWKi8PPH3u+bDCFJWTyvCwc9+kUt1l3WBt9vd3cQY7dpmEWGmFaeTNLLVWEE6+cwcUl4sOS9Jgj3J+svRtK8+CupAjL5RMRUh3v9amRZ4Gn0QT+x8K4Cg+KN+3fP6YnTw/QQI0laU2oEIpDbltuYz8x7zcZgmVtAeCo+55YNuR4q1hfc/ciSH5/wvkBplP8D0h4bhNAHNFUwmr39mTBhprr4KocMez09QcDIj7/5XGcaprLf0HpQx1rxD05ajxjUuM266Xz6uy5u6TvnqQoYZmPNo0zJoJIPiJ/qL+McQ6H8FzDs3Lhjv3OePbA+TOyx8uOCG0gNnyHlRAP5uPVzQIDAQAB"`