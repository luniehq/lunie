<template lang="pug">
tm-page(:title='validatorTitle(this.validator)')
  div(slot="menu"): tm-tool-bar
    router-link(to="/staking" exact): i.material-icons arrow_back
    anchor-copy(v-if="validator" :value="validator.owner" icon="content_copy")


  tm-data-error(v-if="!validator")
  template(v-else)
    tm-part(title='!!! CRITICAL ALERT !!!' v-if="validator.revoked")
      tm-list-item(title="This validator is revoked!" subtitle="Are you the owner? Go fix it!" type="anchor" href="https://cosmos.network/docs/validators/validator-setup.html#common-problems")

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

    modal-stake(
      v-if="showModalStake"
      v-on:submitDelegation="submitDelegation"
      :bondingDenom="this.config.bondingDenom"
      :showModalStake.sync="showModalStake"
      :fromOptions="modalOptions()"
      :to="validator.owner"
    )

    tm-modal(:close="closeCannotStake" icon="warning" v-if="showCannotStake")
      div(slot='title') Cannot Stake
      p You have no {{ bondingDenom }}s to stake.
      div(slot='footer')
        tmBtn(@click.native="closeCannotStake()" value="OK")


    tm-btn(
      @click.native="onStake()"
      color="primary"
      id="Stake"
      value="Stake"
    )



</template>

<script>
import { mapGetters } from "vuex"
import { TmBtn, TmListItem, TmPage, TmPart, TmToolBar } from "@tendermint/ui"
import { TmDataError } from "common/TmDataError"
import { calculateTokens, shortAddress } from "scripts/common"
import ModalStake from "staking/ModalStake"
import numeral from "numeral"
import AnchorCopy from "common/AnchorCopy"
import TmModal from "common/TmModal"
import { isEmpty } from "lodash"

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
    TmDataError
  },
  data: () => ({
    showCannotStake: false,
    showModalStake: false
  }),
  computed: {
    ...mapGetters([
      "bondingDenom",
      "delegates",
      "delegation",
      "committedDelegations",
      "config",
      "keybase",
      "oldBondedAtoms",
      "totalAtoms",
      "wallet"
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
      parseFloat(this.validator.tokens) -
        parseFloat(this.validator.delegator_shares)
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
      let shortOwner = shortAddress(validator.owner)
      title += ` - (${shortOwner})`
      return title
    },
    pretty(num) {
      return numeral(num).format("0,0.00")
    },
    modalOptions() {
      //- First option should always be your wallet (i.e normal delegation)
      let myWallet = [
        {
          address: this.wallet.address,
          maximum: this.totalAtoms - this.oldBondedAtoms,
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
            return validator.owner === address
          })
          return {
            address: address,
            maximum: this.committedDelegations[address],
            key: `${delegate.description.moniker} - ${shortAddress(
              delegate.owner,
              20
            )}`,
            value: index + 1
          }
        })
      return myWallet.concat(redelegationOptions)
    }
  }
}
</script>

<style lang="stylus">
@media screen and (min-width: 640px)
  #validator-profile .tm-part-main
    display flex
    flex-flow row-reverse nowrap

    .list-items
      flex 1
</style>
