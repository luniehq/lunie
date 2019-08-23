<template>
  <TmPage data-title="Block" class="small" hide-header>
    <TmDataError v-if="!connected || !block" />
    <template v-else>
      <div class="block">
        <h2 class="page-profile__title">Block {{ blockTitle || `--` }}</h2>
      </div>

      <ul class="row">
        <li>
          <h4>Chain ID</h4>
          <span class="page-data">{{ block.block_meta.header.chain_id }}</span>
        </li>
        <li>
          <h4>Time</h4>
          <span class="page-data">{{ blockTime }}</span>
        </li>
      </ul>

      <div class="row">
        <div class="column">
          <h3 v-if="block.transactions" class="page-profile__section-title">
            Transactions ({{ block.block_meta.header.num_txs }})
          </h3>

          <TmDataMsg
            v-if="transactions && transactions.length === 0"
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
            :validators="validators"
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

import TmDataError from "common/TmDataError"
import TmPage from "common/TmPage"
import TransactionList from "transactions/TransactionList"
import TmDataMsg from "common/TmDataMsg"
export default {
  name: `page-block`,
  components: {
    TmDataError,
    TmDataMsg,
    TmPage,
    TransactionList
  },
  computed: {
    ...mapState([`delegation`, `session`]),
    ...mapGetters([`connected`, `block`, `lastHeader`, `validators`]),
    transactions() {
      const unbondingInfo = {
        delegation: this.delegation
      }

      if (this.block.transactions) {
        return this.block.transactions
          .reduce(flattenTransactionMsgs, [])
          .map(addTransactionTypeData(unbondingInfo))
      }
      return []
    },
    blockTitle() {
      const block = this.block
      if (!block.block) return `--`
      return `#` + prettyInt(block.block.header.height)
    },
    blockTime() {
      const block = this.block
      if (!block.block) return `--`
      return moment(block.block.header.time).format(`MMMM Do YYYY, HH:mm`)
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
      // query first for the block so we don't fail if the user started from this route and hasn't received any lastHeader yet
      await $store.dispatch(`queryBlockInfo`, $route.params.height)

      if (!this.block && $route.params.height > lastHeader.height) {
        $router.push(`/404`)
        return
      }
      await $store.dispatch(`getBlockTxs`, $route.params.height)
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
