<template lang="pug">
  .header-balance
    .top
      img.icon(src="~assets/images/cosmos-logo.png")
      .total-atoms.top-section
        .h3 Total {{bondingDenom}}
        .h2 {{num.pretty(totalAtoms) || "---"}}
      .unstaked-atoms.top-section(v-if="unstakedAtoms")
        .h3 Unstaked {{bondingDenom}}
        .h2 {{unstakedAtoms}}
      .total-earnings.top-section(v-if="totalEarnings")
        .h3 Total Earnings
        .h2 {{totalEarnings}}
      .total-rewards.top-section(v-if="totalRewards")
        .h3 Total Rewards
        .group
          .h2 {{totalRewards}}
          router-link(to="claim") Claim
    .bottom
      .address(@click="copy")#address {{address}}
      .success(:class="{showSuccess:showSuccess}")
        i.material-icons check
        span Copied
    .tabs
      .tab(v-for="(tab, i) in tabs",
        :key="'tab-' + i",
        :class="{'tab-selected': i === tabIndex}",
        @click="tabIndex = 1") {{tab}}
</template>
<script>
import num from "scripts/num"
import { clipboard } from "electron"
import { mapGetters } from "vuex"
export default {
  name: "tm-balance",
  data() {
    return {
      num,
      tabIndex: 1,
      showSuccess: false
    }
  },
  props: ["unstakedAtoms", "totalEarnings", "totalRewards", "tabs"],
  computed: {
    ...mapGetters(["bondingDenom", "user", "totalAtoms"]),
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
@import '~variables';

.header-balance
  display flex
  flex-grow 1
  flex-direction column
  align-items baseline
  padding-top 1rem

  .top
    display flex
    flex-direction row

    > *
      border-right var(--bc-dim) 1px solid

    > div:last-of-type
      border-right none

    .h3
      font-size 14px
      color var(--txt)

    .h2
      font-size: h1
      color var(--bright)
      font-weight 400

    .icon
      width 60px
      height 60px
      padding 0
      margin 0 1rem 0 2rem
      border-right none

    .total-rewards .group
      display flex
      align-items baseline
      flex-direction: row
      a
        padding-left 10px

  .bottom
    display flex
    align-items flex-start;
    padding-top 1rem
    padding-bottom 1.5rem

    .address
      font-size sm
      padding-left 142px
      color var(--dim)
      cursor pointer

      &:hover
        color var(--link)

    .success
      font-size sm
      display flex
      align-items flex-end
      opacity 0
      transition opacity 500ms ease
      padding-left 10px

      &.showSuccess
        opacity 1
      i
        font-size m
        padding-right 0
        padding-bottom 2px
        color var(--success)

.top-section
  padding 0 2rem

.tabs
  display flex
  margin 1rem 2rem 0

  .tab
    cursor pointer
    margin 0 1rem
    padding-bottom 1rem

    &:first-of-type
      cursor not-allowed
      margin-left 0

    &.tab-selected
      color var(--bright)
      border-bottom 2px solid var(--tertiary)
</style>
