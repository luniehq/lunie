<template>
  <div class="danger-zone">
    <h2>DANGER ZONE</h2>
    <p>
      Creating an address in the browser is not advised. This feature is only
      enabled in insecure mode for testing purposes and should not be used
      otherwise.
    </p>
  </div>
</template>
  
<style scoped>
.danger-zone {
  border: 2px solid var(--danger-bc);
  border-radius: 0.25rem;
  margin-bottom: 1rem;
  padding: 1rem;
}

.danger-zone p {
  font-size: var(--sm);
  color: var(--danger);
  margin: 0;
}

.danger-zone h2 {
  font-weight: 700;
  font-size: var(--m);
  color: var(--danger);
  padding-bottom: 0.25rem;
}
</style>
