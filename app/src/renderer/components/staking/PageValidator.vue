<template lang="pug">
mixin dl(label, value, color)
  dl.colored_dl
    dt= label
    dd(style={borderColor: color})= value
mixin info(label, value)
  dl.info_dl
    dt= label
    dd= value
tm-page(:title='validatorTitle(this.validator)')
  div(slot="menu"): tm-tool-bar
    router-link(to="/staking" exact): i.material-icons arrow_back
    anchor-copy(v-if="validator" :value="validator.owner" icon="content_copy")
  template(slot="menu-body", v-if="config.devMode"): tm-balance(:unstakedAtoms="user.atoms")

  tm-data-error(v-if="!validator")
  template(v-else)
    tm-part(title='!!! CRITICAL ALERT !!!' v-if="validator.revoked")
      tm-list-item(title="This validator is revoked!" subtitle="Are you the owner? Go fix it!" type="anchor" href="https://cosmos.network/docs/validators/validator-setup.html#common-problems")

    .validator-profile__header.container
      .column
        img.avatar(v-if="validator.keybase" :src="validator.keybase.avatarUrl")
        img.avatar(v-else src="~assets/images/validator-icon.svg")
      .column.validator-profile__header__info
        .row.validator-profile__header__name
          .column
            .validator-profile__header__name__title {{ validator.description.moniker || 'Anonymous' }}
            //- TODO replace with address component when ready
            anchor-copy.validator-profile__header__name__address(:value="validator.owner" :label="shortAddress(validator.owner)")
          .column.validator-profile__header__actions
            tm-btn(value="Stake" color="primary")
            tm-btn(value="Unstake" color="secondary")
        .row.validator-profile__header__data
          +dl('My Stake', 12300)
          +dl('My Rewards', 3456)
          .validator-profile__header__data__break
          +dl('Voting Power', 12300)
          +dl('Uptime', 3456)
          +dl('Commission', 12300)
          +dl('Slashes', 3456)
        //- .LiValidator__break: span
        //-   .LiValidator__value.your-votes
        //-     span {{ yourVotes }}
        //-   .LiValidator__value.your-rewards
        //-     span {{ yourRewards }}
        //-   .LiValidator__value.percent_of_vote
        //-     span {{ validator.percent_of_vote }}
        //-   .LiValidator__value.uptime
        //-     // add .green .yellow or .red class to this span to trigger inidication by color
        //-     span {{ uptime }}
        //-   .LiValidator__value.commission
        //-     // add .green .yellow or .red class to this span to trigger inidication by color
        //-     span {{ commission }}
        //-   .LiValidator__value.slashes
        //-     // add .green .yellow or .red class to this span to trigger inidication by color
        //-     span {{ slashes }}

    .container.validator-profile__details
      .row
        .column
          +info('Owner / Address', 'shortAddress(validator.owner)')
          +info('Keybase ID', 'B536B81DDA4323BB')
          +info('First Seen', 'December 16, 2018')
          +info('Keybase ID', 'B536B81DDA4323BB')
          +info('Details', 'Hello from Staking Facilities!')
        .column
          +info('Commission', '1.3%')
          +info('Max Commission Rate', '1.3%')
          +info('Max Daily Commission Change', '1.3%')
          +info('Commission Change Today', '1.3%')


    tm-part#validator-profile(title='Validator Profile')
      img.avatar(v-if="validator.keybase" :src="validator.keybase.avatarUrl" width="192" height="192")
      img.avatar(v-else src="~assets/images/validator-icon.svg" width="192" height="192")
      .list-items
        tm-list-item(dt="Moniker" :dd="validator.description.moniker")
        tm-list-item(v-if="validator.keybase" dt="Keybase" :dd="validator.keybase.userName" :href="validator.keybase.profileUrl")
        tm-list-item(v-else dt="Keybase" dd="add your avatar" href="https://cosmos.network/docs/validators/validator-setup.html#edit-validator-description" target="_blank")
        tm-list-item(dt="Website" :dd="validator.description.website")
        tm-list-item(dt="Details" :dd="validator.description.details")

    tm-part(title='Validator Keys')
      tm-list-item(dt="Owner" :dd="validator.owner")
      tm-list-item(dt="Pub Key" :dd="validator.pub_key")

    tm-part(title='Validator Stake' v-if="!validator.revoked")
      tm-list-item(dt="Voting Power" :dd="pretty(validator.voting_power) + ' ' + this.config.bondingDenom")
      tm-list-item(dt="Self Bonded" :dd="pretty(selfBond) + ' ' + this.config.bondingDenom")
      tm-list-item(dt="Bond Height" :dd="`Block ${validator.bond_height}`")

    tm-part(title='Commission')
      tm-list-item(dt="Commission" :dd="pretty(validator.commission) + ' %'")
      tm-list-item(dt="Commission Maximum" :dd="pretty(validator.commission_max) + ' %'")
      tm-list-item(dt="Commission Change-Rate" :dd="pretty(validator.commission_change_rate) + ' %'")
      tm-list-item(dt="Commission Change Today" :dd="pretty(validator.commission_change_today) + ' %'")
</template>

<script>
import { mapGetters } from "vuex"
import { TmListItem, TmPage, TmPart, TmToolBar, TmBtn } from "@tendermint/ui"
import { shortAddress } from "scripts/common"
import { TmDataError } from "common/TmDataError"
import TmBalance from "common/TmBalance"
import numeral from "numeral"
import AnchorCopy from "common/AnchorCopy"
export default {
  name: "page-validator",
  components: {
    AnchorCopy,
    TmListItem,
    TmBtn,
    TmPage,
    TmPart,
    TmToolBar,
    TmDataError,
    TmBalance
  },
  data: () => ({
    shortAddress
  }),
  computed: {
    ...mapGetters(["delegates", "config", "keybase", "user"]),
    validator() {
      let validator = this.delegates.delegates.find(
        v => this.$route.params.validator === v.owner
      )
      if (validator)
        validator.keybase = this.keybase[validator.description.identity]
      return validator
    },
    selfBond() {
      parseFloat(this.validator.tokens) -
        parseFloat(this.validator.delegator_shares)
    }
  },
  methods: {
    validatorTitle(validator) {
      if (!validator) return "Validator Not Found"
      let title
      if (validator.description.moniker) {
        title = validator.description.moniker
      } else {
        title = "Anonymous"
      }
      let shortOwner = validator.owner.split(1)[1]
      shortOwner = shortOwner.slice(0, 8)
      title += ` - (${shortOwner})`
      return title
    },
    pretty(num) {
      return numeral(num).format("0,0.00")
    }
  }
}
</script>

<style lang="stylus">
@require '~variables'

@media screen and (min-width: 640px)
  #validator-profile .tm-part-main
    display flex
    flex-flow row-reverse nowrap

    .list-items
      flex 1

.container
  display flex
  width 100%
  background-color var(--app-fg)
  padding 1rem
  margin-bottom 1rem

.column
  display flex
  flex-flow column

.row
  display flex
  flex-direction row

.validator-profile
  &__header
    .avatar
      height 178px
      width 178px
      margin-right 1rem

    &__info
      flex 1

    &__name
      margin-bottom 2rem

      &__title
        font-size h1
        color white

      &__address
        font-size small

    &__actions
      flex-flow column
      margin-left auto

      button:not(:last-child)
        margin-bottom 0.5rem

  &__details
    > .row
      > .column
        flex 1

.info_dl
  display flex
  flex-flow column
  margin-right 1rem
  margin-bottom 1rem

  dt
    color var(--dim)
    margin-bottom 0.5rem
    font-size small

  dd
    border-radius 2px
    border solid 1px #31354e
    font-size 1rem
    line-height 1rem
    padding 0.5rem

.colored_dl
  display flex
  height 5rem
  width 5.1rem
  flex-direction column
  align-items center

  &:not(:last-child)
    margin-right 1rem

  dt
    color var(--dim)
    font-size small
    text-align center
    margin-bottom 0.5rem

  dd
    color var(--dim)
    background-color var(--white-fade-1)
    border 1px solid var(--white-fade-2)
    border-radius 4px
    display block
    width 100%
    // margin 0 0.5em
    font-size h5
    line-height h5
    text-align right
    padding 4px 4px
</style>
