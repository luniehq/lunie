<template>
  <TmPage
    data-title="Block"
    :managed="true"
    :loading="this.$apollo.queries.block.loading"
    hide-header
  >
    <template slot="managed-body">
      <div class="block">
        <h2 class="page-profile__title">Block {{ height }}</h2>
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
          </h3>

          <TmDataMsg v-if="block.transactions.length === 0" icon="info_outline">
            <div slot="title">
              No Transactions
            </div>
            <div slot="subtitle">
              This block doesn't contain any transactions.
            </div>
          </TmDataMsg>

          <TransactionList
            :transactions="block.transactions"
            :address="address"
            :validators="validatorsAddressMap"
          />
          <br />
        </div>
      </div>
    </template>
  </TmPage>
</template>

<script>
import { mapState, mapGetters } from "vuex"
import { date } from "src/filters"
import gql from "graphql-tag"

import TmPage from "common/TmPage"
import TransactionList from "transactions/TransactionList"
import TmDataMsg from "common/TmDataMsg"
import TmDataLoading from "common/TmDataLoading"
export default {
  name: `page-block`,
  components: {
    TmDataMsg,
    TmDataLoading,
    TmPage,
    TransactionList
  },
  data: () => ({
    block: {
      transactions: []
    },
    validators: []
  }),
  filters: {
    date
  },
  computed: {
    ...mapGetters([`address`, `network`]),
    height() {
      return this.$route.params.height
    },
    validatorsAddressMap() {
      const names = {}
      this.validators.forEach(item => {
        names[item.operator_address] = item
      })
      return names
    }
  },
  apollo: {
    validators: {
      query: gql`
        query validators(
          $networkId: String!
          $delegatorAddress: String
          $all: Boolean
          $query: String
        ) {
          validators(
            networkId: $networkId
            delegatorAddress: $delegatorAddress
            all: $all
            query: $query
          ) {
            name
            operatorAddress
          }
        }
      `,
      variables() {
        return {
          networkId: this.network
        }
      },
      update: function(result) {
        return result.validators
      }
    },
    block: {
      query: gql`
        query block($networkId: String!, $height: Int!) {
          block(networkId: $networkId, height: $height) {
            networkId
            height
            hash
            chainId
            time
            transactions {
              type
              hash
              height
              group
              timestamp
              gasUsed
              gasWanted
              success
              log
              memo
              fee {
                amount
              }
              signature
              value
              amount
            }
            proposer_address
          }
        }
      `,
      variables() {
        return {
          networkId: this.network,
          height: Number(this.height)
        }
      },
      update: function(result) {
        return result.block
      }
    }
  }
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
