<template lang="pug">
  .header-balance
    .top
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
    .bottom
      .address(@click="copy")#address {{address}}
      .success(:class="{showSuccess:showSuccess}")
        i.material-icons check
        span Copied

    <tabs />
    //- .tabs
    //-   .tab(
    //-     v-for="tab in tabs",
    //-     :class="{'tab-selected': $route.name === tab}",
    //-   )
    //-     span(v-if="$route.name === tab") {{ tab }}
    //-     router-link(v-else :to="{name: tab}") {{ tab }}
</template>
<script>
import num from "scripts/num"
import { clipboard } from "electron"
import { mapGetters } from "vuex"
export default {
  name: `tm-balance`,
  data() {
    return {
      num,
      tabIndex: 1,
      showSuccess: false
    }
  },
  props: [`unbondedAtoms`, `totalEarnings`, `totalRewards`, `tabs`],
  computed: {
    ...mapGetters([`bondingDenom`, `user`, `totalAtoms`]),
    address() {
      return this.user.address
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

  .top
    display flex
    flex-direction row

    > *
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

    .icon
      border-right none
      height 60px
      margin 0 1rem 0 2rem
      padding 0
      width 60px

    .total-rewards .group
      align-items baseline
      display flex
      flex-direction row

      a
        padding-left 10px

  .bottom
    align-items flex-start
    display flex
    padding 0.5rem 0

    .address
      color var(--dim)
      cursor pointer
      font-size 14px
      padding-left 142px

      &:hover
        color var(--link)

    .success
      align-items flex-end
      display flex
      font-size sm
      opacity 0
      padding-left 10px
      transition opacity 500ms ease

      &.showSuccess
        opacity 1

      i
        color var(--success)
        font-size m
        padding-bottom 2px
        padding-right 0

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
