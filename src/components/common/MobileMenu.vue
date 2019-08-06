<template>
  <menu>
    <router-link
      class="mobile-menu-item"
      to="/portfolio"
      exact="exact"
      title="Portfolio"
    >
      <i class="material-icons">account_balance_wallet</i>
      <h2 class="app-menu-title">
        Portfolio
      </h2>
    </router-link>
    <router-link class="mobile-menu-item" to="/validators" title="Validators">
      <i class="material-icons">add_box</i>
      <h2 class="app-menu-title">
        Validators
      </h2>
    </router-link>
    <router-link
      class="mobile-menu-item"
      to="/transactions"
      exact="exact"
      title="Transactions"
    >
      <i class="material-icons">swap_horiz</i>
      <h2 class="app-menu-title">
        Transactions
      </h2>
    </router-link>
    <router-link class="mobile-menu-item" to="/proposals" title="Proposals">
      <i class="material-icons">how_to_vote</i>
      <h2 class="app-menu-title">
        Proposals
      </h2>
    </router-link>
  </menu>
</template>

<script>
export default {
  name: `mobile-menu`
}
</script>

<style scoped>
menu {
  position: fixed;
  bottom: 0;
  height: 4rem;
  width: 100vw;
  display: flex;
  z-index: calc(var(--z-appHeader) - 1);
  background: var(--app-nav);
  flex-flow: row;
  align-items: center;
  justify-content: center;
}

menu a {
  display: flex;
  flex-direction: column;
  text-align: center;
  padding: 0.5rem;
}

menu a:not(.router-link-active) {
  color: var(--bright);
}

menu a:not(:last-child) {
  margin-right: 1rem;
}

menu a h2 {
  font-size: 12px;
}

@media screen and (min-width: 1023px) {
  menu {
    display: none;
  }
}
</style>
