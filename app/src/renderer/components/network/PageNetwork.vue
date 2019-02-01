<template>
  <tm-page data-title="Network">
    <template slot="menu-body">
      <tm-balance />
      <tool-bar />
    </template>

    <tm-data-error v-if="!network" />

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
              <h2 class="page-profile__title">{{ chainId }}</h2>
              <h3 v-if="config.devMode">
                Proposer: {{ block_meta.header.proposer_address }}
              </h3>
            </div>
          </div>
        </div>
        <div class="row">
          <dl class="info_dl colored_dl">
            <dt>Height</dt>
            <dd>{{ block_meta.header.height }}</dd>
          </dl>
          <dl class="info_dl colored_dl">
            <dt>Last Block</dt>
            <dd>8 Seconds Ago</dd>
          </dl>
          <dl class="info_dl colored_dl">
            <dt>Number of Validators</dt>
            <dd>205</dd>
          </dl>
          <dl class="info_dl colored_dl">
            <dt>Transactions</dt>
            <dd>{{ block_meta.header.total_txs }}</dd>
          </dl>
        </div>
      </div>

      <!--
        <div class="page-profile__section">
          <div v-if="proposal.proposal_status === 'VotingPeriod'" class="row">
            <dl class="info_dl colored_dl">
              <dt>Yes</dt>
              <dd>{{ tally.yes }} / {{ yesPercentage }}</dd>
            </dl>
            <dl class="info_dl colored_dl">
              <dt>No</dt>
              <dd>{{ tally.no }} / {{ noPercentage }}</dd>
            </dl>
            <dl class="info_dl colored_dl">
              <dt>No with Veto</dt>
              <dd>{{ tally.no_with_veto }} / {{ noWithVetoPercentage }}</dd>
            </dl>
            <dl class="info_dl colored_dl">
              <dt>Abstain</dt>
              <dd>{{ tally.abstain }} / {{ abstainPercentage }}</dd>
            </dl>
          </div>
          <div class="row">
            <div class="column">
              <dl class="info_dl colored_dl">
                <dt>Description</dt>
                <dd>
                  <text-block :content="proposal.description"/>
                </dd>
              </dl>
            </div>
          </div>
        </div>
      -->
    </template>
  </tm-page>
</template>

<script>
import moment from "moment"
import { mapGetters } from "vuex"
import num from "scripts/num"
import TmBtn from "common/TmBtn"
import ToolBar from "common/ToolBar"
import TmBalance from "common/TmBalance"
import TmDataError from "common/TmDataError"
import TmPage from "common/TmPage"
export default {
  name: `page-proposal`,
  components: {
    TmBalance,
    TmBtn,
    ToolBar,
    TmDataError,
    TmPage
  },
  data: () => ({
    network: true,
    status: {
      color: `green`,
      message: `Testnet is live`
    },
    block_meta: {
      block_id: {
        hash: "39023EFD01688ADA6D84AF103D002A29B4F7AE6F938F6BF2BD5CB23B8FDA273E"
      },
      header: {
        chain_id: "game_of_stakes_3",
        height: "341552",
        time: "2019-01-31T21:24:35.544290754Z",
        total_txs: "403775",
        proposer_address: "621042E0B8DF4247D85E336553F2673F44F7027B"
      }
    }
  }),
  computed: {
    ...mapGetters([`connected`, `lastHeader`, `nodeUrl`, `config`]),
    chainId() {
      return this.block_meta.header.chain_id
    }
  },
  methods: {}
}
</script>
<style></style>
