<template lang="pug">
.tm-session: tm-form-struct(:submit='onSubmit').tm-session-container
  .tm-session-header
    a(@click="setState('welcome')"): i.material-icons arrow_back
    .tm-session-title Import with Seed
    a(@click="help"): i.material-icons help_outline
  .tm-session-main
    tm-form-group(field-id='import-name' field-label='Account Name' :error='$v.fields.importName.$error')
      tm-field#import-name(
        type="text"
        placeholder="Must have at least 5 characters"
        v-model="fields.importName")
      tm-form-msg(name='Name' type='required' v-if='!$v.fields.importName.required')
      tm-form-msg(name='Name' type='minLength' min="5" v-if='!$v.fields.importName.minLength')

    tm-form-group(:error='$v.fields.importPassword.$error'
      field-id='import-password' field-label='Password')
      tm-field#import-password(
        type="password"
        placeholder="Must be at least 10 characters"
        v-model="fields.importPassword")
      tm-form-msg(name='Password' type='required' v-if='!$v.fields.importPassword.required')
      tm-form-msg(name='Password' type='minLength' min="10" v-if='!$v.fields.importPassword.minLength')

    tm-form-group(:error='$v.fields.importPasswordConfirm.$error'
      field-id='import-password-confirmation' field-label='Confirm Password')
      tm-field#import-password-confirmation(
        type="password"
        placeholder="Enter password again"
        v-model="fields.importPasswordConfirm")
      tm-form-msg(name='Password confirmation' type='match' v-if='!$v.fields.importPasswordConfirm.sameAsPassword')

    tm-form-group(:error='$v.fields.importSeed.$error'
      field-id='import-seed' field-label='Seed Phrase')
      field-seed#import-seed(
        :value="fields.importSeed"
        @input="val => fields.importSeed = val"
        placeholder="Must be exactly 24 words")
      tm-form-msg(name='Seed' type='required' v-if='!$v.fields.importSeed.required')
      tm-form-msg(name='Seed' type='words24' v-else-if='!$v.fields.importSeed.words24')

    tm-form-group(field-id="error-collection" field-label=''
      :error='$v.fields.errorCollection.$error')
      .tm-field-checkbox
        .tm-field-checkbox-input
          input#error-collection(type="checkbox" v-model="fields.errorCollection")
        label.tm-field-checkbox-label(for="error-collection")
          | I'd like to opt in for remote error tracking to help improve Voyager.

  .tm-session-footer
    tm-btn(icon="arrow_forward" icon-pos="right" value="Next" size="lg")
</template>

<script>
import { required, minLength, sameAs } from "vuelidate/lib/validators"
import PerfectScrollbar from "perfect-scrollbar"
import {
  TmBtn,
  TmFormGroup,
  TmFormStruct,
  TmField,
  TmFormMsg
} from "@tendermint/ui"
import FieldSeed from "common/TmFieldSeed"

export default {
  name: "tm-session-import",
  components: {
    TmBtn,
    TmField,
    FieldSeed,
    TmFormGroup,
    TmFormMsg,
    TmFormStruct
  },
  data: () => ({
    fields: {
      importName: "",
      importPassword: "",
      importPasswordConfirm: "",
      importSeed: ""
    }
  }),
  methods: {
    help() {
      this.$store.commit("setModalHelp", true)
    },
    setState(value) {
      this.$store.commit("setModalSessionState", value)
    },
    async onSubmit() {
      this.$v.$touch()
      if (this.$v.$error) return
      try {
        let key = await this.$store.dispatch("createKey", {
          seedPhrase: this.fields.importSeed,
          password: this.fields.importPassword,
          name: this.fields.importName
        })
        if (key) {
          this.$store.dispatch("setErrorCollection", {
            account: this.fields.importName,
            optin: this.fields.errorCollection
          })
          this.$store.commit("setModalSession", false)
          this.$store.commit("notify", {
            title: "Welcome back!",
            body: "Your account has been successfully imported."
          })
          this.$store.dispatch("signIn", {
            account: this.fields.importName,
            password: this.fields.importPassword
          })
        }
      } catch (err) {
        this.$store.commit("notifyError", {
          title: `Couldn't create account`,
          body: err.message
        })
      }
    }
  },
  mounted() {
    this.$el.querySelector("#import-seed").focus()
    new PerfectScrollbar(this.$el.querySelector(".tm-session-main"))
  },
  validations: () => ({
    fields: {
      importName: { required, minLength: minLength(5) },
      importPassword: { required, minLength: minLength(10) },
      importPasswordConfirm: { sameAsPassword: sameAs("importPassword") },
      importSeed: { required, words24 },
      errorCollection: false
    }
  })
}
const words24 = param => {
  return param && param.split(" ").length === 24
}
</script>
