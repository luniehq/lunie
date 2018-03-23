<template lang="pug">
.ni-session: form-struct(:submit='onSubmit').ni-session-container
  .ni-session-header
    a(@click="setState('welcome')"): i.material-icons arrow_back
    .ni-session-title Create Account
    a(@click="help"): i.material-icons help_outline
  .ni-session-main
    form-group(field-id='sign-up-name' field-label='Account Name' :error='$v.fields.signUpName.$error')
      field#sign-up-name(
        type="text"
        placeholder="Must be at least 5 characters"
        v-model="fields.signUpName")
      form-msg(name='Name' type='required' v-if='!$v.fields.signUpName.required')
      form-msg(name='Name' type='minLength' min="5" v-if='!$v.fields.signUpName.minLength')

    form-group(:error='$v.fields.signUpPassword.$error'
      field-id='sign-up-password' field-label='Password')
      field#sign-up-password(
        type="password"
        placeholder="Must be at least 10 characters"
        v-model="fields.signUpPassword")
      form-msg(name='Password' type='required' v-if='!$v.fields.signUpPassword.required')
      form-msg(name='Password' type='minLength' min="10" v-if='!$v.fields.signUpPassword.minLength')

    form-group(:error='$v.fields.signUpPasswordConfirm.$error'
      field-id='sign-up-password-confirm' field-label='Confirm Password')
      field#sign-up-password-confirm(
        type="password"
        placeholder="Enter password again"
        v-model="fields.signUpPasswordConfirm")
      form-msg(name='Password confirmation' type='match' v-if='!$v.fields.signUpPasswordConfirm.sameAsPassword')

    form-group(field-id='sign-up-seed' field-label='Seed Phrase')
      field-seed#sign-up-seed(v-model="fields.signUpSeed" disabled)
      form-msg.sm
        | Please back up the seed phrase for this account. This seed phrase cannot be recovered.

    form-group(field-id="sign-up-warning" field-label=' '
      :error='$v.fields.signUpWarning.$error')
      .ni-field-checkbox
        .ni-field-checkbox-input
          input#sign-up-warning(type="checkbox" v-model="fields.signUpWarning")
        label.ni-field-checkbox-label(for="sign-up-warning")
          | I understand that lost seeds cannot be recovered.
      form-msg(name='Recovery confirmation' type='required' v-if='!$v.fields.signUpWarning.required')

    form-group(field-id="sign-up-backup" field-label=' '
      :error='$v.fields.signUpBackup.$error')
      .ni-field-checkbox(for="sign-up-backup")
        .ni-field-checkbox-input
          input#sign-up-backup(type="checkbox" v-model="fields.signUpBackup")
        label.ni-field-checkbox-label(for="sign-up-backup")
          | I have securely written down my seed.
      form-msg(name='Backup confirmation' type='required' v-if='!$v.fields.signUpBackup.required')

    form-group(field-id="error-collection" field-label=' ')
      .ni-field-checkbox
        .ni-field-checkbox-input
          input#sign-up-warning(type="checkbox" v-model="fields.errorCollection")
        label.ni-field-checkbox-label(for="error-collection")
          | I help development of Voyager by sending automatic error reports. This can be turned off at any time.
          
  .ni-session-footer
    btn(icon="arrow_forward" icon-pos="right" value="Next" size="lg" :disabled="creating")
</template>

<script>
import { required, minLength, sameAs } from "vuelidate/lib/validators";
import Btn from "@nylira/vue-button";
import Field from "@nylira/vue-field";
import FieldSeed from "common/NiFieldSeed";
import FieldGroup from "common/NiFieldGroup";
import FormGroup from "common/NiFormGroup";
import FormMsg from "common/NiFormMsg";
import FormStruct from "common/NiFormStruct";
export default {
  name: "ni-session-sign-up",
  components: {
    Btn,
    Field,
    FieldSeed,
    FieldGroup,
    FormGroup,
    FormMsg,
    FormStruct
  },
  data: () => ({
    creating: true,
    fields: {
      signUpName: "",
      signUpSeed: "Creating seed...",
      signUpPassword: "",
      signUpPasswordConfirm: "",
      signUpWarning: false,
      signUpBackup: false
    }
  }),
  methods: {
    help() {
      this.$store.commit("setModalHelp", true);
    },
    setState(value) {
      this.$store.commit("setModalSessionState", value);
    },
    async onSubmit() {
      this.$v.$touch();
      if (this.$v.$error) return;
      try {
        let key = await this.$store.dispatch("createKey", {
          seedPhrase: this.fields.signUpSeed,
          password: this.fields.signUpPassword,
          name: this.fields.signUpName
        });
        if (key) {
          this.$store.commit("setErrorCollection", {
            account: this.fields.signUpName,
            optin: this.fields.errorCollection
          });
          this.$store.commit("setModalSession", false);
          this.$store.commit("notify", {
            title: "Signed Up",
            body: "Your account has been created."
          });
          this.$store.dispatch("signIn", {
            password: this.fields.signUpPassword,
            account: this.fields.signUpName
          });
        }
      } catch (err) {
        this.$store.commit("notifyError", {
          title: `Couldn't create account`,
          body: err.message
        });
      }
    }
  },
  mounted() {
    this.$el.querySelector("#sign-up-name").focus();
    this.$store.dispatch("createSeed").then(seedPhrase => {
      this.creating = false;
      this.fields.signUpSeed = seedPhrase;
    });
  },
  validations: () => ({
    fields: {
      signUpName: { required, minLength: minLength(5) },
      signUpPassword: { required, minLength: minLength(10) },
      signUpPasswordConfirm: { sameAsPassword: sameAs("signUpPassword") },
      signUpWarning: { required },
      signUpBackup: { required },
      errorCollection: false
    }
  })
};
</script>
