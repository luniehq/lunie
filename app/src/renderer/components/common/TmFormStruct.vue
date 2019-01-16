<template>
  <form :class="cssClass" @submit.prevent="submit">
    <div class="tm-form-container">
      <slot name="overlay"></slot>
      <header v-if="hasHeader" class="tm-form-header">
        <div class="tm-form-title"><slot name="title"></slot></div>
        <div class="tm-form-subtitle"><slot name="subtitle"></slot></div>
      </header>
      <main class="tm-form-main"><slot></slot></main>
      <footer v-if="hasFooter" class="tm-form-footer">
        <slot name="footer"></slot>
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

<style>
.tm-form {
  display: flex;
  position: relative;
  width: var(--width-main);
}

.tm-form-container {
  flex: 1;
  display: flex;
  flex-flow: column;
  position: relative;
}

.tm-form-header:empty,
.tm-form-title:empty,
.tm-form-subtitle:empty,
.tm-form-main:empty,
.tm-form-footer:empty {
  display: none;
}

.tm-form-main {
  flex: 1;
}

.tm-form-header {
  display: flex;
  flex-flow: column nowrap;
  border-bottom: var(--px) solid var(--bc);
  position: relative;
  padding: 1rem 0;
}

.tm-form-title {
  line-height: 1rem;
  color: var(--bright);
}

.tm-form-subtitle {
  color: var(--dim);
  font-size: var(--sm);
  line-height: 1rem;
}

.tm-form-footer > div {
  padding: 1rem 1rem calc(1rem - var(--px));
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tm-form-footer > div > *:not(:last-child) {
  margin-right: 1rem;
}

@media screen and (min-width: 480px) {
  .tm-form-title {
    line-height: 1.5rem;
    margin-bottom: 0.5rem;
  }

  .tm-form-subtitle {
    font-size: var(--m);
  }

  .tm-form-main p {
    margin: 1rem 1rem 0;
  }
}
</style>
