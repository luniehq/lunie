<template>
  <div class="tm-li-copy">
    <div class="value">{{ value }}</div>
    <menu> <btn-copy :value="value"></btn-copy> </menu>
  </div>
</template>

<script>
import BtnCopy from "common/TmBtnCopy"
export default {
  name: `tm-li-copy`,
  components: { BtnCopy },
  props: {
    value: {
      type: String,
      required: true
    }
  }
}
</script>

<style>
.tm-li-copy {
  height: 3rem;
  display: flex;
  align-items: center;
  border-bottom: px solid var(--bc-dim);
}

.tm-li-copy:only-child {
  border-bottom: none;
}

.tm-li-copy .value {
  flex: 1;
  padding: 0 1rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tm-li-copy menu {
  display: flex;
  align-items: center;
  padding: 0 0.75em;
}
</style>
