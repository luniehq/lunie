<template>
  <SessionFrame>
    <TmFormStruct :submit="onSubmit" class="session-container">
      <h2 class="session-title">
        Sign in with account
      </h2>
      <div class="session-main bottom-indent">
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
          <TmFormMsg
            v-if="
              $v.signInAddress.$error && !$v.signInAddress.isANetworkAddress
            "
            name="This address doesn't belong to the network you are currently connected to"
            type="custom"
          />
          <div
            v-if="
              $v.signInAddress.$error && !$v.signInAddress.isANetworkAddress
            "
          >
            <p class="error-message">
              Please select the correct network <a href="/networks">here</a>
            </p>
          </div>
          <TmFormMsg v-if="error" type="custom" :msg="error" />
        </TmFormGroup>
      </div>
      <div class="session-footer">
        <TmBtn value="Sign In" />
      </div>
    </TmFormStruct>
  </SessionFrame>
</template>

<script>
import { mapState, mapGetters } from "vuex"
import { required, minLength } from "vuelidate/lib/validators"
import TmBtn from "common/TmBtn"
import TmFormGroup from "common/TmFormGroup"
import TmField from "common/TmField"
import TmFormMsg from "common/TmFormMsg"
import TmFormStruct from "common/TmFormStruct"
import SessionFrame from "common/SessionFrame"
import gql from "graphql-tag"
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
    error: ``,
    addressPrefixes: []
  }),
  computed: {
    ...mapState([`keystore`]),
    ...mapGetters([`network`]),
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
        this.$router.push(`/`)
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
    },
    isANetworkAddress(param) {
      const selectedNetwork = this.addressPrefixes.find(
        ({ id }) => id === this.network
      )
      // handling query not loaded yet or failed
      if (!selectedNetwork) return false

      if (param.startsWith(selectedNetwork.address_prefix)) {
        return true
      } else {
        return false
      }
    }
  },
  validations() {
    return {
      signInAddress: { required, isANetworkAddress: this.isANetworkAddress },
      signInPassword: { required, minLength: minLength(10) }
    }
  },
  apollo: {
    addressPrefixes: {
      query: gql`
        query Network {
          networks {
            id
            address_prefix
          }
        }
      `,
      /* istanbul ignore next */
      update(data) {
        if (data.networks) return data.networks
        return ""
      },
      fetchPolicy: "cache-first"
    }
  }
}
</script>
<style scoped>
p.error-message {
  font-size: var(--sm);
  color: var(--danger);
  font-style: italic;
  font-weight: 500;
  padding-left: 16px;
}
</style>
