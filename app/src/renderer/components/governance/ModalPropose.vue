<template>
  <action-modal title="Proposal" @close-action-modal="close">
    <tm-form-group
      :error="$v.title.error && $v.title.$invalid"
      class="action-modal-form-group"
      field-id="title"
      field-label="Title"
    >
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
      class="action-modal-form-group"
      field-id="description"
      field-label="Description"
    >
      <tm-field
        id="description"
        v-model.trim="description"
        type="textarea"
        class="textarea-large"
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
      class="action-modal-form-group"
      field-id="amount"
      field-label="Amount"
    >
      <span class="input-suffix">{{ denom }}</span>
      <tm-field
        id="amount"
        :max="balance"
        :min="0"
        v-model="amount"
        type="number"
      />
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
      <hr />
    </tm-form-group>
    <tm-form-group
      class="modal-propose-form-group"
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
        id="submit-proposal"
        :disabled="$v.$invalid"
        color="primary"
        value="Submit Proposal"
        @click.native="onPropose"
      />
    </div>
  </action-modal>
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
import ActionModal from "common/ActionModal"

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
    ActionModal,
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
        between: between(1, this.balance)
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
.textarea-large {
  min-height: 240px;
}
</style>
