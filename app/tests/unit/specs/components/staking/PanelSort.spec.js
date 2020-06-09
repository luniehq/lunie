import { shallowMount, createLocalVue } from "@vue/test-utils"
import PanelSort from "src/components/staking/PanelSort"

describe(`PanelSort`, () => {
  let wrapper

  const localVue = createLocalVue()
  localVue.directive(`tooltip`, () => {})

  beforeEach(() => {
    wrapper = shallowMount(PanelSort, {
      localVue,
      propsData: {
        sort: {
          order: `asc`,
        },
        properties: [
          {
            value: `id`,
            title: `ID`,
          },
          {
            value: `amount`,
            title: `AMOUNT`,
          },
        ],
        showOnMobile: "amount",
      },
    })
  })

  it(`has the expected html structure`, () => {
    expect(wrapper.element).toMatchSnapshot()
  })

  it(`should show an arrow according to ordering`, () => {
    const firstCol = wrapper.element.querySelector(`.sort-by`)
    const link = wrapper.element.querySelector(`.sort-by-link`)
    expect(firstCol.className.split(` `)).not.toContain(`asc`)
    expect(firstCol.className.split(` `)).not.toContain(`desc`)
    link.click()
    expect(firstCol.className.split(` `)).not.toContain(`desc`)
    expect(firstCol.className.split(` `)).toContain(`asc`)
    link.click()
    expect(firstCol.className.split(` `)).not.toContain(`asc`)
    expect(firstCol.className.split(` `)).toContain(`desc`)
    link.click()
    expect(firstCol.className.split(` `)).toContain(`asc`)
    expect(firstCol.className.split(` `)).not.toContain(`desc`)
  })

  it(`should only sort one col actively`, () => {
    const firstCol = wrapper.element.querySelectorAll(`.sort-by`)[0]
    const secondCol = wrapper.element.querySelectorAll(`.sort-by`)[1]
    const firstLink = wrapper.element.querySelectorAll(`.sort-by-link`)[0]
    const secondLink = wrapper.element.querySelectorAll(`.sort-by-link`)[1]
    firstLink.click()
    secondLink.click()
    expect(firstCol.className.split(` `)).not.toContain(`asc`)
    expect(secondCol.className.split(` `)).toContain(`asc`)
  })

  describe("showOnMobile", () => {
    beforeEach(() => {
      wrapper = shallowMount(PanelSort, {
        localVue,
        propsData: {
          sort: {
            property: `block_number`,
            order: `asc`,
          },
          properties: [
            {
              value: `block_number`,
              title: `Block Number`,
            },
            {
              value: `amount`,
              title: `Amount`,
            },
            {
              value: `other`,
              title: `Other`,
            },
          ],
          showOnMobile: "amount",
        },
      })
    })

    it(`should show mobile field correctly`, () => {
      wrapper.setProps({ showOnMobile: "amount" })
      const numHidden = wrapper
        .findAll("th")
        .filter((w) => w.classes("hide-xs")).length
      expect(numHidden).toBe(1)
    })
  })
})
