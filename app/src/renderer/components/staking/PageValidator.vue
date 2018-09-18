<template lang="pug">
tm-page
  template(slot="menu-body", v-if="config.devMode"): tm-balance(:unstakedAtoms="user.atoms" :tabs="tabs")
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
              .validator-profile__header__name__title {{ validatorTitle(validator) }}
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
            dt Public Key
            dd {{validator.owner}}
          dl.info_dl
            dt Keybase ID
            dd {{validator.description.identity || 'n/a'}}
          dl.info_dl(v-if="config.devMode")
            dt First Seen
            dd n/a
          dl.info_dl
            dt Details
            dd.info_dl__text-box {{validator.description.details || 'n/a'}}
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
  name: "page-validator",
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
    tabIndex: 1,
    tabs: ["My Stake", "Validators"]
  }),
  computed: {
    ...mapGetters([
      `bondingDenom`,
      "delegates",
      `delegation`,
      "config",
      "keybase",
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
      if (this.powerRatio < 0.01) return "green"
      if (this.powerRatio < 0.03) return "yellow"
      return "red"
    },
    commissionLevel() {
      if (this.validator.commission < 0.01) return "green"
      if (this.validator.commission < 0.03) return "yellow"
      return "red"
    },
    status() {
      // status: jailed
      if (this.validator.revoked)
        return "This validator has been jailed and is not currently validating"

      // status: candidate
      if (parseFloat(this.validator.voting_power) === 0)
        return "This validator has declared candidacy but does not have enough voting power yet"

      // status: validator
      return "This validator is actively validating"
    },
    statusColor() {
      // status: jailed
      if (this.validator.revoked) return "red"

      // status: candidate
      if (parseFloat(this.validator.voting_power) === 0) return "yellow"

      // status: validator
      return "green"
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
        await this.$store.dispatch("submitDelegation", delegation)

        this.$store.commit("notify", {
          title: "Successful Staking!",
          body: `You have successfully staked your ${this.bondingDenom}s.`
        })
      } catch (exception) {
        const { message } = exception
        let errData = message.split("\n")[5]

        if (errData) {
          let parsedErr = errData.split('"')[1]

          this.$store.commit("notifyError", {
            title: `Error While Staking ${this.bondingDenom}s`,
            body: parsedErr[0].toUpperCase() + parsedErr.slice(1)
          })
        } else {
          this.$store.commit("notifyError", {
            title: `Error While Staking ${this.bondingDenom}s`,
            body: message
          })
        }
      }
    },
    validatorTitle(validator) {
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
  },
  watch: {
    validator(validator) {
      this.$store.dispatch("getSelfBond", this.validator)
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
  display flex
  width 100%
  background-color var(--app-fg)
  padding 2rem
  margin-bottom 1rem

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
      height 155px
      width 155px
      margin-right 2rem
      background var(--app-nav)
      border-radius 50%
      padding 1rem

    &__info
      flex 1

    &__name
      margin-bottom 2rem

      &__title
        font-size h1
        line-height h1
        color white
        padding 0 0.5rem 0.5rem 0
        display inline-block

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
    display inline-block
    width 0.5rem
    height 0.5rem
    border-radius 50%
    position absolute
    left -1rem

    &.red
      background var(--danger)

    &.yellow
      background var(--warning)

    &.green
      background var(--success)

  &__status-and-title
    display flex
    align-items center

  &__details
    > .row
      > .column
        flex 1

.info_dl
  display flex
  flex-flow column
  margin-right 1rem
  margin-bottom 1.5rem

  dt
    color var(--dim)
    margin-bottom 4px
    font-size small

  dd
    border-radius 2px
    border solid 1px #31354e
    font-size 1rem
    line-height 1rem
    padding 0.5rem

    &.info_dl__text-box
      min-height 6.91rem

.colored_dl
  display flex
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
    font-size h6
    line-height h6
    text-align right
    padding 4px 4px

    &.red
      color #ff0200
      background-color rgba(209, 2, 0, 0.15)
      border solid 0.5px rgba(209, 2, 0, 0.25)

    &.yellow
      color #ff9502
      background-color rgba(255, 149, 2, 0.15)
      border solid 0.5px rgba(255, 149, 2, 0.25)

    &.green
      color #2ea42d
      background-color rgba(46, 164, 45, 0.15)
      border solid 0.5px rgba(46, 164, 45, 0.25)

.delegates-tabs
  display flex

  .tab
    cursor pointer
    margin 0 0.5em
    padding-bottom 0.5em
    margin-bottom 1em

    &:first-of-type
      cursor not-allowed

    &.tab-selected
      color var(--bright)
      border-bottom 2px solid var(--tertiary)
</style>
