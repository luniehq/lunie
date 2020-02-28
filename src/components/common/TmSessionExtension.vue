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
  </SessionFrame>
</template>

<script>
import gql from "graphql-tag"
import AccountList from "common/AccountList"
import SessionFrame from "common/SessionFrame"
import { mapState } from "vuex"
export default {
  name: `session-extension`,
  components: {
    AccountList,
    SessionFrame
  },
  data: () => ({
    connectionError: null,
    address: null,
    networks: []
  }),
  computed: {
    ...mapState([`extension`]),
    accounts() {
      return this.extension.accounts
    }
  },
  async created() {
    if (this.$route.params.address && this.$route.params.network) {
      await this.signIn({
        address: this.$route.params.address,
        network: this.$route.params.network
      })
      this.$router.push("/portfolio")
    }
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
        networkId: account.network ? account.network : "cosmos-hub-mainnet" // defaulting to cosmos-hub-mainnet
      })
    },
    async signInAndRedirect(account) {
      await this.signIn(account)
      const network = account.network ? account.network : "cosmos-hub-mainnet"
      this.$router.push(`/${this.getNetworkSlug(network)}/portfolio`)
    },
    getNetworkSlug(network) {
      if (this.networks) {
        return this.networks.filter(({ id }) => id === network)[0].slug
      }
    }
  },
  apollo: {
    networks: {
      query: gql`
        query Networks {
          networks {
            id
            slug
          }
        }
      `,
      /* istanbul ignore next */
      update(data) {
        return data.networks
      }
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
