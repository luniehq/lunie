<template>
  <div class="stepItem" :class="{ active: active }">
    <span class="text--default">
      {{ title }}
    </span>
  </div>
</template>

<script>
export default {
  name: "StepComponent",
  props: {
    title: {
      type: String,
      required: true,
    },
    active: {
      type: Boolean,
      required: true,
    },
  },
}
</script>

<style>
.stepItem {
  display: flex;
  flex-direction: row;
  width: 100%;
  cursor: default;
  padding: 0.5rem 0.5rem 0.5rem 0;
  margin-right: 0.75rem;
  border-bottom: 2px solid var(--bc);
  color: var(--dim);
}

.stepItem:last-child {
  margin-right: 0;
}

.text--default {
  font-size: var(--xs);
  font-weight: 500;
  line-height: normal;
  letter-spacing: normal;
  text-align: left;
}

.active {
  border-color: var(--highlight);
  color: var(--highlight);
}
</style>
