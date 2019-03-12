<template>
  <tm-page data-title="Block">
    <tm-data-error v-if="!connected  || !block" />
    <template v-else>
      <div class="page-profile__header page-profile__section block">
        <div class="row">
          <div class="page-profile__header__info">
            <div class="page-profile__status-and-title">
              <h2 class="page-profile__title">
                Block {{ blockTitle }}
              </h2>
              <h3 class="page-profile__subtitle">
                {{
                  block.block_meta && block.block_meta.block_id
                    ? block.block_meta.block_id.hash
                    : ""
                }}
              </h3>
            </div>
          </div>
        </div>

        <div class="row">
          <dl class="info_dl colored_dl">
            <dt>Time</dt>
            <dd>{{ blockTime }}</dd>
          </dl>
        </div>
      </div>

      <div class="page-profile__section block">
        <div class="row">
          <div
            class="column"
          >
            <h3>Transactions</h3>
            <data-empty-block
              v-if="block.transactions && block.transactions.length === 0"
              slot="no-data"
            />
            <li-any-transaction
              v-for="tx in block.transactions"
              :key="tx.txhash"
              :validators="delegates.delegates"
              validators-url="/staking/validators"
              proposals-url="/governance"
              :transaction="tx"
              :address="session.address || ``"
              :bonding-denom="bondDenom"
              :height="block.block.header.height"
              :time="block.block.header.time"
              :unbonding-time="
                getUnbondingTime(tx, delegation.unbondingDelegations)
              "
            />
            <br>
          </div>
        </div>
      </div>
    </template>
  </tm-page>
</template>

<script>
import moment from "moment"
import { mapGetters } from "vuex"
import num from "scripts/num"
import { getUnbondingTime } from "scripts/time"
import TmDataError from "common/TmDataError"
import TmPage from "common/TmPage"
import LiAnyTransaction from "transactions/LiAnyTransaction"
import DataEmptyBlock from "common/DataEmptyBlock"
export default {
	name: `page-block`,
	components: {
		TmDataError,
		DataEmptyBlock,
		TmPage,
		LiAnyTransaction
	},
	data: () => ({
		num,
		moment,
		getUnbondingTime
	}),
	computed: {
		...mapGetters([
			`connected`,
			`block`,
			`bondDenom`,
			`lastHeader`,
			`delegates`,
			`delegation`,
			`session`
		]),
		properties() {
			return [
				{
					title: `Proposer`
				},
				{
					title: `Time`
				},
				{
					title: `Round`
				}
			]
		},
		blockTitle({ num, block } = this) {
			if (!block.block) return `--`
			return `#` + num.prettyInt(block.block.header.height)
		},
		blockTime({ moment, block } = this) {
			if (!block.block) return `--`
			return moment(block.block.header.time).format(`MMM Do YYYY, HH:mm:ss`)
		}
	},
	watch: {
		"$route.params.height": async function() {
			await this.getBlock()
		}
	},
	async mounted() {
		await this.getBlock()
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
