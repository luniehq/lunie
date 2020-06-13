<template>
  <div class="account-menu">
    <div class="account-menu-buttons">
      <router-link
        class="account-menu-button account-menu-show-seed"
        :to="{ name: 'reveal', params: { address } }"
      >
        <i class="material-icons notranslate" style="color: #3d728e;"
          >visibility</i
        >
      </router-link>
    </div>
    <!-- <RevealSeedModal v-if="command === `show-seed`" :address="address" />
    <AccountModal v-else-if="command !== '' && command !== `show-seed`" /> -->
  </div>
</template>

<script>
import { mapGetters } from "vuex"
import RevealSeedModal from "common/RevealSeedModal"
import AccountModal from "common/AccountModal"
import gql from "graphql-tag"

export default {
  name: `account-menu`,
  components: {
    RevealSeedModal,
    AccountModal,
  },
  props: {
    address: {
      type: String,
      required: true,
    },
  },
  data: () => {
    return {
      seed: '',
      command: '',
    }
  },
  methods: {
    accountMenuController(command) {
      this.command = command
    },
    close() {
      console.log('I should make this component disappear')
    }
  }
}
</script>
<style scoped>
.account-menu {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: absolute;
  right: 0;
  top: 16px;
}

.account-balance {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 60%;
  padding: 1rem;
  background: var(--app-fg);
  border-radius: 0.6rem;
  border: 2px solid var(--bc-dim);
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
