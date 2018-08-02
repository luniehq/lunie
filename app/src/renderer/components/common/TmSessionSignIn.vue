<template lang="pug">
.tm-session: tm-form-struct(:submit="onSubmit").tm-session-container
  .tm-session-header
    a(@click="setState('welcome')"): i.material-icons arrow_back
    .tm-session-title Sign In
    a(@click="help"): i.material-icons help_outline
  .tm-session-main
    tm-form-group(field-id='sign-in-name' field-label='Select Account')
      tm-field#sign-in-name(
        type="select"
        v-model="fields.signInName"
        placeholder="Select account…"
        :options="accounts")
      tm-form-msg(name='Name' type='required' v-if='!$v.fields.signInName.required')

    tm-form-group(:error='$v.fields.signInPassword.$error'
      field-id='sign-in-password' field-label='Password')
      tm-field#sign-in-password(
        type="password"
        v-model="fields.signInPassword")
      tm-form-msg(name='Password' type='required' v-if='!$v.fields.signInPassword.required')
      tm-form-msg(name='Password' type='minLength' min="10" v-if='!$v.fields.signInPassword.minLength')
      tm-form-msg(v-if='mockedConnector') default password is 1234567890

  .tm-session-footer
    tm-btn(v-if="connected" icon="arrow_forward" icon-pos="right" value="Next" size="lg")
    tm-btn(v-else icon-pos="right" value="Connecting..." size="lg" disabled="true")
</template>

<script>
import { mapGetters } from "vuex"
import { required, minLength } from "vuelidate/lib/validators"
import {
  TmBtn,
  TmFormGroup,
  TmFormStruct,
  TmField,
  TmFormMsg
} from "@tendermint/ui"
export default {
  name: "tm-session-sign-in",
  components: {
    TmBtn,
    TmField,
    TmFormGroup,
    TmFormMsg,
    TmFormStruct
  },
  data: () => ({
    fields: {
      signInName: "",
      signInPassword: ""
    }
  }),
  computed: {
    ...mapGetters(["user", "mockedConnector", "lastHeader", "connected"]),
    accounts() {
      let accounts = this.user.accounts
      accounts = accounts.filter(({ name }) => name !== "trunk")
      return accounts.map(({ name }) => ({ key: name, value: name }))
    }
  },
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
        await this.$store.dispatch("testLogin", {
          password: this.fields.signInPassword,
          account: this.fields.signInName
        })
        this.$store.dispatch("signIn", {
          password: this.fields.signInPassword,
          account: this.fields.signInName
        })
        localStorage.setItem("prevAccountKey", this.fields.signInName)
        this.$router.push("/")
        this.$store.commit("setModalSession", false)
      } catch (err) {
        this.$store.commit("notifyError", {
          title: "Signing In Failed",
          body: err.message
        })
      }
    },
    setDefaultAccount() {
      let prevAccountKey = localStorage.getItem("prevAccountKey")
      let prevAccountExists = this.accounts.find(a => a.key === prevAccountKey)

      if (this.accounts.length === 1) {
        this.fields.signInName = this.accounts[0].key
      } else if (prevAccountExists) {
        this.fields.signInName = prevAccountKey
      }

      if (this.fields.signInName) {
        this.$el.querySelector("#sign-in-password").focus()
      } else {
        this.$el.querySelector("#sign-in-name").focus()
      }
    }
  },
  mounted() {
    this.setDefaultAccount(this.accounts)
    if (this.mockedConnector) {
      this.fields.signInPassword = "1234567890"
    }
  },
  validations: () => ({
    fields: {
      signInName: { required },
      signInPassword: { required, minLength: minLength(10) }
    }
  })
}
</script>
<style lang="stylus">
.tm-form-group
  a
    cursor pointer
</style>
