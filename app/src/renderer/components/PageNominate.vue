<template lang='pug'>
.page.page-nominate
  page-header(title='Self-Nomination')
  form-struct(:submit='onSubmit')
    form-group(:error='$v.fields.keybase.$error')
      label(for='form-nominate-keybase') Keybase ID
      field(
        id='form-nominate-keybase'
        theme='cosmos'
        type='text'
        placeholder='Keybase ID'
        v-model='fields.keybase')
      form-msg
        div Don't have a Keybase ID? Create one at #[a.open-in-browser(href="https://keybase.io") keybase.io]
      form-msg(name='Keybase ID' type='required'
        v-if='!$v.fields.keybase.required')
      form-msg(name='Keybase ID' type='length'
        :min="config.CANDIDATE.KEYBASE_MIN" :max="config.CANDIDATE.KEYBASE_MAX"
        v-if='!$v.fields.keybase.minLength || !$v.fields.keybase.maxLength')

    form-group(:error='$v.fields.description.$error')
      label(for='form-nominate-description') Description
      field(
        id='form-nominate-description'
        theme='cosmos'
        type='textarea'
        placeholder='Have a message for delegators? Write it here.'
        v-model='fields.description')
      form-msg(name='Description' type='required'
        v-if='!$v.fields.description.required')
      form-msg(name='Description' type='length'
        :min="config.CANDIDATE.DESCRIPTION_MIN" :max="config.CANDIDATE.DESCRIPTION_MAX"
        v-if='!$v.fields.description.minLength || !$v.fields.description.maxLength')

    form-group(:error='$v.fields.serverPower.$error')
      label(for='form-nominate-server-power') Server Power
      field(
        id='form-nominate-server-power'
        theme='cosmos'
        type='textarea'
        placeholder='Network connection, RAM, HDD space, OS, units, etc.'
        v-model='fields.serverPower')
      form-msg(name='Server Power' type='required'
        v-if='!$v.fields.serverPower.required')
      form-msg(name='Server Power' type='length'
        :min="config.CANDIDATE.DESCRIPTION_MIN" :max="config.CANDIDATE.DESCRIPTION_MAX"
        v-if='!$v.fields.serverPower.minLength || !$v.fields.serverPower.maxLength')

    form-group(:error='$v.fields.startDate.$error')
      label(for='form-nominate-start-date') Start Date
      field(
        id='form-nominate-start-date'
        theme='cosmos'
        type='datetime'
        placeholder='Select start date...'
        v-model='fields.startDate')
      form-msg(name='Start Date' type='required'
        v-if='!$v.fields.startDate.required')
      form-msg(name='Start Date' type='datetime'
        v-if='!$v.fields.startDate.datetime')

    form-group(:error='$v.fields.commission.$error')
      label(for='form-nominate-commission') Commission
      field-group
        field(
          id='form-nominate-commission'
          theme='cosmos'
          type='number'
          step='any'
          placeholder='Enter rate...'
          v-model.number='fields.commission')
        .ni-field-addon %
      form-msg(name='Commission' type='required'
        v-if='!$v.fields.commission.required')
      form-msg(name="Commission" type="between"
        :min="config.CANDIDATE.COMMISSION_MIN" :max="config.CANDIDATE.COMMISSION_MAX"
        v-if="!$v.fields.commission.between")

    form-group(:error='$v.fields.country.$error')
      label(for='form-nominate-country') Country
      field(
        id='form-nominate-country'
        theme='cosmos'
        type='country'
        placeholder='Select Country'
        v-model='fields.country')
      form-msg(name='Country' type='required'
        v-if='!$v.fields.country.required')

    form-group(:error='$v.fields.website.$error')
      label(for='form-nominate-website') Website
      field(
        id='form-nominate-website'
        theme='cosmos'
        type='text'
        placeholder='https://'
        v-model='fields.website')
      form-msg( name='Website' type='required'
        v-if='!$v.fields.website.required')
      form-msg(name='Website' type='url'
        v-if='!$v.fields.website.url')

    div(slot='footer')
      div
      btn(theme='cosmos' type='submit' icon='check' value='Submit Nomination')
</template>

<script>
import { mapGetters } from 'vuex'
import { between, minLength, maxLength, required, url } from 'vuelidate/lib/validators'
import moment from 'moment'
import Btn from '@nylira/vue-button'
import Field from './NiField'
import FieldGroup from './NiFieldGroup'
import FormGroup from './FormGroup'
import FormMsg from './FormMsg'
import FormStruct from './FormStruct'
import PageHeader from './PageHeader'
export default {
  name: 'page-nominate',
  components: {
    Btn,
    Field,
    FieldGroup,
    FormGroup,
    FormMsg,
    FormStruct,
    PageHeader
  },
  computed: {
    ...mapGetters(['config'])
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
    }
  }),
  methods: {
    onSubmit () {
      this.$v.$touch()
      if (!this.$v.$error) {
        this.$store.commit('submitNomination', this.fields)
        this.$store.commit('notifyCustom',
          { title: 'Nominination Submitted',
            body: 'Well done! You\'ll appear on the candidates list in a moment.' })
        this.resetFields()
        this.$router.push('/')
      } else {
        console.log('error in form', this.$v.$error)
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
        required,
        minLength (x) { return minLength(this.config.CANDIDATE.KEYBASE_MIN)(x) },
        maxLength (x) { return maxLength(this.config.CANDIDATE.KEYBASE_MAX)(x) }
      },
      country: {
        required
      },
      website: {
        required,
        url
      },
      startDate: {
        required,
        datetime (x) {
          return moment(x).isValid()
        }
      },
      commission: {
        between (x) {
          return between(
            this.config.CANDIDATE.COMMISSION_MIN,
            this.config.CANDIDATE.COMMISSION_MAX)(x)
        },
        required
      },
      serverPower: {
        required,
        minLength (x) { return minLength(this.config.CANDIDATE.DESCRIPTION_MIN)(x) },
        maxLength (x) { return maxLength(this.config.CANDIDATE.DESCRIPTION_MAX)(x) }
      },
      description: {
        required,
        minLength (x) { return minLength(this.config.CANDIDATE.DESCRIPTION_MIN)(x) },
        maxLength (x) { return maxLength(this.config.CANDIDATE.DESCRIPTION_MAX)(x) }
      }
    }
  })
}
</script>
