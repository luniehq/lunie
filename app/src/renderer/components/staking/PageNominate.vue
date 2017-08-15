<template lang='pug'>
.page.page-nominate
  page-header
    div(slot="title")
      span(v-if='user.nominationActive') Edit Candidacy
      span(v-else) Self-Nomination
    btn(v-if='user.nominationActive' theme='cosmos' type='link'
      icon='eye' value='View Candidate'
      :to="{name: 'candidate', params: { candidate: fields.id }}")
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

    form-group(:error='$v.fields.serverDetails.$error')
      label(for='form-nominate-server-power') Server Power
      field(
        id='form-nominate-server-power'
        theme='cosmos'
        type='textarea'
        placeholder='Network connection, RAM, HDD space, OS, units, etc.'
        v-model='fields.serverDetails')
      form-msg(name='Server Power' type='required'
        v-if='!$v.fields.serverDetails.required')
      form-msg(name='Server Power' type='length'
        :min='config.CANDIDATE.DESCRIPTION_MIN' :max='config.CANDIDATE.DESCRIPTION_MAX'
        v-if='!$v.fields.serverDetails.minLength || !$v.fields.serverDetails.maxLength')

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

    form-group(:error='$v.fields.commissionPercent.$error')
      label(for='form-nominate-commission-percent') Commission Percent
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

    form-group(:error='$v.fields.ownCoinsBonded.$error')
      label(for='form-atoms-to-bond') Atoms To Bond
      field-group
        field(
          id='form-atoms-to-bond'
          theme='cosmos'
          type='number'
          step='any'
          placeholder='Enter how many of your own Atom to delegate to yourself'
          v-model.number='fields.ownCoinsBonded')
        .ni-field-addon %
      form-msg(name='OwnCoinsBonded' type='required'
        v-if='!$v.fields.ownCoinsBonded.required')
      form-msg(name='OwnCoinsBonded' type='between'
        :min='config.CANDIDATE.SELF_BOND_MIN' :max='config.CANDIDATE.SELF_BOND_MAX'
        v-if='!$v.fields.ownCoinsBonded.between')

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

    form-group(:error='$v.fields.ipAddress.$error')
      label(for='form-nominate-ip-address') Public IP Address (Optional)
      field-group
        field(
          id='form-nominate-address'
          theme='cosmos'
          type='text'
          placeholder='Enter IP'
          v-model.trim='fields.ipAddress')
      form-msg(name='IP Address' type='ipAddress'
        v-if='!$v.fields.ipAddress.ipAddress')

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
// import validateIP from 'validate-ip-node'
// import moment from 'moment'
import Btn from '@nylira/vue-button'
import Field from './NiField'
import FieldGroup from './NiFieldGroup'
import FormGroup from './FormGroup'
import FormMsg from './FormMsg'
import FormStruct from '../common/NiFormStruct'
import PageHeader from './PageHeader'
import { PrivKey } from 'tendermint-crypto'
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
  created () {
    if (!this.user.signedIn) { this.$store.commit('notifyAuthRequired') }
  },
  data: () => ({
    edit: false,
    fields: {
      atoms: '',
      ownCoinsBonded: '',
      commissionPercent: '',
      country: '',
      description: '',
      id: '',
      ipAddress: '',
      serverDetails: '',
      website: ''
    }
  }),
  methods: {
    onSubmit () {
      this.$v.$touch()
      if (this.$v.$error) {
        console.log('error in form', this.$v)
        return
      }
      if (this.user.nominationActive) {
        this.$store.commit('updateCandidate', this.fields)
        // TODO: send update tx
      } else {
        this.$store.commit('activateNomination')
        let privkey = PrivKey.generate('ed25519')
        // TODO: user should sign outside of app
        let candidate = {
          validatorPubKey: privkey.pubkey(),
          signature: privkey.sign(Buffer('lol')),
          keybaseID: this.fields.id,
          description: this.fields.description,
          country: this.fields.country,
          serverDetails: this.fields.serverDetails,
          nodeAddress: this.fields.ipAddress,
          website: this.fields.website,
          interestCommission: Math.round(this.fields.commissionPercent * 100),
          ownCoinsBonded: this.fields.ownCoinsBonded
        }
        this.$store.dispatch('nominateCandidate', candidate)
        this.$store.commit('notify', {
          title: 'Nomination Submitted',
          body: 'Well done! You\'ll appear on the candidates list shortly .'
        })
        // TODO: handle errors
        this.$store.commit('addCandidate', candidate)
      }
      this.$store.commit('saveNomination', this.fields)
      this.resetFields()
      this.$router.push('/')
    },
    resetFields () {
      this.$v.$reset()
      this.fields = {
        atoms: this.user.atoms,
        ownCoinsBonded: '',
        country: '',
        commissionPercent: '',
        description: '',
        id: '',
        ipAddress: '',
        serverDetails: '',
        website: ''
      }
    }
  },
  mounted () {
    this.fields.atoms = this.user.atoms
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
      ownCoinsBonded: {
        between (x) {
          return between(
            this.config.CANDIDATE.SELF_BOND_MIN,
            this.config.CANDIDATE.SELF_BOND_MAX)(x)
        },
        required
      },
      commissionPercent: {
        between (x) {
          return between(
            this.config.CANDIDATE.COMMISSION_MIN,
            this.config.CANDIDATE.COMMISSION_MAX)(x)
        },
        required
      },
      serverDetails: {
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
        // required,
        // ipAddress (x) { return validateIP(x) }
      }
    }
  })
}
</script>
