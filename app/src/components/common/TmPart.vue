<template>
  <section class="tm-part">
    <div class="tm-part-container">
      <header v-if="$slots['title'] || title" class="tm-part-header">
        <div class="tm-part-header-container">
          <div class="tm-part-title h5">
            <template v-if="title">
              {{ title }}
            </template>
            <slot v-else="" name="title" />
          </div>
          <menu class="tm-part-menu">
            <slot name="menu" />
          </menu>
        </div>
      </header>
      <main class="tm-part-main">
        <slot />
      </main>
    </div>
  </section>
</template>

<script>
export default {
  name: `tm-part`,
  props: {
    title: {
      type: String,
      default: null,
    },
  },
}
</script>
