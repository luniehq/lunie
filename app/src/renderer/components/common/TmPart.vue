<template>
  <section class="tm-part">
    <div class="tm-part-container">
      <header class="tm-part-header" v-if="$slots['title'] || title">
        <div class="tm-part-header-container">
          <div class="tm-part-title h5">
            <template v-if="title">{{ title }}</template>
            <slot name="title" v-else=""></slot>
          </div>
          <menu class="tm-part-menu"> <slot name="menu"></slot> </menu>
        </div>
      </header>
      <main class="tm-part-main"><slot></slot></main>
    </div>
  </section>
</template>

<script>
export default {
  name: `tm-part`,
  props: {
    title: {
      type: String,
      required: true
    }
  }
}
</script>
