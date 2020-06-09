<template>
  <div class="tm-field-group">
    <slot />
  </div>
</template>

<script>
export default { name: `tm-field-group` }
</script>

<style>
.tm-field-group {
  display: flex;
  position: relative;
}

.tm-field-group .tm-field {
  flex: 1;
}

.tm-field-group .tm-field,
.tm-field-group .tm-btn-wrapper {
  margin: 0;
}

.tm-field-group .tm-btn-wrapper {
  max-width: 15rem;
}

.tm-field-group .tm-field + .tm-btn-wrapper {
  margin-left: 1rem;
}

.tm-field-group .tm-btn-wrapper + .tm-field {
  margin-left: 1rem;
}
</style>
