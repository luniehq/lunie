<template lang='pug'>
.page.page-sign-in
  page-header(title='Sign In')
  form-struct(:submit='onSubmit')
    form-group(:error='$v.fields.seed.$error')
      field(
        theme='cosmos'
        type='text'
        placeholder='Input seed...'
        v-model='fields.seed')
      form-msg(
        name='Seed'
        type='required'
        v-if='!$v.fields.seed.required')
      form-msg(
        name='Seed'
        type='error'
        v-if='!$v.fields.seed.valid')
    div(slot='footer')
      btn(theme='cosmos' type='submit' icon='search' value='Sign In')
</template>

<script>
import { required } from 'vuelidate/lib/validators'
import Btn from '@nylira/vue-button'
import Field from '@nylira/vue-input'
import FormGroup from './FormGroup'
import FormMsg from './FormMsg'
import FormStruct from './FormStruct'
import PageHeader from './PageHeader'
export default {
  name: 'page-sign-in',
  components: {
    Btn,
    Field,
    FormGroup,
    FormMsg,
    FormStruct,
    PageHeader
  },
  data: () => ({
    fields: {
      seed: ''
    }
  }),
  methods: {
    onSubmit () {
      this.$v.$touch()
      if (!this.$v.$error) {
        console.log('sign in form validation success!')
        this.$store.commit('notifyCustom',
          { title: 'Sign In Successful',
            body: 'Welcome to the Cosmos Delegation Game!' })
        this.resetFields()
        this.$router.push('/')
      }
    },
    resetFields () {
      this.$v.$reset()
      this.fields = {
        seed: ''
      }
    }
  },
  validations: () => ({
    fields: {
      seed: {
        required
      }
    }
  })
}
</script>
