<template lang="pug">
page(icon="storage" :title="`${delegateId} Vote Power`")
  div(slot="menu"): tool-bar
    router-link(
      :to="{ name: 'delegate', params: { delegate: $route.params.delegate }}")
      i.material-icons arrow_back
      .label Back

  part(title='Vote Power (Millions of ATOMs) / Time')
    chart-vote-power(:votes="chartData")

  part(title='Statistics')
    list-item(dt='Total Vote Power' dd='4.2M ATOM')
    list-item#li-solo-power(dt="Solo Vote Power" dd="1M ATOM (19%)")
    list-item#li-delegated-power(dt="Delg. Vote Power" dd="3.2M ATOM (81%)")
    list-item(dt='Power Rank' dd='#17')
</template>

<script>
import ChartVotePower from "monitor/ChartVotePower"
import ListItem from "common/NiListItem"
import ToolBar from "common/NiToolBar"
import Page from "common/NiPage"
import Part from "common/NiPart"
export default {
  name: "page-delegate-power",
  components: {
    ChartVotePower,
    ListItem,
    Page,
    Part,
    ToolBar
  },
  computed: {
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
