<template>
  <div v-click-outside="close" id="modal-propose" class="modal-propose">
    <div class="modal-propose-header">
      <img
        class="icon modal-propose-atom"
        src="~assets/images/cosmos-logo.png"
      />
      <span class="tm-modal-title">Create Proposal</span>
      <div id="closeBtn" class="tm-modal-icon tm-modal-close" @click="close()">
        <i class="material-icons">close</i>
      </div>
    </div>
    <div v-if="step === `txDetails`">
      <tm-form-group
        :error="$v.title.$invalid && title.length > 0"
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
        :error="$v.description.$invalid && description.length > 0"
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
        :error="$v.amount.$invalid && (amount > 0 || balance === 0)"
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
        <tm-field id="amount" :min="0" v-model="amount" type="number" />
        <tm-form-msg
          v-if="!$v.amount.between && amount > 0 && balance > 0"
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
        <hr v-if="!ledger.isConnected" />
      </tm-form-group>
      <tm-form-group
        v-if="!ledger.isConnected"
        class="modal-propose-form-group"
        field-id="password"
      >
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
    </div>
    <hardware-state
      v-if="step === `sign`"
      icon="usb"
      value="Please unlock the Cosmos app and sign with your Ledger"
    />
    <hardware-state
      v-if="step === `connecting`"
      icon="rotate_right"
      :spin="true"
      value="Please unlock the Cosmos app and sign with your Ledger"
    />
    <div class="modal-propose-footer">
      <tm-btn
        id="submit-proposal"
        :disabled="$v.$invalid"
        color="primary"
        :value="btnMessage"
        size="lg"
        @click.native="ledger.isConnected ? nextStep() : onPropose()"
      />
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex"
import ClickOutside from "vue-click-outside"
import HardwareState from "common/TmHardwareState"
import {
  minLength,
  maxLength,
  required,
  requiredIf,
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
    HardwareState,
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
    step: `txDetails`,
    btnMessage: `Submit proposal`,
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
    ...mapGetters([`ledger`, `wallet`]),
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
        between: between(1, this.balance)
      },
      password: {
        required: requiredIf(!this.ledger.isConnected)
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
    onClick() {
      if (ledger.isConnected) {
        this.nextStep()
      } else {
        this.onPropose()
      }
    },
    nextStep() {
      // TODO: add steps from https://github.com/cosmos/voyager/issues/1735
      switch (this.step) {
        case `txDetails`:
          this.step = `sign`
          this.btnMessage = `Sign`
          break
        case `sign`:
          this.step = `connection`
          this.btnMessage = `Signing...`
          this.onPropose()
          break
        default:
          this.step = `txDetails`
          this.btnMessage = `Submit proposal`
      }
    },
    onPropose() {
      this.$emit(`createProposal`, {
        title: this.title,
        description: this.description,
        type: this.type,
        amount: this.amount,
        password: this.password
      })
      // TODO: this should wait for the user's action on Ledger instead of closing right away
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
