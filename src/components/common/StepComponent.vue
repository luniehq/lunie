<template>
  <div class="stepItem">
    <svg width="30" height="30">
      <circle
        class="circle--default"
        r="14"
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
        {{ stepNumber }}
      </text>
    </svg><svg height="30" width="30" v-if=includeLine>
      <line x1="0" y1="15" x2="45" y2="15" style="stroke:#979797;stroke-width:2" />
    </svg>
    <p class="text--default" :class="isActive">
      {{ stepTitle }}
    </p>
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
    includeLine: Boolean
  },
  mounted() {
    console.log(this.includeLine)
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

.circle--default {
  stroke: var(--grey);
  stroke-width: 2;
  fill: transparent;
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
  /*This needs to be improved */
  width: 30px;
}

.textActive {
  color: var(--tertiary);
}
</style>
