<template>
  <tm-page data-title="Block">
    <tm-data-error v-if="!connected || !block" />
    <template v-else>
      <div class="page-profile__header page-profile__section block">
        <div class="row">
          <div class="page-profile__header__info">
            <div class="page-profile__status-and-title">
              <h2 class="page-profile__title">
                Block {{ blockTitle }}
              </h2>
              <h3 class="page-profile__subtitle">
                {{ block.block_meta.block_id.hash }}
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
          <div class="column">
            <dl class="info_dl colored_dl">
              <dt>Transactions</dt>
              <dd>{{ block.block.data.txs || `No Transactions` }}</dd>
            </dl>
          </div>
        </div>
      </div>

      <div class="page-profile__section block">
        <div class="row">
          <div class="column">
            <dl class="info_dl colored_dl">
              <dt>Evidence</dt>
              <dd>{{ block.block.evidence.evidence || `No Evidence` }}</dd>
            </dl>
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
import TmDataError from "common/TmDataError"
import TmPage from "common/TmPage"
export default {
	name: `page-block`,
	components: {
		TmDataError,
		TmPage
	},
	data: () => ({
		num,
		moment
	}),
	computed: {
		...mapGetters([`connected`, `block`]),
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
			return `#` + num.prettyInt(block.block.header.height)
		},
		blockTime({ moment, block } = this) {
			return moment(block.block.header.time).format(`MMM Do YYYY, HH:mm:ss`)
		}
	},
	watch: {
		$route: `getBlock`
	},
	mounted() {
		this.getBlock()
	},
	methods: {
		async getBlock() {
			await this.$store.dispatch(`queryBlockInfo`, this.$route.params.height)
		}
	}
}
</script>
