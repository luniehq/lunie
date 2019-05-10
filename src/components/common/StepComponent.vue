<template>
  <div>
    <svg width="30" height="30">
      <circle
        class="circle--default"
        r="12"
        cx="15"
        cy="15"
        :class="isActive"
      ></circle>
      <text
        x="50%"
        y="50%"
        text-anchor="middle"
        stroke="white"
        fill="white"
        stroke-width="1"
        dy=".3em"
      >
        1
      </text>
    </svg>
    <p class="text--default" :class="isActive">
      {{ stepTitle }}
    </p>
  </div>
</template>

<script>
// If step === stepName then use select color else default color
export default {
  name: "StepComponent",
  props: {
    stepTitle: String,
    step: String,
    stepName: String
  },
  computed: {
    isActive() {
      return {
        active: this.step === this.stepName,
        textActive: this.step === this.stepname
      }
    }
  }
}
</script>

<style>
.circle--default {
  stroke: #979797;
  stroke-width: 2;
  fill: transparent;
}

.active {
  stroke: #fc31a7;
  stroke-width: 2;
  fill: transparent;
}

.text--default {
  color: #979797;
}

.textActive {
  color: #fc31a7;
}
</style>
