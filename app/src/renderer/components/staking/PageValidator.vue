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
</template>

<script>
import { mapGetters } from "vuex"
import { TmListItem, TmPage, TmPart, TmToolBar } from "@tendermint/ui"
import { TmDataError } from "common/TmDataError"
import numeral from "numeral"
import AnchorCopy from "common/AnchorCopy"
export default {
  name: "page-validator",
  components: {
    AnchorCopy,
    TmListItem,
    TmPage,
    TmPart,
    TmToolBar,
    TmDataError
  },
  computed: {
    ...mapGetters(["delegates", "config"]),
    validator() {
      return this.delegates.delegates.find(
        v => this.$route.params.validator === v.owner
      )
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
@media screen and (min-width: 640px)
  #validator-profile .tm-part-main
    display flex
    flex-flow row-reverse nowrap

    .list-items
      flex 1
</style>
