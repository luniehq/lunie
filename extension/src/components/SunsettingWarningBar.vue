<template>
  <Bar class="sunsetting-warning-bar" :show="true" bar-type="info">
    Lunie Extension will be soon sunset along with the rest of the Lunie
    products and won't receive further support. More infos can be found in
    <a
      href="https://medium.com/luniehq/sunsetting-lunie-io-66d566c14ba1"
      target="_blank"
      >this article.</a
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
  font-size: 0.85rem;
}
</style>
