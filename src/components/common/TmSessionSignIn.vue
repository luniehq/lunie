<template>
  <div class="session">
    <TmFormStruct
      :submit="onSubmit"
      class="session-container"
    >
      <div class="session-header">
        <a @click="goBack">
          <i class="material-icons session-back">arrow_back</i>
        </a>
        <h2 class="session-title">
          Sign in with account
        </h2>
        <a @click="$store.commit(`toggleSessionModal`, false)">
          <i class="material-icons session-close">close</i>
        </a>
      </div>
      <div class="session-main">
        <TmFormGroup
          field-id="sign-in-name"
          field-label="Select Account"
        >
          <TmField
            id="sign-in-name"
            v-model="signInName"
            :options="accounts"
            type="select"
            placeholder="Select account…"
            vue-focus="vue-focus"
          />
          <TmFormMsg
            v-if="$v.signInName.$error && !$v.signInName.required"
            name="Name"
            type="required"
          />
        </TmFormGroup>
        <TmFormGroup
          :error="$v.signInPassword.$error"
          field-id="sign-in-password"
          field-label="Password"
        >
          <TmField
            id="sign-in-password"
            v-model="signInPassword"
            type="password"
          />
          <TmFormMsg
            v-if="$v.signInPassword.$error && !$v.signInPassword.required"
            name="Password"
            type="required"
          />
          <TmFormMsg
            v-if="$v.signInPassword.$error && !$v.signInPassword.minLength"
            name="Password"
            type="minLength"
            min="10"
          />
          <TmFormMsg
            v-if="error"
            type="custom"
            :msg="error"
          />
        </TmFormGroup>
      </div>
      <div class="session-footer">
        <TmBtn value="Sign In" />
      </div>
    </TmFormStruct>
  </div>
</template>

<script>
import { mapGetters } from "vuex"
import { required, minLength } from "vuelidate/lib/validators"
import TmBtn from "common/TmBtn"
import TmFormGroup from "common/TmFormGroup"
import TmField from "common/TmField"
import TmFormMsg from "common/TmFormMsg"
import TmFormStruct from "common/TmFormStruct"
export default {
  name: `session-sign-in`,
  components: {
    TmBtn,
    TmField,
    TmFormGroup,
    TmFormMsg,
    TmFormStruct
  },
  data: () => ({
    signInName: ``,
    signInPassword: ``,
    error: ``
  }),
  computed: {
    ...mapGetters([`session`]),
    accounts() {
      let accounts = this.session.accounts
      accounts = accounts.filter(({ name }) => name !== `trunk`)
      return accounts.map(({ name }) => ({ key: name, value: name }))
    }
  },
  mounted() {
    this.setDefaultAccount(this.accounts)
  },
  methods: {
    setState(value) {
      this.$emit(`route-change`, value)
    },
    goBack() {
      this.$emit("route-change", "existing")
    },
    async onSubmit() {
      this.$v.$touch()
      if (this.$v.$error) return
      const sessionCorrect = await this.$store.dispatch(`testLogin`, {
        password: this.signInPassword,
        localKeyPairName: this.signInName
      })
      if (sessionCorrect) {
        this.$store.dispatch(`signIn`, {
          password: this.signInPassword,
          localKeyPairName: this.signInName,
          sessionType: "local"
        })
        localStorage.setItem(`prevAccountKey`, this.signInName)
        this.$emit(`close`)
      } else {
        this.error = `The provided username or password is wrong.`
      }
    },
    setDefaultAccount() {
      const prevAccountKey = localStorage.getItem(`prevAccountKey`)
      const prevAccountExists = this.accounts.find(
        a => a.key === prevAccountKey
      )

      if (this.accounts.length === 1) {
        this.signInName = this.accounts[0].key
      } else if (prevAccountExists) {
        this.signInName = prevAccountKey
      }

      if (this.signInName) {
        this.$el.querySelector(`#sign-in-password`).focus()
      } else {
        this.$el.querySelector(`#sign-in-name`).focus()
      }
    }
  },
  validations: () => ({
    signInName: { required },
    signInPassword: { required, minLength: minLength(10) }
  })
}
</script>
