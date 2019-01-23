<template>
  <action-modal
    id="modal-propose"
    ref="actionModal"
    title="Proposal"
    @close-action-modal="close"
  >
    <tm-form-group
      :error="$v.title.$error && $v.title.$invalid"
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
        v-if="$v.title.$error && !$v.title.maxLength"
        :max="$v.title.$params.maxLength.max"
        name="Proposal Title"
        type="maxLength"
      />
      <tm-form-msg
        v-if="$v.title.$error && !$v.title.required"
        name="Proposal Title"
        type="required"
      />
    </tm-form-group>
    <tm-form-group
      :error="$v.description.$error && $v.description.$invalid"
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
        v-if="$v.description.$error && !$v.description.maxLength"
        :max="$v.description.$params.maxLength.max"
        name="Description"
        type="maxLength"
      />
      <tm-form-msg
        v-if="$v.description.$error && !$v.description.required"
        name="Description"
        type="required"
      />
    </tm-form-group>
    <tm-form-group
      :error="$v.amount.$error && $v.amount.$invalid"
      class="action-modal-form-group"
      field-id="amount"
      field-label="Amount"
    >
      <span class="input-suffix">{{ denom }}</span>
      <tm-field id="amount" v-model="amount" type="number" />
      <tm-form-msg
        v-if="$v.amount.$error && !$v.amount.between && amount === 0"
        name="Amount"
        type="required"
      />
      <tm-form-msg
        v-if="balance === 0"
        :msg="`doesn't hold any ${denom}s`"
        name="Wallet"
        type="custom"
      />
      <tm-form-msg
        v-else-if="$v.amount.$error && !$v.amount.between && amount > 0"
        :max="$v.fields.amount.$params.between.max"
        :min="$v.fields.amount.$params.between.min"
        name="Amount"
        type="between"
      />
      <hr />
    </tm-form-group>
    <tm-form-group
      :error="$v.password.$error && $v.password.$invalid"
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
      <tm-form-msg
        v-if="$v.password.$error && !$v.password.required"
        name="Password"
        type="required"
      />
    </tm-form-group>
    <div class="action-modal-footer">
      <tm-btn
        v-if="sending"
        value="Sending..."
        disabled="disabled"
        color="primary"
      />
      <tm-btn
        v-else-if="!connected"
        value="Connecting..."
        disabled="disabled"
        color="primary"
      />
      <tm-btn
        v-else
        id="submit-proposal"
        color="primary"
        value="Submit Proposal"
        @click.native="validateForm"
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
    titleMaxLength: 64,
    descriptionMaxLength: 200,
    title: ``,
    description: ``,
    type: `Text`,
    amount: 0,
    password: ``,
    sending: false
  }),
  computed: {
    ...mapGetters([`wallet`, `connected`]),
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
        minLength: minLength(1),
        maxLength: maxLength(this.titleMaxLength),
        notBlank
      },
      description: {
        required,
        minLength: minLength(1),
        maxLength: maxLength(this.descriptionMaxLength),
        notBlank
      },
      type: {
        isValid
      },
      amount: {
        required,
        between: between(this.max ? 1 : 0, this.balance)
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
    async validateForm() {
      this.$v.$touch()

      if (!this.$v.$invalid) {
        await this.submitForm()
      }
    },
    async submitForm() {
      this.sending = true

      await this.$refs.actionModal.submit(async () => {
        await this.$store.dispatch(`submitProposal`, {
          title: this.title,
          description: this.description,
          type: this.type,
          initial_deposit: [
            {
              denom: this.denom,
              amount: String(this.amount)
            }
          ],
          password: this.password
        })
        this.$store.commit(`notify`, {
          title: `Successful proposal submission!`,
          body: `You have successfully submitted a new ${this.type.toLowerCase()} proposal`
        })
      }, `Submitting proposal failed`)

      this.sending = false
    }
  }
}
</script>
<style>
.textarea-large {
  min-height: 240px;
}
</style>
