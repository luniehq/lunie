<template>
  <div class="account-menu">
    <div class="account-menu-buttons">
      <div class="account-menu-button-container">
        <router-link
          class="account-menu-button account-menu-delete-account"
          :to="{ name: 'delete', params: { address, networkId } }"
        >
          <i class="material-icons notranslate show-seed">delete</i>
        </router-link>
        <span class="account-menu-button-span">Delete Account</span>
      </div>
      <div class="account-menu-button-container">
        <router-link
          class="account-menu-button account-menu-show-seed"
          :to="{ name: 'reveal', params: { address } }"
        >
          <i class="material-icons notranslate show-seed">visibility</i>
        </router-link>
        <span class="account-menu-button-span">Show Seed</span>
      </div>
    </div>
  </div>
</template>

<script>
import gql from "graphql-tag"

export default {
  name: `account-menu`,
  props: {
    address: {
      type: String,
      required: true,
    },
    networkId: {
      type: String,
      required: true,
    },
  },
  data: () => {
    return {
      seed: "",
      command: "",
    }
  },
}
</script>
<style scoped>
.account-menu {
  display: flex;
  align-items: center;
  position: absolute;
  right: 0.5rem;
  top: 0.5rem;
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
  cursor: pointer;
  border-radius: 50%;
  padding: 0.5em;
  height: 2.5em;
  width: 2.5em;
}

.account-menu-button-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 0.25rem 0 0;
}

.account-menu-button-span {
  margin-top: 0.5rem;
  font-size: 10px;
  color: var(--faded-blue);
}

.account-menu-button.account-menu-edit {
  background: #dbf7e6;
}

.account-menu-button.account-menu-show-seed {
  background: #b0d1e3;
  color: #3d728e;
}

.account-menu-button.account-menu-delete-account {
  background: #fad3cd;
  color: #f67f70;
}
</style>
