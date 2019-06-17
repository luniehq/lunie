<template>
  <div class="tm-session">
    <TmFormStruct :submit="onSubmit" class="tm-session-container">
      <div class="tm-session-header">
        <a @click="setState('sign-in')">
          <i class="material-icons">arrow_back</i>
        </a>
        <div class="tm-session-title">
          Remove Account
        </div>
      </div>
      <div class="tm-session-main">
        <TmFormGroup
          :error="$v.deletionPassword.$error"
          field-id="sign-in-password"
          field-label="Password"
        >
          <TmField
            id="sign-in-password"
            v-model="deletionPassword"
            type="password"
            placeholder="Enter your password"
          />
          <TmFormMsg
            v-if="!$v.deletionPassword.required"
            name="Password"
            type="required"
          />
          <TmFormMsg
            v-if="!$v.deletionPassword.minLength"
            name="Password"
            type="minLength"
            min="10"
          />
        </TmFormGroup>
        <TmFormGroup
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
              />
            </div>
            <label class="tm-field-checkbox-label" for="sign-up-warning">
              I understand that Cosmos cannot recover deleted accounts without
              the passphrase.
            </label>
          </div>
          <TmFormMsg
            v-if="!$v.deletionWarning.required"
            name="Deletion confirmation"
            type="required"
          />
        </TmFormGroup>
      </div>
      <div class="tm-session-footer">
        <TmBtn icon="exit_to_app" value="Sign Out and Remove Account" />
      </div>
    </TmFormStruct>
  </div>
</template>

<script>
import { required, minLength, sameAs } from "vuelidate/lib/validators"
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
    deletionPassword: { required, minLength: minLength(10) },
    deletionWarning: { required: sameAs(() => true) }
  })
}
</script>
