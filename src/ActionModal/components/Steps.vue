<template>
  <div class="step--container">
    <Step
      v-for="(step, i) in steps"
      :key="step"
      :title="step"
      :active="step.toLocaleLowerCase() === activeStep.toLocaleLowerCase()"
      :number="i + 1"
      :include-line="i < steps.length - 1"
    />
  </div>
</template>

<script>
const Step = () => import(/* webpackChunkName: "Step" */ "./StepComponent")
export default {
  name: "Steps",
  components: {
    Step
  },
  props: {
    steps: {
      type: Array,
      required: true
    },
    activeStep: {
      type: String,
      required: true
    }
  }
}
</script>

<style>
.step--container {
  display: flex;
  flex-direction: row;
  text-align: center;
  justify-content: space-between;
  width: 14rem;
  margin: 0 auto;
}
</style>
