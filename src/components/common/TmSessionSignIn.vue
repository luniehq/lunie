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
          <TmFormMsg v-if="error" type="custom" :msg="error" />
        </TmFormGroup>
        <TmFormGroup
          class="field-checkbox"
          field-id="sign-up-warning"
          field-label
        >
          <div class="field-checkbox-testnet">
            <label class="field-checkbox-label" for="select-testnet">
              <input id="select-testnet" v-model="testnet" type="checkbox" />
              This is a testnet address</label
            >
          </div>
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
    addressPrefixes: [],
    testnet: false
  }),
  computed: {
    ...mapState([`keystore`, `session`]),
    ...mapGetters([`networkSlug`]),
    accounts() {
      let accounts = this.keystore.accounts
      return accounts.map(({ name, address }) => ({
        value: address,
        key: name
      }))
    },
    networkOfAddress() {
      const selectedNetworksArray = this.addressPrefixes.filter(
        ({ address_prefix }) => this.signInAddress.startsWith(address_prefix)
      )

      const selectedNetwork = selectedNetworksArray.find(({ testnet }) =>
        this.testnet ? testnet === true : testnet === false
      )

      return selectedNetwork
    }
  },
  created() {
    this.$store.dispatch("loadAccounts")
  },
  mounted() {
    this.setDefaultAccount(this.accounts)
  },
  methods: {
    async onSubmit() {
      this.$v.$touch()
      if (this.$v.$error) return

      if (!this.networkOfAddress) {
        this.error = `No ${
          this.testnet ? "testnet" : "mainnet"
        } for this address found`
        return
      }
      const sessionCorrect = await this.$store.dispatch(`testLogin`, {
        password: this.signInPassword,
        address: this.signInAddress
      })
      if (sessionCorrect) {
        this.selectNetworkByAddress(this.signInAddress)
        this.$store.dispatch(`signIn`, {
          password: this.signInPassword,
          address: this.signInAddress,
          sessionType: "local"
        })
        localStorage.setItem(`prevAccountKey`, this.signInAddress)
        this.$router.push({
          name: "portfolio",
          params: {
            networkId: this.networkSlug
          }
        })
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
    async selectNetworkByAddress(address) {
      let selectedNetworksArray = this.addressPrefixes.filter(
        ({ address_prefix }) => address.startsWith(address_prefix)
      )
      let selectedNetwork = ``

      // handling when there are both mainnet and testnet networks
      if (selectedNetworksArray.length > 1) {
        /* istanbul ignore next */
        selectedNetwork = selectedNetworksArray.filter(({ testnet }) =>
          this.testnet ? testnet === true : testnet === false
        )[0]
      } else {
        selectedNetwork = selectedNetworksArray[0]
      }
      this.$store.dispatch(`setNetwork`, selectedNetwork)
    }
  },
  validations() {
    return {
      signInAddress: { required },
      signInPassword: { required, minLength: minLength(10) }
    }
  },
  apollo: {
    addressPrefixes: {
      query: gql`
        query Network($experimental: Boolean) {
          networks(experimental: $experimental) {
            id
            address_prefix
            testnet
            slug
          }
        }
      `,
      variables() {
        return {
          experimental: this.session.experimentalMode
        }
      },
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
