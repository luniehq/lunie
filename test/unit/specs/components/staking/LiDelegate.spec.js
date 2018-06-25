import setup from "../../../helpers/vuex-setup"
import LiDelegate from "renderer/components/staking/LiDelegate"

describe("LiDelegate", () => {
  let wrapper, store, delegate
  let instance = setup()

  beforeEach(async () => {
    let test = instance.mount(LiDelegate, {
      propsData: {
        delegate: {
          id: "abc",
          percent_of_vote: "22%",
          description: {}
        }
      }
    })
    wrapper = test.wrapper
    store = test.store

    store.commit("setAtoms", 1337)
    await store.dispatch("getDelegates")
    delegate = store.state.delegates.delegates[0]
    delegate.percent_of_vote = "22%"
    wrapper.setData({ delegate })
  })

  it("has the expected html structure", () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it("should show the voting power", () => {
    expect(wrapper.html()).toContain("22%")
  })

  it("should show the number of bonded atoms", () => {
    expect(wrapper.html()).toContain("14")
  })

  it("should show the relative voting power as a bar", () => {
    expect(
      wrapper.vm.$el.querySelector(".number_of_votes .bar").style.width
    ).toBe("44%")
  })

  it("should add to cart", () => {
    expect(wrapper.vm.shoppingCart).toEqual([])
    expect(wrapper.vm.inCart).toBeFalsy()
    expect(wrapper.html()).not.toContain("li-delegate-active")
    wrapper.find("#add-to-cart").trigger("click")
    expect(wrapper.vm.inCart).toBeTruthy()
    expect(store.commit).toHaveBeenCalledWith(
      "addToCart",
      store.state.delegates.delegates[0]
    )
    expect(wrapper.html()).toContain("li-delegate-active")
  })

  it("should remove from cart", () => {
    store.commit("addToCart", store.state.delegates.delegates[0])
    wrapper.update()
    expect(wrapper.vm.inCart).toBeTruthy()
    wrapper.find("#remove-from-cart").trigger("click")
    expect(store.commit).toHaveBeenCalledWith("removeFromCart", delegate.id)
    expect(wrapper.vm.shoppingCart).toEqual([])
    expect(wrapper.vm.inCart).toBeFalsy()
    expect(wrapper.html()).not.toContain("li-delegate-active")
  })
})
