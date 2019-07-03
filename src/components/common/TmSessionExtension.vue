<template>
  <session-frame>
    <div class="session">
      <div class="session-container">
        <h2 class="session-title">
          Use Lunie Browser extension
        </h2>
        <div v-if="!extension.enabled" class="session-main">
          <p>
            Please install the Lunie Browser Extension from the
            <a
              href="https://chrome.google.com/webstore/category/extensions"
              target="_blank"
              rel="noopener norefferer"
              >Chrome Web Store</a
            >.
          </p>
        </div>

        <div v-if="extension.enabled" class="session-main">
          <div :icon="extension.enabled ? 'laptop' : 'info'">
            <div v-if="extension.enabled">
              Click below to open the Lunie Browser Extension, or use one of the
              existing address.
              <ul>
                <li v-for="account in extension.accounts" :key="account.name">
                  <div class="extension-address-item">
                    <div>
                      {{ account.name }}<br />
                      <TmBtn
                        type="anchor"
                        :value="account.address | formatBech32"
                        color="primary"
                        @click.native="signIn(account.address)"
                      />
                    </div>
                    <div>
                      <TmBtn
                        value="Use Address"
                        color="primary"
                        @click.native="signIn(account.address)"
                      />
                    </div>
                  </div>
                </li>
              </ul>
            </div>
            <div v-else>
              Use the Lunie Browser Extension to securely store your keys, and
              safely perform transactions.
            </div>
          </div>

          <div class="session-footer">
            <p class="ledger-install">
              You can find the Lunie Browser Extension in the
              <a
                href="https://chrome.google.com/webstore/category/extensions"
                target="_blank"
                rel="noopener norefferer"
                >Chrome Web Store</a
              >
            </p>
          </div>
        </div>
      </div>
    </div>
  </session-frame>
</template>

<script>
import TmBtn from "common/TmBtn"
import SessionFrame from "common/SessionFrame"
import { mapGetters } from "vuex"
import { formatBech32 } from "src/filters"
export default {
  name: `session-extension`,
  components: {
    SessionFrame,
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
