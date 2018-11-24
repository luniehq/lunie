<template>
  <div class="modal-propose" id="modal-propose" v-click-outside="close">
    <div class="modal-propose-header">
      <img
        class="icon modal-propose-atom"
        src="~assets/images/cosmos-logo.png"
      /><span class="tm-modal-title">Create Proposal</span>
      <div class="tm-modal-icon tm-modal-close" id="closeBtn" @click="close()">
        <i class="material-icons">close</i>
      </div>
    </div>
    <tm-form-group class="page-proposal-form-group"
      ><span>Title</span>
      <tm-field
        id="title"
        type="text"
        placeholder="Proposal title"
        v-model="title"
        v-focus="v - focus"
      ></tm-field>
    </tm-form-group>
    <tm-form-group class="page-proposal-form-group"
      ><span>Description</span>
      <tm-field
        id="description"
        type="textarea"
        placeholder="Write your proposal here..."
        v-model="description"
      ></tm-field>
    </tm-form-group>
    <tm-form-group class="modal-propose-form-group" field-id="amount"
      ><span>Deposit amount</span>
      <tm-field
        id="denom"
        type="text"
        :placeholder="denom"
        readonly="readonly"
      ></tm-field>
      <tm-field
        id="amount"
        type="number"
        :max="balance"
        :min="0"
        step="any"
        v-model="amount"
        v-focus="v - focus"
      ></tm-field>
    </tm-form-group>
    <div class="modal-propose-footer">
      <tm-btn
        id="submit-proposal"
        @click.native="onPropose"
        :disabled="$v.$invalid"
        color="primary"
        value="Submit proposal"
        size="lg"
      ></tm-btn>
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
import { TmBtn, TmField, TmFormGroup } from "@tendermint/ui"

const isValid = type =>
  type === `Text` || type === `ParameterChange` || type === `SoftwareUpgrade`

const notBlank = text => !isEmpty(trim(text))

export default {
  name: `modal-propose`,
  directives: {
    ClickOutside
  },
  components: {
    Modal,
    TmBtn,
    TmField,
    TmFormGroup
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
    amount: 0
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
        minLength(x) {
          return minLength(this.titleMinLength)(x)
        },
        maxLength(x) {
          return maxLength(this.titleMaxLength)(x)
        },
        notBlank
      },
      description: {
        required,
        minLength(x) {
          return minLength(this.descriptionMinLength)(x)
        },
        maxLength(x) {
          return maxLength(this.descriptionMaxLength)(x)
        },
        notBlank
      },
      type: {
        isValid
      },
      amount: {
        required,
        between: between(
          0.0000000001,
          this.balance > 0 ? this.balance : 0.0000000001
        )
      }
    }
  },
  methods: {
    close() {
      this.$emit(`update:showModalPropose`, false)
    },
    onPropose() {
      this.$emit(`createProposal`, {
        title: this.title,
        description: this.description,
        type: this.type,
        amount: this.amount
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
