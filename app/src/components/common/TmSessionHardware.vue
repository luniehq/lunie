<template>
  <SessionFrame :icon="`vpn_key`">
    <h2 class="session-title">Use my Ledger Nano</h2>

    <template v-if="session.browserWithLedgerSupport">
      <div class="session-main">
        <HardwareState :loading="status === `connect` ? false : true">
          <template v-if="isWindows && !hasHIDEnabled">
            Due to recent Ledger updates, using a Ledger on Windows now requires
            "Experimental Web Platform features" to be enabled.
            <template v-if="isChrome">
              <br />
              <br />
              <p>
                Please copy the link below into a new tab and set the
                "Experimental Web Platform features" flag to "Enabled":
              </p>
              <div
                v-clipboard:copy="hidFeatureLink"
                v-clipboard:success="() => onCopy()"
                class="copy-feature-link"
              >
                {{ hidFeatureLink }}
                <i
                  class="material-icons notranslate copied"
                  :class="{ active: copySuccess }"
                >
                  check
                </i>
              </div>
              <br />
              <br />
            </template>
          </template>
          <template v-else-if="isLinux">
            Since we switched to WebUSB Linux users may experience connection
            issues with their devices.
            <br />
            <br />
            Please visit the following site to learn more about how to fix them:
            <div
              v-clipboard:copy="linuxLedgerConnectionLink"
              v-clipboard:success="() => onCopy()"
              class="copy-feature-link"
            >
              {{ linuxLedgerConnectionLink }}
              <i
                class="material-icons notranslate copied"
                :class="{ active: copySuccess }"
              >
                check
              </i>
            </div>
            <br />
            <br />
          </template>
          <template v-else-if="status === `connect` || status === `detect`">
            <p>
              Please plug in your Ledger&nbsp;Nano and open the Cosmos Ledger
              app
            </p>
          </template>
          <p v-if="connectionError" class="error-message">
            {{ connectionError }}
          </p>
          <TmBtn
            :value="submitCaption"
            :disabled="
              status === `connect` || (isWindows && !hasHIDEnabled)
                ? false
                : `disabled`
            "
            @click.native="signIn()"
          />
        </HardwareState>
      </div>
    </template>

    <div v-else class="session-main">
      <p>
        Please use Chrome or Brave. Ledger is not supported in this browser.
      </p>
    </div>
  </SessionFrame>
</template>

<script>
import TmBtn from "common/TmBtn"
import { mapState, mapGetters } from "vuex"
import HardwareState from "common/TmHardwareState"
import SessionFrame from "common/SessionFrame"
import { getAddressFromLedger } from "scripts/ledger"
import * as Sentry from "@sentry/browser"

export default {
  name: `session-hardware`,
  components: {
    TmBtn,
    SessionFrame,
    HardwareState,
  },
  data: () => ({
    status: `connect`,
    connectionError: null,
    address: null,
    copySuccess: false,
    hidFeatureLink: `chrome://flags/#enable-experimental-web-platform-features`,
    linuxLedgerConnectionLink: `https://support.ledger.com/hc/en-us/articles/360019301813-Fix-USB-issues`,
    navigator: window.navigator,
  }),
  computed: {
    ...mapState([`session`]),
    ...mapGetters([`networkSlug`]),
    ...mapGetters({ networkId: `network` }),
    submitCaption() {
      return {
        connect: "Sign In",
        detect: "Waiting for Ledger",
      }[this.status]
    },
    isWindows() {
      return this.navigator.platform.indexOf("Win") > -1
    },
    isLinux() {
      return this.navigator.platform.indexOf("Lin") > -1
    },
    hasHIDEnabled() {
      return !!this.navigator.hid
    },
    isChrome() {
      const ua = navigator.userAgent.toLowerCase()
      return /chrome|crios/.test(ua) && !/edge|opr\//.test(ua)
    },
  },
  methods: {
    async signIn() {
      this.connectionError = null
      this.status = `detect`
      this.address = null
      try {
        this.address = await getAddressFromLedger(this.networkId, this.$store)
        this.$router.push({
          name: "portfolio",
          params: {
            networkId: this.networkSlug,
          },
        })
      } catch (error) {
        this.status = `connect`
        this.connectionError = error.message
        Sentry.captureException(error)
        return
      }

      await this.$store.dispatch(`signIn`, {
        sessionType: `ledger`,
        address: this.address,
        networkId: this.networkId,
      })
    },
    onCopy() {
      this.copySuccess = true
      setTimeout(() => {
        this.copySuccess = false
      }, 2500)
    },
  },
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

.address {
  color: var(--link);
  font-weight: 500;
  font-size: 14px;
  white-space: nowrap;
}

.form-message {
  font-size: var(--sm);
  font-weight: 500;
  font-style: italic;
  color: var(--dim);
  display: inline-block;
}

.form-message.notice {
  border-radius: 0.25rem;
  border: 1px solid var(--bc-dim);
  background-color: #1c223e;
  font-weight: 400;
  margin: 2rem 0;
  padding: 1rem 1rem;
  font-size: 14px;
  font-style: normal;
  width: 100%;
}

.copy-feature-link {
  display: initial;
  font-size: 0.8rem;
  cursor: pointer;
  margin-bottom: 0.2rem;
  color: var(--link);
}

.copy-feature-link .material-icons {
  font-size: 12px;
}

.copy-feature-link .copied {
  padding-bottom: 2px;
  padding-right: 0;
  transition: opacity 500ms ease;
  color: var(--success);
  opacity: 0;
}

.copy-feature-link .copied.active {
  opacity: 1;
}

.session-main .button {
  margin: 2rem auto 0;
}
</style>
