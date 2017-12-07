<template lang="pug">
.ni-session: form-struct(:submit='onSubmit').ni-session-container
  .ni-session-header
    a(@click="setState('welcome')"): i.material-icons arrow_back
    .ni-session-title Enter Seed
    a: i.material-icons help_outline
  .ni-session-main
    form-group(:error='$v.fields.signInSeed.$error'
      field-id='sign-in-seed' field-label='Account Seed')
      field#sign-in-seed(
        type="textarea"
        placeholder="Enter your 12-word seed here"
        v-model="fields.signInSeed"
        @input="$v.fields.signInSeed.$touch()")
      form-msg(name='Account Seed' type='required' v-if='!$v.fields.signInSeed.required')
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
      signInSeed: ''
    }
  }),
  methods: {
    setState (value) { this.$store.commit('setModalSessionState', value) },
    onSubmit () {
      this.$v.$touch()
      if (this.$v.$error) return
      this.$store.commit('setModalSession', false)
      this.$store.commit('notify', { title: 'Welcome back!', body: 'You are now signed in to your Cosmos account.' })
      this.$store.commit('setSignedIn', true)
    }
  },
  validations: () => ({
    fields: {
      signInSeed: { required }
    }
  })
}
</script>
