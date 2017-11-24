<template lang="pug">
page(icon="storage" :title="`${validatorId} Vote Power`")
  div(slot="menu"): tool-bar
    router-link(:to="{ name: 'validator', params: { validator: $route.params.validator }}")
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
import ChartVotePower from 'monitor/ChartVotePower'
import ListItem from 'common/NiListItem'
import ToolBar from 'common/NiToolBar'
import Page from 'common/NiPage'
import Part from 'common/NiPart'
export default {
  name: 'page-validator-power',
  components: {
    ChartVotePower,
    ListItem,
    Page,
    Part,
    ToolBar
  },
  computed: {
    validatorId () { return this.slugToIp(this.$route.params.validator) }
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
    slugToIp (slug) { return slug.split('-').join('.') }
  }
}
</script>

<style lang="stylus">
@require '~variables'

#li-solo-power .ni-li-dd
  color hsl(mhue, 50%, 50%)

#li-delegated-power .ni-li-dd
  color hsl(330, 50%, 50%)
</style>

