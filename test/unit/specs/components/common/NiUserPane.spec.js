import NiUserPane from 'common/NiUserPane'
import ListItem from 'common/NiListItem'
import setup from '../../../helpers/vuex-setup'

describe('NiUserPane', () => {
  let wrapper, router, store, instance
  let {mount} = setup()

  beforeEach(async () => {
    instance = mount(NiUserPane)
    store = instance.store
    router = instance.router
    wrapper = instance.wrapper
    store.commit('setAccounts', [{
      address: '1234567890123456789012345678901234567890',
      name: 'ACTIVE_ACCOUNT',
      password: '1234567890'
    }])
    await store.dispatch('signIn', {account: 'ACTIVE_ACCOUNT', password: '1234567890'})
    wrapper.update()
  })

  it('has the expected html structure', () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it('should show the active account name', () => {
    expect(wrapper.html()).toContain('ACTIVE_ACCOUNT')
  })

  it('should not show the active account name if signed out', async () => {
    await store.dispatch('signOut')
    wrapper.update()
    expect(wrapper.html()).toBeUndefined()
  })

  it('should redirect to the profile page if signed in', () => {
    wrapper.find(ListItem).trigger('click')
    expect(router.currentRoute.path).toBe('/profile')
  })
})
