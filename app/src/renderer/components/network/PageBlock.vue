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
                {{ block.block_meta.block_id ? block.block_meta.block_id.hash : '' }}
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
              <dd>{{ block.block && block.block.data.txs || `No Transactions` }}</dd>
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
    ...mapGetters([`connected`, `block`, `lastHeader`]),
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
      if (!block.block) return `n/a`
      return `#` + num.prettyInt(block.block.header.height)
    },
    blockTime({ moment, block } = this) {
      if (!block.block) return `n/a`
      return moment(block.block.header.time).format(`MMM Do YYYY, HH:mm:ss`)
    }
  },
  watch: {
    $route: function() {
      this.getBlock()
    }
  },
  mounted() {
    this.getBlock()
  },
  methods: {
    async getBlock({ $store, $route, $router, lastHeader } = this) {
      // query first for the block so we don't fail if the user started from this route and hasn't received any lastHeader yet
      const blockInfo = await $store.dispatch(
        `queryBlockInfo`,
        $route.params.height
      )

      if (
        !blockInfo &&
        Number($route.params.height) > Number(lastHeader.height)
      ) {
        $router.push(`/404`)
        return
      }
    }
  }
}
</script>
