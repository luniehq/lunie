<template>
  <TmPage
    data-title="Block"
    :managed="true"
    :loading="!blockMetaInfo"
    :loaded="!!blockMetaInfo"
    :error="error"
    hide-header
  >
    <template slot="managed-body">
      <div class="block">
        <h2 class="page-profile__title">Block {{ blockTitle || `--` }}</h2>
      </div>

      <ul class="row">
        <li>
          <h4>Chain ID</h4>
          <span class="page-data">{{
            blockMetaInfo && blockMetaInfo.header.chain_id
          }}</span>
        </li>
        <li>
          <h4>Time</h4>
          <span class="page-data">{{ blockTime }}</span>
        </li>
      </ul>

      <div class="row">
        <div class="column">
          <h3 v-if="transactions" class="page-profile__section-title">
            Transactions ({{ blockMetaInfo && blockMetaInfo.header.num_txs }})
          </h3>

          <TmDataLoading v-if="transactionsLoading" />

          <TmDataMsg
            v-else-if="transactions && transactions.length === 0"
            icon="info_outline"
          >
            <div slot="title">
              No Transactions
            </div>
            <div slot="subtitle">
              This block doesn't contain any transactions.
            </div>
          </TmDataMsg>

          <TransactionList
            :transactions="transactions"
            :address="session.address"
            :validators="validatorsAddressMap"
          />
          <br />
        </div>
      </div>
    </template>
  </TmPage>
</template>

<script>
import moment from "moment"
import { mapState, mapGetters } from "vuex"
import { prettyInt } from "scripts/num"
import {
  flattenTransactionMsgs,
  addTransactionTypeData
} from "scripts/transaction-utils"
import { AllValidators, AllValidatorsResult } from "src/gql"

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
    error: null,
    transactionsRaw: [],
    blockMetaInfo: null,
    validators: []
  }),
  computed: {
    ...mapState({ network: state => state.connection.network }),
    ...mapState([`delegation`, `session`]),
    ...mapGetters([`lastHeader`]),
    validatorsAddressMap() {
      const names = {}
      this.validators.forEach(item => {
        names[item.operator_address] = item
      })
      return names
    },
    transactions() {
      const unbondingInfo = {
        delegation: this.delegation
      }

      if (this.transactionsRaw) {
        return this.transactionsRaw
          .reduce(flattenTransactionMsgs, [])
          .map(addTransactionTypeData(unbondingInfo))
      }
      return []
    },
    transactionsLoading() {
      return (
        this.blockMetaInfo &&
        this.blockMetaInfo.header.num_txs > 0 &&
        this.transactions.length === 0
      )
    },
    blockTitle() {
      if (!this.blockMetaInfo) return `--`
      return `#` + prettyInt(this.blockMetaInfo.header.height)
    },
    blockTime() {
      if (!this.blockMetaInfo) return `--`
      return moment(this.blockMetaInfo.header.time).format(
        `MMMM Do YYYY, HH:mm`
      )
    }
  },
  watch: {
    "$route.params.height": async function() {
      this.getBlock()
    }
  },
  async created() {
    this.getBlock()
  },
  methods: {
    async getBlock({ $store, $route, $router, lastHeader } = this) {
      try {
        // query first for the block so we don't fail if the user started from this route and hasn't received any lastHeader yet
        this.blockMetaInfo = await $store.dispatch(
          `queryBlockInfo`,
          $route.params.height
        )

        if (!this.blockMetaInfo && $route.params.height > lastHeader.height) {
          $router.push(`/404`)
          return
        }

        this.transactionsRaw = await $store.dispatch(
          `getBlockTxs`,
          $route.params.height
        )
      } catch (error) {
        this.error = error
      }
    }
  },
  apollo: {
    validators: {
      query() {
        /* istanbul ignore next */
        return AllValidators(this.network)
      },
      update(data) {
        /* istanbul ignore next */
        return AllValidatorsResult(this.network)(data)
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
