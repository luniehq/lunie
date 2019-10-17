<template>
  <div>
    <Steps
      :steps="steps.map(({ name }) => name)"
      :active-step="activeStep.name"
    />
    <div
      class="steps"
      :class="{ forward: forwardTransition, back: backTransition }"
    >
      <div class="step step-previous" v-if="active > steps.length">
        <slot :name="steps[active - 1].name" />
      </div>
      <div class="step step-current">
        <slot :name="activeStep.name" />
      </div>
      <div class="step step-next" v-if="active < steps.length - 1">
        <slot :name="steps[active + 1].name" />
      </div>
    </div>
  </div>
</template>

<script>
import Steps from "../../ActionModal/components/Steps"

export default {
  name: `steps-form`,
  props: {
    steps: {
      type: Array, // [{ name, validation }]
      required: true
    }
  },
  data: () => ({
    active: 0,
    backTransition: false,
    forwardTransition: false
  }),
  components: {
    Steps
  },
  methods: {
    async onNext() {
      if (await this.activeStep.validation()) {
        if (this.active === this.steps.length - 1) {
          this.onDone()
          return
        }
        this.forwardTransition = true
        setTimeout(() => {
          this.active++
          this.forwardTransition = false
        }, 1000)
      }
    },
    async goBack() {
      if (this.active > 0) {
        this.active--
      }
    },
    onDone() {
      this.$emit("done")
    }
  },
  computed: {
    activeStep() {
      return this.steps[this.active]
    }
  },
  mounted() {
    this.active = 0
  }
}
</script>
<style scoped>
.step {
  display: inline-block;
  width: calc(100% / 3);
  margin-right: 2rem;
}
.steps {
  width: 300%;
}
.steps.back {
  transition: all 1s ease;
  transform: translateX(calc(100% / 3 - 2rem));
}
.steps.forward {
  transition: all 1s ease;
  transform: translateX(calc(-100% / 3 - 2rem));
}
</style>
