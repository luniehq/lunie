<template>
  <div class="tm-data-msg">
    <img
      class="tm-data-msg__icon"
      src="~assets/images/loader.svg"
      alt="a small spinning circle to display loading"
    />
    <div class="tm-data-msg__text">
      <div slot="title" class="tm-data-msg__title">
        Finding connection
      </div>
      <div slot="subtitle" class="tm-data-msg__subtitle">
        You are currently not connected to a node. We will load this information
        when a connection is established.
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: `tm-data-connecting`
}
</script>
