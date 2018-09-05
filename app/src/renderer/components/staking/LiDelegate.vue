<template lang='pug'>
.li-delegate(:class='styles'): .li-delegate__values
  .li-delegate__value.name
    router-link(:to="{ name: 'validator', params: { validator: delegate.id }}")
      img.avatar(v-if="delegate.keybase" :src="delegate.keybase.avatarUrl" width="48" height="48")
      img.avatar(v-else src="~assets/images/validator-icon.svg" width="48" height="48")
      .vert
        .top {{ delegate.description.moniker }}
        .bottom {{ shortAddress(delegate.id)}}
  .li-delegate__value.your-votes
    span {{ yourVotes }}
  .li-delegate__value.your-rewards
    span {{ yourRewards }}
  .li-delegate__break: span
  .li-delegate__value.percent_of_vote
    span {{ delegate.percent_of_vote }}
  .li-delegate__value.uptime
    span.NOT_green {{ uptime }}
  .li-delegate__value.commission
    span.NOT_orange {{ commission }}
  .li-delegate__value.slashes
    span.NOT_red {{ slashes }}
  template(v-if="userCanDelegate")
    .li-delegate__value.checkbox(v-if="committedDelegations[delegate.id]")
      i.material-icons lock
    .li-delegate__value.checkbox#remove-from-cart(v-else-if="inCart" @click='rm(delegate)')
      i.material-icons check_box
    .li-delegate__value.checkbox#add-to-cart(v-else @click='add(delegate)')
      i.material-icons check_box_outline_blank
  template(v-else)
    .li-delegate__value
</template>

<script>
import { mapGetters } from "vuex"
import num from "scripts/num"
import { maxBy } from "lodash"
import { shortAddress } from "scripts/common"
export default {
  name: "li-delegate",
  props: ["delegate"],
  computed: {
    ...mapGetters([
      "shoppingCart",
      "delegates",
      "config",
      "committedDelegations",
      "user"
    ]),
    slashes() {
      return "n/a" //TODO: add slashes
    },
    commission() {
      return "n/a" //TODO: add commission
    },
    uptime() {
      return "n/a" //TODO: add real uptime
    },
    yourRewards() {
      return "n/a"
    },
    yourVotes() {
      let yourVotes = this.num.prettyInt(
        this.committedDelegations[this.delegate.id]
      )

      return yourVotes
    },
    styles() {
      let value = ""
      if (this.inCart || this.yourVotes > 0) value += "li-delegate-active "
      if (this.delegate.isValidator) value += "li-delegate-validator "
      return value
    },
    vpMax() {
      if (this.delegates.delegates.length > 0) {
        let richestDelegate = maxBy(this.delegates.delegates, "voting_power")
        return richestDelegate.voting_power
      } else {
        return 0
      }
    },
    vpStyles() {
      let percentage = Math.round(this.delegate.voting_power / this.vpMax * 100)
      return { width: percentage + "%" }
    },
    inCart() {
      return this.shoppingCart.find(c => c.id === this.delegate.id)
    },
    userCanDelegate() {
      return this.shoppingCart.length > 0 || this.user.atoms > 0
    },
    delegateType() {
      return this.delegate.revoked
        ? "Revoked"
        : this.delegate.isValidator
          ? "Validator"
          : "Candidate"
    }
  },
  data: () => ({ num, shortAddress }),
  methods: {
    add(delegate) {
      this.$store.commit("addToCart", delegate)
    },
    rm(delegate) {
      this.$store.commit("removeFromCart", delegate.id)
    }
  },
  watch: {
    yourVotes(newVal) {
      if (newVal > 0) {
        this.$store.commit("addToCart", this.delegate)
      }
    }
  }
}
</script>

<style lang="stylus">
@require '~variables'

.li-delegate
  border 1px solid var(--bc)
  margin-bottom 1em
  &:nth-of-type(2n-1)
    background var(--app-fg)

  &.li-delegate-active
    background var(--app-bg-alpha)

    .li-delegate__value i
      color var(--link)

  &:hover
    background var(--hover-bg)

.li-delegate__values
  display flex
  height 5rem
  padding 12px 1em
  background-color var(--app-nav)

  & > .li-delegate__value:not(:first-of-type) span
    color var(--dim)
    background-color var(--white-fade-1)
    border 1px solid var(--white-fade-2)
    border-radius 4px
    display block
    width 100%
    margin 0 0.5em
    font-size h5
    line-height h5
    text-align right
    padding 4px 4px
    &.green
      color var(--green)
      background-color var(--green-fade-1)
      border 1px solid var(--green-fade-2)
    &.orange
      color var(--orange)
      background-color var(--orange-fade-1)
      border 1px solid var(--orange-fade-2)
    &.red
      color var(--red)
      background-color var(--red-fade-1)
      border 1px solid var(--red-fade-2)
.li-delegate__break
  flex 0
  display flex
  align-items center
  min-width 1
  span
    margin 0 0.5em
    width 1px
    background-color var(--white-fade-1)
    height 2rem

.li-delegate__value
  flex 1
  display flex
  align-items center
  min-width 0
  &.name
    flex 3
    a
      display flex
      img
        border-radius 100%
        margin-right 1em
      .vert
        display flex
        flex-direction column
        color var(--bright)
        .top
          font-size h5
          padding-bottom 6px
        .bottom
          font-size h6
          color var(--dim)


    .li-delegate__icon
      width 1.5rem
      display flex
      align-items center
      justify-content center

      img, span
        height 1rem
        width 1rem

  &.bar
    position relative

    span
      display block
      position absolute
      top 0
      left 0
      z-index z(listItem)
      line-height 3rem
      color var(--txt)

    .bar
      height 1.5rem
      position relative
      left -0.25rem
      background var(--accent-alpha)

  &.checkbox
    justify-content center
    cursor pointer

  span
    white-space nowrap
    overflow hidden
    text-overflow ellipsis
    padding-right 1rem

.sort-by.name
  padding-left 1rem

.sort-by
  .label
    font-size sm
</style>
