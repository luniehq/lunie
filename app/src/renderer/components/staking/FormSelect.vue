<template lang="pug">
.form-select: select(:id="id", :value="value", @input="updateValue($event.target.value)")

  option(disabled, value="")
    | Select&hellip;

  template(v-if="groups")
    template(v-for="pg in orderById(parentGroups)")
      option(:value="pg.id") {{ pg.id }}
      template(v-for="cg in orderById(pg.childGroups)")
        option(:value="cg.id") {{ pg.id }} > {{ cg.id }}
      
  template(v-else)
    option(v-for="option in orderById(options)", :value="option.id") {{ option.id }}
</template>

<script>
import $ from 'jquery'
import { orderBy } from 'lodash'
export default {
  name: 'form-select',
  computed: {
    parentGroups () {
      let self = this
      let pgs = self.options.filter(g => g.parent_id === '')
      pgs.map(function (pg) {
        pg.childGroups = self.options.filter(g => g.parent_id === pg.id)
      })
      return pgs
    }
  },
  created () {
    if (this.required) {
      $('#' + this.id).prop('required', true)
    }
  },
  methods: {
    orderById (collection) {
      return orderBy(collection.slice(), ['id'])
    },
    updateValue (value) {
      let formattedValue = value.trim()
      // Emit the number value through the input event
      this.$emit('input', formattedValue)
    }
  },
  props: ['id', 'value', 'options', 'required', 'groups']
}
</script>

<style lang="stylus">
@require '../../styles/variables.styl'

.form-select
  position relative
  width 100%

  &:after
    display block
    box-sizing border-box
    width x*2
    height x*2

    position absolute
    top 0
    right 0

    border 1px solid input-bc
    background #fff

    font-family FontAwesome
    content "\f0d7"
    text-align center
    line-height x*2 - 2px
    color txt

    pointer-events none

  select
    appearance none
    border-radius 0
    width 100%
    background input-bg
</style>
