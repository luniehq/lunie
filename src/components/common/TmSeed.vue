<template>
  <div class="seed-phrase">
    <div class="seed-warning">
      <p>
        This backup code is all that is needed to access your account. Please
        make sure to store it in a safe place.
      </p>
    </div>
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
    <div>
      <table class="seed-table">
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
export default {
  name: `TmSeed`,
  props: {
    value: {
      type: String,
      default: ``
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
.seed-table {
  width: calc(100% + 8px);
  border-spacing: 4px;
  border-collapse: separate;
  margin: 0 -4px;
}

.seed-table td {
  text-align: center;
  width: 16.6666666666667%;
  background-color: var(--app-nav-light);
  padding: 0.5rem 0.1rem 0.5rem 0.1rem;
  border-radius: 0.2rem;
  font-size: 0.9rem;
}

.seed-table td .word-number {
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
  color: var(--link);
}

.copy-seed .material-icons {
  font-size: 12px;
}

.seed-phrase .copied {
  padding-bottom: 2px;
  padding-right: 0;
  transition: opacity 500ms ease;
  color: var(--success);
  opacity: 0;
}

.seed-phrase .copied.active {
  opacity: 1;
}

.seed-warning {
  border: 2px solid var(--warning);
  border-radius: 0.25rem;
  margin-bottom: 1rem;
  padding: 0.5rem;
}

.seed-warning p {
  font-size: var(--sm);
  color: var(--warning);
  margin: 0;
}

@media screen and (max-width: 360px) {
  .seed-table td {
    padding: 0.5rem 0.1rem 0.5rem 0.1rem;
    border-radius: 0.2rem;
    font-size: 0.7rem;
  }
}

@media screen and (min-width: 361px) and (max-width: 667px) {
  .seed-table td {
    font-size: 0.8rem;
  }
}
</style>
