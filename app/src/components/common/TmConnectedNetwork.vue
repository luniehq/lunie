<template>
  <div class="sidebar-bottom">
    <TmBtn
      v-if="!config.mobileApp"
      id="intercom-button"
      class="intercom-button secondary"
      value="Help / Feedback"
      type="sidebar"
      size="small"
      @click.native="handleIntercom()"
    />
    <div
      v-if="!$apollo.queries.block.loading"
      id="tm-connected-network"
      class="tm-connected-network"
    >
      <div class="tm-connected-network__connection">
        <div id="tm-connected-network__icon" class="tm-connected-network__icon">
          <span
            v-tooltip.top="`Network is up and running`"
            class="tm-connected-network__status green"
          />
        </div>
        <div
          id="tm-connected-network__string"
          class="tm-connected-network__string"
        >
          <span v-tooltip.top="networkTooltip" class="chain-id">
            {{ block.chainId }}
          </span>
        </div>
      </div>
      <div
        id="tm-connected-network__block"
        class="tm-connected-network__string"
      >
        <router-link
          v-if="block.height"
          v-tooltip.top="'Block Height'"
          :class="
            `block-number` && {
              noClickable: !currentNetwork.feature_activity,
            }
          "
          :to="
            !currentNetwork.feature_activity
              ? ``
              : {
                  name: `block`,
                  params: { height: block.height, networkId: networkSlug },
                }
          "
          @click.native="handleClick()"
        >
          #{{ block.height | prettyInt }}
        </router-link>
        <template v-else> -- </template>
      </div>
    </div>
    <div
      v-else
      id="tm-disconnected-network"
      class="tm-connected-network tm-disconnected-network"
    >
      <img
        class="tm-connected-network-loader"
        src="~assets/images/loader.svg"
        alt="a small spinning circle to display loading"
      />
      <div
        class="tm-connected-network__string tm-connected-network__string--connecting"
      >
        Connecting…
      </div>
    </div>
    <PoweredBy
      :network="currentNetwork"
      powered-by-line
      is-menu
      @close-menu="handleClick"
    />
  </div>
</template>
<script>
import { mapState, mapGetters } from "vuex"
import { prettyInt } from "scripts/num"
import TmBtn from "common/TmBtn"
import PoweredBy from "network/PoweredBy"
import gql from "graphql-tag"
import config from "src/../config"

export default {
  name: `tm-connected-network`,
  components: {
    TmBtn,
    PoweredBy,
  },
  filters: {
    prettyInt,
  },
  data: () => ({
    block: {},
    config,
  }),
  computed: {
    ...mapState([`connection`]),
    ...mapGetters([`network`, `currentNetwork`]),
    networkSlug() {
      return this.connection.networkSlug
    },
    networkTooltip() {
      return `You're connected to ${this.block.chainId}.`
    },
  },
  methods: {
    handleClick() {
      this.$emit(`close-menu`)
      window.scrollTo(0, 0)
    },
    handleIntercom() {
      if (config.mobileApp) {
        this.$store.dispatch(`displayMessenger`)
      }
    },
  },
  apollo: {
    block: {
      query: gql`
        query blockV2($networkId: String!) {
          blockV2(networkId: $networkId) {
            id
            height
            chainId
          }
        }
      `,
      /* istanbul ignore next */
      variables() {
        /* istanbul ignore next */
        return {
          networkId: this.network,
        }
      },
      /* istanbul ignore next */
      update: function (result) {
        return result.blockV2
      },
    },
    $subscribe: {
      blockAdded: {
        variables() {
          /* istanbul ignore next */
          return {
            networkId: this.network,
          }
        },
        query() {
          return gql`
            subscription($networkId: String!) {
              blockAdded(networkId: $networkId) {
                height
                chainId
              }
            }
          `
        },
        result({ data }) {
          /* istanbul ignore next */
          this.block = data.blockAdded
        },
      },
    },
  },
}
</script>

<style scoped>
.sidebar-bottom {
  margin: 0.5rem;
  padding: 0.5rem;
  background: var(--app-nav);
}

.noClickable {
  cursor: unset;
}

.noClickable:hover {
  color: var(--link);
}

button.small.intercom-button {
  width: 100%;
  margin: 1rem 0;
  border-color: var(--menu-border);
}

.tm-connected-network {
  align-items: center;
  border-radius: 0.25rem;
  color: var(--menu-text);
  display: flex;
  font-size: var(--sm);
  justify-content: space-between;
  padding: 0.5rem 0 0;
}

.tm-connected-network .chain-id {
  font-weight: 500;
  padding-right: 1rem;
  color: var(--menu-text);
}

.tm-connected-network .exit {
  font-size: var(--sm);
}

.tm-connected-network__icon {
  align-items: center;
  color: var(--success-bc);
  display: flex;
  font-size: var(--m);
  justify-content: center;
  padding-right: 0.25rem;
}

.tm-connected-network__icon .fa-spin {
  color: var(--warning);
}

.tm-connected-network--mocked .tm-connected-network__icon {
  color: var(--warning);
}

.tm-connected-network__connection {
  display: flex;
}

.tm-disconnected-network {
  justify-content: start;
}

.tm-connected-network__string--connecting {
  color: var(--warning);
}

.tm-connected-network-loader {
  height: 1rem;
  margin-right: 0.5rem;
  width: 1rem;
}

.tm-connected-network__status {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--success);
}

.block-number {
  color: var(--menu-link);
}

.block-number:hover {
  color: var(--menu-link-hover);
}

@media screen and (max-width: 1023px) {
  .sidebar-bottom {
    max-width: 100%;
  }
}

@media screen and (max-height: 640px) {
  .sidebar-bottom {
    position: static;
  }
}
</style>
