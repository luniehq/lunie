import setup from "../../../helpers/vuex-setup"
import TmModalLCDApproval from "common/TmModalLCDApproval"

let instance = setup()

describe("TmModalLCDApproval", () => {
  let wrapper, store

  beforeEach(() => {
    let test = instance.mount(TmModalLCDApproval, {
      propsData: { hash: "this_is_a_hash" }
    })
    wrapper = test.wrapper
    store = test.store
  })

  it("has the expected html structure", () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it("shows the hash", () => {
    expect(wrapper.vm.hash).toBe("this_is_a_hash")
    expect(wrapper.vm.$el.querySelector("textarea").value).toBe(
      "this_is_a_hash"
    )
  })

  it("allows to approve a hash", () => {
    wrapper.vm.approve()
    expect(store.dispatch).toHaveBeenCalledWith(
      "approveNodeHash",
      "this_is_a_hash"
    )
  })

  it("allows to disapprove a hash", () => {
    wrapper.vm.newNode()
    expect(store.dispatch).toHaveBeenCalledWith(
      "disapproveNodeHash",
      "this_is_a_hash"
    )
  })
})
