<template>
  <header class="tm-page-header">
    <div class="tm-page-header-container">
      <div class="tm-page-header-text">
        <div v-if="$slots['title']" class="tm-page-header-title">
          <slot name="title" />
        </div>
        <div v-if="$slots['subtitle']" class="tm-page-header-subtitle">
          <slot name="subtitle" />
        </div>
        <div v-if="$slots['menu-body']" class="tm-page-header-body">
          <slot name="menu-body" />
        </div>
      </div>
      <menu class="tm-page-header-menu">
        <slot name="menu" />
      </menu>
      <tabs v-if="tabs" :tabs="tabs" />
      <div v-if="$slots['header-buttons']" class="header-buttons">
        <slot name="header-buttons" />
      </div>
    </div>
  </header>
</template>

<script>
import Tabs from "common/Tabs"
export default {
  name: `tm-page-header`,
  components: {
    Tabs
  },
  props: {
    tabs: {
      type: Array,
      default: () => []
    }
  }
}
</script>

<style>
.tm-page-header {
  -webkit-app-region: drag;
}

.header-buttons {
  align-self: flex-start;
  margin-left: auto;
  position: relative;
  bottom: 4px;
}

.tm-page-header-title {
  font-size: var(--xl);
}

.tm-page-header-title > div {
  display: inline-block;
}

.tm-page-header-container {
  min-height: 4.22rem;
  flex-wrap: wrap;
  border-bottom: 1px solid var(--bc-dim);
  display: flex;
  padding: 0 1rem 0 1rem;
}

.tm-page-header-text {
  flex-basis: 100%;
  display: flex;
  min-width: 0;
  padding: 11px 0 0 0;
  align-items: center;
}

.tm-page-header-text .tm-page-header-body {
  flex: 1;
  display: flex;
  justify-content: flex-end;
}

.tm-page-header-text .tool-bar i.material-icons {
  font-size: calc(1.375 * var(--x));
}

.tm-page-header-text > div {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tm-page-header-text h2 {
  font-size: var(--xl);
  font-weight: 500;
  color: var(--bright);
}

@media screen and (min-width: 1024px) {
  .tm-page-header {
    border-bottom-color: var(--bc);
  }

  .tm-page-header-container {
    display: flex;
  }

  .tm-page-header-menu {
    display: flex;
    align-items: flex-start;
    padding-top: 11px;
  }
}
</style>
