<template lang="pug">
.ni-session: form-struct(:submit='onSubmit').ni-session-container
  .ni-session-header
    a(@click="setState('welcome')"): i.material-icons arrow_back
    .ni-session-title Enter Password
    a(@click="help"): i.material-icons help_outline
  .ni-session-main
    form-group(:error='$v.fields.signInPassword.$error'
      field-id='sign-in-password' field-label='Password')
      field#sign-in-password(
        type="password"
        placeholder="Enter your password"
        v-model="fields.signInPassword"
        @input="$v.fields.signInPassword.$touch()")
      form-msg(name='Password' type='required' v-if='!$v.fields.signInPassword.required')
  .ni-session-footer
    btn(icon="exit_to_app" value="Sign In" size="lg")
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
  name: 'ni-session-sign-in',
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
      signInPassword: ''
    }
  }),
  methods: {
    help () { this.$store.commit('setModalHelp', true) },
    setState (value) { this.$store.commit('setModalSessionState', value) },
    onSubmit () {
      this.$v.$touch()
      if (this.$v.$error) return
      this.$store.commit('setModalSession', false)
      this.$store.commit('notify', { title: 'Signed In (Seed)', body: 'TODO: REPLACE ME' })
      this.$store.commit('setSignedIn', true)
    }
  },
  mounted () {
    document.querySelector('#sign-in-password').focus()
  },
  validations: () => ({
    fields: {
      signInPassword: { required }
    }
  })
}
</script>
