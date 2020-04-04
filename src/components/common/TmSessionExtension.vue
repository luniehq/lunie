<template>
  <SessionFrame>
    <div class="session-container">
      <h2 class="session-title">
        Use Lunie Browser Extension
      </h2>
      <div v-if="!extension.enabled" class="session-main">
        <p>
          Looks like you don't have the Lunie browser extension installed yet.
          Head over to the
          <a
            href="http://bit.ly/lunie-ext"
            target="_blank"
            rel="noopener norefferer"
            >Chrome Web Store</a
          >
          to quickly install the extension.
        </p>
      </div>

      <div v-else-if="accounts.length" class="session-main">
        <p class="extension-message">
          Below is a list of accounts we've received from the Lunie browser
          extension.
        </p>
        <AccountList
          :accounts="accounts"
          :button-action="signInAndRedirect"
          :button-text="`Use Account`"
        />
      </div>

      <div v-else class="session-main">
        <p class="extension-message">
          Looks like you don't have any accounts yet. How about opening the
          extension and creating an account right now?
        </p>
      </div>
    </div>
    <TmFormGroup class="field-checkbox" field-id="sign-up-warning" field-label>
      <div class="field-checkbox-testnet">
        <label class="field-checkbox-label" for="select-testnet">
          <input id="select-testnet" v-model="testnet" type="checkbox" />
          This is a testnet address</label
        >
      </div>
    </TmFormGroup>
  </SessionFrame>
</template>

<script>
import AccountList from "common/AccountList"
import SessionFrame from "common/SessionFrame"
import TmFormGroup from "common/TmFormGroup"
import { mapState, mapGetters } from "vuex"
export default {
  name: `session-extension`,
  components: {
    AccountList,
    SessionFrame,
    TmFormGroup
  },
  data: () => ({
    connectionError: null,
    address: null,
    testnet: false
  }),
  computed: {
    ...mapState([`extension`]),
    ...mapGetters([`networks`]),
    accounts() {
      return this.extension.accounts
    }
  },
  mounted() {
    this.getAddressesFromExtension()
  },
  methods: {
    getAddressesFromExtension() {
      this.$store.dispatch("getAddressesFromExtension")
    },
    getSignInNetwork(account) {
      // defaulting to cosmos-hub-mainnet
      const accountNetwork = account.network || "cosmos-hub-mainnet"
      if (this.testnet) {
        return (
          this.networks
            .filter(({ testnet }) => testnet)
            .find(({ slug }) => accountNetwork.startsWith(slug)) ||
          // it could happen that there is no mainnet ready yet for that protocol
          this.networks.find(({ slug }) => accountNetwork.startsWith(slug))
        )
      } else {
        // if testnet is not true then we will sign in to mainnet
        return (
          this.networks
            .filter(({ testnet }) => !testnet)
            .find(({ slug }) => accountNetwork.startsWith(slug)) ||
          // this is quite unlikely, as we will always have a testnet of each, but better stay safe
          this.networks.find(({ slug }) => accountNetwork.startsWith(slug))
        )
      }
    },
    async signIn(account) {
      const network = this.getSignInNetwork(account)
      this.$store.dispatch(`signIn`, {
        sessionType: `extension`,
        address: account.address,
        networkId: network.id
      })
    },
    async signInAndRedirect(account) {
      await this.signIn(account)
      const accountNetwork = this.getSignInNetwork(account)
      this.$router.push({
        name: "portfolio",
        params: {
          networkId: accountNetwork.slug
        }
      })
    }
  }
}
</script>
<style scoped>
.session-title,
.extension-message {
  padding: 0 1rem;
  margin: 0;
}
</style>
