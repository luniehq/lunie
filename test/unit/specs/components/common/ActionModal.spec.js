import setup from "../../../helpers/vuex-setup"
import ActionModal from "renderer/components/common/ActionModal"

describe(`ActionModal`, () => {
  let wrapper, store
  let instance = setup()

  beforeEach(() => {
    let test = instance.mount(ActionModal, {
      propsData: {
        title: `Action Modal`
      }
    })
    wrapper = test.wrapper
    store = test.store

    jest.useFakeTimers()
  })

  it(`has the expected html structure`, () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`should default to submissionError being null`, () => {
    expect(wrapper.vm.submissionError).toBe(null)
  })

  it(`should emit an event to close itself when the close method is called`, () => {
    wrapper.vm.close()

    expect(wrapper.emittedByOrder()).toEqual([
      {
        name: `close-action-modal`,
        args: []
      }
    ])
  })

  it(`should call the close method if the function resolves`, async () => {
    const submitFn = jest.fn()
    await wrapper.vm.submit(submitFn)

    expect(wrapper.emittedByOrder()).toEqual([
      {
        name: `close-action-modal`,
        args: []
      }
    ])
  })

  it(`should set the submissionError if the function is rejected`, async () => {
    const submitFn = jest
      .fn()
      .mockRejectedValue(new Error("some kind of error message"))
    await wrapper.vm.submit(submitFn)

    expect(wrapper.vm.submissionError).toEqual(
      `Submitting data failed: some kind of error message.`
    )
  })

  it(`should clear the submissionError after a timeout if the function is rejected`, async () => {
    const submitFn = jest
      .fn()
      .mockRejectedValue(new Error("some kind of error message"))
    await wrapper.vm.submit(submitFn)

    expect(wrapper.vm.submissionError).toEqual(
      `Submitting data failed: some kind of error message.`
    )

    jest.runAllTimers()
    expect(wrapper.vm.submissionError).toEqual(null)
  })
})
