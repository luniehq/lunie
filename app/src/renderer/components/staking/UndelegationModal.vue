<template>
  <div
    class="undelegation-modal"
    id="undelegation-modal"
    v-click-outside="close"
  >
    <div class="undelegation-modal-header">
      <img
        class="icon undelegation-modal-atom"
        src="~assets/images/cosmos-logo.png"
      /><span class="tm-modal-title">Undelegate</span>
      <div class="tm-modal-icon tm-modal-close" @click="close()">
        <i class="material-icons">close</i>
      </div>
    </div>
    <tm-form-group class="undelegation-modal-form-group" field-label="Amount">
      <tm-field
        id="denom"
        type="text"
        :placeholder="bondingDenom"
        readonly="readonly"
      ></tm-field>
      <tm-field
        id="amount"
        :max="maximum"
        :min="0"
        step="any"
        type="number"
        v-model="amount"
        v-focus="v - focus"
      ></tm-field>
    </tm-form-group>
    <tm-form-group
      class="undelegation-modal-form-group"
      field-id="to"
      field-label="To"
    >
      <tm-field id="to" readonly="readonly" v-model="to"></tm-field>
    </tm-form-group>
    <div class="undelegation-modal-footer">
      <tm-btn
        id="submit-undelegation"
        @click.native="onUndelegate"
        :disabled="$v.amount.$invalid"
        color="primary"
        value="Undelegate"
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
import { TmBtn, TmField, TmFormGroup, TmFormMsg } from "@tendermint/ui"

export default {
  name: `undelegation-modal`,
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
    maximum: {
      type: Number,
      required: true
    },
    to: {
      type: String,
      required: true
    }
  },
  data: () => ({
    amount: 0
  }),
  computed: {
    ...mapGetters([`bondingDenom`])
  },
  validations() {
    return {
      amount: {
        required,
        between: between(0.0000000001, this.maximum)
      }
    }
  },
  methods: {
    close() {
      this.$emit(`update:showUndelegationModal`, false)
    },
    onUndelegate() {
      this.$emit(`submitUndelegation`, {
        amount: this.amount
      })
      this.close()
    }
  }
}
</script>

<style>
.undelegation-modal {
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

.undelegation-modal-header {
  align-items: center;
  display: flex;
}

.undelegation-modal-atom {
  height: 4rem;
  width: 4rem;
}

.undelegation-modal-form-group {
  display: block;
  padding: 0;
}

.undelegation-modal #amount {
  margin-top: -32px;
}

.undelegation-modal #denom {
  text-align: right;
  width: 72px;
  margin-left: 80%;
  border: none;
}

.undelegation-modal-footer {
  display: flex;
  justify-content: flex-end;
}

.undelegation-modal-footer button {
  margin-left: 1rem;
}
</style>
