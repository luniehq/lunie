<template>
  <Bar class="sunsetting-warning-bar" :show="true" bar-type="info">
    Lunie Extension will be soon sunset and won't receive further support. More
    infos can be found
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

.left {
  padding: 0;
  font-size: 12px;
}

.bar {
  padding: 0.75rem 0.75rem 0 !important;
}
</style>
