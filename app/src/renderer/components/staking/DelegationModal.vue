<template>
  <div class="delegation-modal" id="delegation-modal" v-click-outside="close">
    <div class="delegation-modal-header">
      <img
        class="icon delegation-modal-atom"
        src="~assets/images/cosmos-logo.png"
      /><span class="tm-modal-title">Delegation</span>
      <div class="tm-modal-icon tm-modal-close" id="closeBtn" @click="close()">
        <i class="material-icons">close</i>
      </div>
    </div>
    <tm-form-group
      class="delegation-modal-form-group"
      field-id="amount"
      field-label="Amount"
    >
      <tm-field
        id="denom"
        type="text"
        :placeholder="bondingDenom"
        readonly="readonly"
      ></tm-field>
      <tm-field
        id="amount"
        type="number"
        :max="fromOptions[selectedIndex].maximum"
        :min="0"
        step="any"
        v-model="amount"
        v-focus="v - focus"
      ></tm-field>
    </tm-form-group>
    <tm-form-group
      class="delegation-modal-form-group"
      field-id="to"
      field-label="To"
    >
      <tm-field id="to" readonly="readonly" v-model="to"></tm-field>
    </tm-form-group>
    <tm-form-group
      class="delegation-modal-form-group"
      field-id="from"
      field-label="From"
    >
      <tm-field
        id="from"
        type="select"
        v-model="selectedIndex"
        :title="fromOptions[selectedIndex].address"
        :options="fromOptions"
      ></tm-field>
    </tm-form-group>
    <div class="delegation-modal-footer">
      <tm-btn
        id="submit-delegation"
        @click.native="onDelegation"
        :disabled="$v.amount.$invalid"
        color="primary"
        value="Confirm Delegation"
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
  name: `delegation-modal`,
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
  props: [`fromOptions`, `to`],
  data: () => ({
    amount: 0,
    selectedIndex: 0
  }),
  computed: {
    ...mapGetters([`bondingDenom`])
  },
  validations() {
    return {
      amount: {
        required,
        between: between(
          0.0000000001,
          this.fromOptions[this.selectedIndex].maximum
        )
      }
    }
  },
  methods: {
    close() {
      this.$emit(`update:showDelegationModal`, false)
    },
    onDelegation() {
      this.$emit(`submitDelegation`, {
        amount: this.amount,
        from: this.fromOptions[this.selectedIndex].address
      })
      this.close()
    }
  }
}
</script>

<style>
.delegation-modal {
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

.delegation-modal-header {
  align-items: center;
  display: flex;
}

.delegation-modal-atom {
  height: 4rem;
  width: 4rem;
}

.delegation-modal-form-group {
  display: block;
  padding: 0;
}

.delegation-modal #amount {
  margin-top: -32px;
}

.delegation-modal #denom {
  border: none;
  margin-left: 80%;
  text-align: right;
  width: 72px;
}

.delegation-modal-footer {
  display: flex;
  justify-content: flex-end;
}

.delegation-modal-footer button {
  margin-left: 1rem;
}
</style>
