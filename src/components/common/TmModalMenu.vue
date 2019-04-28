<template>
  <div class="tm-modal-menu">
    <slot />
  </div>
</template>

<script>
export default { name: `tm-modal-menu` }
</script>

<style>
.tm-modal-menu {
  background: var(--app-bg-alpha);
  z-index: var(--z-default);
  user-select: none;
  backdrop-filter: blur(0.5rem);
  overflow-y: scroll;
}

@media screen and (max-width: 1023px) {
  .tm-modal-menu {
    padding-top: 3rem;
    height: 100vh;
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    width: 100vw;
  }
}
</style>
