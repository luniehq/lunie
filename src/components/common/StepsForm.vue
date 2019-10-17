<template>
  <div>
    <Steps
      :steps="steps.map(({ name }) => name)"
      :active-step="activeStep.name"
    />
    <div class="steps" :class="'step' + active">
      <div class="step" v-for="step in steps" :key="step.name">
        <slot :name="step.name" />
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
        this.backTransition = true
        setTimeout(() => {
          this.active--
          this.backTransition = false
        }, 1000)
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
  width: calc(100% / 3 - 2rem);
}
.step:not(:last-child) {
  margin-right: 2rem;
}
.steps {
  width: calc(300% + 6rem + 1px);
  transition: all 1s ease;
}
.step1 {
  margin-left: calc(-100% - 2rem);
}
.step2 {
  margin-left: calc(-200% - 4rem);
}
</style>
