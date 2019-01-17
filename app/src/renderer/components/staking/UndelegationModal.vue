<template>
  <action-modal
    id="undelegation-modal"
    title="Undelegation"
    class="undelegation-modal"
    @close-action-modal="close"
  >
    <tm-form-group
      v-if="fromOptions.length > 1"
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
      class="action-modal-form-group"
      field-id="to"
      field-label="To"
    >
      <tm-field id="to" v-model="to" readonly="readonly" />
    </tm-form-group>

    <tm-form-group
      :error="$v.amount.$error && $v.amount.$invalid"
      class="action-modal-form-group"
      field-id="amount"
      field-label="Amount"
    >
      <span class="input-suffix">{{ denom }}</span>
      <tm-field v-focus id="amount" v-model="amount" type="number" />
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
        id="submit-undelegation"
        color="primary"
        value="Submit Undelegation"
        @click.native="onUndelegate"
      />
    </div>
  </action-modal>
</template>

<script>
import ClickOutside from "vue-click-outside"
import { required, between, integer } from "vuelidate/lib/validators"
import ActionModal from "common/ActionModal"
import Modal from "common/TmModal"
import TmBtn from "common/TmBtn"
import TmField from "common/TmField"
import TmFormGroup from "common/TmFormGroup"
import TmFormMsg from "common/TmFormMsg"

export default {
  name: `undelegation-modal`,
  directives: {
    ClickOutside
  },
  components: {
    ActionModal,
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
    fromOptions: {
      type: Array,
      required: true
    },
    to: {
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
    selectedIndex: 0
  }),
  validations() {
    return {
      amount: {
        required,
        integer,
        between: between(1, this.maximum)
      },
      password: {
        required
      }
    }
  },
  methods: {
    close() {
      this.$emit(`update:showUndelegationModal`, false)
    },
    onUndelegate() {
      this.$emit(`submitUndelegation`, {
        amount: this.amount,
        password: this.password
      })
      this.close()
    }
  }
}
</script>
