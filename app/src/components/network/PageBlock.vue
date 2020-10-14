<template>
  <TmPage
    data-title="Block"
    :loading="this.$apollo.queries.block.loading"
    class="readable-width"
  >
    <template>
      <div class="block">
        <h2 class="page-profile__title">Block #{{ height | prettyInt }}</h2>
      </div>

      <ul class="row">
        <li>
          <h4>Chain ID</h4>
          <span class="page-data">{{ block.chainId }}</span>
        </li>
        <li>
          <h4>Time</h4>
          <span class="page-data">{{ block.time | date }}</span>
        </li>
      </ul>

      <div class="row">
        <div class="column">
          <h3 class="page-profile__section-title">
            Transactions ({{ block.transactions.length }})
            <template v-if="unknownTxs.length">
              ({{ unknownTxs.length }} transaction{{
                unknownTxs.length > 1 ? "s" : ""
              }}
              not showing)
            </template>
          </h3>

          <TmDataMsg v-if="block.transactions.length === 0" icon="info_outline">
            <div slot="title">No Transactions</div>
            <div slot="subtitle">
              This block doesn't contain any transactions.
            </div>
          </TmDataMsg>

          <EventList
            v-else
            :events="filteredTransactions"
            :more-available="false"
          >
            <template slot-scope="event">
              <TransactionItem
                :key="event.key"
                :transaction="event"
                :validators="validatorsAddressMap"
                :address="address"
              />
            </template>
          </EventList>

          <br />
        </div>
      </div>
    </template>
  </TmPage>
</template>

<script>
import { mapGetters } from "vuex"
import { date } from "src/filters"
import { prettyInt } from "scripts/num"
import gql from "graphql-tag"

import TmPage from "common/TmPage"
import TransactionItem from "transactions/TransactionItem"
import TmDataMsg from "common/TmDataMsg"
import EventList from "common/EventList"

const transactionV2Fields = `
  type
  hash
  key
  height
  timestamp
  memo
  success
  fees {
    denom
    amount
  }
  details {
    ... on SendTx {
      from
      to
      amount {
        denom
        amount
      }
    }
    ... on StakeTx {
      to
      amount {
        denom
        amount
      }
    }
    ... on RestakeTx {
      to
      from
      amount {
        denom
        amount
      }
    }
    ... on UnstakeTx {
      from
      amount {
        denom
        amount
      }
    }
    ... on ClaimRewardsTx {
      from
      amounts {
        denom
        amount
      }
    }
    ... on SubmitProposalTx {
      proposalType
      proposalTitle
      proposalDescription
      initialDeposit {
        denom
        amount
      }
    }
    ... on VoteTx {
      proposalId
      voteOption
    }
    ... on DepositTx {
      proposalId
      amount {
        denom
        amount
      }
    }
  }
`

export default {
  name: `page-block`,
  components: {
    TmDataMsg,
    TmPage,
    TransactionItem,
    EventList,
  },
  filters: {
    date,
    prettyInt,
  },
  data: () => ({
    block: {
      transactions: [],
    },
    validators: [],
  }),
  computed: {
    ...mapGetters([`address`, `network`]),
    height() {
      return this.$route.params.height
    },
    validatorsAddressMap() {
      const names = {}
      this.validators.forEach((item) => {
        names[item.operatorAddress] = item
      })
      return names
    },
    unknownTxs() {
      if (this.block && this.block.transactions) {
        return this.block.transactions.filter(
          (transaction) => transaction.type === `UnknownTx`
        )
      }
      return []
    },
    filteredTransactions() {
      if (this.block && this.block.transactions) {
        return this.block.transactions.filter(
          (transaction) => transaction.type !== `UnknownTx`
        )
      } else {
        return []
      }
    },
  },
  apollo: {
    validators: {
      query: gql`
        query validators($networkId: String!) {
          validators(networkId: $networkId) {
            id
            name
            operatorAddress
          }
        }
      `,
      /* istanbul ignore next */
      variables() {
        return {
          networkId: this.network,
        }
      },
      /* istanbul ignore next */
      update: function (result) {
        return result.validators
      },
    },
    block: {
      query: gql`
        query blockV2($networkId: String!, $height: Int!) {
          blockV2(networkId: $networkId, height: $height) {
            id
            networkId
            height
            hash
            chainId
            time
            transactions {
              ${transactionV2Fields}
            }
            proposer_address
          }
        }
      `,
      /* istanbul ignore next */
      variables() {
        return {
          networkId: this.network,
          height: Number(this.height),
        }
      },
      /* istanbul ignore next */
      update: function (result) {
        return result.blockV2
      },
      /* istanbul ignore next */
      result({ error }) {
        // TODO move logic of 404 into API
        this.error = error
      },
    },
  },
}
</script>
<style scoped>
.page-profile__title {
  color: var(--bright);
  font-size: var(--h1);
  line-height: 2.25rem;
  font-weight: 500;
  padding: 1rem;
}

.page-profile__section-title {
  color: var(--txt);
}

.tm-data-msg {
  margin: 0;
}

.page-profile__section {
  padding-top: 2rem;
}
</style>
