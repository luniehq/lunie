<template>
  <div class="step--container">
    <Step
      v-for="step in steps"
      :key="step"
      :title="step"
      :active="step.toLocaleLowerCase() === activeStep.toLocaleLowerCase()"
    />
  </div>
</template>

<script>
import Step from "./StepComponent"
export default {
  name: "Steps",
  components: {
    Step,
  },
  props: {
    steps: {
      type: Array,
      required: true,
    },
    activeStep: {
      type: String,
      required: true,
    },
  },
}
</script>

<style>
.step--container {
  display: flex;
  flex-direction: row;
  text-align: center;
  justify-content: space-between;
  width: 100%;
  margin: 1rem auto 2rem;
}
</style>
