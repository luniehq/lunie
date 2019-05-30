<template>
  <form :class="cssClass" @submit.prevent="submit">
    <div class="tm-form-container">
      <slot name="overlay" />
      <header v-if="hasHeader" class="tm-form-header">
        <div class="tm-form-title">
          <slot name="title" />
        </div>
        <div class="tm-form-subtitle">
          <slot name="subtitle" />
        </div>
      </header>
      <main class="tm-form-main">
        <slot />
      </main>
      <footer v-if="hasFooter" class="tm-form-footer">
        <slot name="footer" />
      </footer>
    </div>
  </form>
</template>

<script>
// NOTICE
// Remember that v-on:submit will NOT work on this component
// Use :submit="onSubmit on the parent component and it'll save you headaches
export default {
  name: `tm-form-struct`,
  props: {
    width: {
      type: String,
      default: ``
    },
    submit: {
      type: Function,
      required: true
    }
  },
  computed: {
    cssClass() {
      let value = `tm-form`
      if (this.width === `narrow`) value += ` tm-form-narrow`
      return value
    },
    hasHeader() {
      return this.$slots[`title`] || this.$slots[`subtitle`]
    },
    hasFooter() {
      return this.$slots[`footer`]
    }
  }
}
</script>
