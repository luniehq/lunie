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
  txProps: {
    validatorAddress: "cosmos123"
  },
  txMetaData: {
    gasPrice: {
      amount: 2000,
      denom: "uatom"
    },
    submitType: "",
    password: ""
  }
}
