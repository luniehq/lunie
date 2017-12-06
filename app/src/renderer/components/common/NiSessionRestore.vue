<template lang="pug">
.ni-session: form-struct(:submit='onSubmit').ni-session-container
  .ni-session-header
    a(@click="setState('welcome')"): i.material-icons arrow_back
    .ni-session-title Enter Seed
    a: i.material-icons help_outline
  .ni-session-main
    form-group(:error='$v.fields.restoreSeed.$error'
      field-id='restore-seed' field-label='Account Seed')
      field#restore-seed(
        type="textarea"
        placeholder="Enter your 12-word seed here"
        v-model="fields.restoreSeed"
        @input="$v.fields.restoreSeed.$touch()")
      form-msg(name='Account Seed' type='required' v-if='!$v.fields.restoreSeed.required')
  .ni-session-footer
    btn(icon="settings_backup_restore" value="Restore Account" size="lg")
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
  name: 'ni-session-restore',
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
      restoreSeed: ''
    }
  }),
  methods: {
    setState (value) { this.$store.commit('setModalSessionState', value) },
    onSubmit () {
      this.$v.$touch()
      if (this.$v.$error) return
      this.$store.commit('setModalSession', false)
      this.$store.commit('notify', { title: 'Welcome back!', body: 'Your account has been successfully restored.' })
      this.$store.commit('setSignedIn', true)
    }
  },
  mounted () {
    document.querySelector('#restore-seed').focus()
  },
  validations: () => ({
    fields: {
      restoreSeed: { required }
    }
  })
}
</script>
