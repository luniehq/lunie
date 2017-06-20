<template lang='pug'>
.page.page-nominate
  page-header
    div(slot="title")
      | Self-Nomination
      span(v-if="user.nominationActive")  (Update)
  form-struct(:submit='onSubmit')
    form-group(:error='$v.fields.id.$error')
      label(for='form-nominate-id') Keybase ID
      field(
        v-if="user.nominationActive"
        id='form-nominate-id'
        theme='cosmos'
        type='text'
        placeholder='Keybase ID'
        :value='fields.id'
        disabled)
      field(
        v-else
        id='form-nominate-id'
        theme='cosmos'
        type='text'
        placeholder='Keybase ID'
        v-model='fields.id')
      form-msg(v-if='!user.nominationActive'): div Don't have a Keybase ID? Create one at #[a.open-in-browser(href='https://id.io') id.io]
      form-msg(name='Keybase ID' type='required'
        v-if='!$v.fields.id.required')
      form-msg(name='Keybase ID' type='length'
        :min='config.CANDIDATE.KEYBASE_MIN' :max='config.CANDIDATE.KEYBASE_MAX'
        v-if='!$v.fields.id.minLength || !$v.fields.id.maxLength')

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
        :min='config.CANDIDATE.DESCRIPTION_MIN' :max='config.CANDIDATE.DESCRIPTION_MAX'
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
        :min='config.CANDIDATE.DESCRIPTION_MIN' :max='config.CANDIDATE.DESCRIPTION_MAX'
        v-if='!$v.fields.serverPower.minLength || !$v.fields.serverPower.maxLength')

    // form-group(:error='$v.fields.startDate.$error')
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

    form-group(:error='$v.fields.ipAddress.$error')
      label(for='form-nominate-ip-address') IP Address
      field-group
        field(
          id='form-nominate-ip-address'
          theme='cosmos'
          type='text'
          placeholder='Enter IP'
          v-model.trim='fields.ipAddress')
      form-msg(name='IP Address' type='required'
        v-if='!$v.fields.ipAddress.required')
      form-msg(name='IP Address' type='ipAddress'
        v-if='!$v.fields.ipAddress.ipAddress')

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

    form-group(:error='$v.fields.commissionPercent.$error')
      label(for='form-nominate-commission-percent') Commission
      field-group
        field(
          id='form-nominate-commission-percent'
          theme='cosmos'
          type='number'
          step='any'
          placeholder='Enter rate'
          v-model.number='fields.commissionPercent')
        .ni-field-addon %
      form-msg(name='Commission' type='required'
        v-if='!$v.fields.commissionPercent.required')
      form-msg(name='Commission' type='between'
        :min='config.CANDIDATE.COMMISSION_MIN' :max='config.CANDIDATE.COMMISSION_MAX'
        v-if='!$v.fields.commissionPercent.between')

    div(slot='footer')
      div
      btn(v-if='user.nominationActive'
        theme='cosmos' type='submit' icon='refresh' value='Update Nomination')
      btn(v-else
        theme='cosmos' type='submit' icon='check' value='Submit Nomination')
</template>

<script>
import { mapGetters } from 'vuex'
import { between, minLength, maxLength, required, url } from 'vuelidate/lib/validators'
import validateIP from 'validate-ip-node'
// import moment from 'moment'
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
    ...mapGetters(['config', 'user'])
  },
  data: () => ({
    edit: false,
    fields: {
      commissionPercent: '',
      country: '',
      description: '',
      id: '',
      ipAddress: '',
      serverPower: '',
      // startDate: '',
      website: ''
    }
  }),
  methods: {
    onSubmit () {
      this.$v.$touch()
      if (!this.$v.$error) {
        if (this.user.nominationActive) {
          this.$store.commit('updateCandidate', this.fields)
        } else {
          this.$store.commit('activateNomination')
          this.$store.commit('addCandidate', this.fields)
        }
        this.$store.commit('saveNomination', this.fields)
        this.resetFields()
        this.$router.push('/')
      } else {
        console.log('error in form', this.$v)
      }
    },
    resetFields () {
      this.$v.$reset()
      this.fields = {
        country: '',
        commissionPercent: '',
        description: '',
        ipAddress: '',
        id: '',
        serverPower: '',
        // startDate: '',
        website: ''
      }
    }
  },
  mounted () {
    if (this.user.nominationActive) {
      this.fields = JSON.parse(JSON.stringify(this.user.nomination))
    }
  },
  validations: () => ({
    fields: {
      id: {
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
      commissionPercent: {
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
      },
      /*
      startDate: {
        required,
        datetime (x) {
          return moment(x).isValid()
        }
      },
      */
      ipAddress: {
        required,
        ipAddress (x) { return validateIP(x) }
      }
    }
  })
}
</script>
