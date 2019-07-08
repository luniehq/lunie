<template>
  <SessionFrame>
    <div class="session">
      <div class="session-container">
        <h2 class="session-title">
          Use Lunie browser extension
        </h2>
        <div v-if="!extension.enabled" class="session-main">
          <p>
            Please install the Lunie browser extension from the
            <a
              href="https://chrome.google.com/webstore/category/extensions"
              target="_blank"
              rel="noopener norefferer"
              >Chrome Web Store</a
            >.
          </p>
        </div>

        <div v-else class="session-main">
          Below is a list of accounts we received from the Lunie browser
          extension.
          <AccountList
            :accounts="accounts"
            :button-action="signIn"
            :button-text="`Use Account`"
          />
        </div>
      </div>
    </div>
  </SessionFrame>
</template>

<script>
import AccountList from "common/AccountList"
import SessionFrame from "common/SessionFrame"
import { mapGetters } from "vuex"
export default {
  name: `session-extension`,
  components: {
    AccountList,
    SessionFrame
  },
  data: () => ({
    connectionError: null,
    address: null
  }),
  computed: {
    ...mapGetters([`extension`]),
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
    async signIn(address) {
      this.$store.dispatch(`signIn`, {
        sessionType: `extension`,
        address: address
      })
      this.$router.push(`/`)
    }
  }
}
</script>
