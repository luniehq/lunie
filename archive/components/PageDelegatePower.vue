<template lang="pug">
tm-page(icon="storage" :title="`${delegateId} Vote Power`")
  div(slot="menu"): tool-bar
    router-link(v-tooltip.bottom="'Back'"
      :to="{ name: 'delegate', params: { delegate: $route.params.delegate }}")
      i.material-icons arrow_back

  tm-part(:title='`Vote Power (Millions of ${bondingDenom}) / Time`')
    chart-vote-power(:votes="chartData")

  tm-part(title='Statistics')
    list-item(dt='Total Vote Power' :dd='`4.2M ${bondingDenom.toUpperCase()}`')
    list-item#li-solo-power(dt="Solo Vote Power" :dd="`1M ${bondingDenom.toUpperCase()} (19%)`")
    list-item#li-delegated-power(dt="Delg. Vote Power" :dd="`3.2M ${bondingDenom.toUpperCase()} (81%)`")
    list-item(dt='Power Rank' dd='#17')
</template>

<script>
import ChartVotePower from "staking/ChartVotePower"
import ListItem from "common/NiListItem"
import ToolBar from "common/NiToolBar"
import { TmPage, TmPart } from "@tendermint/ui"
import { mapGetters } from "vuex"
export default {
  name: "page-delegate-power",
  components: {
    ChartVotePower,
    ListItem,
    TmPage,
    TmPart,
    ToolBar
  },
  computed: {
    ...mapGetters(["bondingDenom"]),
    delegateId() {
      return this.slugToIp(this.$route.params.delegate)
    }
  },
  data: () => ({
    chartData: {
      yes: 55,
      no: 24,
      reject: 10,
      abstain: 11
    }
  }),
  methods: {
    slugToIp(slug) {
      return slug.split("-").join(".")
    }
  }
}
</script>

<style lang="stylus">
@require '~variables'

#li-solo-power .ni-li-dd
  color mc

#li-delegated-power .ni-li-dd
  color accent
</style>
