<template>
  <div class="account-menu">
    <div>
      <span>{{ accountBalance.amount }}</span>
      &nbsp;
      <span>{{ accountBalance.denom }}</span>
    </div>
    <div class="account-menu-buttons">
      <div
        class="account-menu-button account-menu-edit"
        @click="accountMenuController(`edit`)"
      >
        <i class="material-icons notranslate" style="color: #62D08E">create</i>
      </div>
      <div
        class="account-menu-button account-menu-delete"
        @click="accountMenuController(`delete`)"
      >
        <i class="material-icons notranslate" style="color: #f67f70;">delete</i>
      </div>
      <div
        class="account-menu-button account-menu-show-seed"
        @click="accountMenuController(`show-seed`)"
      >
        <i class="material-icons notranslate" style="color: #3d728e;"
          >visibility</i
        >
      </div>
    </div>
    <RevealSeedModal v-if="displayRevealSeed" :address="address" />
  </div>
</template>

<script>
import { mapGetters } from "vuex"
import RevealSeedModal from "common/RevealSeedModal"
import gql from "graphql-tag"

export default {
  name: `account-menu`,
  components: {
    RevealSeedModal,
  },
  props: {
    address: {
      type: String,
      required: true,
    },
  },
  data: () => {
    return {
      seed: "",
      displayRevealSeed: false,
      balances: [],
    }
  },
  computed: {
    ...mapGetters([`network`, `stakingDenom`]),
    accountBalance() {
      if (this.balances && this.balances.length > 0) {
        return this.balances.find(({ denom }) => denom === this.stakingDenom)
      } else {
        return { amount: 0, denom: this.stakingDenom }
      }
    },
  },
  methods: {
    accountMenuController(command) {
      if (command === `show-seed`) {
        this.displayRevealSeed = true
      }
    },
  },
  apollo: {
    balances: {
      query: gql`
        query Balances($networkId: String!, $address: String!) {
          balances(networkId: $networkId, address: $address) {
            amount
            denom
          }
        }
      `,
      /* istanbul ignore next */
      skip() {
        return !this.address
      },
      /* istanbul ignore next */
      variables() {
        return {
          networkId: this.network,
          address: this.address,
        }
      },
      /* istanbul ignore next */
      update(data) {
        return data.balances || []
      },
    },
  },
}
</script>
<style scoped>
.account-menu {
  display: flex;
  justify-content: space-between;
}

.account-menu-buttons {
  display: flex;
}

.account-menu-button {
  margin-right: 1em;
  cursor: pointer;
  border-radius: 50%;
  padding: 0.5em;
  height: 2.5em;
  width: 2.5em;
}

.account-menu-button.account-menu-edit {
  background: #DBF7E6;
}

.account-menu-button.account-menu-delete {
  background: #fad3cd;
}

.account-menu-button.account-menu-show-seed {
  background: #b0d1e3;
}
</style>
