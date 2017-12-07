<template lang="pug">
.ni-session: form-struct(:submit='onSubmit').ni-session-container
  .ni-session-header
    a(@click="setState('welcome')"): i.material-icons arrow_back
    .ni-session-title Enter Password
    a(@click="help"): i.material-icons help_outline
  .ni-session-main
    form-group(:error='$v.fields.deletionPassword.$error'
      field-id='sign-in-password' field-label='Password')
      field#sign-in-password(
        type="password"
        placeholder="Enter your password"
        v-model="fields.deletionPassword")
      form-msg(name='Password' type='required' v-if='!$v.fields.deletionPassword.required')
      form-msg(name='Password' type='minLength' min="10" v-if='!$v.fields.deletionPassword.minLength')

    form-group(field-id="sign-up-warning" field-label=' '
      :error='$v.fields.deletionWarning.$error')
      .ni-field-checkbox
        .ni-field-checkbox-input
          input#sign-up-warning(type="checkbox" v-model="fields.deletionWarning")
        label.ni-field-checkbox-label(for="sign-up-warning")
          | I understand that Cosmos cannot recover deleted accounts without the passphrase.
      form-msg(name='Deletion confirmation' type='required' v-if='!$v.fields.deletionWarning.required')
  .ni-session-footer
    btn(icon="exit_to_app" value="Sign In" size="lg")
</template>

<script>
import {required, minLength} from 'vuelidate/lib/validators'
import Btn from '@nylira/vue-button'
import Field from '@nylira/vue-field'
import FieldGroup from 'common/NiFieldGroup'
import FormGroup from 'common/NiFormGroup'
import FormMsg from '@nylira/vue-form-msg'
import FormStruct from 'common/NiFormStruct'
export default {
  name: 'ni-session-account-delete',
  components: {
    Btn,
    Field,
    FieldGroup,
    FormGroup,
    FormMsg,
    FormStruct
  },
  data: () => ({
    fields: {
      deletionPassword: ''
    }
  }),
  methods: {
    help () { this.$store.commit('setModalHelp', true) },
    setState (value) { this.$store.commit('setModalSessionState', value) },
    async onSubmit () {
      this.$v.$touch()
      if (this.$v.$error) return
      try {
        let success = await this.$store.dispatch('deleteKey', {password: this.fields.deletionPassword})
        if (success) {
          this.setState('welcome')
          this.$store.commit('notify', { title: 'Account Deleted', body: `You have successfully deleted the account 'default'` })
        }
      } catch (err) {
        this.$store.commit('notifyError', { title: 'Account Deletio Failed', body: err.message })
      }
    }
  },
  mounted () {
    this.$el.querySelector('#sign-in-password').focus()
  },
  validations: () => ({
    fields: {
      deletionPassword: { required, minLength: minLength(10) },
      deletionWarning: { required }
    }
  })
}
</script>
