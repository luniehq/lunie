<template>
  <div class="session">
    <div class="session-container">
      <div class="session-header">
        <a @click="goBack">
          <i class="material-icons session-back">arrow_back</i>
        </a>
        <h2 class="session-title">
          Use Lunie Chrome extension
        </h2>
        <a @click="close">
          <i class="material-icons session-close">close</i>
        </a>
      </div>
      <div v-if="!session.extensionInstalled" class="session-main">
        <p>
          Please install the Lunie Extension for Chrome from the Google Play
          Store.
        </p>
      </div>
      <div v-if="session.extensionInstalled">
        <div class="session-main">
          <div :icon="session.extensionInstalled ? 'laptop' : 'info'">
            <div v-if="session.extensionInstalled">
              Click below to open the Lunie Chrome Extension, or use one of the
              existing address.
              <ul>
                <li v-for="wallet in extension.wallets" :key="wallet.name">
                  <div class="extension-address-item">
                    <div>
                      {{ wallet.name }}<br />
                      <TmBtn
                        type="anchor"
                        :value="wallet.address | formatBech32"
                        color="primary"
                        @click.native="signIn(wallet.address)"
                      />
                    </div>
                    <div>
                      <TmBtn
                        value="Use Address"
                        color="primary"
                        @click.native="signIn(wallet.address)"
                      />
                    </div>
                  </div>
                </li>
              </ul>
            </div>
            <div v-else>
              Use the Lunie Chrome extension to securely store your keys, and
              safely perform transactions.
            </div>
          </div>
        </div>
        <div class="session-footer">
          <p class="ledger-install">
            You can find the Lunie Chrome extension on the
            <a href="">Google Play Store</a>.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import TmBtn from "common/TmBtn"
import { mapGetters } from "vuex"
import { formatBech32 } from "src/filters"
export default {
  name: `session-extension`,
  components: {
    TmBtn
  },
  filters: {
    formatBech32
  },
  data: () => ({
    connectionError: null,
    address: null
  }),
  computed: {
    ...mapGetters([`session`, `extension`]),
    submitCaption() {
      return "Sign In"
    }
  },
  mounted() {
    this.getAddressesFromExtension()
  },
  methods: {
    setState(value) {
      this.$emit(`route-change`, value)
    },
    goBack() {
      this.$emit(`route-change`, "existing")
    },
    close() {
      this.$emit(`close`)
    },
    async signIn(address) {
      this.$store.dispatch(`signIn`, {
        sessionType: `extension`,
        address: address
      })
      this.$emit(`close`)
    },
    getAddressesFromExtension() {
      this.$store.dispatch("getAddressesFromExtension")
    }
  }
}
</script>
<style scoped>
.error-message {
  color: var(--danger);
  font-size: var(--sm);
  font-style: italic;
  margin-bottom: 0;
  padding-top: 1rem;
}

.install-notes {
  flex-direction: column;
}

.ledger-install {
  font-size: var(--sm);
  margin-bottom: 0;
}

.session-footer {
  justify-content: space-between;
}

.address {
  color: var(--link);
  font-weight: 500;
  font-size: 14px;
  white-space: nowrap;
}

.extension-address-item {
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
}
</style>
