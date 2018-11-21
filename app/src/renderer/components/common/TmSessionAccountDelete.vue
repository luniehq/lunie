<template>
  <div class="tm-session">
    <tm-form-struct class="tm-session-container" :submit="onSubmit">
      <div class="tm-session-header">
        <a @click="setState('sign-in')"
          ><i class="material-icons">arrow_back</i></a
        >
        <div class="tm-session-title">Remove Account</div>
        <a @click="help"><i class="material-icons">help_outline</i></a>
      </div>
      <div class="tm-session-main">
        <tm-form-group
          :error="$v.fields.deletionPassword.$error"
          field-id="sign-in-password"
          field-label="Password"
        >
          <tm-field
            id="sign-in-password"
            type="password"
            placeholder="Enter your password"
            v-model="fields.deletionPassword"
          ></tm-field>
          <tm-form-msg
            name="Password"
            type="required"
            v-if="!$v.fields.deletionPassword.required"
          ></tm-form-msg>
          <tm-form-msg
            name="Password"
            type="minLength"
            min="10"
            v-if="!$v.fields.deletionPassword.minLength"
          ></tm-form-msg>
        </tm-form-group>
        <tm-form-group
          field-id="sign-up-warning"
          field-label=" "
          :error="$v.fields.deletionWarning.$error"
        >
          <div class="tm-field-checkbox">
            <div class="tm-field-checkbox-input">
              <input
                id="sign-up-warning"
                type="checkbox"
                v-model="fields.deletionWarning"
              />
            </div>
            <label class="tm-field-checkbox-label" for="sign-up-warning"
              >I understand that Cosmos cannot recover deleted accounts without
              the passphrase.</label
            >
          </div>
          <tm-form-msg
            name="Deletion confirmation"
            type="required"
            v-if="!$v.fields.deletionWarning.required"
          ></tm-form-msg>
        </tm-form-group>
      </div>
      <div class="tm-session-footer">
        <tm-btn
          icon="exit_to_app"
          value="Sign Out and Remove Account"
          size="lg"
        ></tm-btn>
      </div>
    </tm-form-struct>
  </div>
</template>

<script>
import { required, minLength } from "vuelidate/lib/validators"
import {
  TmBtn,
  TmFormGroup,
  TmFormStruct,
  TmField,
  TmFormMsg
} from "@tendermint/ui"
export default {
  name: `tm-session-account-delete`,
  components: {
    TmBtn,
    TmField,
    TmFormGroup,
    TmFormMsg,
    TmFormStruct
  },
  data: () => ({ fields: { deletionPassword: `` } }),
  mounted() {
    this.$el.querySelector(`#sign-in-password`).focus()
  },
  methods: {
    help() {
      this.$store.commit(`setModalHelp`, true)
    },
    setState(value) {
      this.$store.commit(`setModalSessionState`, value)
    },
    async onSubmit() {
      this.$v.$touch()
      if (this.$v.$error) return
      try {
        let success = await this.$store.dispatch(`deleteKey`, {
          password: this.fields.deletionPassword
        })
        if (success) {
          this.setState(`welcome`)
          this.$store.commit(`notify`, {
            title: `Account Deleted`,
            body: `You have successfully deleted the account 'default'`
          })
        }
      } catch (err) {
        this.$store.commit(`notifyError`, {
          title: `Account Deletion Failed`,
          body: err.message
        })
      }
    }
  },
  validations: () => ({
    fields: {
      deletionPassword: { required, minLength: minLength(10) },
      deletionWarning: { required }
    }
  })
}
</script>
