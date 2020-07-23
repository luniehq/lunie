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
    <!-- <div class="show-mobile-sorting">
      <i
        :class="{ active: showMobileSorting }"
        class="filter-toggle material-icons notranslate"
        @click="toggleMobileSorting"
        >filter_list</i
      >
    </div>
    <transition name="fade">
      <ul v-if="showMobileSorting" class="sortingOptions">
        <li
          :class="{ active: isSortedBy(`popularity`) }"
          @click="sortBy(`popularity`)"
        >
          <i class="sorting-icon material-icons notranslate">star_rate</i>
          Popular on Lunie
          <i
            :class="{ inactive: !isSortedBy(`popularity`) }"
            class="sorting-check material-icons notranslate"
            >check</i
          >
        </li>
        <li
          :class="{ active: isSortedBy(`votingPower`) }"
          @click="sortBy(`votingPower`)"
        >
          <i class="sorting-icon material-icons notranslate">flash_on</i> Voting
          Power
          <i
            :class="{ inactive: !isSortedBy(`votingPower`) }"
            class="sorting-check material-icons notranslate"
            >check</i
          >
        </li>
        <li
          :class="{ active: isSortedBy(`expectedReturns`) }"
          @click="sortBy(`expectedReturns`)"
        >
          <i class="sorting-icon material-icons notranslate">emoji_events</i>
          Most Rewards
          <i
            :class="{ inactive: !isSortedBy(`expectedReturns`) }"
            class="sorting-check material-icons notranslate"
            >check</i
          >
        </li>
      </ul>
    </transition> -->
  </div>
</template>

<script>
import { capitalize } from "src/filters"

export default {
	name: `toggle`,
	filters: {
		capitalize,
	},
	data: () => ({
		showMobileSorting: true,
	}),
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
	},
	methods: {
		toggleMobileSorting() {
      this.showMobileSorting = !this.showMobileSorting
		}
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
