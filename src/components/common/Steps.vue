<template>
  <div class="step--container">
    <Step
      v-for="(step, i) in steps"
      :key="step"
      :title="step"
      :active="step.toLocaleLowerCase() === active.toLocaleLowerCase()"
      :number="i"
      :include-line="i < (steps.length -1)"
    />
  </div>
</template>

<script>
import Step from "common/StepComponent"
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
    // active step name
    active: {
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
  width: 13rem;
  margin: 0 auto;
}
</style>
