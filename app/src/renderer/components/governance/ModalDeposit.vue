<template>
  <action-modal
    id="modal-deposit"
    ref="actionModal"
    :submit-fn="submitForm"
    :validate="validateForm"
    title="Deposit"
    class="modal-deposit"
    submission-error-prefix="Depositing failed"
    @close="$v.$reset()"
  >
    <tm-form-group
      :error="$v.amount.$error && $v.amount.$invalid"
      class="action-modal-form-group"
      field-id="amount"
      field-label="Amount"
    >
      <span class="input-suffix">{{ denom }}</span>
      <tm-field id="amount" v-model="amount" type="number" />
      <tm-form-msg
        v-if="balance === 0"
        :msg="`doesn't have any ${denom}s`"
        name="Wallet"
        type="custom"
      />
      <tm-form-msg
        v-else-if="$v.amount.$error && (!$v.amount.required || amount === 0)"
        name="Amount"
        type="required"
      />
      <tm-form-msg
        v-else-if="$v.amount.$error && !$v.amount.decimal"
        name="Amount"
        type="numeric"
      />
      <tm-form-msg
        v-else-if="$v.amount.$error && !$v.amount.between"
        :max="$v.amount.$params.between.max"
        :min="$v.amount.$params.between.min"
        name="Amount"
        type="between"
      />
    </tm-form-group>
  </action-modal>
</template>

<script>
import { mapGetters } from "vuex"
import { uatoms, atoms } from "../../scripts/num.js"
import { between, decimal } from "vuelidate/lib/validators"
import TmField from "common/TmField"
import TmFormGroup from "common/TmFormGroup"
import TmFormMsg from "common/TmFormMsg"
import ActionModal from "common/ActionModal"

export default {
  name: `modal-deposit`,
  components: {
    ActionModal,
    TmField,
    TmFormGroup,
    TmFormMsg
  },
  props: {
    proposalId: {
      type: [Number, String],
      required: true
    },
    proposalTitle: {
      type: String,
      required: true
    },
    denom: {
      type: String,
      required: true
    }
  },
  data: () => ({
    amount: 0
  }),
  computed: {
    ...mapGetters([`wallet`]),
    balance() {
      // TODO: refactor to get the selected coin when multicoin deposit is enabled
      if (!this.wallet.loading && !!this.wallet.balances.length) {
        const balance = this.wallet.balances.find(
          coin => coin.denom === this.denom
        )
        if (balance) return parseFloat(balance.amount)
      }
      return 0
    }
  },
  validations() {
    return {
      amount: {
        required: x => x !== `0` && x !== ``,
        decimal,
        between: between(0, atoms(this.balance))
      }
    }
  },
  methods: {
    open() {
      this.$refs.actionModal.open()
    },
    validateForm() {
      this.$v.$touch()

      return !this.$v.$invalid
    },
    async submitForm(submitType, password) {
      // TODO: support multiple coins
      await this.$store.dispatch(`submitDeposit`, {
        submitType,
        password,
        proposal_id: this.proposalId,
        amount: [
          {
            amount: String(uatoms(this.amount)),
            denom: this.denom
          }
        ]
      })

      this.$store.commit(`notify`, {
        title: `Successful deposit!`,
        body: `You have successfully deposited your ${
          this.denom
        }s on proposal #${this.proposalId}`
      })
    }
  }
}
</script>
