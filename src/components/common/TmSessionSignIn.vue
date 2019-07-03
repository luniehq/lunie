<template>
  <session-frame>
    <div class="session">
      <TmFormStruct :submit="onSubmit" class="session-container">
        <h2 class="session-title">
          Sign in with account
        </h2>
        <div class="session-main">
          <TmFormGroup field-id="sign-in-name" field-label="Select Account">
            <TmField
              id="sign-in-name"
              v-model="signInAddress"
              :options="accounts"
              type="select"
              placeholder="Select account…"
              vue-focus="vue-focus"
            />
            <TmFormMsg
              v-if="$v.signInAddress.$error && !$v.signInAddress.required"
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
            <TmFormMsg v-if="error" type="custom" :msg="error" />
          </TmFormGroup>
        </div>
        <div class="session-footer">
          <TmBtn value="Sign In" />
        </div>
      </TmFormStruct>
    </div>
  </session-frame>
</template>

<script>
import { mapGetters } from "vuex"
import { required, minLength } from "vuelidate/lib/validators"
import TmBtn from "common/TmBtn"
import TmFormGroup from "common/TmFormGroup"
import TmField from "common/TmField"
import TmFormMsg from "common/TmFormMsg"
import TmFormStruct from "common/TmFormStruct"
import SessionFrame from "common/SessionFrame"
export default {
  name: `session-sign-in`,
  components: {
    TmBtn,
    TmField,
    TmFormGroup,
    TmFormMsg,
    SessionFrame,
    TmFormStruct
  },
  data: () => ({
    signInAddress: ``,
    signInPassword: ``,
    error: ``
  }),
  computed: {
    ...mapGetters([`keystore`]),
    accounts() {
      let accounts = this.keystore.accounts
      return accounts.map(({ name, address }) => ({
        value: address,
        key: name
      }))
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
    close() {
      this.$emit(`close`)
    },
    async onSubmit() {
      this.$v.$touch()
      if (this.$v.$error) return
      const sessionCorrect = await this.$store.dispatch(`testLogin`, {
        password: this.signInPassword,
        address: this.signInAddress
      })
      if (sessionCorrect) {
        this.$store.dispatch(`signIn`, {
          password: this.signInPassword,
          address: this.signInAddress,
          sessionType: "local"
        })
        localStorage.setItem(`prevAccountKey`, this.signInAddress)
        this.$emit(`close`)
      } else {
        this.error = `The provided username or password is wrong.`
      }
    },
    setDefaultAccount() {
      const prevAccountKey = localStorage.getItem(`prevAccountKey`)
      const prevAccountExists = this.accounts.find(
        a => a.value === prevAccountKey
      )

      if (this.accounts.length === 1) {
        this.signInAddress = this.accounts[0].value
      } else if (prevAccountExists) {
        this.signInAddress = prevAccountKey
      }

      if (this.signInAddress) {
        this.$el.querySelector(`#sign-in-password`).focus()
      } else {
        this.$el.querySelector(`#sign-in-name`).focus()
      }
    }
  },
  validations: () => ({
    signInAddress: { required },
    signInPassword: { required, minLength: minLength(10) }
  })
}
</script>
