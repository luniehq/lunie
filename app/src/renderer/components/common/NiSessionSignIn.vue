<template lang="pug">
.ni-session: form-struct(:submit='onSubmit').ni-session-container
  .ni-session-header
    .ni-session-title Sign In
    a(@click="help"): i.material-icons help_outline
  .ni-session-main
    form-group(:error='$v.fields.signInPassword.$error'
      field-id='sign-in-password' field-label='Password')
      field#sign-in-password(
        type="password"
        v-model="fields.signInPassword")
      form-msg(name='Password' type='required' v-if='!$v.fields.signInPassword.required')
      form-msg(name='Password' type='minLength' min="10" v-if='!$v.fields.signInPassword.minLength')
    form-group
      a(@click="setState('delete')") Sign Out and Remove Account
  .ni-session-footer
    btn(icon="arrow_forward" icon-pos="right" value="Next" size="lg")
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
    async onSubmit () {
      this.$v.$touch()
      if (this.$v.$error) return
      try {
        await this.$store.dispatch('testLogin', {password: this.fields.signInPassword})
        this.$store.dispatch('signIn', {password: this.fields.signInPassword})
        this.$store.commit('setModalSession', false)
        this.$store.commit('notify', { title: 'Signed In', body: `You are now signed in to your Cosmos account.` })
      } catch (err) {
        this.$store.commit('notifyError', { title: 'Signing In Failed', body: err.message })
      }
    }
  },
  mounted () {
    this.$el.querySelector('#sign-in-password').focus()
  },
  validations: () => ({
    fields: {
      signInPassword: { required, minLength: minLength(10) }
    }
  })
}
</script>
<style lang="stylus">
  .ni-form-group
    a
      cursor pointer
</style>
