import { mount } from '@vue/test-utils'
import htmlBeautify from 'html-beautify'
import NiFormStruct from 'common/NiFormStruct'

describe('NiFormStruct', () => {
  let wrapper

  let propsData = {
    width: 'narrow',
    submit: function () {
      console.log('form successfully submitted')
    }
  }

  beforeEach(() => {
    wrapper = mount(NiFormStruct, {
      propsData,
      slots: {
        default: '<div class="fake-fields"></div>',
        footer: '<div class="fake-footer">Fake Footer</div>',
        title: '<div class="fake-title">Fake Title</div>',
        subtitle: '<div class="fake-subtitle">Fake Subtitle</div>'
      }
    })
  })

  it('has a width from props', () => {
    expect(wrapper.vm.width).toBe('narrow')
  })

  it('has a submit function', () => {
    expect(wrapper.vm.submit).toBeTruthy()
  })

  it('has the expected html structure', () => {
    expect(htmlBeautify(wrapper.html())).toMatchSnapshot()
  })

  it('has a default slot', () => {
    expect(wrapper.findAll('.fake-fields').length).toBe(1)
  })

  it('has a footer slot', () => {
    expect(wrapper.find('.fake-footer').text().trim()).toBe('Fake Footer')
  })

  it('has a title slot', () => {
    expect(wrapper.find('.fake-title').text().trim()).toBe('Fake Title')
  })

  it('has a subtitle slot', () => {
    expect(wrapper.find('.fake-subtitle').text().trim()).toBe('Fake Subtitle')
  })
})
