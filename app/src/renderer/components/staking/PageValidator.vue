<template lang="pug">
tm-page
  template(slot="menu-body", v-if="config.devMode"): tm-balance(:unstakedAtoms="user.atoms")
  div(slot="menu"): tm-tool-bar
    router-link(to="/staking" exact): i.material-icons arrow_back
    anchor-copy(v-if="validator" :value="validator.owner" icon="content_copy")

  tm-data-error(v-if="!validator")

  template(v-else)
    .validator-profile__header.validator-profile__section
      .column
        img.avatar(v-if="validator.keybase" :src="validator.keybase.avatarUrl")
        img.avatar(v-else src="~assets/images/validator-icon.svg")
      .column.validator-profile__header__info
        .row.validator-profile__header__name
          .column
            div.validator-profile__status-and-title
              span.validator-profile__status(v-bind:class="statusColor" v-tooltip.top="status")
              .validator-profile__header__name__title {{ validator.description.moniker }}
            //- TODO replace with address component when ready
            anchor-copy.validator-profile__header__name__address(:value="validator.owner" :label="shortAddress(validator.owner)")
          .column.validator-profile__header__actions
            tm-btn(id="stake-btn" value="Stake" color="primary" @click.native="onStake()")
            tm-btn(v-if="config.devMode" value="Unstake" color="secondary")
        .row.validator-profile__header__data
          dl.colored_dl
            dt My Stake
            dd {{myBond < 0.01 ? '< ' + 0.01 : pretty(myBond)}}
          dl.colored_dl(v-if="config.devMode")
            dt My Rewards
            dd n/a
          .validator-profile__header__data__break
          dl.colored_dl
            dt Voting Power
            dd(id="validator-profile__power" v-bind:class="[powerRatioLevel]") {{pretty(powerRatio * 100)}} %
          dl.colored_dl(v-if="config.devMode")
            dt Uptime
            dd n/a
          dl.colored_dl
            dt Commission
            dd(id="validator-profile__commission" v-bind:class="[commissionLevel]") {{pretty(validator.commission)}} %
          dl.colored_dl(v-if="config.devMode")
            dt Slashes
            dd n/a

    .validator-profile__details.validator-profile__section
      .row
        .column
          dl.info_dl
            dt Owner
            dd {{validator.owner}}
          dl.info_dl
            dt Keybase ID
            dd {{translateEmptyDescription(validator.description.identity)}}
          dl.info_dl(v-if="config.devMode")
            dt First Seen
            dd n/a
          dl.info_dl
            dt Website
            dd {{translateEmptyDescription(validator.description.website)}}
          dl.info_dl
            dt Details
            dd.info_dl__text-box {{translateEmptyDescription(validator.description.details)}}
        .column
          dl.info_dl
            dt Commission Rate
            dd {{validator.commission}} %
          dl.info_dl
            dt Max Commission Rate
            dd {{validator.commission_max}} %
          dl.info_dl
            dt Commission Change Today
            dd {{validator.commission_change_today}} %
          dl.info_dl
            dt Max Daily Commission Change
            dd {{validator.commission_change_rate}} %
          dl.info_dl
            dt Self Stake
            dd(id="validator-profile__self-bond") {{selfBond}} %
          dl.info_dl(v-if="config.devMode")
            dt Minimum Self Stake
            dd 0 %

    modal-stake(
      v-if="showModalStake"
      v-on:submitDelegation="submitDelegation"
      :showModalStake.sync="showModalStake"
      :fromOptions="[{ key: `My Wallet - ${this.wallet.address}`, value: 0 }]"
      :maximum="availableAtoms"
      :to="validator.owner"
    )

    tm-modal(:close="closeCannotStake" icon="warning" v-if="showCannotStake")
      div(slot='title') Cannot Stake
      p You have no {{ bondingDenom }}s to stake.
      div(slot='footer')
        tmBtn(id="no-atoms-modal__btn" @click.native="closeCannotStake()" value="OK")
</template>

<script>
import { mapGetters } from "vuex"
import { TmBtn, TmListItem, TmPage, TmPart, TmToolBar } from "@tendermint/ui"
import { TmDataError } from "common/TmDataError"
import { calculateTokens, shortAddress, ratToBigNumber } from "scripts/common"
import ModalStake from "staking/ModalStake"
import numeral from "numeral"
import AnchorCopy from "common/AnchorCopy"
import TmBalance from "common/TmBalance"
export default {
  name: `page-validator`,
  components: {
    AnchorCopy,
    ModalStake,
    TmBtn,
    TmListItem,
    TmBalance,
    TmPage,
    TmPart,
    TmToolBar,
    TmDataError,
    TmBalance
  },
  data: () => ({
    showCannotStake: false,
    showModalStake: false,
    shortAddress,
    tabIndex: 1
  }),
  computed: {
    ...mapGetters([
      `bondingDenom`,
      `delegates`,
      `delegation`,
      `config`,
      `keybase`,
      `oldBondedAtoms`,
      `totalAtoms`,
      `wallet`,
      `user`
    ]),
    validator() {
      let validator = this.delegates.delegates.find(
        v => this.$route.params.validator === v.owner
      )
      if (validator)
        validator.keybase = this.keybase[validator.description.identity]
      return validator
    },
    selfBond() {
      return this.validator.selfBond
        ? (this.validator.selfBond * 100).toFixed(2)
        : 0
    },
    myBond() {
      return this.delegation.committedDelegates[this.validator.owner] || 0
    },
    powerRatio() {
      return ratToBigNumber(this.validator.tokens)
        .div(this.delegates.globalPower)
        .toNumber()
    },
    powerRatioLevel() {
      if (this.powerRatio < 0.01) return `green`
      if (this.powerRatio < 0.03) return `yellow`
      return `red`
    },
    commissionLevel() {
      if (this.validator.commission < 0.01) return `green`
      if (this.validator.commission < 0.03) return `yellow`
      return `red`
    },
    status() {
      // status: jailed
      if (this.validator.revoked)
        return `This validator has been jailed and is not currently validating`

      // status: candidate
      if (parseFloat(this.validator.voting_power) === 0)
        return `This validator has declared candidacy but does not have enough voting power yet`

      // status: validator
      return `This validator is actively validating`
    },
    statusColor() {
      // status: jailed
      if (this.validator.revoked) return `red`

      // status: candidate
      if (parseFloat(this.validator.voting_power) === 0) return `yellow`

      // status: validator
      return `green`
    },
    availableAtoms() {
      return this.totalAtoms - this.oldBondedAtoms
    }
  },
  methods: {
    closeCannotStake() {
      this.showCannotStake = false
    },
    onStake() {
      if (this.availableAtoms > 0) {
        this.showModalStake = true
      } else {
        this.showCannotStake = true
      }
    },
    async submitDelegation({ amount }) {
      const candidateId = this.validator.owner

      const currentlyDelegated = calculateTokens(
        this.validator,
        this.delegation.committedDelegates[candidateId] || 0
      )

      const delegation = [
        {
          atoms: currentlyDelegated.plus(amount),
          delegate: this.validator
        }
      ]

      try {
        await this.$store.dispatch(`submitDelegation`, delegation)

        this.$store.commit(`notify`, {
          title: `Successful Staking!`,
          body: `You have successfully staked your ${this.bondingDenom}s.`
        })
      } catch (exception) {
        const { message } = exception
        let errData = message.split(`\n`)[5]

        if (errData) {
          let parsedErr = errData.split(`"`)[1]

          this.$store.commit(`notifyError`, {
            title: `Error While Staking ${this.bondingDenom}s`,
            body: parsedErr[0].toUpperCase() + parsedErr.slice(1)
          })
        } else {
          this.$store.commit(`notifyError`, {
            title: `Error While Staking ${this.bondingDenom}s`,
            body: message
          })
        }
      }
    },
    pretty(num) {
      return numeral(num).format(`0,0.00`)
    },
    // empty descriptions have a strange '[do-not-modify]' value which we don't want to show
    translateEmptyDescription(value) {
      if (!value || value === `[do-not-modify]`) return `n/a`
      return value
    }
  },
  watch: {
    validator(validator) {
      this.$store.dispatch(`getSelfBond`, validator)
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

.validator-profile__section
  background-color var(--app-fg)
  display flex
  margin-bottom 1rem
  padding 2rem
  width 100%

.column
  display flex
  flex-flow column
  position relative

.row
  display flex
  flex-direction row
  width 100%

.validator-profile
  &__header
    .avatar
      background var(--app-nav)
      border-radius 50%
      height 155px
      margin-right 2rem
      padding 1rem
      width 155px

    &__info
      flex 1

    &__name
      margin-bottom 2rem

      &__title
        color white
        display inline-block
        font-size h1
        line-height h1
        padding 0 0.5rem 0.5rem 0

      &__address
        font-size small

    &__actions
      flex-flow column
      margin-left auto

      button:not(:last-child)
        margin-bottom 0.5rem

  &__header__data__break
    border-right 1px solid var(--bc-dim)
    margin-right 1rem

  &__status
    border-radius 50%
    display inline-block
    height 0.5rem
    left -1rem
    position absolute
    width 0.5rem

    &.red
      background var(--danger)

    &.yellow
      background var(--warning)

    &.green
      background var(--success)

  &__status-and-title
    align-items center
    display flex

  &__details
    > .row
      > .column
        flex 1

.info_dl
  display flex
  flex-flow column
  margin-bottom 1.5rem
  margin-right 1rem

  dt
    color var(--dim)
    font-size small
    margin-bottom 4px

  dd
    border solid 1px #31354e
    border-radius 2px
    font-size 1rem
    line-height 1rem
    padding 0.5rem

    &.info_dl__text-box
      min-height 6.91rem

.colored_dl
  align-items center
  display flex
  flex-direction column
  width 5.1rem

  &:not(:last-child)
    margin-right 1rem

  dt
    color var(--dim)
    font-size small
    margin-bottom 0.5rem
    text-align center

  dd
    background-color var(--white-fade-1)
    border 1px solid var(--white-fade-2)
    border-radius 4px
    color var(--dim)
    display block
    font-size h6
    line-height h6
    padding 4px 4px
    text-align right
    width 100%

    &.red
      background-color rgba(209, 2, 0, 0.15)
      border solid 0.5px rgba(209, 2, 0, 0.25)
      color #ff0200

    &.yellow
      background-color rgba(255, 149, 2, 0.15)
      border solid 0.5px rgba(255, 149, 2, 0.25)
      color #ff9502

    &.green
      background-color rgba(46, 164, 45, 0.15)
      border solid 0.5px rgba(46, 164, 45, 0.25)
      color #2ea42d
</style>
