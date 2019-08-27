const testTransactionObjects = [
  {
    type: "cosmos-sdk/MsgSend",
    value: {
      from_address: "cosmos1alkjdbasdlkhasldjnasldkjasndlkjansdlasndlkj",
      to_address: "cosmos1alkjdbasdlkhasldjnasldkjasndlkjansdlasndlkj",
      amount: [{ denom: "uatom", amount: "234500" }]
    },
    key:
      'cosmos-sdk/MsgSend_2019-07-18T10:03:11.624Z_{"from_address":"cosmos1alkjdbasdlkhasldjnasldkjasndlkjansdlasndlkj","to_address":"cosmos1alkjdbasdlkhasldjnasldkjasndlkjansdlasndlkj","amount":[{"denom":"uatom","amount":"234500"}]}',
    blockNumber: 1086769,
    time: new Date("2019-07-31T09:22:23.054Z"),
    group: "banking",
    memo: "(Sent via Lunie)",
    fees: { denom: "uatom", amount: "37" },
    liquidDate: null
  },
  {
    type: "cosmos-sdk/MsgSend",
    value: {
      from_address: "cosmos1",
      to_address: "cosmos1alkjdbasdlkhasldjnasldkjasndlkjansdlasndlkasdas",
      amount: [{ denom: "uatom", amount: "234500" }]
    },
    key:
      'cosmos-sdk/MsgSend_2019-07-18T10:03:11.624Z_{"from_address":"cosmos1alkjdbasdlkhasldjnasldkjasndlkjansdlasndlkj","to_address":"cosmos1alkjdbasdlkhasldjnasldkjasndlkjansdlasndlkj","amount":[{"denom":"uatom","amount":"234500"}]}',
    blockNumber: 1086769,
    time: new Date("2019-07-31T09:22:23.054Z"),
    group: "banking",
    memo: "(Sent via Lunie)",
    fees: { denom: "uatom", amount: "37" },
    liquidDate: null
  },
  {
    type: "cosmos-sdk/MsgSend",
    value: {
      from_address: "cosmos1",
      to_address: "cosmos1",
      amount: [{ denom: "uatom", amount: "234500" }]
    },
    key:
      'cosmos-sdk/MsgSend_2019-07-18T10:03:11.624Z_{"from_address":"cosmos1alkjdbasdlkhasldjnasldkjasndlkjansdlasndlkj","to_address":"cosmos1alkjdbasdlkhasldjnasldkjasndlkjansdlasndlkj","amount":[{"denom":"uatom","amount":"234500"}]}',
    blockNumber: 1086769,
    time: new Date("2019-07-31T09:22:23.054Z"),
    group: "banking",
    memo: "(Sent via Lunie)",
    fees: { denom: "uatom", amount: "37" },
    liquidDate: null
  },
  {
    type: "cosmos-sdk/MsgSend",
    value: {
      from_address: "cosmos11231212",
      to_address: "cosmos1",
      amount: [{ denom: "uatom", amount: "234500" }]
    },
    key:
      'cosmos-sdk/MsgSend_2019-07-18T10:03:11.624Z_{"from_address":"cosmos1alkjdbasdlkhasldjnasldkjasndlkjansdlasndlkj","to_address":"cosmos1alkjdbasdlkhasldjnasldkjasndlkjansdlasndlkj","amount":[{"denom":"uatom","amount":"234500"}]}',
    blockNumber: 1086769,
    time: new Date("2019-07-31T09:22:23.054Z"),
    group: "banking",
    memo: "(Sent via Lunie)",
    fees: { denom: "uatom", amount: "37" },
    liquidDate: null
  },
  {
    type: "cosmos-sdk/MsgUndelegate",
    value: {
      delegator_address: "cosmos1askldjbasldkhasdlkasbndlkasjda",
      validator_address: "cosmosvaloper1lsajkdalskdjhasldkahsdljkalskdjhlaks",
      amount: { denom: "uatom", amount: "50000" }
    },
    key:
      'cosmos-sdk/MsgUndelegate_2019-07-31T09:22:23.054Z_{"delegator_address":"cosmos1jiojhasdljaosaodjnsadlkjsndlndliuahdlasndlasjd,"validator_address":"cosmosvaloper1aaskdjbalkdnasldknasdlknasdlkasnjdlakjnd,"amount":{"denom":"uatom","amount":"50000"}}',
    blockNumber: 1248479,
    time: new Date("2019-07-31T09:22:23.054Z"),
    group: "staking",
    memo: "",
    fees: { denom: "uatom", amount: "4141" },
    liquidDate: "2019-08-21T09:22:23.054Z"
  },
  {
    type: "cosmos-sdk/MsgBeginRedelegate",
    value: {
      delegator_address: "cosmos1alkjdbasdlkhasldjnasldkjasndlkjansdlasndlkj",
      validator_src_address: "cosmosvaloper1sjllsnasdmasakjshdlkdhjasldnasd",
      validator_dst_address: "cosmosvaloper1uaisjdnidjnlaskjdnlkjasndlkadjn",
      amount: { denom: "uatom", amount: "10000" }
    },
    key:
      'cosmos-sdk/MsgBeginRedelegate_2019-06-19T14:45:43.303Z_{"delegator_address":"cosmos1alkjdbasdlkhasldjnasldkjasndlkjansdlasndlkj","validator_src_address":"cosmosvaloper1sjllsnasdmasakjshdlkdhjasldnasdnadn","validator_dst_address":"cosmosvaloper1uaisjdnidjnlaskjdnlkjasndlkadjn","amount":{"denom":"uatom","amount":"10000"}}',
    blockNumber: 726616,
    time: "2019-06-19T14:45:43.303Z",
    group: "staking",
    memo: "",
    fees: { denom: "uatom", amount: "283" },
    liquidDate: null
  },
  {
    type: "cosmos-sdk/MsgDelegate",
    value: {
      delegator_address: "cosmos1alkjdbasdlkhasldjnasldkjasndlkjansdlasndlkj",
      validator_address: "cosmosvaloper1uaisjdnidjnlaskjdnlkjasndlkadjn",
      amount: { denom: "uatom", amount: "50000" }
    },
    key:
      'cosmos-sdk/MsgDelegate_2019-06-19T14:43:45.874Z_{"delegator_address":"cosmos1alkjdbasdlkhasldjnasldkjasndlkjansdlasndlkj","validator_address":"cosmosvaloper1uaisjdnidjnlaskjdnlkjasndlkadjn","amount":{"denom":"uatom","amount":"50000"}}',
    blockNumber: 726599,
    time: "2019-06-19T14:43:45.874Z",
    group: "staking",
    memo: "",
    fees: { denom: "uatom", amount: "166" },
    liquidDate: null
  },
  {
    type: "cosmos-sdk/MsgWithdrawDelegationReward",
    value: {
      delegator_address: "cosmos1alkjdbasdlkhasldjnasldkjasndlkjansdlasndlkj",
      validator_address: "cosmosvaloper1sjllsnasdmasakjshdlkdhjasldnasdnadn"
    },
    key:
      'cosmos-sdk/MsgWithdrawDelegationReward_2019-06-11T13:47:45.425Z_{"delegator_address":"cosmos1alkjdbasdlkhasldjnasldkjasndlkjansdlasndlkj","validator_address":"cosmosvaloper1sjllsnasdmasakjshdlkdhjasldnasdnadn"}',
    blockNumber: 626102,
    time: "2019-06-11T13:47:45.425Z",
    group: "distribution",
    memo: "",
    fees: { amount: "0", denom: "ATOM" },
    liquidDate: null
  },
  {
    type: "cosmos-sdk/MsgSubmitProposal",
    value: {
      content: {
        type: "cosmos-sdk/TextProposal",
        value: {
          description: "description text",
          title: "Test title"
        }
      },
      initial_deposit: [{ amount: "200000", denom: "uatom" }],
      proposer: "cosmos1jq9mc3kp4nnxwryr09fpqjtrwya8q5q480zu0e"
    },
    key:
      'cosmos-sdk/cosmos-sdk/MsgSubmitProposal_2019-06-11T13:47:45.425Z_{"delegator_address":"cosmos1alkjdbasdlkhasldjnasldkjasndlkjansdlasndlkj","validator_address":"cosmosvaloper1sjllsnasdmasakjshdlkdhjasldnasdnadn"}',
    blockNumber: 626102,
    time: "2019-06-11T13:47:45.425Z",
    group: "governance",
    memo: "",
    fees: { amount: "69", denom: "ATOM" },
    liquidDate: null
  },
  {
    type: "cosmos-sdk/MsgVote",
    value: {
      option: "NoWithVeto",
      proposal_id: "13",
      voter: "cosmos1jq9mc3kp4nnxwrasdadasdasdasd5q480zu0z"
    },
    key:
      'cosmos-sdk/cosmos-sdk/MsgVote_2019-06-11T13:47:45.425Z_{"delegator_address":"cosmos1asdkjadkajsdkasdadadh","validator_address":"cosmosvaloper1sjllsnjhagsdhgajshdasjhdgajsdhgjas"}',
    blockNumber: 626103,
    time: "2019-06-11T13:47:45.425Z",
    group: "governance",
    memo: "",
    fees: { amount: "69", denom: "ATOM" },
    liquidDate: null
  },
  {
    type: "cosmos-sdk/MsgDeposit",
    value: {
      depositer: `cosmos1asdadasdasdasds`,
      proposal_id: 2,
      amount: [{ denom: "uatom", amount: "234500" }]
    },
    key:
      'cosmos-sdk/cosmos-sdk/MsgDeposit_2019-06-11T13:47:45.425Z_{"delegator_address":"cosmos1asdkjadkajsdkasdadadh","validator_address":"cosmosvaloper1sjllsnjhagsdhgajshdasjhdgajsdhgjas"}',
    blockNumber: 626103,
    time: "2019-06-11T13:47:45.425Z",
    group: "governance",
    memo: "",
    fees: { amount: "69", denom: "ATOM" },
    liquidDate: null
  },
  {
    type: "cosmos-sdk/MsgSetWithdrawAddress",
    value: {
      withdraw_address: "cosmos1alkjdbasdlkhasldjnasldkjasndlkjansdlasndlkj"
    },
    key:
      'cosmos-sdk/MsgSetWithdrawAddress_2019-06-11T13:47:45.425Z_{"delegator_address":"cosmos1alkjdbasdlkhasldjnasldkjasndlkjansdlasndlkj","validator_address":"cosmosvaloper1sjllsnasdmasakjshdlkdhjasldnasdnadn"}',
    blockNumber: 626102,
    time: "2019-06-11T13:47:45.425Z",
    group: "distribution",
    memo: "",
    fees: { amount: "0", denom: "ATOM" },
    liquidDate: null
  },
  {
    type: "cosmos-sdk/MsgWithdrawValidatorCommission",
    value: {
      validator_address: "cosmos1alkjdbasdlkhasldjnasldkjasndlkjansdlasndlkj"
    },
    key:
      'cosmos-sdk/MsgWithdrawValidatorCommission_2019-06-11T13:47:45.425Z_{"delegator_address":"cosmos1alkjdbasdlkhasldjnasldkjasndlkjansdlasndlkj","validator_address":"cosmosvaloper1sjllsnasdmasakjshdlkdhjasldnasdnadn"}',
    blockNumber: 626102,
    time: "2019-06-11T13:47:45.425Z",
    group: "distribution",
    memo: "",
    fees: { amount: "0", denom: "ATOM" },
    liquidDate: null
  },
  {
    type: "cosmos-sdk/MsgUnjail",
    value: {
      address: "cosmos1alkjdbasdlkhasldjnasldkjasndlkjansdlasndlkj"
    },
    key:
      'cosmos-sdk/MsgUnjail_2019-06-11T13:47:45.425Z_{"delegator_address":"cosmos1alkjdbasdlkhasldjnasldkjasndlkjansdlasndlkj","validator_address":"cosmosvaloper1sjllsnasdmasakjshdlkdhjasldnasdnadn"}',
    blockNumber: 626102,
    time: "2019-06-11T13:47:45.425Z",
    group: "distribution",
    memo: "",
    fees: { amount: "0", denom: "ATOM" },
    liquidDate: null
  },
  {
    type: "cosmos-sdk/MsgCreateValidator",
    value: {
      validator_address: "cosmos1alkjdbasdlkhasldjnasldkjasndlkjansdlasndlkj"
    },
    key:
      'cosmos-sdk/MsgCreateValidator_2019-06-11T13:47:45.425Z_{"delegator_address":"cosmos1alkjdbasdlkhasldjnasldkjasndlkjansdlasndlkj","validator_address":"cosmosvaloper1sjllsnasdmasakjshdlkdhjasldnasdnadn"}',
    blockNumber: 626102,
    time: "2019-06-11T13:47:45.425Z",
    group: "distribution",
    memo: "",
    fees: { amount: "0", denom: "ATOM" },
    liquidDate: null
  },
  {
    type: "cosmos-sdk/MsgEditValidator",
    value: {
      validator_address: "cosmos1alkjdbasdlkhasldjnasldkjasndlkjansdlasndlkj"
    },
    key:
      'cosmos-sdk/MsgEditValidator_2019-06-11T13:47:45.425Z_{"delegator_address":"cosmos1alkjdbasdlkhasldjnasldkjasndlkjansdlasndlkj","validator_address":"cosmosvaloper1sjllsnasdmasakjshdlkdhjasldnasdnadn"}',
    blockNumber: 626102,
    time: "2019-06-11T13:47:45.425Z",
    group: "distribution",
    memo: "",
    fees: { amount: "0", denom: "ATOM" },
    liquidDate: null
  },
  {
    type: "cosmos-sdk/MsgSubmitProposal",
    value: {
      content: {
        type: "cosmos-sdk/SoftwareUpgradeProposal",
        value: {
          description: "description text",
          title: "Test title"
        }
      },
      initial_deposit: [{ amount: "200000", denom: "uatom" }],
      proposer: "cosmos1jq9mc3kp4nnxwryr09fpqjtrwya8q5q480zu0e"
    },
    key:
      'cosmos-sdk/cosmos-sdk/MsgSubmitProposal_2019-06-11T13:47:45.425Z_{"delegator_address":"cosmos1alkjdbasdlkhasldjnasldkjasndlkjansdlasndlkj","validator_address":"cosmosvaloper1sjllsnasdmasakjshdlkdhjasldnasdnadn"}',
    blockNumber: 626102,
    time: "2019-06-11T13:47:45.425Z",
    group: "governance",
    memo: "",
    fees: { amount: "69", denom: "ATOM" },
    liquidDate: null
  }
]

export { testTransactionObjects }
