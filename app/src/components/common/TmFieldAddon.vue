<template>
  <div class="tm-field-addon">
    <slot />
  </div>
</template>

<script>
export default { name: `tm-field-addon` }
</script>

<style>
.tm-field-addon {
  background: var(--app-bg);
  border: var(--px) solid var(--bc);
  display: flex;
  align-items: center;
  justify-content: center;
  height: 2rem;
  min-width: 2rem;
  padding: 0 0.5rem;
}

.tm-field-addon + .tm-btn {
  margin-left: 1rem;
}
</style>
