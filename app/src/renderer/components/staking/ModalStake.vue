<template lang="pug">
  .modal-stake
    .stake-contents
      .stake-header
        img.icon(class='stake-atom' src="~assets/images/cosmos-logo.png")
        span.tm-modal-title Stake

      tm-form-group.stake-form-group(
        :error='$v.amount.$error'
        field-id='amount'
        field-label='Amount'
      )
        tm-field#amount(
          type="number"
          v-model="amount")
        tm-form-msg(name='Amount' type='between' :min='1' :max='unbondedAtoms'
          v-if='!$v.amount.between')

      tm-form-group.stake-form-group(
        field-id='to' field-label='To')
        tm-field#to(v-model="to")

      tm-form-group.stake-form-group(
        field-id='from' field-label='From')
        tm-field#from(
          type="select"
          :options="fromOptions()"
          v-model="fromActive"
        )

      .stake-footer
        tm-btn(@click.native="stake" color="primary" value="Stake" size="lg")
</template>

<script>
import { between } from "vuelidate/lib/validators"
import { mapGetters } from "vuex"
import Modal from "common/TmModal"
import { TmBtn, TmField, TmFormGroup, TmFormMsg } from "@tendermint/ui"
export default {
  props: ["to"],
  components: {
    Modal,
    TmBtn,
    TmField,
    TmFormGroup,
    TmFormMsg
  },
  data: () => ({
    amount: 1,
    fromActive: `wallet`
  }),
  validations() {
    return {
      amount: {
        between: between(1, this.unbondedAtoms)
      }
    }
  },
  computed: Object.assign(
    mapGetters([
      `bondingDenom`,
      `delegation`,
      `totalAtoms`,
      `oldBondedAtoms`,
      `wallet`
    ]),
    {
      unbondedAtoms() {
        return this.totalAtoms - this.oldBondedAtoms
      }
    }
  ),
  methods: {
    close() {
      this.$emit("update:showModalStake", false)
    },
    fromOptions() {
      return [{ key: `My Wallet - ${this.wallet.address}`, value: `wallet` }]
    },
    async stake() {
      this.$v.$touch()

      if (!this.$v.$error) {
        const currentlyDelegated =
          parseInt(this.delegation.committedDelegates[this.to]) || 0

        const delegation = [
          {
            atoms: currentlyDelegated + this.amount,
            delegate: { owner: this.to }
          }
        ]

        try {
          await this.$store.dispatch("submitDelegation", delegation)

          this.$store.commit("notify", {
            title: "Successful Staking!",
            body: `You have successfully staked your ${this.bondingDenom}s.`
          })
        } catch ({ message }) {
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

        this.close()
      }
    }
  }
}
</script>

<style lang="stylus">
@import '~variables'

.modal-stake
  display: grid
  grid-template-columns: 5fr 4fr 1fr
  grid-template-rows: 1fr 1fr
  height: 100%
  left: 0
  position: fixed
  top: 0
  width: 100%
  z-index: z(modal)

  .stake-contents
    background: var(--app-nav)
    display: flex
    flex-direction: column
    grid-column-end: 3
    grid-column-start: 2
    grid-row-end: 3
    grid-row-start: 2
    justify-content: space-between
    padding: 5%

    .stake-header
      align-items: center
      display: flex

      .stake-atom
        height: 3em
        width: 3em

    .stake-footer
      display: flex
      justify-content: flex-end

.stake-form-group
  display: block
  padding: 0
</style>
