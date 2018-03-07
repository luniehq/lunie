<template lang="pug">
.ni-session: form-struct(:submit="onSubmit").ni-session-container
  .ni-session-header
    a(@click="setState('welcome')"): i.material-icons arrow_back
    .ni-session-title Sign In
    a(@click="help"): i.material-icons help_outline
  .ni-session-main
    form-group(field-id='sign-in-name' field-label='Select Account')
      field#sign-in-name(
        type="select"
        v-model="fields.signInName"
        placeholder="Select account…"
        :options="accounts")
      form-msg(name='Name' type='required' v-if='!$v.fields.signInName.required')

    form-group(:error='$v.fields.signInPassword.$error'
      field-id='sign-in-password' field-label='Password')
      field#sign-in-password(
        type="password"
        v-model="fields.signInPassword")
      form-msg(name='Password' type='required' v-if='!$v.fields.signInPassword.required')
      form-msg(name='Password' type='minLength' min="10" v-if='!$v.fields.signInPassword.minLength')
  .ni-session-footer
    btn(icon="arrow_forward" icon-pos="right" value="Next" size="lg")
</template>

<script>
import { mapGetters } from 'vuex'
import { required, minLength } from 'vuelidate/lib/validators'
import Btn from '@nylira/vue-button'
import Field from '@nylira/vue-field'
import FieldGroup from 'common/NiFieldGroup'
import FormGroup from 'common/NiFormGroup'
import FormMsg from 'common/NiFormMsg'
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
      signInName: '',
      signInPassword: ''
    }
  }),
  computed: {
    ...mapGetters(['user']),
    accounts () {
      let accounts = this.user.accounts
      accounts = accounts.filter(({ name }) => name !== 'trunk')
      return accounts.map(({ name }) => ({ key: name, value: name }))
    }
  },
  methods: {
    help () {
      this.$store.commit('setModalHelp', true)
    },
    setState (value) {
      this.$store.commit('setModalSessionState', value)
    },
    async onSubmit () {
      this.$v.$touch()
      if (this.$v.$error) return
      try {
        await this.$store.dispatch('testLogin', { password: this.fields.signInPassword, account: this.fields.signInName })
        this.$store.dispatch('signIn', { password: this.fields.signInPassword, account: this.fields.signInName })
        localStorage.setItem('prevAccountKey', this.fields.signInName)
        this.$store.commit('setModalSession', false)
      } catch (err) {
        this.$store.commit('notifyError', { title: 'Signing In Failed', body: err.message })
      }
    },
    setDefaultAccount () {
      let prevAccountKey = localStorage.getItem('prevAccountKey')
      let prevAccountExists = this.accounts.find(a => a.key === prevAccountKey)

      if (this.accounts.length === 1) {
        this.fields.signInName = this.accounts[0].key
      } else if (prevAccountExists) {
        this.fields.signInName = prevAccountKey
      }

      if (this.fields.signInName) {
        this.$el.querySelector('#sign-in-password').focus()
      } else {
        this.$el.querySelector('#sign-in-name').focus()
      }
    }
  },
  mounted () {
    this.setDefaultAccount(this.accounts)
  },
  validations: () => ({
    fields: {
      signInName: { required },
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
