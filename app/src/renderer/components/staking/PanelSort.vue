<template>
  <tr class="panel-sort-container">
    <th
      class="sort-by"
      v-for="(property, i) in properties"
      :class="property.class"
    >
      <a
        class="sort-by-link"
        v-tooltip.top="property.tooltip"
        @click="orderBy(property.value)"
        >{{ property.title }}</a
      >
    </th>
  </tr>
</template>

<script>
export default {
  name: `panel-sort`,
  props: [`sort`, `properties`],
  methods: {
    orderBy(property) {
      let sortBys = this.$el.querySelectorAll(`.sort-by`)
      sortBys.forEach(el => el.classList.remove(`active`, `desc`, `asc`))
      let index = this.properties.findIndex(p => p.value === property)
      let el = sortBys[index]

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

.sort-by {
  font-size: sm;
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
