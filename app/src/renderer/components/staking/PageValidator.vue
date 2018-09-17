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
            tm-btn(value="Stake" color="primary" @click.native="onStake()")
            tm-btn(v-if="config.devMode" value="Unstake" color="secondary")
        .row.validator-profile__header__data
          +dl('My Stake', 12300)
          +dl('My Rewards', 3456)
          .validator-profile__header__data__break
          +dl('Voting Power', 12300)
          +dl('Uptime', 3456)
          +dl('Commission', 12300)
          +dl('Slashes', 3456)

    .container.validator-profile__details
      .row
        .column
          dl.info_dl
            dt Owner / Address
            dd {{shortAddress(validator.owner)}}
          dl.info_dl
            dt Keybase ID
            dd {{validator.description.identity || 'n/a'}}
          dl.info_dl(v-if="config.devMode")
            dt First Seen
            dd December 16, 2018
          dl.info_dl
            dt Details
            dd.info_dl__text-box {{validator.description.details}}
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
            dd {{selfBond}} %
          dl.info_dl(v-if="config.devMode")
            dt Minimum Self Stake
            dd 6 %

    modal-stake(
      v-if="showModalStake"
      v-on:submitDelegation="submitDelegation"
      :showModalStake.sync="showModalStake"
      :fromOptions="[{ key: `My Wallet - ${this.wallet.address}`, value: 0 }]"
      :maximum="availableAtoms()"
      :to="validator.owner"
    )

    tm-modal(:close="closeCannotStake" icon="warning" v-if="showCannotStake")
      div(slot='title') Cannot Stake
      p You have no {{ bondingDenom }}s to stake.
      div(slot='footer')
        tmBtn(@click.native="closeCannotStake()" value="OK")
</template>

<script>
import { mapGetters } from "vuex"
import { TmBtn, TmListItem, TmPage, TmPart, TmToolBar } from "@tendermint/ui"
import TmBalance from "common/TmBalance"
import { TmDataError } from "common/TmDataError"
import { calculateTokens, shortAddress, ratToBigNumber } from "scripts/common"
import ModalStake from "staking/ModalStake"
import numeral from "numeral"
import AnchorCopy from "common/AnchorCopy"
import TmModal from "common/TmModal"

export default {
  name: "page-validator",
  components: {
    AnchorCopy,
    ModalStake,
    TmBtn,
    TmListItem,
    TmModal,
    TmPage,
    TmPart,
    TmToolBar,
    TmDataError,
    TmBalance
  },
  data: () => ({
    showCannotStake: false,
    showModalStake: false,
    shortAddress
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
      return ratToBigNumber(this.validator.tokens)
        .minus(
          calculateTokens(
            this.validator,
            ratToBigNumber(this.validator.delegator_shares).toNumber()
          )
        )
        .toFixed(2)
    }
  },
  methods: {
    availableAtoms() {
      return this.totalAtoms - this.oldBondedAtoms
    },
    closeCannotStake() {
      this.showCannotStake = false
    },
    onStake() {
      if (this.availableAtoms() > 0) {
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
        console.log(exception.stack)
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
  width 100%

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

    &.info_dl__text-box
      min-height 6.91rem

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
