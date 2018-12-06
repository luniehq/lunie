<template>
  <div class="fundraiser-warning">
    <div class="fundraiser-warning__title">
      Warning – Do not enter your fundraiser seed. This software has not been
      audited. Never enter your 12-word seed while your computer is connected to
      the internet.
    </div>
    <div class="fundraiser-warning__subtitle">
      Even when we do start supporting fundraiser seeds, don't use it except for
      testing or with small amounts. Soon we will release a command line
      interface to use for the signing of transactions offline including support
      for certain hardware ledgers.
    </div>
  </div>
</template>

<script>
export default { name: `fundraiser-warning` }
</script>

<style>
.fundraiser-warning {
  margin-top: 2rem;
  padding: 0.75rem 1rem 0.875rem;
  background: var(--app-fg);
}

.fundraiser-warning__title {
  padding: 0 0 0.625rem;
  font-weight: bold;
  color: var(--danger);
}

.fundraiser-warning__subtitle {
  color: var(--dim);
  font-size: var(--sm);
}
</style>
