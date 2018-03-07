<template lang="pug">
.ni-session: form-struct(:submit='onSubmit').ni-session-container
  .ni-session-header
    a(@click="setState('welcome')"): i.material-icons arrow_back
    .ni-session-title Import with Seed
    a(@click="help"): i.material-icons help_outline
  .ni-session-main
    form-group(field-id='import-name' field-label='Account Name' :error='$v.fields.importName.$error')
      field#import-name(
        type="text"
        placeholder="Must have at least 5 characters"
        v-model="fields.importName")
      form-msg(name='Name' type='required' v-if='!$v.fields.importName.required')
      form-msg(name='Name' type='minLength' min="5" v-if='!$v.fields.importName.minLength')

    form-group(:error='$v.fields.importPassword.$error'
      field-id='import-password' field-label='Password')
      field#import-password(
        type="password"
        placeholder="Must be at least 10 characters"
        v-model="fields.importPassword")
      form-msg(name='Password' type='required' v-if='!$v.fields.importPassword.required')
      form-msg(name='Password' type='minLength' min="10" v-if='!$v.fields.importPassword.minLength')

    form-group(:error='$v.fields.importPasswordConfirm.$error'
      field-id='import-password-confirmation' field-label='Confirm Password')
      field#import-password-confirmation(
        type="password"
        placeholder="Enter password again"
        v-model="fields.importPasswordConfirm")
      form-msg(name='Password confirmation' type='match' v-if='!$v.fields.importPasswordConfirm.sameAsPassword')

    form-group(:error='$v.fields.importSeed.$error'
      field-id='import-seed' field-label='Seed Phrase')
      field-seed#import-seed(
        :value="fields.importSeed"
        @input="val => fields.importSeed = val"
        placeholder="Must be exactly 12 words")
      form-msg(name='Seed' type='required' v-if='!$v.fields.importSeed.required')

  .ni-session-footer
    btn(icon="arrow_forward" icon-pos="right" value="Next" size="lg")
</template>

<script>
import { required, minLength, sameAs } from 'vuelidate/lib/validators'
import Btn from '@nylira/vue-button'
import Field from '@nylira/vue-field'
import FieldGroup from 'common/NiFieldGroup'
import FieldSeed from 'common/NiFieldSeed'
import FormGroup from 'common/NiFormGroup'
import FormMsg from 'common/NiFormMsg'
import FormStruct from 'common/NiFormStruct'
export default {
  name: 'ni-session-import',
  components: {
    Btn,
    Field,
    FieldGroup,
    FieldSeed,
    FormGroup,
    FormMsg,
    FormStruct
  },
  data: () => ({
    fields: {
      importName: '',
      importPassword: '',
      importPasswordConfirm: '',
      importSeed: ''
    }
  }),
  methods: {
    help () { this.$store.commit('setModalHelp', true) },
    setState (value) { this.$store.commit('setModalSessionState', value) },
    async onSubmit () {
      this.$v.$touch()
      if (this.$v.$error) return
      try {
        let key = await this.$store.dispatch('createKey', {
          seedPhrase: this.fields.importSeed,
          password: this.fields.importPassword,
          name: this.fields.importName
        })
        if (key) {
          this.$store.commit('setModalSession', false)
          this.$store.commit('notify', { title: 'Welcome back!', body: 'Your account has been successfully imported.' })
          this.$store.dispatch('signIn', {
            account: this.fields.importName,
            password: this.fields.importPassword
          })
        }
      } catch (err) {
        this.$store.commit('notifyError', { title: `Couldn't create account`, body: err.message })
      }
    }
  },
  mounted () {
    this.$el.querySelector('#import-seed').focus()
  },
  validations: () => ({
    fields: {
      importName: { required, minLength: minLength(5) },
      importPassword: { required, minLength: minLength(10) },
      importPasswordConfirm: { sameAsPassword: sameAs('importPassword') },
      importSeed: { required }
    }
  })
}
</script>
