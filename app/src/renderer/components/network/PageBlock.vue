<template>
  <tm-page data-title="Block">
    <template slot="menu-body">
      <tm-balance />
      <tool-bar />
    </template>

    <tm-data-error v-if="!connected || !block || !header" />

    <template v-else>
      <router-link :to="{ name: 'block', params: { height: backNumber } }"
        >Back</router-link
      >
      <router-link :to="{ name: 'block', params: { height: forwardNumber } }"
        >Forward</router-link
      >
      <div class="page-profile__header page-profile__section block">
        <div class="row">
          <div class="page-profile__header__info">
            <div class="page-profile__status-and-title">
              <h2 class="page-profile__title">{{ header.height }}</h2>
              <h2 class="page-profile__subtitle">
                <!-- {{ block.block_meta.block_id.hash }} -->
              </h2>
            </div>
          </div>
        </div>
        <div class="row">
          <dl class="info_dl colored_dl">
            <dt>Time</dt>
            <dd>{{ header.time }}</dd>
          </dl>
          <dl class="info_dl colored_dl">
            <dt>Transactions</dt>
            <dd>{{ header.num_txs }}</dd>
          </dl>
          <dl class="info_dl colored_dl">
            <dt>Proposer</dt>
            <dd>{{ header.proposer_address }}</dd>
          </dl>
        </div>

        <div class="row">
          <h3>Transactions</h3>
          <dl class="info_dl colored_dl">
            <pre>{{ block.block.data.txs || `No Transactions` }}</pre>
          </dl>
        </div>

        <div class="row">
          <h3>Evidence</h3>
          <dl class="info_dl colored_dl">
            <pre>{{ block.block.evidence.evidence || `No Evidence` }}</pre>
          </dl>
        </div>

        <div class="row">
          <h3>Pre Commits</h3>
          <ul v-for="precommit in block.block.last_commit.precommits">
            <li>
              {{ precommit.validator_address }} {{ precommit.timestamp }}
              {{ precommit.round }}
            </li>
          </ul>
        </div>
      </div>
    </template>
  </tm-page>
</template>

<script>
import moment from "moment"
import axios from "axios"
import { mapGetters } from "vuex"
import num from "scripts/num"
import ToolBar from "common/ToolBar"
import TmBalance from "common/TmBalance"
import TmDataError from "common/TmDataError"
import TmPage from "common/TmPage"
export default {
  name: `page-block`,
  components: {
    TmBalance,
    ToolBar,
    TmDataError,
    TmPage
  },
  async mounted() {
    await this.getBlock()
  },
  watch: {
    $route: "getBlock"
  },
  data: () => ({
    num,
    header: null,
    block: null
  }),
  computed: {
    ...mapGetters([`connected`, `blocks`, `config`]),
    backNumber() {
      return Number(this.header.height) - 1
    },
    forwardNumber() {
      return Number(this.header.height) + 1
    }
  },
  methods: {
    async getBlock() {
      const url =
        `http://localhost:8080/` + `blocks/` + this.$route.params.height
      const block = await axios.get(url)
      this.header = block.data.block.header
      this.block = block.data
    }
  }
}
</script>
<style></style>
