<template>
  <div class="toggle" :class="buttonWidth">
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
	computed: {
		buttonWidth() {
			if (this.toggleOptions.length === 3) {
				return `three-options`
			} else return ``
		},
	}
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
  width: 100%;
  max-width: 400px;
  margin: 0.25rem 0;
}

.toggle.three-options .toggle-button {
  width: 33%;
}

.toggle-button {
  margin: 0 0.12rem;
  width: 50%;
  border-radius: 0.25rem;
}

.active {
  background: var(--app-fg-hover);
}
</style>
