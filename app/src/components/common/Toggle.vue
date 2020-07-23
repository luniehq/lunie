<template>
  <div class="toggle">
    <button
      v-for="option in toggleOptions"
      :key="option"
      :class="{ active: option === currentSelection }"
      class="toggle-button"
      @click="$emit(`sort`, option)"
    >
      {{ option | capitalize }}
    </button>
    <!-- <TmBtn
      v-for="option in toggleOptions"
      :key="option.name"
      :value="option.name"
      class="toggle-button"
      :type="popularSort ? `active` : `secondary`"
      @click.native="defaultSelectorsController(`popularSort`)"
    /> -->
    <!-- <TmBtn
      value="All"
      class="toggle-button"
      :type="allValidators ? `active` : `secondary`"
      @click.native="defaultSelectorsController(`allValidators`)"
    />
    <TmBtn
      value="Active"
      class="toggle-button"
      :type="activeOnly ? `active` : `secondary`"
      @click.native="defaultSelectorsController(`activeOnly`)"
    />
    <div class="show-mobile-sorting">
      <i
        :class="{ active: showMobileSorting }"
        class="filter-toggle material-icons notranslate"
        @click="toggleMobileSorting"
        >filter_list</i
      >
    </div> -->
  </div>
</template>

<script>
import { capitalize } from "src/filters"

export default {
	name: `toggle`,
	components: {
	},
	filters: {
		capitalize,
	},
	props: {
		toggleOptions: {
			type: Array,
			required: true
		},
		currentSelection: {
			type: String,
			required: true
		}
	},
}
</script>

<style scoped>
button {
  font-family: var(--sans);
  font-size: 14px;
  font-weight: 400;
  display: flex;
  align-items: center;
  justify-content: center;
  width: auto;
  min-width: 100px;
  margin: 0;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.5s ease;
  white-space: nowrap;
  outline: none;
  height: 36px;
  background: transparent;
  border: none;
  color: var(--txt);
}

button:hover {
  background: var(--app-fg-hover);
}

.toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--app-fg);
  padding: 0.25rem;
  border-radius: 0.25rem;
}

.toggle-button {
  min-width: 120px;
  margin: 0 0.12rem;
  width: 100%;
  border-radius: 0.25rem;
}

.active {
  background: var(--app-fg-hover);
}
</style>
