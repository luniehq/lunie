<template>
  <tm-page data-title="Network">
    <template slot="menu-body">
      <tm-balance />
      <tool-bar />
    </template>

    <tm-data-error v-if="!connected" />

    <template v-else>
      <div class="page-profile__header page-profile__section network">
        <div class="row">
          <div class="page-profile__header__info">
            <div class="page-profile__status-and-title">
              <span
                v-tooltip.top="status.message"
                :class="status.color"
                class="page-profile__status"
              />
              <h2 class="page-profile__title">{{ lastHeader.chain_id }}</h2>
              <h3 v-if="config.devMode">
                Proposer: {{ lastHeader.proposer_address }}
              </h3>
            </div>
          </div>
        </div>
        <div class="row">
          <dl class="info_dl colored_dl">
            <dt>Height</dt>
            <dd>{{ lastHeader.height }}</dd>
          </dl>
          <dl class="info_dl colored_dl">
            <dt>Last Block</dt>
            <dd>{{ lastBlock }}</dd>
          </dl>
          <dl class="info_dl colored_dl">
            <dt>Transactions</dt>
            <dd>{{ lastHeader.total_txs }}</dd>
          </dl>
          <dl class="info_dl colored_dl">
            <dt>Number of Validators</dt>
            <dd>{{ delegates.delegates.length }}</dd>
          </dl>
        </div>
        <div class="row">
          <div class="column">
            <dl class="info_dl">
              <dt>Total Liquid {{ bondDenom }}</dt>
              <dd id="loose_tokens">
                {{ pool.pool.loose_tokens ? pool.pool.loose_tokens : `n/a` }}
              </dd>
            </dl>
          </div>
          <div class="column">
            <dl class="info_dl">
              <dt>Total Delegated {{ bondDenom }}</dt>
              <dd id="bonded_tokens">
                {{ pool.pool.bonded_tokens ? pool.pool.bonded_tokens : `n/a` }}
              </dd>
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
import TmBtn from "common/TmBtn"
import ToolBar from "common/ToolBar"
import TmBalance from "common/TmBalance"
import TmDataError from "common/TmDataError"
import TmPage from "common/TmPage"
export default {
  name: `page-network`,
  components: {
    TmBalance,
    TmBtn,
    ToolBar,
    TmDataError,
    TmPage
  },
  computed: {
    ...mapGetters([
      `connected`,
      `lastHeader`,
      `delegates`,
      `config`,
      `pool`,
      `bondDenom`
    ]),
    status() {
      const color = this.connected ? `green` : `red`
      const message = this.connected
        ? `Network is up and running`
        : `Network is down`
      return { color, message }
    },
    lastBlock() {
      moment.relativeTimeThreshold(`ss`, 1)
      return moment(this.lastHeader.time).fromNow()
    }
  }
}
</script>
<style>
.network .page-profile__header__info {
  padding: 2rem;
}
</style>
