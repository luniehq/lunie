<template lang="pug">
  .header-balance
    .top
      .icon-container
        img.icon(src="~assets/images/cosmos-logo.png")
      .total-atoms.top-section
        h3 Total {{bondingDenom}}
        h2 {{num.pretty(totalAtoms) || "---"}}
      .unbonded-atoms.top-section(v-if="unbondedAtoms")
        h3 Unbonded {{bondingDenom}}
        h2 {{unbondedAtoms}}
      .total-earnings.top-section(v-if="totalEarnings")
        h3 Total Earnings
        h2 {{totalEarnings}}
      .total-rewards.top-section(v-if="totalRewards")
        h3 Total Rewards
        .group
          h2 {{totalRewards}}
          router-link(to="claim") Claim

    short-address(:address="user.address")

    .tabs
      .tab(
        v-for="tab in tabs",
        :class="{'tab-selected': $route.name === tab}",
      )
        span(v-if="$route.name === tab") {{ tab }}
        router-link(v-else :to="{name: tab}") {{ tab }}
</template>
<script>
import num from "scripts/num"
import ShortAddress from "common/ShortAddress"
import { mapGetters } from "vuex"
export default {
  name: `tm-balance`,
  components: {
    ShortAddress
  },
  data() {
    return {
      num,
      tabIndex: 1
    }
  },
  props: [`totalEarnings`, `totalRewards`, `tabs`],
  computed: {
    ...mapGetters([`bondingDenom`, `user`, `totalAtoms`]),
    address() {
      return this.user.address
    },
    unbondedAtoms() {
      return this.user.atoms
    }
  },
  methods: {
    copy() {
      clipboard.writeText(this.user.address)
      this.showSuccess = true
      setTimeout(() => {
        this.showSuccess = false
      }, 3000)
    }
  }
}
</script>
<style lang="stylus" scoped>
@import '~variables'

.header-balance
  align-items baseline
  display flex
  flex-direction column
  flex-grow 1
  padding-top 1rem
  padding-left 2rem

  .top
    display flex
    flex-direction row

    > .top-section
      border-right var(--bc-dim) 1px solid

    > div:last-of-type
      border-right none

    h3
      color var(--dim)
      font-size 14px
      margin 0
      font-weight 400

    h2
      color var(--bright)
      font-size h1
      font-weight 500

    .icon-container
      display block
      height 100%

    .icon
      border-right none
      height 60px
      margin 0 1rem 0 0
      padding 0
      width 60px

    .total-rewards .group
      align-items baseline
      display flex
      flex-direction row

      a
        padding-left 10px

  .short-address
    padding 0.5rem 0 0.5rem 109px

.top-section
  padding 0 2rem

.tabs
  display flex
  margin-left 2rem
  margin-top 2rem

  .tab
    cursor pointer
    margin-right 2rem
    font-size 1rem

    a
      color var(--dim)
      display block
      padding-bottom 1rem

    a:hover
      color var(--link)

    &.tab-selected
      border-bottom 2px solid var(--tertiary)
      color var(--bright)
</style>
