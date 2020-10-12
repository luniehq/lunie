<template>
  <SessionFrame :icon="`laptop`">
    <div class="session-container">
      <h2 class="session-title">Use Lunie Browser Extension</h2>
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
          Looks like you don't have any addresses in the Lunie extension yet.
          Click on the extension icon in your browser and add an address now.
        </p>
      </div>
    </div>
  </SessionFrame>
</template>

<script>
import AccountList from "account/AccountList"
import SessionFrame from "common/SessionFrame"
import { mapState, mapGetters } from "vuex"
export default {
  name: `session-extension`,
  components: {
    AccountList,
    SessionFrame,
  },
  data: () => ({
    connectionError: null,
    address: null,
  }),
  computed: {
    ...mapState([`extension`]),
    ...mapGetters([`networks`]),
    accounts() {
      return this.extension.accounts
    },
  },
  mounted() {
    this.getAddressesFromExtension()
  },
  methods: {
    getAddressesFromExtension() {
      this.$store.dispatch("getAddressesFromExtension")
    },
    async signIn(account) {
      this.$store.dispatch(`signIn`, {
        sessionType: `extension`,
        address: account.address,
        networkId: account.network ? account.network : "cosmos-hub-mainnet", // defaulting to cosmos-hub-mainnet
      })
    },
    async signInAndRedirect(account) {
      const accountNetwork = await this.$store.dispatch("getNetworkByAccount", {
        account,
      })
      await this.signIn(account)
      this.$router.push({
        name: "portfolio",
        params: {
          networkId: accountNetwork.slug,
        },
      })
    },
  },
}
</script>
