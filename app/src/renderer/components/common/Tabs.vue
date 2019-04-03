<template>
  <div class="tabs">
    <div
      v-for="tab in tabs"
      :key="tab.pathName"
      :class="{ 'tab-selected': $route.name === tab.pathName }"
      class="tab"
    >
      <router-link :to="{ name: tab.pathName }">
        {{ tab.displayName }}
      </router-link>
    </div>
  </div>
</template>

<script>
export default {
  name: `tabs`,
  props: {
    tabs: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      tabIndex: 1
    }
  }
}
</script>
<style scoped>
.tabs {
  display: flex;
  margin-left: 2rem;
}

.tabs .tab {
  cursor: pointer;
  margin-right: 1.5rem;
  font-size: 1rem;
  letter-spacing: -1px;
}

.tabs .tab a {
  color: var(--dim);
  display: block;
  font-weight: 500;
  padding-bottom: 1rem;
}

.tabs .tab a:hover {
  color: var(--link);
}

.tabs .tab.tab-selected {
  border-bottom: 2px solid var(--tertiary);
}

.tabs .tab.tab-selected a {
  color: var(--bright);
}
</style>
