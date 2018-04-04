import AppTheme from 'common/AppTheme'
import htmlBeautify from 'html-beautify'
import setup from '../../../helpers/vuex-setup'

describe('AppTheme', () => {
  let wrapper, store, instance
  let { mount } = setup()

  beforeEach(() => {
    instance = mount(AppTheme)
    wrapper = instance.wrapper
  })

  it('has the expected html structure', () => {
    expect(htmlBeautify(wrapper.html())).toMatchSnapshot()
  })

  /*
  it('sets the theme on mount', () => {
    const spy = jest.spyOn(wrapper.vm, 'setTheme')
    mount(AppTheme)
    expect(spy).toHaveBeenCalled()
  })
  */

  it('can change change the theme', () => {
    expect(wrapper.vm.setTheme).toBeTruthy()
  })

  it('can change the theme to dark', () => {
    expect(wrapper.vm.setThemeDark).toBeTruthy()
  })

  it('can change the theme to light', () => {
    expect(wrapper.vm.setThemeLight).toBeTruthy()
  })

  it('can set a css variable', () => {
    expect(wrapper.vm.setCssVar).toBeTruthy()
  })
})
