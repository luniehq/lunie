<template>
  <div class="session-success">
    <h2>Transaction Complete</h2>
    <div>
      <p>You successfully signed the transaction.</p>
    </div>
    <div class="session-footer">
      <router-link to="/accounts">View Accounts</router-link>
    </div>
  </div>
</template>

<script>
export default {
  name: `session-success`
}
</script>

<style scoped>
.session-success {
  padding: 2rem;
  border-left: 1px solid var(--bc-dim);
  background: var(--app-bg);
  color: var(--bright);
  min-height: 540px;
}

.session-success h2 {
  color: var(--bright);
  font-size: var(--h1);
  font-weight: 500;
  line-height: 3rem;
}
</style>
