<template>
  <div class="tm-session">
    <tm-form-struct :submit="onSubmit" class="tm-session-container">
      <div class="tm-session-header">
        <a
          @click="setState('sign-in')"
        >
          <i class="material-icons">arrow_back</i>
        </a>
        <div class="tm-session-title">
          Remove Account
        </div>
      </div>
      <div class="tm-session-main">
        <tm-form-group
          :error="$v.deletionPassword.$error"
          field-id="sign-in-password"
          field-label="Password"
        >
          <tm-field
            id="sign-in-password"
            v-model="deletionPassword"
            type="password"
            placeholder="Enter your password"
          />
          <tm-form-msg
            v-if="!$v.deletionPassword.required"
            name="Password"
            type="required"
          />
          <tm-form-msg
            v-if="!$v.deletionPassword.minLength"
            name="Password"
            type="minLength"
            min="10"
          />
        </tm-form-group>
        <tm-form-group
          :error="$v.deletionWarning.$error"
          field-id="sign-up-warning"
          field-label=" "
        >
          <div class="tm-field-checkbox">
            <div class="tm-field-checkbox-input">
              <input
                id="sign-up-warning"
                v-model="deletionWarning"
                type="checkbox"
              >
            </div>
            <label
              class="tm-field-checkbox-label"
              for="sign-up-warning"
            >
              I understand that Cosmos cannot recover deleted accounts without
              the passphrase.
            </label>
          </div>
          <tm-form-msg
            v-if="!$v.deletionWarning.required"
            name="Deletion confirmation"
            type="required"
          />
        </tm-form-group>
      </div>
      <div class="tm-session-footer">
        <tm-btn
          icon="exit_to_app"
          value="Sign Out and Remove Account"
          size="lg"
        />
      </div>
    </tm-form-struct>
  </div>
</template>

<script>
import {
  required, minLength, sameAs
} from "vuelidate/lib/validators"
import TmBtn from "common/TmBtn"
import TmFormGroup from "common/TmFormGroup"
import TmFormStruct from "common/TmFormStruct"
import TmField from "common/TmField"
import TmFormMsg from "common/TmFormMsg"
export default {
  name: `tm-session-account-delete`,
  components: {
    TmBtn,
    TmField,
    TmFormGroup,
    TmFormMsg,
    TmFormStruct
  },
  data: () => ({
    deletionPassword: ``,
    deletionWarning: false
  }),
  mounted() {
    this.$el.querySelector(`#sign-in-password`).focus()
  },
  methods: {
    setState(value) {
      this.$store.commit(`setSessionModalView`, value)
    },
    async onSubmit() {
      this.$v.$touch()
      if (this.$v.$error) return
      try {
        const success = await this.$store.dispatch(`deleteKey`, {
          password: this.deletionPassword
        })
        if (success) {
          this.setState(`welcome`)
          this.$store.commit(`notify`, {
            title: `Account Deleted`,
            body: `You have successfully deleted the account 'default'`
          })
        }
      } catch (error) {
        this.$store.commit(`notifyError`, {
          title: `Account Deletion Failed`,
          body: error.message
        })
      }
    }
  },
  validations: () => ({
    deletionPassword: {
      required, minLength: minLength(10)
    },
    deletionWarning: {
      required: sameAs(() => true)
    }
  })
}
</script>
