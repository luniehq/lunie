<template>
  <div class="stepItem">
    <div class="circle--container">
      <div class="circle--default" :class="{ active, includeLine }">
        {{ number }}
      </div>
      <p class="text--default" :class="{ textActive: active }">
        {{ title }}
      </p>
    </div>
  </div>
</template>

<script>
export default {
  name: "StepComponent",
  props: {
    title: {
      type: String,
      required: true
    },
    active: {
      type: Boolean,
      required: true
    },
    number: {
      type: Number,
      required: true
    },
    includeLine: {
      type: Boolean,
      default: true
    }
  }
}
</script>

<style>
.stepItem {
  display: flex;
  flex-direction: row;
  justify-content: center;
  width: 33%;
  cursor: default;
}

.circle--container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  white-space: normal;
  position: relative;
  align-items: center;
}

.circle--default {
  border: 0.1rem var(--grey) solid;
  border-radius: 50%;
  background: var(--app-nav-light);
  width: 1.6rem;
  height: 1.6rem;
  min-height: 1.6rem;
  margin-bottom: 0.75rem;
  font-size: var(--xs);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
}

.active {
  border-color: var(--tertiary);
}

.text--default {
  color: var(--grey);
  font-size: var(--xs);
  font-weight: 500;
  line-height: normal;
  letter-spacing: normal;
  text-align: center;
  margin: 0 auto;
}

.includeLine {
  position: relative;
}

.includeLine::after {
  display: inline-block;
  content: "";
  background: var(--grey);
  width: 50px;
  height: 2px;
  position: absolute;
  left: 25px;
  top: 10px;
}

.textActive {
  color: var(--tertiary);
}
</style>
