<template>
  <action-modal
    id="modal-deposit"
    ref="actionModal"
    title="Deposit"
    class="modal-deposit"
    @close-action-modal="close"
  >
    <tm-form-group
      :error="
        $v.amount.$error && $v.amount.$invalid && (amount > 0 || balance === 0)
      "
      class="action-modal-form-group"
      field-id="amount"
      field-label="Amount"
    >
      <span class="input-suffix">{{ denom }}</span>
      <tm-field v-focus id="amount" v-model="amount" type="number" />
      <tm-form-msg
        v-if="
          $v.amount.$error && !$v.amount.between && amount > 0 && balance > 0
        "
        :max="$v.amount.$params.between.max"
        :min="$v.amount.$params.between.min"
        name="Amount"
        type="between"
      />
      <tm-form-msg
        v-else-if="balance === 0"
        :msg="`doesn't hold any ${denom}s`"
        name="Wallet"
        type="custom"
      />
      <hr />
    </tm-form-group>
    <tm-form-group
      class="action-modal-form-group"
      field-id="password"
      field-label="Password"
    >
      <tm-field
        id="password"
        v-model="password"
        type="password"
        placeholder="Password"
      />
      <tm-form-msg
        v-if="$v.password.$error && !$v.password.required"
        name="Password"
        type="required"
      />
    </tm-form-group>
    <div class="action-modal-footer">
      <tm-btn
        v-if="sending"
        value="Sending..."
        disabled="disabled"
        color="primary"
      />
      <tm-btn
        v-else-if="!connected"
        value="Connecting..."
        disabled="disabled"
        color="primary"
      />
      <tm-btn
        v-else
        id="submit-deposit"
        color="primary"
        value="Submit Deposit"
        @click.native="validateForm"
      />
    </div>
  </action-modal>
</template>

<script>
import { mapGetters } from "vuex"
import ClickOutside from "vue-click-outside"
import { required, between } from "vuelidate/lib/validators"
import Modal from "common/TmModal"
import TmBtn from "common/TmBtn"
import TmField from "common/TmField"
import TmFormGroup from "common/TmFormGroup"
import TmFormMsg from "common/TmFormMsg"
import ActionModal from "common/ActionModal"

const isInteger = amount => Number.isInteger(amount)

export default {
  name: `modal-deposit`,
  components: {
    ActionModal,
    Modal,
    TmBtn,
    TmField,
    TmFormGroup,
    TmFormMsg
  },
  directives: {
    ClickOutside
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
    amount: 0,
    password: ``,
    sending: false
  }),
  computed: {
    ...mapGetters([`wallet`, `connected`]),
    balance() {
      // TODO: refactor to get the selected coin when multicoin deposit is enabled
      if (!this.wallet.loading && !!this.wallet.balances.length) {
        let balance = this.wallet.balances.find(
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
        required,
        isInteger,
        between: between(1, this.balance)
      },
      password: {
        required
      }
    }
  },
  methods: {
    close() {
      this.$emit(`update:showModalDeposit`, false)
    },
    validateForm() {
      this.$v.$touch()

      if (!this.$v.$invalid) {
        this.submitForm()
      }
    },
    async submitForm() {
      this.sending = true

      await this.$refs.actionModal.submit(async () => {
        // TODO: support multiple coins
        await this.$store.dispatch(`submitDeposit`, {
          proposal_id: this.proposalId,
          amount: [
            {
              amount: String(this.amount),
              denom: this.denom
            }
          ],
          password: this.password
        })

        this.$store.commit(`notify`, {
          title: `Successful deposit!`,
          body: `You have successfully deposited your ${
            this.denom
          }s on proposal #${this.proposalId}`
        })
      }, `Depositing failed`)

      this.sending = false
    }
  }
}
</script>
