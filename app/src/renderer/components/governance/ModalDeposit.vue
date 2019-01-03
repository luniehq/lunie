<template>
  <action-modal
    title="Deposit"
    class="modal-deposit"
    v-on:close-action-modal="close()"
  >
    <tm-form-group
      :error="$v.amount.$invalid"
      class="action-modal-form-group"
      field-id="amount"
      field-label="Amount"
    >
      <span class="input-suffix">{{ bondingDenom }}</span>
      <tm-field
        v-focus
        id="amount"
        :max="balance"
        :min="0"
        v-model="amount"
        type="number"
      />
      <tm-form-msg
        v-if="!$v.amount.between && amount > 0"
        :max="$v.amount.$params.between.max"
        :min="$v.amount.$params.between.min"
        name="Amount"
        type="between"
      />
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
    </tm-form-group>
    <div class="action-modal-footer">
      <tm-btn
        id="submit-deposit"
        :disabled="$v.$invalid"
        color="primary"
        value="Deposit"
        @click.native="onDeposit"
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
    showPassword: false
  }),
  computed: {
    // TODO: get coin denom from governance params
    ...mapGetters([`wallet`, `bondingDenom`]),
    balance() {
      // TODO: refactor to get the selected coin when multicooin deposit is enabled
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
        between: between(1, this.balance > 0 ? this.balance : 1)
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
    onDeposit() {
      let amount = [
        {
          denom: this.denom,
          amount: String(this.amount)
        }
      ]
      this.$emit(`submitDeposit`, { amount, password: this.password })
      this.close()
    }
  }
}
</script>
