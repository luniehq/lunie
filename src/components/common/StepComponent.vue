<template>
  <div class="stepItem">
    <div class="circle--container">
      <div class="circle--default" :class="isCircleActive">
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
        textActive: this.step === this.stepName
      }
    },
    isCircleActive() {
      return {
        active: this.step === this.stepName
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
  width: 33%;
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
  width: 1.2rem;
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

.textActive {
  color: var(--tertiary);
}
</style>
