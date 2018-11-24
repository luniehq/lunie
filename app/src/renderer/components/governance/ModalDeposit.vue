<template>
  <div class="modal-deposit" id="modal-deposit" v-click-outside="close">
    <div class="modal-deposit-header">
      <img
        class="icon modal-deposit-atom"
        src="~assets/images/cosmos-logo.png"
      /><span class="tm-modal-title">Deposit</span>
      <div class="tm-modal-icon tm-modal-close" id="closeBtn" @click="close()">
        <i class="material-icons">close</i>
      </div>
    </div>
    <div>
      <h2>Title: {{ proposalTitle }}</h2>
      <h3>Proposal ID: {{ `#` + proposalId }}</h3>
    </div>
    <tm-form-group
      class="modal-deposit-form-group"
      field-id="amount"
      field-label="Amount"
    >
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
    <div class="modal-deposit-footer">
      <tm-btn
        id="submit-deposit"
        @click.native="onDeposit"
        :disabled="$v.amount.$invalid"
        color="primary"
        value="Deposit"
        size="lg"
      ></tm-btn>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex"
import ClickOutside from "vue-click-outside"
import { required, between } from "vuelidate/lib/validators"
import Modal from "common/TmModal"
import { TmBtn, TmField, TmFormGroup } from "@tendermint/ui"

export default {
  name: `modal-deposit`,
  components: {
    Modal,
    TmBtn,
    TmField,
    TmFormGroup
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
    amount: 0
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
        between: between(
          0.0000000001,
          this.balance > 0 ? this.balance : 0.0000000001
        )
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
      this.$emit(`submitDeposit`, { amount })
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
  z-index: z(modal);
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
