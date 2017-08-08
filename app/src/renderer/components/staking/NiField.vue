<template>
  <div class="ni-field-select-container" v-if="type === 'country'">
    <select 
      :class="css" 
      :value="value"
      @input="updateValue($event.target.value)">
      <optgroup>
        <option disabled value="">Select&hellip;</option>
        <option v-for="country in countries" :value="country.value">
          {{ country.key }}
        </option>
      </optgroup>
    </select>
  </div>
  <div class="ni-field-select-container" v-else-if="type === 'select'">
    <select 
      :class="css" 
      :placeholder="placeholder"
      :value="value"
      @input="updateValue($event.target.value)">
      <optgroup>
        <option disabled value="">Select&hellip;</option>
        <option v-for="option in options" :value="option.value">
          {{ option.key }}
        </option>
      </optgroup>
    </select>
  </div>
  <div class="ni-field-datetime-container" v-else-if="type === 'datetime'">
    <input
      type="text"
      :class="css"
      :placeholder="placeholder"
      :value="value"
      @input="updateValue($event.target.value)">
    </input>
  </div>
  <textarea v-else-if="type === 'textarea'"
    :class="css"
    :placeholder="placeholder"
    :value="value"
    @input="updateValue($event.target.value)">
  </textarea>
  <input v-else
    :type="type"
    :class="css"
    :placeholder="placeholder"
    :value="value"
    @input="updateValue($event.target.value)">
  </input>
</template>

<script>
import flatpickr from 'flatpickr'
import countries from '../../scripts/countries.json'
export default {
  name: 'ni-field',
  props: ['placeholder', 'type', 'size', 'value', 'theme', 'options'],
  computed: {
    css () {
      let value = 'ni-field'
      if (this.type === 'select') value += ' ni-field-select'
      if (this.size) value += ` ni-field-size-${this.size}`
      if (this.theme) value += ` ni-field-theme-${this.theme}`
      return value
    }
  },
  data: () => ({
    countries: countries,
    picker: {}
  }),
  methods: {
    updateValue (value) {
      let formattedValue = value.trim()
      // Emit the number value through the input event
      this.$emit('input', formattedValue)
    },
    togglePicker () {

    }
  },
  mounted () {
    let el = this.$el
    if (this.type === 'number') {
      el.addEventListener('focus', function () {
        el.select()
      })
    }
    if (this.type === 'datetime') {
      this.picker = flatpickr(el, {
        enableTime: true,
        dateFormat: 'Y-m-d H:i',
        onChange: (dateObj, dateStr) => this.updateValue(dateStr)
      })
      // console.log('its a datetime!', el)
    }
  }
}
</script>

<style>
.ni-field {
  -webkit-appearance: none; border: 1px solid #ccc;
  vertical-align: top;
  padding: 0.1875rem 0.5rem;
  font-size: 16px;
  line-height: 1.5rem;
  border-radius: 0;
  display: block;
  width: 100%;
  min-width: 0;
  background: #fff;
}
.ni-field:disabled {
  opacity: 0.666;
  cursor: not-allowed;
}
.ni-field:focus {
  outline: none;
  box-shadow: none;
  border: 1px solid #09c;
}
input.ni-field {
  height: 2rem;
}
textarea.ni-field {
  height: 4rem;
  resize: vertical;
}

/*==============================================================================*/

.ni-field-select-container {
  position: relative;
  width: 100%;
}

.ni-field-select-container:after {
  display: flex;
  align-items: center;
  justify-content: center;

  box-sizing: border-box;
  width: 2rem;
  height: 2rem;

  position: absolute;
  top: 0;
  right: 0;

  border: 1px solid #ccc;
  background: #fff;

  font-family: FontAwesome;
  content: "\f0d7";
  text-align: center;
  color: #000;

  pointer-events: none;
}

.ni-field-select-container select {
  appearance: none;
  border-radius: 0;
  width: 100%;
  background: #fff;
}
.ni-field-select-container optgroup {
  font-size: 0.75rem;
}


/*==============================================================================*/

.ni-field-datetime-container {
  position: relative;
}
.ni-field-datetime-container:after {
  display: flex;
  align-items: center;
  justify-content: center;

  box-sizing: border-box;
  width: 2rem;
  height: 2rem;

  position: absolute;
  top: 0;
  right: 0;

  border: 1px solid #ccc;
  background: #fff;

  font-family: FontAwesome;
  content: "\f073";
  text-align: center;
  color: #000;

  pointer-events: none;
}

/*==============================================================================*/

.input-group-addon {
  display: flex;
  align-items: center;
  justify-content: center;

  background: #eee;
  border: 1px solid #ccc;
  border-left: none;

  font-size: 0.75rem;
  color: #666;
}
@media screen and (min-width: 360px) {
  .input-group-addon {
    font-size: 1rem;
  }
}

/*==============================================================================*/
/* WebKit, Blink, Edge */

.ni-field::-webkit-input-placeholder {
  color: #666;
}
/* Mozilla Firefox 4 to 18 */
.ni-field:-moz-placeholder {
  color: #666;
  opacity: 1;
}
/* Mozilla Firefox 19+ */
.ni-field::-moz-placeholder {
  color: #666;
  opacity: 1;
}
/* Internet Explorer 10-11 */
.ni-field:-ms-input-placeholder {
  color: #666;
}
/* Standard (https//drafts.csswg.org/selectors-4/#placeholder) */
.ni-field:placeholder-shown {
  color: #666;
}

/*==============================================================================*/
/* sizes */

.ni-field.ni-field-size-sm {
  height: 1.5rem;
  font-size: 0.75rem;
  padding-left: 0.5rem;
  padding-right: 0.5rem;
}
.ni-field.ni-field-size-lg {
  height: 3rem;
  font-size: 1.125rem;
  padding-left: 0.75rem;
  padding-right: 0.75rem;
}

/*==============================================================================*/
/* tendermint styles */

.ni-field.ni-field-theme-tendermint {
  color: #fff;
  background: hsl(210,70%,18%);
  border-color: hsl(210,70%,38%);
} .ni-field.ni-field-theme-tendermint:focus {
  border-color: hsl(210,70%,43%);
}

.ni-field.ni-field-theme-tendermint::-webkit-input-placeholder {
  color: hsl(210,70%,70%);
}
/* Mozilla Firefox 4 to 18 */
.ni-field.ni-field-theme-tendermint:-moz-placeholder {
  color: hsl(210,70%,70%);
  opacity: 1;
}
/* Mozilla Firefox 19+ */
.ni-field.ni-field-theme-tendermint::-moz-placeholder {
  color: hsl(210,70%,70%);
  opacity: 1;
}
/* Internet Explorer 10-11 */
.ni-field.ni-field-theme-tendermint:-ms-input-placeholder {
  color: hsl(210,70%,70%);
}
/* Standard (https//drafts.csswg.org/selectors-4/#placeholder) */
.ni-field.ni-field-theme-tendermint:placeholder-shown {
  color: hsl(210,70%,70%);
}

/*==============================================================================*/
/* cosmos styles */

.ni-field.ni-field-theme-cosmos {
  background: transparent;
  color: hsl(210,32%,86%);
  border-color: hsl(210, 20%, 18%);
  font-family: 'DIN', -apple-system, ".SFNSText-Regular", "San Francisco", "Roboto", "Segoe UI", "Helvetica Neue", "Lucida Grande", sans-serif;
}
.ni-field.ni-field-theme-cosmos:focus
.ni-field-select-container:hover,
.ni-field-datetime-container:hover {
  border-color: hsl(210, 41%, 49%)
}

.ni-field-select-container:after,
.ni-field-datetime-container:after {
  border-color: hsl(210, 20%, 18%);
  background: transparent;
  color: hsl(210,32%,50%);
}
.ni-field.ni-field-theme-cosmos::-webkit-input-placeholder {
  font-size: 0.75rem;
  letter-spacing: 0.025rem;
  text-transform: uppercase;
  color: hsl(210, 32%, 50%);
}
/* Mozilla Firefox 4 to 18 */
.ni-field.ni-field-theme-cosmos:-moz-placeholder {
  font-size: 0.75rem;
  letter-spacing: 0.025rem;
  text-transform: uppercase;
  color: hsl(210, 32%, 50%);
  opacity: 1;
}
/* Mozilla Firefox 19+ */
.ni-field.ni-field-theme-cosmos::-moz-placeholder {
  font-size: 0.75rem;
  letter-spacing: 0.025rem;
  text-transform: uppercase;
  color: hsl(210, 32%, 50%);
  opacity: 1;
}
/* Internet Explorer 10-11 */
.ni-field.ni-field-theme-cosmos:-ms-input-placeholder {
  font-size: 0.75rem;
  letter-spacing: 0.025rem;
  text-transform: uppercase;
  color: hsl(210, 32%, 50%);
}
/* Standard (https//drafts.csswg.org/selectors-4/#placeholder) */
.ni-field.ni-field-theme-cosmos:placeholder-shown {
  font-size: 0.75rem;
  letter-spacing: 0.025rem;
  text-transform: uppercase;
  color: hsl(210, 32%, 50%);
}
</style>
