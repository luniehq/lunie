<template>
  <Bar
    class="sunsetting-warning-bar"
    :show="true"
    :hide-close="true"
    bar-type="info"
  >
    We are sunsetting the Lunie Browser Extension. Please read our announcement
    for more information.
    <a
      href="https://medium.com/luniehq/sunsetting-lunie-io-66d566c14ba1"
      target="_blank"
      >here.</a
    >
  </Bar>
</template>

<script>
import Bar from 'common/Bar'

export default {
  name: `sunsetting-warning-bar`,
  components: {
    Bar
  }
}
</script>

<style>
.sunsetting-warning-bar {
  margin: 0;
}

.bar-container {
  margin: 0 0 1rem !important;
}

.bar {
  padding: 0.75rem 0.75rem 0 !important;
}

.left {
  padding: 0;
  font-size: 12px;
}
</style>
