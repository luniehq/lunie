<template>
  <div class="stepItem">
    <div class="circle--container">
      <div class="circle--default">
        {{ stepNumber }}
      </div>
      <p class="text--default" :class="isActive">
        {{ stepTitle }}
      </p>
    </div>
  </div>
</template>

<script>
export default {
  name: "StepComponent",
  props: {
    stepTitle: String,
    step: String,
    stepName: String,
    stepNumber: String,
    includeLine: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    isActive() {
      return {
        active: this.step === this.stepName,
        textActive: this.step === this.stepName
      }
    }
  }
}
</script>

<style>
.stepItem {
  display: flex;
  flex-direction: row;
  justify-content: center;
}

.circle--container {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.circle--default {
  border: 0.1rem var(--grey) solid;
  border-radius: 1rem;
  fill: transparent;
  width: 1.75rem;
  margin: 0 auto;
  margin-bottom: 0.5rem;
}

.active {
  stroke: var(--tertiary);
  stroke-width: 2;
  fill: rgba(252, 49, 167, 0.25);
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

.textActive {
  color: var(--tertiary);
}
</style>
