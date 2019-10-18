<template>
  <div class="seed-phrase">
    <div
      v-clipboard:copy="value"
      v-clipboard:success="() => onCopy()"
      class="copy-seed"
    >
      Copy to clipboard
      <i class="material-icons copied" :class="{ active: copySuccess }">
        check
      </i>
    </div>
    <div v-if="legacy">
      <FieldSeed id="sign-up-seed" v-model="value" disabled />
    </div>
    <div v-else>
      <table>
        <tr>
          <td v-for="(word, index) in splitSeed.slice(0, 6)" :key="index">
            <span class="word-number">{{ index + 1 }}</span>
            {{ word }}
          </td>
        </tr>
        <tr>
          <td v-for="(word, index) in splitSeed.slice(6, 12)" :key="index">
            <span class="word-number">{{ index + 7 }}</span>
            {{ word }}
          </td>
        </tr>
        <tr>
          <td v-for="(word, index) in splitSeed.slice(12, 18)" :key="index">
            <span class="word-number">{{ index + 13 }}</span>
            {{ word }}
          </td>
        </tr>
        <tr>
          <td v-for="(word, index) in splitSeed.slice(18, 24)" :key="index">
            <span class="word-number">{{ index + 19 }}</span>
            {{ word }}
          </td>
        </tr>
      </table>
    </div>
  </div>
</template>

<script>
import FieldSeed from "common/TmFieldSeed"
export default {
  name: `TmSeed`,
  components: {
    FieldSeed
  },
  props: {
    value: {
      type: String,
      default: ``
    },
    legacy: {
      type: Boolean,
      default: true
    }
  },
  data: () => ({
    copySuccess: false
  }),
  computed: {
    splitSeed: function() {
      return this.value.split(` `)
    }
  },
  methods: {
    onCopy() {
      this.copySuccess = true
      setTimeout(() => {
        this.copySuccess = false
      }, 2500)
    }
  }
}
</script>
<style scoped>
table {
  width: calc(100% + 8px);
  border-spacing: 4px;
  border-collapse: separate;
  margin: 0 -4px;
}
td {
  text-align: center;
  width: 16.6666666666667%;
  background-color: var(--app-nav-light);
  padding: 0.5rem;
  border-radius: 0.2rem;
  font-size: 0.9rem;
}
td .word-number {
  display: block;
  width: 100%;
  opacity: 0.3;
  /* Prevent user to copy word numbers, we only want the words in their correct order */
  -moz-user-select: none;
  -webkit-user-select: none;
  -ms-user-select: none;
  -o-user-select: none;
  user-select: none;
}

.copy-seed {
  display: initial;
  float: right;
  font-size: 0.8rem;
  cursor: pointer;
  margin-bottom: 0.2rem;
}

.copy-seed .material-icons {
  font-size: 12px;
}

.seed-phrase .copied {
  padding-bottom: 2px;
  padding-right: 0;
  transition: opacity 500ms ease;
}

.seed-phrase .copied.active {
  color: var(--success);
  opacity: 1;
}
</style>
