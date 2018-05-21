<template>
  <div>
    <slot name='svg'></slot>
  </div>
</template>

<script>
import { LINE, CIRCLE, PATH } from './constants'
import { extend } from './utils'
import { Circle, Line, Path } from 'progressbar.js'

const RE_FLOAT = /^\d+(\.\d+)?$/
const RE_INT = /^\+?[1-9][0-9]*$/

export default {
  props: {
    type: {
      type: String,
      default: LINE,
      validator: function (val) {
        return val === LINE || val === CIRCLE || val === PATH
      }
    },
    color: {
      type: String,
      default: '#555'
    },
    strokeWidth: {
      type: [Number, String],
      default: 1.0,
      validator: function (val) {
        return RE_FLOAT.test(val)
      }
    },
    trailColor: {
      type: String,
      default: '#eee'
    },
    trailWidth: {
      type: [Number, String],
      default: 0.5,
      validator: function (val) {
        return RE_FLOAT.test(val)
      }
    },
    duration: {
      type: [Number, String],
      default: 800,
      validator: function (val) {
        return RE_INT.test(val)
      }
    },
    easing: {
      type: String,
      default: 'linear'
    },
    svgStyle: Object,
    fill: String,
    from: Object,
    to: Object,
    step: Function,
    options: {
      type: Object,
      default: function () {
        return {}
      }
    }
  },

  data () {
    return {
      progress: undefined
    }
  },

  mounted () {
    this.init()
  },

  destroyed () {
    if (this.progress) this.progress.destroy()
  },

  methods: {
    init () {
      let _options = {
        color: this.color,
        strokeWidth: parseFloat(this.strokeWidth),
        trailColor: this.trailColor,
        trailWidth: parseFloat(this.trailWidth),
        duration: parseInt(this.duration),
        easing: this.easing
      }

      if (this.svgStyle) _options.svgStyle = this.svgStyle
      if (this.fill) _options.fill = this.fill
      if (this.from) _options.from = this.from
      if (this.to) _options.to = this.to
      if (this.step) _options.step = this.step

      let options = extend(_options, this.options || {})

      switch (this.type) {
        case CIRCLE:
          this.progress = new Circle(this.$el, options)
          break
        case PATH:
          let paths = this.$el.querySelectorAll('path')
          if (paths.length === 0) throw new Error('[VueProgress Error] Path not found in slot svg.')
          this.progress = new Path(paths[paths.length - 1], options)
          break
        default:
          this.progress = new Line(this.$el, options)
      }
    },

    // Reference to SVG element where progress bar is drawn.
    svg () {
      return this.progress.svg
    },

    // Reference to SVG path which presents the actual progress bar.
    path () {
      return this.progress.path
    },

    // Reference to SVG path which presents the trail of the progress bar. Returns null if trail is not defined.
    trail () {
      return this.progress.trail
    },

    // Reference to p element which presents the text label for progress bar. Returns null if text is not defined.
    getText () {
      return this.progress.text
    },

    animate (progress, options, cb) {
      this.progress.animate(progress, options, cb)
    },

    // Sets progress instantly without animation. Clears all animations for path.
    set (progress) {
      this.progress.set(progress)
    },

    // Stops animation to its current position.
    stop () {
      this.progress.stop()
    },

    // Returns current shown progress from 0 to 1. This value changes when animation is running.
    value () {
      return this.progress.value()
    },

    // Sets text to given a string. If you need to dynamically modify the text element, see .text attribute.
    setText (text) {
      this.progress.setText(text)
    }
  }
}
</script>
