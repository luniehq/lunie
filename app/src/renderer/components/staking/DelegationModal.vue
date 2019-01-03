<template>
  <action-modal
    id="delegation-modal"
    title="Delegation"
    class="delegation-modal"
    @:close-action-modal="close()"
  >
    <tm-form-group
      class="action-modal-form-group"
      field-id="to"
      field-label="To"
    >
      <tm-field id="to" v-model="to" type="text" readonly />
    </tm-form-group>

    <tm-form-group
      class="action-modal-form-group"
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
      :error="$v.amount.$invalid"
      class="action-modal-form-group"
      field-id="amount"
      field-label="Amount"
    >
      <span class="input-suffix">{{ bondingDenom }}</span>
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
        id="submit-delegation"
        :disabled="$v.$invalid"
        color="primary"
        value="Submit"
        @click.native="onDelegation"
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
  name: `delegation-modal`,
  directives: {
    ClickOutside
  },
  components: {
    Modal,
    TmBtn,
    TmField,
    TmFormGroup,
    TmFormMsg,
    ActionModal
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
