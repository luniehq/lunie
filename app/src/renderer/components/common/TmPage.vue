<template>
  <div class="tm-page">
    <tm-page-header>
      <h2 v-if="title" slot="title">{{ title }}</h2>
      <h3 v-if="subtitle" slot="subtitle">{{ subtitle }}</h3>
      <template slot="menu-body">
        <slot name="menu-body"></slot>
      </template>
      <div slot="menu"><slot name="menu"></slot></div>
    </tm-page-header>
    <main class="tm-page-main"><slot></slot></main>
  </div>
</template>

<script>
import PerfectScrollbar from "perfect-scrollbar"
import TmPageHeader from "./TmPageHeader.vue"
export default {
  name: `tm-page`,
  components: {
    TmPageHeader
  },
  props: {
    title: {
      type: String,
      default: ``
    },
    subtitle: {
      type: String,
      default: ``
    },
    "menu-body": {
      type: String,
      default: ``
    }
  },
  data: () => ({ ps: `` }),
  async mounted() {
    await this.$nextTick()
    const container = this.$el.querySelector(`.tm-page-main`)
    this.ps = new PerfectScrollbar(container)
  }
}
</script>

<style>
.tm-page {
  flex: 1;
  display: flex;
  flex-flow: column nowrap;
  position: relative;
  width: 100%;
}

.tm-page-main {
  flex: 1;
  position: relative;
}

.tm-page-title {
  color: var(--bright);
  font-size: h2;
  padding: 0.5rem 1rem 1rem;
}

.tm-page-subtitle > div {
  color: var(--dim);
  font-size: var(--sm);
}

@media screen and (min-width: 768px) {
  .tm-page-main {
    padding: 1rem;
  }
}
</style>
