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
}

.circle--default {
  border: 0.1rem var(--grey) solid;
  border-radius: 1rem;
  fill: transparent;
  width: 1.2rem;
  height: 1.2rem;
  margin: 0 auto;
  margin-bottom: 0.3rem;
  font-size: var(--xs);
}

.active {
  border-color: var(--tertiary);
}

svg {
  display: inline-block;
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

.grey--line {
  height: 1px;
  width: 20px;
  border: solid var(--grey) 1px;
}

.includeLine::after {
  display: inline-block;
  content: "";
  border-top: 0.15rem solid var(--grey);
  width: 3.12rem;
  margin: 0 1.12rem;
  transform: translateY(-1.15rem);
}

.textActive {
  color: var(--tertiary);
}
</style>
