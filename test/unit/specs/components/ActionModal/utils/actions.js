export const sendTx = {
  txProps: {
    toAddress: "cosmos123",
    amounts: [
      {
        amount: "20000",
        denom: "uatom"
      }
    ]
  },
  txDelProps: {
    toAddress: "cosmos123",
    amounts: [
      {
        amount: "20000",
        denom: "uatom"
      }
    ],
    validator_address: "cosmosvaloper1pnmn05d9prestn2vxujr8h88fpm9c0skeg72p5",
    message: {
      value: {
        validator_moniker: "operator_account_2"
      }
    },
    amount: "12000000",
    denom: "stake"
  },
  txMetaData: {
    gasEstimate: 12335,
    gasPrice: {
      amount: 2000,
      denom: "uatom"
    },
    submitType: "",
    password: ""
  }
}

export const withdrawTx = {
  txProps: {},
  txMetaData: {
    gasPrice: {
      amount: 2000,
      denom: "uatom"
    },
    submitType: "",
    password: ""
  }
}
