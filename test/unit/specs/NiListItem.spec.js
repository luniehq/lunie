import { mount } from 'vue-test-utils'
import NiListItem from 'common/NiListItem'

describe('NiListItem', () => {
  let wrapper

  beforeEach(() => {
    wrapper = mount(NiListItem, {
      propsData: {
        type: null,
        title: null,
        subtitle: null,
        image: null,
        icon: null,
        to: null,
        dt: null,
        dd: null,
        href: null
      }
    })
  })

  it('has the expected html structure', () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it('should show a thumb', () => {
    wrapper.setProps({dt: 'Link', href: '/location'})
    expect(wrapper.vm.$el).toMatchSnapshot()
    wrapper.setProps({icon: 'icon_hello'})
    expect(wrapper.find('i')).toBeDefined()
    wrapper.setProps({icon: null, image: 'path/to/img'})
    expect(wrapper.find('img')).toBeDefined()
  })

  it('should use a slot for a thumb', () => {
    wrapper = mount(NiListItem, {
      propsData: {dt: 'Link', href: '/location'},
      slots: {
        graphic: '<graphic-elem />'
      }
    })
    expect(wrapper.contains('graphic-elem')).toBe(true)
  })

  it('should show a description', () => {
    wrapper.setProps({dt: 'Link', href: '/location'})
    expect(wrapper.vm.$el).toMatchSnapshot()
    expect(wrapper.html()).toContain('Link')
    wrapper.setProps({dd: 'HALLO'})
    expect(wrapper.html()).toContain('HALLO')
  })

  it('should use a slot for a description', () => {
    wrapper = mount(NiListItem, {
      propsData: {dt: 'Link', to: '/location'},
      slots: {
        dd: 'Some description here'
      }
    })
    expect(wrapper.html()).toContain('Some description here')
  })

  it('should show a dd link', () => {
    wrapper.setProps({dt: 'Link', href: '/location'})
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it('should show a router-link', () => {
    wrapper.setProps({dt: 'Link', to: '/location'})
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it('should show a label', () => {
    wrapper.setProps({title: 'Title', subtitle: 'Subtitle'})
    expect(wrapper.vm.$el).toMatchSnapshot()
    expect(wrapper.html()).toContain('Title')
    expect(wrapper.html()).toContain('Subtitle')
  })

  it('should show as dd text', () => {
    wrapper.setProps({dt: 'Link'})
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it('should show as text link', () => {
    wrapper.setProps({dt: 'Link'})
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it('should show a subtitle router link', () => {
    wrapper.setProps({to: '/location'})
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it('should show as text', () => {
    wrapper.setProps({title: 'Link'})
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it('should show as image', () => {
    wrapper = mount(NiListItem, {
      propsData: {type: 'image'},
      slots: {
        image: '<img src="route/to/image" />'
      }
    })
    expect(wrapper.find('img')).toBeDefined()
  })
})
