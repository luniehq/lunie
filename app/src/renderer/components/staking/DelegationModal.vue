<template>
  <div v-click-outside="close" id="delegation-modal" class="delegation-modal">
    <div class="delegation-modal-header">
      <img
        class="icon delegation-modal-atom"
        src="~assets/images/cosmos-logo.png"
      /><span class="tm-modal-title">Delegation</span>
      <div id="closeBtn" class="tm-modal-icon tm-modal-close" @click="close()">
        <i class="material-icons">close</i>
      </div>
    </div>
    <tm-form-group
      :error="$v.amount.$invalid"
      class="delegation-modal-form-group"
      field-id="amount"
      field-label="Amount"
    >
      <tm-field
        id="denom"
        :placeholder="bondingDenom"
        type="text"
        readonly="readonly"
      />
      <tm-field
        v-focus
        id="amount"
        :max="fromOptions[selectedIndex].maximum"
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
      class="delegation-modal-form-group"
      field-id="to"
      field-label="To"
    >
      <tm-field id="to" v-model="to" readonly="readonly" type="text" />
    </tm-form-group>
    <tm-form-group
      class="delegation-modal-form-group"
      field-id="from"
      field-label="From"
    >
      <tm-field
        id="from"
        v-model="selectedIndex"
        :title="fromOptions[selectedIndex].address"
        :options="fromOptions"
        type="select"
      />
    </tm-form-group>
    <tm-form-group
      class="delegation-modal-form-group"
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
    <div class="delegation-modal-footer">
      <tm-btn
        id="submit-delegation"
        :disabled="$v.$invalid"
        color="primary"
        value="Submit"
        @click.native="onDelegation"
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
  props: {
    fromOptions: {
      type: Array,
      required: true
    },
    to: {
      type: String,
      required: true
    }
  },
  data: () => ({
    amount: 0,
    selectedIndex: 0,
    password: ``,
    showPassword: false
  }),
  computed: {
    ...mapGetters([`bondingDenom`])
  },
  validations() {
    return {
      amount: {
        required,
        isInteger,
        between: between(1, this.fromOptions[this.selectedIndex].maximum)
      },
      password: {
        required
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
        from: this.fromOptions[this.selectedIndex].address,
        password: this.password
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
  justify-content: space-between;
  right: 2rem;
  padding: 3rem;
  position: fixed;
  bottom: 0;
  width: 100%;
  max-width: 600px;
  z-index: var(--z-modal);
}

.delegation-modal-header {
  align-items: center;
  display: flex;
  padding-bottom: 2rem;
}

.delegation-modal-atom {
  height: 3rem;
  width: 3rem;
}

.delegation-modal-form-group {
  display: block;
  padding: 0.5rem 0;
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
  padding: 2rem 0 0;
}

.delegation-modal-footer button {
  margin-left: 1rem;
}
</style>
