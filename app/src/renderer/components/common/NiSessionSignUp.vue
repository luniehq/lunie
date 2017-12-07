<template lang="pug">
.ni-session: form-struct(:submit='onSubmit').ni-session-container
  .ni-session-header
    a(@click="setState('welcome')"): i.material-icons arrow_back
    .ni-session-title New Account
    a(@click="help"): i.material-icons help_outline
  .ni-session-main
    form-group(field-id='sign-up-seed' field-label='Account Seed')
      field#sign-up-seed(
        disabled
        type="textarea"
        v-model="fields.signUpSeed"
        @input="$v.fields.signUpSeed.$touch()")
      form-msg(body='Please back up the seed phrase for this account. These words cannot be recovered!')

    form-group(field-id="sign-up-warning" field-label=' '
      :error='$v.fields.signUpWarning.$error')
      .ni-field-checkbox
        .ni-field-checkbox-input
          input#sign-up-warning(type="checkbox" v-model="fields.signUpWarning")
        label.ni-field-checkbox-label(for="sign-up-warning")
          | I understand that Cosmos cannot recover lost seed phrases.
      form-msg(name='Recovery confirmation' type='required' v-if='!$v.fields.signUpWarning.required')

    form-group(field-id="sign-up-backup" field-label=' '
      :error='$v.fields.signUpBackup.$error')
      .ni-field-checkbox(for="sign-up-backup")
        .ni-field-checkbox-input
          input#sign-up-backup(type="checkbox" v-model="fields.signUpBackup")
        label.ni-field-checkbox-label(for="sign-up-backup")
          | I have securely backed up my generated seed phrase.
      form-msg(name='Backup confirmation' type='required' v-if='!$v.fields.signUpBackup.required')
  .ni-session-footer
    btn(icon="create" value="Create Account" size="lg")
</template>

<script>
import {required} from 'vuelidate/lib/validators'
import Btn from '@nylira/vue-button'
import Field from '@nylira/vue-field'
import FieldGroup from 'common/NiFieldGroup'
import FormGroup from 'common/NiFormGroup'
import FormMsg from '@nylira/vue-form-msg'
import FormStruct from 'common/NiFormStruct'
export default {
  name: 'ni-session-sign-up',
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
      signUpSeed: 'one two three four five six seven eight nine ten eleven twelve',
      signUpWarning: false,
      signUpBackup: false
    }
  }),
  methods: {
    help () { this.$store.commit('setModalHelp', true) },
    setState (value) { this.$store.commit('setModalSessionState', value) },
    onSubmit () {
      this.$v.$touch()
      if (this.$v.$error) return
      this.$store.commit('setModalSession', false)
      this.$store.commit('notify', { title: 'Welcome!', body: 'Your account has been created.' })
      this.$store.commit('setSignedIn', true)
    }
  },
  mounted () {
    this.$el.querySelector('#sign-up-warning').focus()
  },
  validations: () => ({
    fields: {
      signUpWarning: { required },
      signUpBackup: { required }
    }
  })
}
</script>
