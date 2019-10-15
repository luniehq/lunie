<template>
  <div class="danger-zone">
    <h2>DANGER ZONE</h2>
    <p>
      Did you know that creating your address in the browser is considered
      unsafe? We offer a more secure way to do this with our
      <a
        href="http://bit.ly/lunie-ext"
        target="_blank"
        rel="noopener norefferer"
        >browser extension</a
      >. Check it out in a quiet minute.
    </p>
  </div>
</template>

<style scoped>
.danger-zone {
  border: 2px solid var(--danger-bc);
  border-radius: 0.25rem;
  margin: 1rem 0;
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
