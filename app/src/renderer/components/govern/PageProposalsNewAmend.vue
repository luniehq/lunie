<template lang="pug">
page(title="Proposal: Amend Constitution")
  tool-bar
    router-link(to="/proposals/new" exact): i.material-icons arrow_back
  form-struct(:submit="onSubmit")
    form-group(:error="$v.fields.title.$error"
      field-id='proposal-title' field-label='Proposal Title')
      field#proposal-title(
        type="text"
        placeholder="Proposal Title"
        v-model="fields.title")
      form-msg(name='Proposal Title' type='required'
        v-if='!$v.fields.title.required')
      form-msg(name='Proposal Title' type='length'
        :min='titleMinLength' :max='titleMaxLength'
        v-if='!$v.fields.title.minLength || !$v.fields.title.maxLength')
    form-group(:error="$v.fields.body.$error"
      field-id='proposal-body' field-label='Proposal Body')
      field#proposal-body(
        type="textarea"
        placeholder="Write your proposal here..."
        v-model="fields.body")
      form-msg(name='Proposal Body' type='required'
        v-if='!$v.fields.body.required')
      form-msg(name='Proposal Body' type='length'
        :min='bodyMinLength' :max='bodyMaxLength'
        v-if='!$v.fields.body.minLength || !$v.fields.body.maxLength')
    div(slot="footer")
      div
      btn(icon="send" value="Propose" type="submit")
</template>

<script>
import { mapGetters } from 'vuex'
import { minLength, maxLength, required } from 'vuelidate/lib/validators'
import Btn from '@nylira/vue-button'
import Field from '@nylira/vue-field'
import FieldGroup from '../common/NiFieldGroup'
import FormGroup from '../common/NiFormGroup'
import FormMsg from '../common/NiFormMsg'
import FormStruct from '../common/NiFormStruct'
import Page from '../common/NiPage'
import ToolBar from '../common/NiToolBar'
export default {
  name: 'page-proposals-new-amend',
  components: {
    Btn,
    Field,
    FieldGroup,
    FormGroup,
    FormMsg,
    FormStruct,
    Page,
    ToolBar
  },
  computed: {
    ...mapGetters([])
  },
  data: () => ({
    titleMinLength: 10,
    titleMaxLength: 254,
    bodyMinLength: 10,
    bodyMaxLength: 40000,
    fields: {
      title: '',
      body: ''
    }
  }),
  methods: {
    onSubmit () {
      this.$v.$touch()
      if (!this.$v.$error) {
        this.$store.commit('notify', { title: 'TODO: Create Text Proposal', body: 'You will have successfully created a text proposal' })
        this.resetForm()
        this.$router.push({ name: 'proposals' })
      }
    },
    resetForm () {
      this.fields = {
        title: '',
        body: ''
      }
    }
  },
  validations: () => ({
    fields: {
      title: {
        required,
        minLength (x) { return minLength(this.titleMinLength)(x) },
        maxLength (x) { return maxLength(this.titleMaxLength)(x) }
      },
      body: {
        required,
        minLength (x) { return minLength(this.bodyMinLength)(x) },
        maxLength (x) { return maxLength(this.bodyMaxLength)(x) }
      }
    }
  })
}
</script>
