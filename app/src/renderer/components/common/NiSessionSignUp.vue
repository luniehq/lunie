<template lang="pug">
.ni-session: form-struct(:submit='onSubmit').ni-session-container
  .ni-session-header
    a(@click="setState('welcome')"): i.material-icons arrow_back
    .ni-session-title Create Account
    a(@click="help"): i.material-icons help_outline
  .ni-session-main
    form-group(field-id='sign-up-seed' field-label='Seed (write it down)')
      field-seed#sign-up-seed(v-model="fields.signUpSeed" disabled)
      form-msg(body='Please back up the seed phrase for this account. These words cannot be recovered!')

    form-group(:error='$v.fields.signInPassword.$error'
      field-id='sign-in-password' field-label='Password')
      field#sign-in-password(
        type="password"
        placeholder="at least 10 characters"
        v-model="fields.signInPassword")
      form-msg(body="Create a password to secure your new account")
      form-msg(name='Password' type='required' v-if='!$v.fields.signInPassword.required')
      form-msg(name='Password' type='minLength' min="10" v-if='!$v.fields.signInPassword.minLength')

    form-group(field-id="sign-up-warning" field-label=' '
      :error='$v.fields.signUpWarning.$error')
      .ni-field-checkbox
        .ni-field-checkbox-input
          input#sign-up-warning(type="checkbox" v-model="fields.signUpWarning")
        label.ni-field-checkbox-label(for="sign-up-warning")
          | I understand that lost seeds cannot be recovered.
      form-msg(name='Recovery confirmation' type='required' v-if='!$v.fields.signUpWarning.required')

    form-group(field-id="sign-up-backup" field-label=' '
      :error='$v.fields.signUpBackup.$error')
      .ni-field-checkbox(for="sign-up-backup")
        .ni-field-checkbox-input
          input#sign-up-backup(type="checkbox" v-model="fields.signUpBackup")
        label.ni-field-checkbox-label(for="sign-up-backup")
          | I have securely written down my seed.
      form-msg(name='Backup confirmation' type='required' v-if='!$v.fields.signUpBackup.required')
  .ni-session-footer
    btn(icon="arrow_forward" icon-pos="right" value="Next" size="lg" :disabled="creating")
</template>

<script>
import {required, minLength} from 'vuelidate/lib/validators'
import Btn from '@nylira/vue-button'
import Field from '@nylira/vue-field'
import FieldSeed from 'common/NiFieldSeed'
import FieldGroup from 'common/NiFieldGroup'
import FormGroup from 'common/NiFormGroup'
import FormMsg from '@nylira/vue-form-msg'
import FormStruct from 'common/NiFormStruct'
export default {
  name: 'ni-session-sign-up',
  components: {
    Btn,
    Field,
    FieldSeed,
    FieldGroup,
    FormGroup,
    FormMsg,
    FormStruct
  },
  data: () => ({
    creating: true,
    fields: {
      signUpSeed: 'Creating seed...',
      signInPassword: '',
      signUpWarning: false,
      signUpBackup: false
    }
  }),
  methods: {
    help () { this.$store.commit('setModalHelp', true) },
    setState (value) { this.$store.commit('setModalSessionState', value) },
    async onSubmit () {
      this.$v.$touch()
      if (this.$v.$error) return
      let key = await this.$store.dispatch('createKey', { seedPhrase: this.fields.signUpSeed, password: this.fields.signInPassword })
      if (key) {
        this.$store.commit('setModalSession', false)
        this.$store.commit('notify', { title: 'Signed Up', body: 'Your account has been created.' })
        this.$store.dispatch('signIn', {password: this.fields.signInPassword})
      }
    }
  },
  mounted () {
    this.$el.querySelector('#sign-up-warning').focus()
    this.$store.dispatch('createSeed')
      .then(seedPhrase => {
        this.creating = false
        this.fields.signUpSeed = seedPhrase
      })
  },
  validations: () => ({
    fields: {
      signInPassword: { required, minLength: minLength(10) },
      signUpWarning: { required },
      signUpBackup: { required }
    }
  })
}
</script>
