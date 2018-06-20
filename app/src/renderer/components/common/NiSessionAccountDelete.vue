<template lang="pug">
.tm-session: tm-form-struct(:submit='onSubmit').tm-session-container
  .tm-session-header
    a(@click="setState('sign-in')"): i.material-icons arrow_back
    .tm-session-title Remove Account
    a(@click="help"): i.material-icons help_outline
  .tm-session-main
    tm-form-group(:error='$v.fields.deletionPassword.$error'
      field-id='sign-in-password' field-label='Password')
      tm-field#sign-in-password(
        type="password"
        placeholder="Enter your password"
        v-model="fields.deletionPassword")
      tm-form-msg(name='Password' type='required' v-if='!$v.fields.deletionPassword.required')
      tm-form-msg(name='Password' type='minLength' min="10" v-if='!$v.fields.deletionPassword.minLength')

    tm-form-group(field-id="sign-up-warning" field-label=' '
      :error='$v.fields.deletionWarning.$error')
      .tm-field-checkbox
        .tm-field-checkbox-input
          input#sign-up-warning(type="checkbox" v-model="fields.deletionWarning")
        label.tm-field-checkbox-label(for="sign-up-warning")
          | I understand that Cosmos cannot recover deleted accounts without the passphrase.
      tm-form-msg(name='Deletion confirmation' type='required' v-if='!$v.fields.deletionWarning.required')
  .tm-session-footer
    tm-btn(icon="exit_to_app" value="Sign Out and Remove Account" size="lg")
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
  name: "tm-session-account-delete",
  components: {
    TmBtn,
    TmField,
    TmFormGroup,
    TmFormMsg,
    TmFormStruct
  },
  data: () => ({ fields: { deletionPassword: "" } }),
  methods: {
    help() {
      this.$store.commit("setModalHelp", true)
    },
    setState(value) {
      this.$store.commit("setModalSessionState", value)
    },
    async onSubmit() {
      this.$v.$touch()
      if (this.$v.$error) return
      try {
        let success = await this.$store.dispatch("deleteKey", {
          password: this.fields.deletionPassword
        })
        if (success) {
          this.setState("welcome")
          this.$store.commit("notify", {
            title: "Account Deleted",
            body: `You have successfully deleted the account 'default'`
          })
        }
      } catch (err) {
        this.$store.commit("notifyError", {
          title: "Account Deletion Failed",
          body: err.message
        })
      }
    }
  },
  mounted() {
    this.$el.querySelector("#sign-in-password").focus()
  },
  validations: () => ({
    fields: {
      deletionPassword: { required, minLength: minLength(10) },
      deletionWarning: { required }
    }
  })
}
</script>
