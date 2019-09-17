<template>
  <div class="danger-zone">
    <h2>DANGER ZONE</h2>
    <p>
      Did you know that storing your key in the browser is considered unsafe? We
      offer a more secure way to storing your keys via our
      <a
        href="http://bit.ly/lunie-ext"
        target="_blank"
        rel="noopener norefferer"
        >browser extension</a
      >. Check it out in a quiet minute. Soon you will also have out mobile app
      available to store your keys. Stay tuned!
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
