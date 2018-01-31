import { shallow } from '@vue/test-utils'
import NiLiSession from 'common/NiLiSession'

describe('NiLiSession', () => {
  let wrapper
  let propsData = {
    icon: 'mood',
    title: 'useful title',
    subtitle: 'useful subtitle'
  }
  beforeEach(() => {
    wrapper = shallow(NiLiSession, {
      propsData
    })
  })

  it('has the expected html structure', () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it('should have an icon', () => {
    expect(wrapper.find('.ni-li-session-icon i.material-icons').html())
      .toContain('mood')
  })

  it('should have a title', () => {
    expect(wrapper.find('.ni-li-session-title').html())
      .toContain('useful title')
  })

  it('should have a subtitle', () => {
    expect(wrapper.find('.ni-li-session-subtitle').html())
      .toContain('useful subtitle')
  })
})
