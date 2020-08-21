<template>
  <button class="back-button" @click="$router.go(-1)">
    <i class="material-icons notranslate arrow">arrow_back</i>
    Back
  </button>
</template>

<script>
export default {
  name: `back-button`,
}
</script>

<style scoped>
.back-button {
  padding: 0.5rem 1rem;
  width: auto;
  font-size: 14px;
  background: transparent;
  color: #7a88b8;
  border: 2px solid rgb(122, 136, 184, 0.1);
  border-radius: 0.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  font-family: var(--sans);
}

.back-button i {
  padding-right: 1rem;
  font-size: 1rem;
}

.back-button:hover {
  background-color: rgba(255, 255, 255, 0.02);
}
</style>
