export const testTransactions = [
  {
    height: "310168",
    txhash: "2345678909876543456789876543",
    raw_log: '[{"msg_index":"0","success":true,"log":""}]',
    logs: [{ msg_index: "0", success: true, log: "" }],
    gas_wanted: "24352",
    gas_used: "24292",
    tags: [
      { key: "action", value: "send" },
      { key: "sender", value: "cosmos1abcdefghijkl" },
      {
        key: "recipient",
        value: "cosmos1abcdefghijkl",
      },
    ],
    tx: {
      type: "auth/StdTx",
      value: {
        msg: [
          {
            type: "cosmos-sdk/MsgSend",
            value: {
              from_address: "cosmos1abcdefghijkl",
              to_address: "cosmos1abcdefghijkl",
              amount: [{ denom: "uatom", amount: "50000" }],
            },
          },
        ],
        fee: { amount: null, gas: "24352" },
        signatures: [
          {
            pub_key: {
              type: "tendermint/PubKeySecp256k1",
              value: "askjdhasd876as9dyasdbnmada",
            },
            signature: "kahdakjhdasdhsa",
          },
        ],
        memo: "",
      },
    },
    timestamp: "2019-05-17T07:44:10Z",
    type: "bank",
    time: "2019-05-17T07:44:10.621Z",
  },
  {
    height: "349113",
    txhash: "GFKJHBKJH345678345HGI",
    raw_log: '[{"msg_index":"0","success":true,"log":""}]',
    logs: [{ msg_index: "0", success: true, log: "" }],
    gas_wanted: "24362",
    gas_used: "24302",
    tags: [
      { key: "action", value: "send" },
      { key: "sender", value: "cosmos1abcdefghijkl" },
      {
        key: "recipient",
        value: "cosmos1abcdefghijkl",
      },
    ],
    tx: {
      type: "auth/StdTx",
      value: {
        msg: [
          {
            type: "cosmos-sdk/MsgSend",
            value: {
              from_address: "cosmos1abcdefghijkl",
              to_address: "cosmos1abcdefghijkl",
              amount: [{ denom: "uatom", amount: "200000" }],
            },
          },
        ],
        fee: { amount: null, gas: "24362" },
        signatures: [
          {
            pub_key: {
              type: "tendermint/PubKeySecp256k1",
              value: "askjdhasd876as9dyasdbnmada",
            },
            signature: "kahdakjhdasdhsa",
          },
        ],
        memo: "",
      },
    },
    timestamp: "2019-05-20T10:25:27Z",
    type: "bank",
    time: "2019-05-20T10:25:27.240Z",
  },
  {
    height: "403475",
    txhash: "GAHSFDKJAHSGDHDKAJHSJDKSA",
    raw_log: '[{"msg_index":"0","success":true,"log":""}]',
    logs: [{ msg_index: "0", success: true, log: "" }],
    gas_wanted: "29234",
    gas_used: "27855",
    tags: [
      { key: "action", value: "send" },
      { key: "sender", value: "cosmos1abcdefghijkl" },
      {
        key: "recipient",
        value: "cosmos1abcdefghijkl",
      },
    ],
    tx: {
      type: "auth/StdTx",
      value: {
        msg: [
          {
            type: "cosmos-sdk/MsgSend",
            value: {
              from_address: "cosmos1abcdefghijkl",
              to_address: "cosmos1abcdefghijkl",
              amount: [{ denom: "uatom", amount: "200000" }],
            },
          },
        ],
        fee: { amount: [{ denom: "uatom", amount: "29" }], gas: "29234" },
        signatures: [
          {
            pub_key: {
              type: "tendermint/PubKeySecp256k1",
              value: "askjdhasd876as9dyasdbnmada",
            },
            signature: "kahdakjhdasdhsa",
          },
        ],
        memo: "",
      },
    },
    timestamp: "2019-05-24T18:44:25Z",
    type: "bank",
    time: "2019-05-24T18:44:25.271Z",
  },
  {
    height: "437376",
    txhash: "KAJSHDGSAHDASKJHDLASKJHDLASKJDHSA",
    raw_log: '[{"msg_index":"0","success":true,"log":""}]',
    logs: [{ msg_index: "0", success: true, log: "" }],
    gas_wanted: "28982",
    gas_used: "27750",
    tags: [
      { key: "action", value: "send" },
      { key: "sender", value: "cosmos1abcdefghijkl" },
      {
        key: "recipient",
        value: "cosmos1abcdefghijkl",
      },
    ],
    tx: {
      type: "auth/StdTx",
      value: {
        msg: [
          {
            type: "cosmos-sdk/MsgSend",
            value: {
              from_address: "cosmos1abcdefghijkl",
              to_address: "cosmos1abcdefghijkl",
              amount: [{ denom: "uatom", amount: "923" }],
            },
          },
        ],
        fee: { amount: [{ denom: "uatom", amount: "29" }], gas: "28982" },
        signatures: [
          {
            pub_key: {
              type: "tendermint/PubKeySecp256k1",
              value: "askjdhasd876as9dyasdbnmada",
            },
            signature: "kahdakjhdasdhsa",
          },
        ],
        memo: "",
      },
    },
    timestamp: "2019-05-27T11:33:44Z",
    type: "bank",
    time: "2019-05-27T11:33:44.895Z",
  },
  {
    height: "462230",
    txhash: "ASDASDASDASDASDASFFAFDDSGDS",
    raw_log: '[{"msg_index":"0","success":true,"log":""}]',
    logs: [{ msg_index: "0", success: true, log: "" }],
    gas_wanted: "29234",
    gas_used: "24302",
    tags: [
      { key: "action", value: "send" },
      { key: "sender", value: "cosmos1abcdefghijkl" },
      {
        key: "recipient",
        value: "cosmos1abcdefghijkl",
      },
    ],
    tx: {
      type: "auth/StdTx",
      value: {
        msg: [
          {
            type: "cosmos-sdk/MsgSend",
            value: {
              from_address: "cosmos1abcdefghijkl",
              to_address: "cosmos1abcdefghijkl",
              amount: [{ denom: "uatom", amount: "200000" }],
            },
          },
        ],
        fee: { amount: null, gas: "29234" },
        signatures: [
          {
            pub_key: {
              type: "tendermint/PubKeySecp256k1",
              value: "askjdhasd876as9dyasdbnmada",
            },
            signature: "kahdakjhdasdhsa",
          },
        ],
        memo: "",
      },
    },
    timestamp: "2019-05-29T11:22:14Z",
    type: "bank",
    time: "2019-05-29T11:22:14.271Z",
  },
  {
    height: "488727",
    txhash: "ASDLKJHSALKDJHASLKDJHASLKDHASLKDJSA",
    raw_log: '[{"msg_index":"0","success":true,"log":""}]',
    logs: [{ msg_index: "0", success: true, log: "" }],
    gas_wanted: "36363",
    gas_used: "24182",
    tags: [
      { key: "action", value: "send" },
      { key: "sender", value: "cosmos1abcdefghijkl" },
      {
        key: "recipient",
        value: "cosmos1abcdefghijkl",
      },
    ],
    tx: {
      type: "auth/StdTx",
      value: {
        msg: [
          {
            type: "cosmos-sdk/MsgSend",
            value: {
              from_address: "cosmos1abcdefghijkl",
              to_address: "cosmos1abcdefghijkl",
              amount: [{ denom: "uatom", amount: "200000" }],
            },
          },
        ],
        fee: { amount: null, gas: "36363" },
        signatures: [
          {
            pub_key: {
              type: "tendermint/PubKeySecp256k1",
              value: "askjdhasd876as9dyasdbnmada",
            },
            signature: "kahdakjhdasdhsa",
          },
        ],
        memo: "woop",
      },
    },
    timestamp: "2019-05-31T14:46:14Z",
    type: "bank",
    time: "2019-05-31T14:46:14.571Z",
  },
  {
    height: "573799",
    txhash: "ASLDHASLKDHJASLKDJHASLKDJHASLKDJHASLD",
    raw_log: '[{"msg_index":"0","success":true,"log":""}]',
    logs: [{ msg_index: "0", success: true, log: "" }],
    gas_wanted: "36543",
    gas_used: "24302",
    tags: [
      { key: "action", value: "send" },
      { key: "sender", value: "cosmos1abcdefghijkl" },
      {
        key: "recipient",
        value: "cosmos1abcdefghijkl",
      },
    ],
    tx: {
      type: "auth/StdTx",
      value: {
        msg: [
          {
            type: "cosmos-sdk/MsgSend",
            value: {
              from_address: "cosmos1abcdefghijkl",
              to_address: "cosmos1abcdefghijkl",
              amount: [{ denom: "uatom", amount: "200000" }],
            },
          },
        ],
        fee: { amount: null, gas: "36543" },
        signatures: [
          {
            pub_key: {
              type: "tendermint/PubKeySecp256k1",
              value: "askjdhasd876as9dyasdbnmada",
            },
            signature: "kahdakjhdasdhsa",
          },
        ],
        memo: "",
      },
    },
    timestamp: "2019-06-07T09:34:52Z",
    type: "bank",
    time: "2019-06-07T09:34:52.594Z",
  },
  {
    height: "623297",
    txhash: "ASLKDJHSALKDHASLKDJHASLKDJHASLKDJHKLSAD",
    raw_log: '[{"msg_index":"0","success":true,"log":""}]',
    logs: [{ msg_index: "0", success: true, log: "" }],
    gas_wanted: "36273",
    gas_used: "24302",
    tags: [
      { key: "action", value: "send" },
      { key: "sender", value: "cosmos1abcdefghijkl" },
      {
        key: "recipient",
        value: "cosmos1abcdefghijkl",
      },
    ],
    tx: {
      type: "auth/StdTx",
      value: {
        msg: [
          {
            type: "cosmos-sdk/MsgSend",
            value: {
              from_address: "cosmos1abcdefghijkl",
              to_address: "cosmos1abcdefghijkl",
              amount: [{ denom: "uatom", amount: "200000" }],
            },
          },
        ],
        fee: { amount: null, gas: "36273" },
        signatures: [
          {
            pub_key: {
              type: "tendermint/PubKeySecp256k1",
              value: "askjdhasd876as9dyasdbnmada",
            },
            signature: "kahdakjhdasdhsa",
          },
        ],
        memo: "",
      },
    },
    timestamp: "2019-06-11T08:25:00Z",
    type: "bank",
    time: "2019-06-11T08:25:00.293Z",
  },
  {
    height: "625814",
    txhash: "345678KJHGKJH4567LKHJ76JKB97",
    raw_log: '[{"msg_index":"0","success":true,"log":""}]',
    logs: [{ msg_index: "0", success: true, log: "" }],
    gas_wanted: "36543",
    gas_used: "27855",
    tags: [
      { key: "action", value: "send" },
      { key: "sender", value: "cosmos1abcdefghijkl" },
      {
        key: "recipient",
        value: "cosmos1abcdefghijkl",
      },
    ],
    tx: {
      type: "auth/StdTx",
      value: {
        msg: [
          {
            type: "cosmos-sdk/MsgSend",
            value: {
              from_address: "cosmos1abcdefghijkl",
              to_address: "cosmos1abcdefghijkl",
              amount: [{ denom: "uatom", amount: "200000" }],
            },
          },
        ],
        fee: { amount: [{ denom: "uatom", amount: "37" }], gas: "36543" },
        signatures: [
          {
            pub_key: {
              type: "tendermint/PubKeySecp256k1",
              value: "askjdhasd876as9dyasdbnmada",
            },
            signature: "kahdakjhdasdhsa",
          },
        ],
        memo: "",
      },
    },
    timestamp: "2019-06-11T13:14:31Z",
    type: "bank",
    time: "2019-06-11T13:14:31.017Z",
  },
  {
    height: "630736",
    txhash: "KJ78KJNBKJ8KJHB7654KBLJHBLJ7868",
    raw_log: '[{"msg_index":"0","success":true,"log":""}]',
    logs: [{ msg_index: "0", success: true, log: "" }],
    gas_wanted: "36543",
    gas_used: "27855",
    tags: [
      { key: "action", value: "send" },
      { key: "sender", value: "cosmos1abcdefghijkl" },
      {
        key: "recipient",
        value: "cosmos1abcdefghijkl",
      },
    ],
    tx: {
      type: "auth/StdTx",
      value: {
        msg: [
          {
            type: "cosmos-sdk/MsgSend",
            value: {
              from_address: "cosmos1abcdefghijkl",
              to_address: "cosmos1abcdefghijkl",
              amount: [{ denom: "uatom", amount: "200000" }],
            },
          },
        ],
        fee: { amount: [{ denom: "uatom", amount: "37" }], gas: "36543" },
        signatures: [
          {
            pub_key: {
              type: "tendermint/PubKeySecp256k1",
              value: "askjdhasd876as9dyasdbnmada",
            },
            signature: "kahdakjhdasdhsa",
          },
        ],
        memo: "",
      },
    },
    timestamp: "2019-06-11T22:41:04Z",
    type: "bank",
    time: "2019-06-11T22:41:04.794Z",
  },
]
