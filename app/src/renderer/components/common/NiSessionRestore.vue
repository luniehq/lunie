<template lang="pug">
.ni-session: form-struct(:submit='onSubmit').ni-session-container
  .ni-session-header
    a(@click="setState('welcome')"): i.material-icons arrow_back
    .ni-session-title Restore Account
    a(@click="help"): i.material-icons help_outline
  .ni-session-main
    form-group(:error='$v.fields.restoreSeed.$error'
      field-id='restore-seed' field-label='Seed')
      field-seed#restore-seed(
        :value="fields.restoreSeed"
        @input="val => fields.restoreSeed = val"
        placeholder="must be exactly 12 words")
      form-msg(name='Seed' type='required' v-if='!$v.fields.restoreSeed.required')

    form-group(:error='$v.fields.signInPassword.$error'
      field-id='sign-in-password' field-label='Password')
      field#sign-in-password(
        type="password"
        placeholder="at least 10 characters"
        v-model="fields.signInPassword")
      form-msg(body="Create a password to secure your restored account")
      form-msg(name='Password' type='required' v-if='!$v.fields.signInPassword.required')
      form-msg(name='Password' type='minLength' min="10" v-if='!$v.fields.signInPassword.minLength')
  .ni-session-footer
    btn(icon="arrow_forward" icon-pos="right" value="Next" size="lg")
</template>

<script>
import {required, minLength} from 'vuelidate/lib/validators'
import Btn from '@nylira/vue-button'
import Field from '@nylira/vue-field'
import FieldGroup from 'common/NiFieldGroup'
import FieldSeed from 'common/NiFieldSeed'
import FormGroup from 'common/NiFormGroup'
import FormMsg from '@nylira/vue-form-msg'
import FormStruct from 'common/NiFormStruct'
export default {
  name: 'ni-session-restore',
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
      signInPassword: '',
      restoreSeed: ''
    }
  }),
  methods: {
    help () { this.$store.commit('setModalHelp', true) },
    setState (value) { this.$store.commit('setModalSessionState', value) },
    async onSubmit () {
      this.$v.$touch()
      if (this.$v.$error) return
      let key = await this.$store.dispatch('createKey', { seedPhrase: this.fields.restoreSeed, password: this.fields.signInPassword })
      if (key) {
        this.$store.commit('setModalSession', false)
        this.$store.commit('notify', { title: 'Welcome back!', body: 'Your account has been successfully restored.' })
        this.$store.dispatch('signIn', {password: this.fields.signInPassword})
      }
    }
  },
  mounted () {
    this.$el.querySelector('#restore-seed').focus()
  },
  validations: () => ({
    fields: {
      signInPassword: { required, minLength: minLength(10) },
      restoreSeed: { required }
    }
  })
}
</script>
