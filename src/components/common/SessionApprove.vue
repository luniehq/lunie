<template>
  <div
    class="approve-tran"
    hide-header
  >
    <h2>Approve Transaction</h2>
    <div>
      <p>Verify the transaction details below.</p>
    </div>
    <TmFormGroup
      field-id="to"
      field-label="Your address"
    >
      <LiAnyTransaction
        v-for="tx in obj"
        :key="tx.txhash"
        :validators="deligates"
        :transaction="tx"
        :hide-meta-data="true"
        validators-url="/"
        proposals-url="/"
        bonding-denom="Atoms"
      />

      <!-- Going to take some more logic based on how transactions are passed in -->
      <div>From
        <Bech32 :address="currentAccount.address" />
      </div>

      <TableInvoice
        :amount="12"
        :gas-estimate="Number(obj[0].gas_wanted)"
        :gas-price="0.000004"
      />

      <div class="approve-tran-footer">
        <TmBtn
          value="Reject"
          class="left-button"
          color="secondary"
        />
        <TmBtn
          value="Approve"
          class="right-button"
          color="primary"
        />
      </div>
    </TmFormGroup>
  </div>
</template>

<script>
import TmBtn from "common/TmBtn"
import TmFormGroup from "common/TmFormGroup"
import LiAnyTransaction from "transactions/LiAnyTransaction"
import TableInvoice from "src/ActionModal/components/TableInvoice"
import Bech32 from "common/Bech32"

export default {
  name: `session-ext-approve-tran`,
  components: {
    TmBtn,
    TmFormGroup,
    LiAnyTransaction,
    TableInvoice,
    Bech32
  },
  data: () => ({
    obj: [
      {
        height: 1912,
        txhash:
          "CE4465D697895A4FDD7F507316997BC7F187C312F3BC1526D3B5F472E6FF0B53",
        data: "0C0890BDB9E80510EA83B18401",
        raw_log: '[{"msg_index":"0","success":true,"log":""}]',
        logs: [
          {
            msg_index: "0",
            success: true,
            log: ""
          }
        ],
        gas_wanted: "162302",
        gas_used: "111767",
        tags: [
          {
            key: "action",
            value: "begin_unbonding"
          },
          {
            key: "delegator",
            value: "cosmos1ek9cd8ewgxg9w5xllq9um0uf4aaxaruvcw4v9e"
          },
          {
            key: "source-validator",
            value: "cosmosvaloper1d6xm3t87wggn5lnvu203hx3ter8gyh780cm975"
          },
          {
            key: "end-time",
            value: "2019-06-22T17:00:00Z"
          }
        ],
        tx: {
          type: "auth/StdTx",
          value: {
            msg: [
              {
                type: "cosmos-sdk/MsgUndelegate",
                value: {
                  delegator_address:
                    "cosmos1ek9cd8ewgxg9w5xllq9um0uf4aaxaruvcw4v9e",
                  validator_address:
                    "cosmosvaloper1d6xm3t87wggn5lnvu203hx3ter8gyh780cm975",
                  amount: {
                    denom: "stake",
                    amount: "12000000"
                  }
                }
              }
            ],
            fee: {
              amount: [
                {
                  denom: "stake",
                  amount: "162"
                }
              ],
              gas: "162302"
            },
            signatures: [
              {
                pub_key: {
                  type: "tendermint/PubKeySecp256k1",
                  value: "Av0BWXFrBZolysYmX9ouUsBXEYeUj8EvOPcYLxmLVrzB"
                },
                signature:
                  "US7ONl2JLFuSW38v0nU4wY6mtOF3ALXDhN9Re17RlKINnwQD/HnNAj2LxU3ItcKWzfl7Z+Ff71tppGdqmZu+Kg=="
              }
            ],
            memo: ""
          }
        },
        timestamp: "2019-06-19T17:00:00Z",
        type: "staking",
        time: "2019-06-19T17:00:00.277Z"
      }
    ],
    deligates: [
      {
        operator_address:
          "cosmosvaloper1dxelhf7rvlx6drulrdhxq9zkxxwreczscguac5",
        consensus_pubkey:
          "cosmosvalconspub1zcjduepqpc2pl0nac84an3y6k0npr43xf5rv4qjqx656p0slegk8vqe048lslaw7r7",
        jailed: false,
        status: 2,
        tokens: "10000000",
        delegator_shares: "10000000.000000000000000000",
        description: {
          moniker: "operator_account_1",
          identity: "",
          website: "",
          details: ""
        },
        unbonding_height: "0",
        unbonding_time: "1970-01-01T00:00:00Z",
        commission: {
          rate: "0.000000000000000000",
          max_rate: "0.000000000000000000",
          max_change_rate: "0.000000000000000000",
          update_time: "2019-06-20T18:43:36.70076117Z"
        },
        min_self_delegation: "1",
        keybase: {
          keybaseId: ""
        },
        signing_info: {
          start_height: "3",
          index_offset: "470",
          jailed_until: "1970-01-01T00:00:00Z",
          tombstoned: false,
          missed_blocks_counter: "0"
        }
      }
    ],
    currentAccount: {
      address: "cosmos1vgkesh3z4wuglzjf9fjvcvkcxhp22rqx3sd5zr"
    }
  }),
  methods: {
    setState(value) {
      this.$emit(`route-change`, value)
    },
    close() {
      this.$emit(`close`)
    }
  }
}
</script>

<style scoped>
.approve-tran {
  padding: 2rem;
  background: var(--fg);
  border-left: 1px solid var(--bc-dim);
}

.approve-tran h2 {
  color: var(--bright);
  font-size: var(--h1);
  font-weight: 500;
  line-height: 3rem;
}

.card {
  background: var(--app-nav);
  border-radius: 2px;
  padding: 1rem;
  font-size: var(--m);
  margin-bottom: 0.5rem;
  border: 1px solid var(--bc);
}

.card h3 {
  font-size: 14px;
  font-weight: 400;
}

.content-left {
  display: flex;
  flex-direction: column;
}

.approve-tran-footer {
  display: flex;
  justify-content: space-around;
  padding: 1.5rem 0 1rem;

  /* keeps button in bottom right no matter the size of the action modal */
  flex-grow: 1;
  align-self: flex-end;
}
</style>
