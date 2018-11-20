<template lang="pug">
tm-page(data-title="Validator")
  template(slot="menu-body"): tm-balance
  div(slot="menu"): tm-tool-bar
    router-link(to="/staking/validators" exact): i.material-icons arrow_back

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
            short-bech32(:address="validator.operator_address")
          .column.validator-profile__header__actions
            tm-btn#delegation-btn(value="Delegate" color="primary" @click.native="onDelegation")

            tm-btn#undelegation-btn(
              value="Undelegate"
              color="secondary"
              @click.native="onUndelegation"
            )

        .row.validator-profile__header__data
          dl.colored_dl
            dt Delegated {{bondingDenom}}
            dd {{myBond.isLessThan(0.01) && myBond.isGreaterThan(0) ? '< ' + 0.01 : num.shortNumber(myBond)}}
          dl.colored_dl(v-if="config.devMode")
            dt My Rewards
            dd n/a
          .validator-profile__header__data__break
          dl.colored_dl
            dt Voting Power
            dd(id="validator-profile__power") {{ pretty(powerRatio * 100)}} %
          dl.colored_dl(v-if="config.devMode")
            dt Uptime
            dd(id="validator-profile__uptime") {{ validator.signing_info ? pretty(validator.signing_info.signed_blocks_counter/100) : `n/a`}} %
          dl.colored_dl
            dt Commission
            dd(id="validator-profile__commission") {{ validator.commission.rate }} %
          dl.colored_dl(v-if="config.devMode")
            dt Slashes
            dd n/a

    .validator-profile__details.validator-profile__section
      .row
        .column
          dl.info_dl
            dt Operator
            dd {{validator.operator_address}}
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
            dd {{validator.commission.rate}} %
          dl.info_dl
            dt Max Commission Rate
            dd {{validator.commission.max_rate}} %
          dl.info_dl
            dt Max Daily Commission Change
            dd {{validator.commission.max_change_rate}} %
          dl.info_dl
            dt Last Commission Change
            dd {{new Date(validator.commission.update_time).getTime() === 0 ? 'Never' : moment(new Date(validator.commission.update_time)).fromNow() }}
          dl.info_dl
            dt Self Delegated {{bondingDenom}}
            dd(id="validator-profile__self-bond") {{selfBond}} %
          dl.info_dl(v-if="config.devMode")
            dt Minimum Self Delegated {{bondingDenom}}
            dd 0 %

    delegation-modal(
      v-if="showDelegationModal"
      v-on:submitDelegation="submitDelegation"
      :showDelegationModal.sync="showDelegationModal"
      :fromOptions="delegationTargetOptions()"
      :to="validator.operator_address"
    )

    undelegation-modal(
      v-if="showUndelegationModal"
      v-on:submitUndelegation="submitUndelegation"
      :showUndelegationModal.sync="showUndelegationModal"
      :maximum="myBond"
      :to="this.wallet.address"
    )
    tm-modal(:close="closeCannotModal" icon="warning" v-if="showCannotModal")
      div(slot='title') Cannot Complete {{ action == `delegate`? `Delegation` : `Undelegation` }}
      p You have no {{ bondingDenom }}s {{ action == `undelegate` ? `delegated `: `` }}to {{ action == `delegate` ? `delegate.` : `this validator.` }}
      div(slot='footer')
        tmBtn(
          id="no-atoms-modal__btn"
          @click.native="closeCannotModal"
          value="OK"
        )
</template>

<script>
import moment from "moment"
import { calculateTokens } from "scripts/common"
import { mapGetters } from "vuex"
import num from "scripts/num"
import { TmBtn, TmListItem, TmPage, TmPart, TmToolBar } from "@tendermint/ui"
import TmModal from "common/TmModal"
import TmDataError from "common/TmDataError"
import { shortAddress, ratToBigNumber } from "scripts/common"
import DelegationModal from "staking/DelegationModal"
import UndelegationModal from "staking/UndelegationModal"
import numeral from "numeral"
import ShortBech32 from "common/ShortBech32"
import TmBalance from "common/TmBalance"
import { isEmpty } from "lodash"
export default {
  name: `page-validator`,
  components: {
    ShortBech32,
    DelegationModal,
    UndelegationModal,
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
    num,
    showCannotModal: false,
    showDelegationModal: false,
    showUndelegationModal: false,
    shortAddress,
    tabIndex: 1,
    action: ``,
    moment
  }),
  computed: {
    ...mapGetters([
      `bondingDenom`,
      `delegates`,
      `delegation`,
      `committedDelegations`,
      `config`,
      `keybase`,
      `oldBondedAtoms`,
      `totalAtoms`,
      `wallet`
    ]),
    validator() {
      let validator = this.delegates.delegates.find(
        v => this.$route.params.validator === v.operator_address
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
      return calculateTokens(
        this.validator,
        this.committedDelegations[this.validator.operator_address] || 0
      )
    },
    powerRatio() {
      return ratToBigNumber(this.validator.tokens)
        .div(this.delegates.globalPower)
        .toNumber()
    },
    // TODO enable once we decide on limits
    // powerRatioLevel() {
    //   if (this.powerRatio < 0.01) return `green`
    //   if (this.powerRatio < 0.03) return `yellow`
    //   return `red`
    // },
    // TODO enable once we decide on limits
    // commissionLevel() {
    //   if (this.validator.commission < 0.01) return `green`
    //   if (this.validator.commission < 0.03) return `yellow`
    //   return `red`
    // },
    status() {
      // status: jailed
      if (this.validator.revoked)
        return `This validator has been jailed and is not currently validating`

      // status: inactive
      if (parseFloat(this.validator.voting_power) === 0)
        return `This validator does not have enough voting power yet and is inactive`

      // status: active
      return `This validator is actively validating`
    },
    statusColor() {
      // status: jailed
      if (this.validator.revoked) return `red`

      // status: inactive
      if (parseFloat(this.validator.voting_power) === 0) return `yellow`

      // status: active
      return `green`
    },
    availableAtoms() {
      return this.totalAtoms - this.oldBondedAtoms
    }
  },
  watch: {
    validator: {
      immediate: true,
      handler(validator) {
        if (!validator) return
        this.$store.dispatch(`getSelfBond`, validator)
      }
    }
  },
  methods: {
    closeCannotModal() {
      this.showCannotModal = false
    },
    onDelegation() {
      this.action = `delegate`
      if (this.availableAtoms > 0) {
        this.showDelegationModal = true
      } else {
        this.showCannotModal = true
      }
    },
    onUndelegation() {
      this.action = `undelegate`
      if (this.myBond.isGreaterThan(0)) {
        this.showUndelegationModal = true
      } else {
        this.showCannotModal = true
      }
    },
    async submitDelegation({ amount, from }) {
      const delegatorAddr = this.wallet.address
      let stakingTransactions = {}
      let txTitle,
        txBody,
        txAction = ``

      if (from === delegatorAddr) {
        txTitle = `delegation`
        txBody = `delegated`
        txAction = `delegating`

        stakingTransactions.delegations = [
          {
            atoms: amount,
            validator: this.validator
          }
        ]
      } else {
        txTitle = `redelegation`
        txBody = `redelegated`
        txAction = `redelegating`

        let validatorFrom = this.delegates.delegates.find(
          v => from === v.operator_address
        )

        stakingTransactions.redelegations = [
          {
            atoms: amount,
            validatorSrc: validatorFrom,
            validatorDst: this.validator
          }
        ]
      }

      try {
        await this.$store.dispatch(`submitDelegation`, {
          stakingTransactions
        })

        this.$store.commit(`notify`, {
          title: `Successful ${txTitle}!`,
          body: `You have successfully ${txBody} your ${this.bondingDenom}s`
        })
      } catch ({ message }) {
        this.$store.commit(`notifyError`, {
          title: `Error while ${txAction} ${this.bondingDenom}s`,
          body: message
        })
      }
    },
    async submitUndelegation({ amount }) {
      try {
        await this.$store.dispatch(`submitDelegation`, {
          stakingTransactions: {
            unbondings: [
              {
                atoms: -amount,
                validator: this.validator
              }
            ]
          }
        })

        this.$store.commit(`notify`, {
          title: `Successful Undelegation!`,
          body: `You have successfully undelegated ${amount} ${
            this.bondingDenom
          }s.`
        })
      } catch ({ message }) {
        this.$store.commit(`notifyError`, {
          title: `Error while undelegating ${this.bondingDenom}s`,
          body: message
        })
      }
    },
    delegationTargetOptions() {
      //- First option should always be your wallet (i.e normal delegation)
      let myWallet = [
        {
          address: this.wallet.address,
          maximum: Math.floor(this.totalAtoms - this.oldBondedAtoms),
          key: `My Wallet - ${shortAddress(this.wallet.address, 20)}`,
          value: 0
        }
      ]
      let bondedValidators = Object.keys(this.committedDelegations)
      if (isEmpty(bondedValidators)) {
        return myWallet
      }
      //- The rest of the options are from your other bonded validators
      //- We skip the option of redelegating to the same address
      let redelegationOptions = bondedValidators
        .filter(address => address != this.$route.params.validator)
        .map((address, index) => {
          let delegate = this.delegates.delegates.find(function(validator) {
            return validator.operator_address === address
          })
          return {
            address: address,
            maximum: Math.floor(this.committedDelegations[address]),
            key: `${delegate.description.moniker} - ${shortAddress(
              delegate.operator_address,
              20
            )}`,
            value: index + 1
          }
        })
      return myWallet.concat(redelegationOptions)
    },
    pretty(num) {
      return numeral(num).format(`0,0.00`)
    },
    // empty descriptions have a strange '[do-not-modify]' value which we don't want to show
    translateEmptyDescription(value) {
      if (!value || value === `[do-not-modify]`) return `n/a`
      return value
    }
  }
}
</script>

<style lang="stylus">
@require '~variables'

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
        font-weight 400
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

    &.blue
      background var(--primary)

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
  width 6rem

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
