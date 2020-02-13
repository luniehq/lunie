<template>
  <TmPage
    :managed="true"
    :loading="$apollo.queries.transactions.loading && dataEmpty"
    :loaded="!$apollo.queries.transactions.loading && !dataEmpty"
    :error="$apollo.queries.transactions.error"
    :data-empty="transactions.length === 0"
    data-title="Transactions"
    :sign-in-required="true"
    :hide-header="true"
  >
    <DataEmptyTx slot="no-data" />
    <template slot="managed-body">
      <div>
        <TransactionList
          :transactions="showingTransactions"
          :address="address"
          :validators="validatorsAddressMap"
          @loadMore="loadMore"
        />
      </div>
      <br />
      <TmDataMsg icon="calendar_today">
        <div slot="title">
          Looking for older transactions?
        </div>
        <div slot="subtitle">
          Unfortunately, we can't display transactions from previous chains
          right now.
          <a class="intercom-button" @click="handleIntercom()">Let us know</a>
          if you'd like access these transactions.
        </div>
      </TmDataMsg>
    </template>
  </TmPage>
</template>

<script>
import { mapGetters } from "vuex"
import DataEmptyTx from "common/TmDataEmptyTx"
import TmDataMsg from "common/TmDataMsg"
import TmPage from "common/TmPage"
import TransactionList from "transactions/TransactionList"
import gql from "graphql-tag"

export default {
  name: `page-transactions`,
  components: {
    TransactionList,
    DataEmptyTx,
    TmDataMsg,
    TmPage
  },
  data: () => ({
    showing: 15,
    block: 0,
    validators: [],
    transactions: [],
    loadedTransactions: [],
    lastLoadedRecordsCount: 0
  }),
  computed: {
    ...mapGetters([`address`, `network`]),
    validatorsAddressMap() {
      const names = {}
      this.validators.forEach(item => {
        names[item.operatorAddress] = item
      })
      return names
    },
    dataEmpty() {
      return this.transactions.length === 0
    },
    showingTransactions() {
      return this.transactions.slice(0, this.showing)
    }
  },
  methods: {
    loadMore() {
      this.showing += 50
      // preload next transactions before scroll end and check if last loading loads new records
      if (
        this.showing > this.transactions.length - 100 &&
        this.lastLoadedRecordsCount
      ) {
        // loads new portion
        this.block++
      }
    },
    handleIntercom() {
      this.$store.dispatch(`displayMessenger`)
    }
  },
  apollo: {
    transactions: {
      query: gql`
        query transactions(
          $networkId: String!
          $address: String!
          $block: Int
        ) {
          transactions(
            networkId: $networkId
            address: $address
            block: $block
          ) {
            hash
            type
            group
            height
            timestamp
            gasUsed
            fee {
              amount
              denom
            }
            value
            withdrawValidators
          }
        }
      `,
      skip() {
        return !this.address
      },
      variables() {
        return {
          networkId: this.network,
          address: this.address,
          block: this.block
        }
      },
      update(result) {
        let trx = []
        if (Array.isArray(result.transactions)) {
          trx = result.transactions.map(tx => ({
            ...tx,
            timestamp: new Date(tx.timestamp),
            value: JSON.parse(tx.value)
          }))
        }
        this.lastLoadedRecordsCount = trx.length
        this.loadedTransactions = [...this.loadedTransactions, ...trx]
        return this.loadedTransactions
      }
    },
    validators: {
      query: gql`
        query validators($networkId: String!) {
          validators(networkId: $networkId) {
            name
            operatorAddress
            picture
          }
        }
      `,
      skip() {
        return !this.address
      },
      variables() {
        return {
          networkId: this.network
        }
      }
    }
  }
}
</script>
