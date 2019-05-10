<template>
  <footer>
    <ul>
      <li>
        <router-link
          class="app-menu-item-small"
          to="/about"
          exact="exact"
          title="About"
        >
          About
        </router-link>
      </li>
      <li>
        <router-link
          class="app-menu-item-small"
          to="/careers"
          exact="exact"
          title="Careers"
        >
          Careers
        </router-link>
      </li>
      <li>
        <router-link
          class="app-menu-item-small"
          to="/security"
          exact="exact"
          title="Security"
        >
          Security
        </router-link>
      </li>
      <li>
        <router-link
          class="app-menu-item-small"
          to="/terms"
          exact="exact"
          title="Terms"
        >
          Terms of Service
        </router-link>
      </li>
      <li>
        <router-link
          class="app-menu-item-small"
          to="/privacy"
          exact="exact"
          title="Privacy"
        >
          Privacy Policy
        </router-link>
      </li>
    </ul>
  </footer>
</template>

<script>
export default { name: `tm-page-footer` }
</script>

<style scoped>
footer {
  width: 100%;
  background: var(--app-fg);
  padding: 0.5rem;
  margin-top: 1rem;
}

ul {
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

ul li {
  display: inline;
}

.app-menu-item-small {
  display: inline-block;
  justify-content: space-between;
  align-items: center;
  padding: 0.25rem 0.25rem;
  margin: 0 0.5rem;
  color: var(--dim);
  border-radius: 0.25rem;
  font-size: var(--sm);
}
</style>
