<template>
  <div v-click-outside="close" id="modal-deposit" class="modal-deposit">
    <div class="modal-deposit-header">
      <img
        class="icon modal-deposit-atom"
        src="~assets/images/cosmos-logo.png"
      /><span class="tm-modal-title">Deposit</span>
      <div id="closeBtn" class="tm-modal-icon tm-modal-close" @click="close()">
        <i class="material-icons">close</i>
      </div>
    </div>
    <div>
      <h2>Title: {{ proposalTitle }}</h2>
      <h3>Proposal ID: {{ `#` + proposalId }}</h3>
    </div>
    <tm-form-group
      :error="$v.amount.$invalid"
      class="modal-deposit-form-group"
      field-id="amount"
      field-label="Amount"
    >
      <tm-field
        id="denom"
        :placeholder="denom"
        type="text"
        readonly="readonly"
      />
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
      <hr />
    </tm-form-group>
    <tm-form-group
      class="modal-deposit-form-group"
      field-id="password"
      field-label="Account password"
    >
      <tm-field
        id="password"
        v-model="password"
        :type="showPassword ? `text` : `password`"
        placeholder="password..."
      />
      <input
        id="showPasswordCheckbox"
        v-model="showPassword"
        type="checkbox"
        @input="togglePassword"
      />
      <label for="showPasswordCheckbox">Show password</label>
    </tm-form-group>
    <div class="modal-deposit-footer">
      <tm-btn
        id="submit-deposit"
        :disabled="$v.$invalid"
        color="primary"
        value="Deposit"
        size="lg"
        @click.native="onDeposit"
      />
    </div>
  </div>
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

const isInteger = amount => Number.isInteger(amount)

export default {
  name: `modal-deposit`,
  components: {
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
    ...mapGetters([`wallet`]),
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
    togglePassword() {
      this.showPassword = !this.showPassword
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

<style>
.modal-deposit {
  background: var(--app-nav);
  display: flex;
  flex-direction: column;
  height: 50%;
  justify-content: space-between;
  left: 50%;
  padding: 2rem;
  position: fixed;
  top: 50%;
  width: 40%;
  z-index: var(--z-modal);
}

.modal-deposit-header {
  align-items: center;
  display: flex;
}

.modal-deposit-atom {
  height: 4rem;
  width: 4rem;
}

.modal-deposit-form-group {
  display: block;
  padding: 0;
}

.modal-deposit #amount {
  margin-top: -32px;
}

.modal-deposit #denom {
  border: none;
  margin-left: 80%;
  text-align: right;
  width: 72px;
}

.modal-deposit-footer {
  display: flex;
  justify-content: flex-end;
}

.modal-deposit-footer button {
  margin-left: 1rem;
}
</style>
