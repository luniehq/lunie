<template lang='pug'>
page(:title='pageTitle')
  div(slot="menu"): tool-bar

  form-struct(:submit='onSubmit')
    form-group(:error='$v.fields.id.$error'
      field-id='form-nominate-id' field-label='Keybase ID')
      field#form-nominate-id(
        v-if="user.nominationActive"
        type='text'
        placeholder='Keybase ID'
        :value='fields.id'
        disabled)
      field#form-nominate-id(
        v-else
        type='text'
        placeholder='Keybase ID'
        v-model='fields.id')
      form-msg(v-if='!user.nominationActive'): div Don't have a Keybase ID? Create one at #[a.open-in-browser(href='https://keybase.io') keybase.io]
      form-msg(name='Keybase ID' type='required'
        v-if='!$v.fields.id.required')
      form-msg(name='Keybase ID' type='length'
        :min='config.CANDIDATE.KEYBASE_MIN' :max='config.CANDIDATE.KEYBASE_MAX'
        v-if='!$v.fields.id.minLength || !$v.fields.id.maxLength')

    form-group(:error='$v.fields.description.$error'
      field-id='form-nominate-description' field-label='Description')
      field#form-nominate-description(
        type='textarea'
        placeholder='Have a message for delegators? Write it here.'
        v-model='fields.description')
      form-msg(name='Description' type='required'
        v-if='!$v.fields.description.required')
      form-msg(name='Description' type='length'
        :min='config.CANDIDATE.DESCRIPTION_MIN' :max='config.CANDIDATE.DESCRIPTION_MAX'
        v-if='!$v.fields.description.minLength || !$v.fields.description.maxLength')

    form-group(:error='$v.fields.serverDetails.$error'
      field-id='form-nominate-server-power' field-label='Server Power')
      field#form-nominate-server-power(
        type='textarea'
        placeholder='Network connection, RAM, HDD space, OS, units, etc.'
        v-model='fields.serverDetails')
      form-msg(name='Server Power' type='required'
        v-if='!$v.fields.serverDetails.required')
      form-msg(name='Server Power' type='length'
        :min='config.CANDIDATE.DESCRIPTION_MIN' :max='config.CANDIDATE.DESCRIPTION_MAX'
        v-if='!$v.fields.serverDetails.minLength || !$v.fields.serverDetails.maxLength')

    form-group(:error='$v.fields.country.$error'
      field-id='form-nominate-country' field-label='Country')
      field#form-nominate-country(type='countries' placeholder='Select country...'
        v-model='fields.country')
      form-msg(name='Country' type='required'
        v-if='!$v.fields.country.required')

    form-group(:error='$v.fields.commissionPercent.$error'
      field-id='form-nominate-commission-percent' field-label='Commission Percent')
      field-group
        field#form-nominate-commission-percent(
          type='number'
          step='any'
          placeholder='Enter rate'
          v-model.number='fields.commissionPercent')
        field-addon %
      form-msg(name='Commission' type='required'
        v-if='!$v.fields.commissionPercent.required')
      form-msg(name='Commission' type='between'
        :min='config.CANDIDATE.COMMISSION_MIN' :max='config.CANDIDATE.COMMISSION_MAX'
        v-if='!$v.fields.commissionPercent.between')

    form-group(:error='$v.fields.ownCoinsBonded.$error'
      field-id='form-nominate-atoms-to-bond' field-label='Atoms to Bond')
      field-group
        field#form-atoms-to-bond(
          type='number'
          step='any'
          placeholder='Enter atoms'
          v-model.number='fields.ownCoinsBonded')
        field-addon ATOM
      form-msg(name='OwnCoinsBonded' type='required'
        v-if='!$v.fields.ownCoinsBonded.required')
      form-msg(name='OwnCoinsBonded' type='between'
        :min='config.CANDIDATE.SELF_BOND_MIN' :max='config.CANDIDATE.SELF_BOND_MAX'
        v-if='!$v.fields.ownCoinsBonded.between')

    form-group(:error='$v.fields.website.$error'
      field-id='form-nominate-website' field-label='Website (Optional)')
      field#form-nominate-website(
        type='text'
        placeholder='https://'
        v-model='fields.website')
      form-msg( name='Website' type='required'
        v-if='!$v.fields.website.required')
      form-msg(name='Website' type='url'
        v-if='!$v.fields.website.url')

    // form-group(:error='$v.fields.ipAddress.$error'
      field-id='form-nominate-ip-address' field-label='IP Address (Optional)')
      field-group
        field#form-nominate-address(
          type='text'
          placeholder='Enter IP'
          v-model.trim='fields.ipAddress')
      form-msg(name='IP Address' type='ipAddress'
        v-if='!$v.fields.ipAddress.ipAddress')

    div(slot="footer")
      btn(v-if='user.nominationActive' type="link" :to="{name: 'candidate', params: { candidate: fields.id }}" icon="eye" value="View Candidate")
      div
      btn(v-if='user.nominationActive' @click='onSubmit' icon="refresh" value="Update Nomination")
      btn(v-else @click='onSubmit' icon="check" value="Nominate")
</template>

<script>
import { PrivKey } from 'tendermint-crypto'
import { mapGetters } from 'vuex'
import { between, minLength, maxLength, required, url } from 'vuelidate/lib/validators'
import Btn from '@nylira/vue-button'
import Field from '@nylira/vue-field'
import FieldAddon from '../common/NiFieldAddon'
import FieldGroup from '../common/NiFieldGroup'
import FormGroup from '../common/NiFormGroup'
import FormMsg from '../common/NiFormMsg'
import FormStruct from '../common/NiFormStruct'
import Page from '../common/NiPage'
import ToolBar from 'common/NiToolBar'
export default {
  name: 'page-nominate',
  components: {
    Btn,
    Field,
    FieldAddon,
    FieldGroup,
    FormGroup,
    FormMsg,
    FormStruct,
    Page,
    ToolBar
  },
  computed: {
    ...mapGetters(['config', 'user']),
    pageTitle () {
      if (this.user.nominationActive) {
        return 'Edit Candidacy'
      } else {
        return 'Self-Nomination'
      }
    }
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
