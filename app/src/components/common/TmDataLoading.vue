<template>
  <div class="spinner-container">
    <img
      class="spinner"
      src="/img/spinner_blue@256.gif"
      alt="a small spinning circle to display loading"
    />
  </div>
</template>

<script>
export default {
  name: `tm-data-loading`,
}
</script>
<style>
.spinner-container {
  display: flex;
  justify-content: center;
  width: 100%;
  height: 100%;
  padding: 1rem;
}

.spinner {
  height: 45px;
  width: 45px;
}
</style>
