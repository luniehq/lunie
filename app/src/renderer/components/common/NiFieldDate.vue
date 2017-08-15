<template lang="pug">
.input-group.field-date
  input(
    :id="fieldId",
    :value="dateValue",
    @input="updateValue($event.target.value)",
    type="text",
    required)
  .input-group-addon(:id="fieldAddonId", @click="togglePicker")
    i.fa.fa-calendar
</template>

<script>
import moment from 'moment'
import Pikaday from 'pikaday-time'
import dateUnix from '../../scripts/dateUnix'
export default {
  name: 'field-date',
  computed: {
    fieldAddonId () {
      return this.fieldId + '-addon'
    },
    dateValue: {
      get () {
        return dateUnix(this.value)
      },
      set (newValue) {
        this.updateValue(newValue)
      }
    }
  },
  data () {
    return {
      picker: {}
    }
  },
  methods: {
    togglePicker () {
      if (this.picker.isVisible()) {
        this.picker.hide()
      } else {
        this.picker.show()
      }
    },
    updateValue (value) {
      console.log('FieldDate ->', value)
      this.$emit('input', value)
    }
  },
  mounted () {
    let self = this
    this.picker = new Pikaday({
      field: document.querySelector('#' + this.fieldId),
      format: 'MMM D, YYYY, h:mm A',
      i18n: {
        previousMonth: 'Previous Month',
        nextMonth: 'Next Month',
        months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
        weekdays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        weekdaysShort: ['S', 'M', 'T', 'W', 'T', 'F', 'S']
      },
      incrementMinuteBy: 10,
      minDate: moment().startOf('day').toDate(),
      onSelect () {
        self.dateValue = this.getMoment().valueOf()
      },
      position: 'bottom left'
    })
  },
  props: ['value', 'field-id']
}
</script>

<style lang="stylus">
@require '~@/styles/variables.styl'

.field-date
  display flex
  input, .input-group-addon
    cursor pointer

  // set input z-index to 1 to appear over the addon
  input
    position relative
    z-index 1
    flex 1

// calendar container
.pika-single
  z-index 1
  position relative
  background #fff
  border 1px solid bc
  font-size x
  line-height 1.5
  font-family sans

  // when the calendar is not visible
  &.is-hidden
    display none

  // when the calendar is bound to an input field
  &.is-bound
    position absolute
    box-shadow rgba(0,0,0,0.3) 0 x*0.33 x*0.5

// center titles
.pika-title
  position relative
  text-align center

  select
    cursor pointer
    position absolute
    z-index 9998
    margin 0
    left 0
    top 0
    opacity 0

// the title area
.pika-label
  display inline-block
  position relative
  overflow hidden
  margin 0

  padding 0 x*0.25
  font-size x
  line-height 2*x
  font-weight 600

// next/prev buttons
.pika-prev, .pika-next
  display block
  cursor pointer
  position relative
  width x*2
  height x*2

  border 1px solid bc
  border none
  background primary-gradient
  background none

  color dim
  text-indent -99em
  transition 0.1s ease-in-out

  &:hover
    color link
    background lighten(link,90%)

  &.is-disabled
    cursor not-allowed
    pointer-events none
    color subtle
    &:hover
      color subtle
      background transparent

  &:after
    font-family FontAwesome
    position absolute
    top 0
    left 0
    width x*2
    line-height x*2
    font-size x*1.5
    text-align center

.pika-prev, .is-rtl .pika-next
  float left
  &:after
    content "\f104"
    text-indent 0

.pika-next, .is-rtl .pika-prev
  float right
  &:after
    content "\f105"
    text-indent 0

// calendar container
.pika-lendar
  width x*25
  margin x*0.5

.pika-table
  width 100%
  border-collapse collapse

  th, td
    width 14.2857142857%
  th
    color faint
    text-align center
    text-transform uppercase
    font-size x*0.6666
    line-height x*1.3333
    padding-top 1px
    background lighten(bc,75%)
    border-top 1px solid bc2
    border-bottom 1px solid bc
    box-shadow inset #fff 0 1px 0
  td
    border-top 1px solid bc
    &.is-empty
      border-top none

.pika-button
  display block
  width 100%
  padding x*0.75 0

  color txt
  line-height 1
  text-align center
  font-size x*0.9

  border none
  background none

  cursor pointer
  position relative

  &:after
    display block
    content ''
    border-radius x
    width x*2
    height x*2
    background transparent
    position absolute
    top 0.125*x
    left 50%
    margin-left -1*x
    z-index -1

  &:hover
    color link
    &:after
      background lighten(link,90%)

.pika-week
  font-size x*0.75
  color faint

.is-today .pika-button
  color #fff
  background transparent
  &:after
    background ac

.is-selected .pika-button
  color #fff
  &:after
    background link

.is-inrange .pika-button
  background #D5E9F7

.is-startrange .pika-button
  color #fff
  background #6CB31D
  box-shadow none
  border-radius 3px

.is-endrange .pika-button
  color #fff
  background #33aaff
  box-shadow none
  border-radius 3px

.is-disabled .pika-button
  pointer-events none
  cursor not-allowed
  color faint

.pika-table abbr
  border-bottom none
  cursor help

.pika-time-container
  margin -0.5*x x*0.5 0
  border-top 1px solid bc
  padding x*0.5 0

table.pika-time
  display table
  margin 0 auto

select.pika-select
  line-height x*2
  height x*2
  margin 0 x*0.5
</style>
