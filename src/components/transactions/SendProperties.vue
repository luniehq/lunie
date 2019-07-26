<template>
  <div>
    <slot :caption="caption">What is going on here</slot>
  </div>
</template>

<script>
export default {
  props: {
    transaction: {
      type: Object,
      required: true
    }
  },
  data: function() {
    return {
      caption: `<b>Sent</b>`
    }
  }
}
</script>
