<template>
  <div class="tm-data-msg">
    <img
      class="tm-data-msg__icon"
      src="~assets/images/loader.svg"
      alt="a small spinning circle to display loading"
    />
    <div class="tm-data-msg__text">
      <div slot="title" class="tm-data-msg__title">
        {{ title }}
      </div>
      <div slot="subtitle" class="tm-data-msg__subtitle">
        Please wait a moment.
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: `tm-data-loading`,
  props: {
    title: {
      type: String,
      default: `Data is loading…`
    }
  }
}
</script>
