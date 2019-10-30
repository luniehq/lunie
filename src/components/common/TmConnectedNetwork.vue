<template>
  <div class="sidebar-bottom">
    <TmBtn
      id="intercom-button"
      class="intercom-button"
      value="Help / Feedback"
      type="secondary"
      size="small"
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
          :to="{
            name: `block`,
            params: { height: block.height }
          }"
        >
          #{{ block.height | prettyInt }}
        </router-link>
        <template v-else>
          --
        </template>
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
        v-tooltip.top="'Seeking connection'"
        class="
        tm-connected-network__string
        tm-connected-network__string--connecting
      "
      >
        Connecting…
      </div>
    </div>
  </div>
</template>
<script>
import { mapGetters } from "vuex"
import { prettyInt } from "scripts/num"
import TmBtn from "common/TmBtn"
import { NewBlockSubscription } from "src/gql"
import gql from "graphql-tag"

export default {
  name: `tm-connected-network`,
  components: {
    TmBtn
  },
  filters: {
    prettyInt
  },
  data: () => ({
    block: {}
  }),
  computed: {
    ...mapGetters([`network`]),
    networkTooltip() {
      if (!this.$apollo.queries.block.loading) {
        return `You're connected to ${this.block.chainId}.`
      } else {
        return `Seeking connection`
      }
    }
  },
  apollo: {
    block: {
      query: gql`
        query Block($networkId: String!) {
          block(networkId: $networkId) {
            height
            chainId
          }
        }
      `,
      variables() {
        return {
          networkId: this.network
        }
      }
    },
    $subscribe: {
      blockAdded: {
        variables() {
          return {
            networkId: this.network
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
          this.block = data.blockAdded
        }
      }
    }
  }
}
</script>

<style scoped>
.sidebar-bottom {
  margin: 0.5rem;
  padding: 0.5rem;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  max-width: 208px; /* sidebar width minus margin */
}

.intercom-button {
  width: 100%;
  margin: 1rem 0;
}

.tm-connected-network {
  align-items: center;
  border-radius: 0.25rem;
  color: var(--dim);
  display: flex;
  font-size: var(--sm);
  justify-content: space-between;
  padding: 0.5rem 0 0;
}

.tm-connected-network .chain-id {
  font-weight: 500;
  padding-right: 1rem;
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

@media screen and (max-width: 767px) {
  .sidebar-bottom {
    max-width: 100%;
  }
}
</style>
