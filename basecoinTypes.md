# Basecoin JS types

Here are sample JSON values for the different data types:

### Account
Accounts simply store a balance of coins, and are associated with a public key. Users may have many accounts (each time they generate a new key/address they are generating a new account).

We can query any account by its address (the hash of its public key).

```js
{
  key: PubKey, // will be null if the account has received money but not spent any yet
  sequence: 1000,
  coins: [
    { denom: 'test', amount: 1000000 },
    { denom: 'atom', amount: 1234 }
  ]
}
```

### Transaction
Transactions have inputs (the list of accounts the transaction is spending from, and an amount for each type of coin being spent), and outputs (list of accounts the transaction sends to, and an amount for each type of coin.

When starting the wallet, it will download all the transactions that have happened since we last used the wallet and filter by ones which are relevant to the user's accounts. Relevant transactions will be stored locally, so we will always have a history of transactions. While the wallet is open, it will listen for new transactions so we can notify the user when a relevant transaction is seen.

```js
{
  gas: 0,
  fee: { denom: 'test', amount: 0 },
  inputs: [
    {
      address: Buffer,
      coins: [
        { denom: 'test', amount: 1000000 },
        { denom: 'atom', amount: 1234 }
      ],
      sequence: 1,
      signature: Buffer,
      pubkey: PubKey
    }
  ],
  outputs: [
    {
      address: Buffer,
      coins: [
        { denom: 'test', amount: 1000000 },
        { denom: 'atom', amount: 1234 }
      ]
    }
  ]
}
```

### PubKey
```js
{
  algo: {
    name: 'ed25519',
    id: 1,
    privLength: 64,
    pubLength: 32,
    sigLength: 64
  },
  key: Buffer
}
```
