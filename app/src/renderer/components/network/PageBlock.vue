<template>
  <tm-page data-title="Block">
    <template slot="menu-body">
      <tm-balance />
      <tool-bar />
    </template>

    <tm-data-error v-if="!connected || !block" />

    <template v-else>
      <div class="page-profile__header page-profile__section block">
        <div class="row">
          <div class="page-profile__header__info">
            <div class="page-profile__status-and-title">
              <h2 class="page-profile__title">
                Block {{ `#` + num.prettyInt(block.block.header.height) }}
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
            <dd>
              {{
                moment(block.block.header.time).format("MMM Do YYYY, HH:mm:ss")
              }}
            </dd>
          </dl>
          <dl class="info_dl colored_dl">
            <dt>Proposer</dt>
            <dd>{{ block.block.header.proposer_address }}</dd>
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

      <div class="page-profile__section block">
        <div class="row">
          <div class="column">
            <dl class="info_dl colored_dl">
              <dt>Pre Commits</dt>
              <dd v-if="!block.block.last_commit.precommits">No precommits</dd>
              <table v-else class="pre-commits data-table">
                <thead>
                  <panel-sort :properties="properties" />
                </thead>
                <tbody>
                  <tr
                    v-for="(precommit, index) in block.block.last_commit
                      .precommits"
                    :key="index"
                    class="block data-table__row"
                  >
                    <td>{{ precommit.validator_address }}</td>
                    <td>
                      {{
                        moment(precommit.timestamp).format(
                          "MMM Do YYYY, HH:mm:ss"
                        )
                      }}
                    </td>
                    <td>{{ precommit.round }}</td>
                  </tr>
                </tbody>
              </table>
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
import PanelSort from "staking/PanelSort"
import ToolBar from "common/ToolBar"
import TmBalance from "common/TmBalance"
import TmDataError from "common/TmDataError"
import TmPage from "common/TmPage"
export default {
  name: `page-block`,
  components: {
    PanelSort,
    TmBalance,
    ToolBar,
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
<style></style>
