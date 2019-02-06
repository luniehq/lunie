<template>
  <tr class="panel-sort-container">
    <th
      v-for="property in properties"
      :key="property.value"
      :class="{ 'sort-by': sort }"
      class="panel-sort-table-header"
    >
      <a
        v-if="sort"
        v-tooltip.top="property.tooltip"
        class="sort-by-link"
        @click="orderBy(property.value)"
        >{{ property.title }}</a
      >
      <span v-else="!sort">{{ property.title }}</span>
    </th>
  </tr>
</template>

<script>
export default {
  name: `panel-sort`,
  props: {
    sort: {
      type: Object,
      default: null
    },
    properties: {
      type: Array,
      required: true
    }
  },
  methods: {
    orderBy(property) {
      const sortBys = this.$el.querySelectorAll(`.sort-by`)
      sortBys.forEach(el => el.classList.remove(`active`, `desc`, `asc`))
      const index = this.properties.findIndex(p => p.value === property)
      const el = sortBys[index]

      if (this.sort.property === property) {
        if (this.sort.order === `asc`) {
          this.sort.order = `desc`
        } else {
          this.sort.order = `asc`
        }
      } else {
        this.sort.property = property
      }
      if (this.sort.order === `asc`) {
        el.classList.add(`asc`)
      } else {
        el.classList.add(`desc`)
      }
      el.classList.add(`active`)
    }
  }
}
</script>

<style>
.panel-sort-container {
  padding: 1rem;
}

.panel-sort-table-header {
  font-size: var(--sm);
}

.sort-by a {
  cursor: pointer;
  user-select: none;
}

.sort-by:after {
  content: "\f0d8";
  color: var(--link);
  display: inline-block;
  font-family: FontAwesome;
  padding-left: 4px;
}

.sort-by.asc:after {
  color: var(--tertiary);
}

.sort-by.desc:after {
  content: "\f0d7";
  color: var(--tertiary);
}
</style>
