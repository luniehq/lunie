<template lang='pug'>
.page.page-nominate
  page-header(title='Nominate Self')
  form-struct(:submit='onSubmit')
    form-group(:error='$v.fields.keybase.$error')
      label(for='form-nominate-keybase') Keybase ID
      field(
        id='form-nominate-keybase'
        theme='cosmos'
        type='text'
        placeholder='Keybase ID'
        v-model='fields.keybase')
      form-msg(
        name='Keybase ID'
        type='required'
        v-if='!$v.fields.keybase.required')

    form-group(:error='$v.fields.country.$error')
      label(for='form-nominate-country') Country
      field(
        id='form-nominate-country'
        theme='cosmos'
        type='country'
        placeholder='Select Country'
        v-model='fields.country')
      form-msg(
        name='Country'
        type='required'
        v-if='!$v.fields.country.required')

    form-group(:error='$v.fields.description.$error')
      label(for='form-nominate-description') Description
      field(
        id='form-nominate-description'
        theme='cosmos'
        type='textarea'
        placeholder='Have a message for delegators? Write it here.'
        v-model='fields.description')
      form-msg(
        name='Description'
        type='required'
        v-if='!$v.fields.description.required')

    form-group(:error='$v.fields.serverPower.$error')
      label(for='form-nominate-server-power') Server Power
      field(
        id='form-nominate-server-power'
        theme='cosmos'
        type='textarea'
        placeholder='Network connection, RAM, HDD space, OS, units, etc.'
        v-model='fields.serverPower')
      form-msg(
        name='Server Power'
        type='required'
        v-if='!$v.fields.serverPower.required')

    form-group(:error='$v.fields.startDate.$error')
      label(for='form-nominate-start-date') Start Date
      field(
        id='form-nominate-start-date'
        theme='cosmos'
        type='datetime'
        placeholder='Select start date...'
        v-model='fields.startDate')
      form-msg(
        name='Start Date'
        type='required'
        v-if='!$v.fields.startDate.required')

    form-group(:error='$v.fields.commission.$error')
      label(for='form-nominate-commission') Commission
      field(
        id='form-nominate-commission'
        theme='cosmos'
        type='number'
        placeholder='0.0'
        v-model='fields.commission')
      form-msg(
        name='Commission'
        type='required'
        v-if='!$v.fields.commission.required')

    form-group(:error='$v.fields.website.$error')
      label(for='form-nominate-website') Website
      field(
        id='form-nominate-website'
        theme='cosmos'
        type='text'
        placeholder='https://'
        v-model='fields.website')
      form-msg(
        name='Website'
        type='required'
        v-if='!$v.fields.website.required')

    div(slot='footer')
      btn(theme='cosmos' type='submit' icon='check' value='Submit Nomination')
</template>

<script>
import { required } from 'vuelidate/lib/validators'
import Btn from '@nylira/vue-button'
import Field from './NiField'
import FormGroup from './FormGroup'
import FormMsg from './FormMsg'
import FormStruct from './FormStruct'
import PageHeader from './PageHeader'
export default {
  name: 'page-nominate',
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
      keybase: '',
      country: '',
      website: '',
      startDate: '',
      commission: '',
      serverPower: '',
      description: ''
    },
    options: [
      { key: 'One', value: '1' },
      { key: 'Two', value: '1' },
      { key: 'Three', value: '1' }
    ]
  }),
  methods: {
    onSubmit () {
      this.$v.$touch()
      if (!this.$v.$error) {
        this.$store.commit('notifyCustom',
          { title: 'Nominination Submitted',
            body: `Well done! You should appear on the list of candidates shortly.` })
        this.resetFields()
        this.$router.push('/')
      }
    },
    resetFields () {
      this.$v.$reset()
      this.fields = {
        keybase: '',
        country: '',
        website: '',
        startDate: '',
        commission: '',
        serverPower: '',
        description: ''
      }
    }
  },
  validations: () => ({
    fields: {
      keybase: {
        required
      },
      country: {
        required
      },
      website: {
        required
      },
      startDate: {
        required
      },
      commission: {
        required
      },
      serverPower: {
        required
      },
      description: {
        required
      }
    }
  })
}
</script>
