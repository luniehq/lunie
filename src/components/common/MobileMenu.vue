<template>
  <menu>
    <router-link
      class="mobile-menu-item"
      to="/portfolio"
      exact="exact"
      title="Portfolio"
    >
      <i class="material-icons">star</i>
      <h2 class="app-menu-title">
        Portfolio
      </h2>
    </router-link>
    <router-link class="mobile-menu-item" to="/validators" title="Validators">
      <i class="material-icons">sort</i>
      <h2 class="app-menu-title">
        Validators
      </h2>
    </router-link>
    <router-link class="mobile-menu-item" to="/proposals" title="Proposals">
      <i class="material-icons">add_circle_outline</i>
      <h2 class="app-menu-title">
        Proposals
      </h2>
    </router-link>
    <router-link
      class="mobile-menu-item"
      to="/transactions"
      exact="exact"
      title="Transactions"
    >
      <i class="material-icons">show_chart</i>
      <h2 class="app-menu-title">
        Activity
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
  width: 100vw;
  display: flex;
  z-index: calc(var(--z-appHeader) - 2);
  background: var(--app-nav);
  flex-flow: row;
  align-items: center;
  justify-content: center;
}

menu a {
  display: flex;
  flex-direction: column;
  text-align: center;
  padding: 0.4rem;
  width: 25%;
}

menu a i {
  font-size: 18px;
}

.mobile-menu-item.router-link-active {
  color: var(--tertiary);
}

menu a:not(.router-link-active) {
  color: var(--bright);
}

menu a h2 {
  padding-top: 2px;
  font-size: 8px;
  font-weight: 500;
}

@media screen and (min-width: 668px) {
  menu {
    display: none;
  }
}
</style>
