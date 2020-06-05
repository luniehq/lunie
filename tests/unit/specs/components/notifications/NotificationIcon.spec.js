import { shallowMount } from "@vue/test-utils"
import NotificationIcon from "src/components/notifications/NotificationIcon"

describe(`NotificationIcon`, () => {
  it(`it updates notifications available`, () => {
    const $store = {
        dispatch: jest.fn(),
        state: {
          session: {
            notificationAvailable: false,
          },
        },
      },
      wrapper = shallowMount(NotificationIcon, {
        mocks: {
          $store,
        },
      })
    wrapper.vm.updateNotificationsAvailable()
    expect($store.dispatch).toHaveBeenCalledWith(`setNotificationAvailable`, {
      notificationAvailable: true,
    })
  })
})
