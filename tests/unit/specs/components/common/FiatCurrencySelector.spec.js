import { shallowMount } from "@vue/test-utils"
import FiatCurrencySelector from "common/FiatCurrencySelector"

describe("FiatCurrencySelector", () => {
  let $store, wrapper

  beforeEach(() => {
    $store = {
      state: {
        moonpay: {
          coinDenom: undefined
        }
      }
    }
    wrapper = shallowMount(FiatCurrencySelector, {
      mocks: {
        $store
      }
    })
  })

  it(`navigates to Moonpay with the selected fiat currency`, () => {
    wrapper = shallowMount(FiatCurrencySelector, {
      mocks: {
        $store: {
          state: {
            moonpay: {
              coinDenom: "atom"
            }
          }
        }
      }
    })
    const openFn = jest.fn()
    window.open = openFn
    wrapper.vm.selectCurrency("EUR")
    expect(openFn).toHaveBeenCalledWith(
      "https://buy-staging.moonpay.io?apiKey=pk_test_PKdo6236SY0Nw7p6lLikGGRAgutp8up1&currencyCode=atom&baseCurrencyCode=EUR",
      "_blank"
    )
  })
})
