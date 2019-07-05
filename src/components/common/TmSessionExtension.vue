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
          <ul class="account-list">
            <li
              v-for="account in extension.accounts"
              :key="account.name"
              class="account"
            >
              <div class="account-info">
                <h3>{{ account.name }}</h3>
                <Bech32 :address="account.address || ''" />
              </div>
              <TmBtn
                class="account-button"
                value="Use Address"
                color="primary"
                @click.native="signIn(account.address)"
              />
            </li>
          </ul>
        </div>
      </div>
    </div>
  </SessionFrame>
</template>

<script>
import Bech32 from "common/Bech32"
import TmBtn from "common/TmBtn"
import SessionFrame from "common/SessionFrame"
import { mapGetters } from "vuex"
import { formatBech32 } from "src/filters"
export default {
  name: `session-extension`,
  components: {
    Bech32,
    TmBtn,
    SessionFrame
  },
  filters: {
    formatBech32
  },
  data: () => ({
    connectionError: null,
    address: null
  }),
  computed: {
    ...mapGetters([`extension`])
  },
  mounted() {
    this.getAddressesFromExtension()
  },
  methods: {
    async signIn(address) {
      this.$store.dispatch(`signIn`, {
        sessionType: `extension`,
        address: address
      })
      this.$router.push(`/`)
    },
    getAddressesFromExtension() {
      this.$store.dispatch("getAddressesFromExtension")
    }
  }
}
</script>
<style scoped>
.account-list {
  padding: 2rem 0;
}

.account {
  display: flex;
  flex-flow: row;
  justify-content: space-between;
  padding: 0.5rem 1rem;
  background: var(--app-fg);
  border-radius: 0.25rem;
  border: 2px solid var(--bc-dim);
}

.account h3 {
  color: var(--bright);
}

.account-info {
  display: flex;
  flex-direction: column;
}
</style>
