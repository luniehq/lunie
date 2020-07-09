<template>
  <div class="session session-success">
    <h2>Transaction Complete</h2>
    <div>
      <p>🎉 Your transaction was successfully signed!</p>
    </div>
    <div class="session-footer">
      <router-link to="/accounts">Back to my account list</router-link>
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
  background: var(--app-bg);
  color: var(--txt);
}

.session-success h2 {
  color: var(--bright);
  font-size: var(--h1);
  font-weight: 500;
  line-height: 3rem;
}
</style>
