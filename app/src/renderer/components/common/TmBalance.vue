<template lang="pug">
  .header-balance
    .top
      img.icon(src="~assets/images/cosmos-logo.png")
      .total-atoms
        .h3 Total {{bondingDenom}}
        .h2 {{totalAtoms || "---"}}
      .unstaked-atoms(v-if="unstakedAtoms")
        .h3 Unstaked {{bondingDenom}}
        .h2 {{unstakedAtoms}}
      .total-earnings(v-if="totalEarnings")
        .h3 Total Earnings
        .h2 {{totalEarnings}}
      .total-rewards(v-if="totalRewards")
        .h3 Total Rewards
        .group
          .h2 {{totalRewards}}
          router-link(to="claim") Claim
    .bottom
      .address(@click="copy") {{address}}
      .success(:class="{showSuccess:showSuccess}")
        i.material-icons check
        span Copied
</template>
<script>
import { clipboard } from "electron"
import { mapGetters } from "vuex"
export default {
  name: "tm-balance",
  data() {
    return {
      showSuccess: false
    }
  },
  props: ["unstakedAtoms", "totalEarnings", "totalRewards"],
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
  flex-grow: 1
  flex-direction: column
  align-items baseline
  padding-top 1rem
  .top
    display flex
    flex-direction: row
    > *
      padding-right 1em
      padding-left 1em
      display flex
      flex-direction column
      border-right: var(--bc) 1px solid
    > div:last-of-type {
      border-right none
    }
    .h3
      font-size:14px;
      color var(--txt)
    .h2
      font-size: h1
      color var(--bright)
    .icon
      width 29px * 2
      height 29px * 2
      padding 0
      border-right: none;
    .total-rewards .group
      display flex
      align-items baseline
      flex-direction: row
      a
        padding-left 10px
  .bottom
    display flex
    align-items: flex-start;
    padding-top:20px
    padding-bottom:20px
    .address
      font-size sm
      padding-left: 29px * 2 + 10px
      color var(--dim)
      cursor pointer
      &:hover
        color var(--link)
    .success
      font-size sm
      display flex
      align-items: flex-end;
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

</style>
