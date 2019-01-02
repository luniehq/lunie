<template>
  <div v-click-outside="close" id="modal-propose" class="modal-propose">
    <div class="modal-propose-header">
      <img
        class="icon modal-propose-atom"
        src="~assets/images/cosmos-logo.png"
      /><span class="tm-modal-title">Create Proposal</span>
      <div id="closeBtn" class="tm-modal-icon tm-modal-close" @click="close()">
        <i class="material-icons">close</i>
      </div>
    </div>
    <tm-form-group
      :error="$v.title.error && $v.title.$invalid"
      class="page-proposal-form-group"
    >
      <span>Title</span>
      <tm-field
        v-focus
        id="title"
        v-model.trim="title"
        type="text"
        placeholder="Proposal title"
      />
      <tm-form-msg
        v-if="!$v.title.maxLength"
        :max="$v.title.$params.maxLength.max"
        name="Proposal Title"
        type="maxLength"
      />
    </tm-form-group>
    <tm-form-group
      :error="$v.description.error && $v.description.$invalid"
      class="page-proposal-form-group"
    >
      <span>Description</span>
      <tm-field
        id="description"
        v-model.trim="description"
        type="textarea"
        placeholder="Write your proposal here..."
      />
      <tm-form-msg
        v-if="!$v.description.maxLength"
        :max="$v.description.$params.maxLength.max"
        name="Description"
        type="maxLength"
      />
    </tm-form-group>
    <tm-form-group
      :error="$v.amount.error && $v.amount.$invalid"
      class="modal-propose-form-group"
      field-id="amount"
    >
      <span>Deposit amount</span>
      <tm-field
        id="denom"
        :placeholder="denom"
        :tabindex="-1"
        type="text"
        readonly="readonly"
      />
      <tm-field
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
    <tm-form-group class="modal-propose-form-group" field-id="password">
      <span>Account password</span>
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
    <div class="modal-propose-footer">
      <tm-btn
        id="submit-proposal"
        :disabled="$v.$invalid"
        color="primary"
        value="Submit proposal"
        size="lg"
        @click.native="onPropose"
      />
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex"
import ClickOutside from "vue-click-outside"
import {
  minLength,
  maxLength,
  required,
  between
} from "vuelidate/lib/validators"
import { isEmpty, trim } from "lodash"
import Modal from "common/TmModal"
import TmBtn from "common/TmBtn"
import TmField from "common/TmField"
import TmFormGroup from "common/TmFormGroup"
import TmFormMsg from "common/TmFormMsg"

const isValid = type =>
  type === `Text` || type === `ParameterChange` || type === `SoftwareUpgrade`

const notBlank = text => !isEmpty(trim(text))
const isInteger = amount => Number.isInteger(amount)

export default {
  name: `modal-propose`,
  directives: {
    ClickOutside
  },
  components: {
    Modal,
    TmBtn,
    TmField,
    TmFormGroup,
    TmFormMsg
  },
  props: {
    denom: {
      type: String,
      required: true
    }
  },
  data: () => ({
    titleMinLength: 1,
    titleMaxLength: 64,
    descriptionMinLength: 1,
    descriptionMaxLength: 200,
    title: ``,
    description: ``,
    type: `Text`,
    amount: 0,
    password: ``,
    showPassword: false
  }),
  computed: {
    // TODO: get coin denom from governance params
    ...mapGetters([`wallet`]),
    balance() {
      // TODO: refactor to get the selected coin when multicoin deposit is enabled
      if (!this.wallet.balancesLoading && !!this.wallet.balances.length) {
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
      title: {
        required,
        minLength: minLength(this.titleMinLength),
        maxLength: maxLength(this.titleMaxLength),
        notBlank
      },
      description: {
        required,
        minLength: minLength(this.descriptionMinLength),
        maxLength: maxLength(this.descriptionMaxLength),
        notBlank
      },
      type: {
        isValid
      },
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
      this.$emit(`update:showModalPropose`, false)
    },
    togglePassword() {
      this.showPassword = !this.showPassword
    },
    onPropose() {
      this.$emit(`createProposal`, {
        title: this.title,
        description: this.description,
        type: this.type,
        amount: this.amount,
        password: this.password
      })
      this.close()
    }
  }
}
</script>

<style>
.modal-propose {
  background: var(--app-nav);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  left: 50%;
  padding: 2rem;
  position: fixed;
  bottom: 0;
  width: 50%;
  z-index: var(--z-modal);
}

.modal-propose-header {
  align-items: center;
  display: flex;
}

.modal-propose-atom {
  height: 4rem;
  width: 4rem;
}

.modal-propose-form-group {
  display: block;
  padding: 0;
}

.modal-propose #amount {
  margin-top: -32px;
}

.modal-propose #denom {
  border: none;
  margin-left: 80%;
  text-align: right;
  width: 72px;
}

.modal-propose-footer {
  display: flex;
  justify-content: flex-end;
}

.modal-propose-footer button {
  margin-left: 1rem;
  margin-top: 1rem;
}

.modal-propose .page-proposal-form-group {
  display: block;
  padding: 0;
}

.modal-propose .page-proposal-form-group textarea {
  min-height: 300px;
}

.modal-propose .tm-form-group {
  margin: 0.5rem 0;
}
</style>
