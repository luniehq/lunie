<template>
  <div class="account-menu">
    <div class="account-menu-buttons">
      <div class="account-menu-button-container">
        <router-link
          class="account-menu-button account-menu-show-seed"
          :to="{ name: 'reveal', params: { address } }"
        >
          <i class="material-icons notranslate">visibility</i>
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
/* Somehow this is not being detected in extension. Needs to be here */
.material-icons {
  font-weight: normal;
  font-style: normal;
  font-size: 24px;
  display: inline-block;
  line-height: 1;
  text-transform: none;
  letter-spacing: normal;
  word-wrap: normal;
  white-space: nowrap;
  direction: ltr;
}

.account-menu {
  display: flex;
  align-items: center;
  position: absolute;
  right: 0;
  top: 0.75rem;
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
}

.account-menu-button-span {
  margin-top: 0.5em;
  font-size: 0.75em;
  color: var(--faded-blue);
}

.account-menu-button.account-menu-edit {
  background: #dbf7e6;
}

.account-menu-button.account-menu-delete {
  background: #fad3cd;
}

.account-menu-button.account-menu-show-seed {
  background: #b0d1e3;
  color: #3d728e;
}
</style>
