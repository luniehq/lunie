import { shallowMount, createLocalVue } from "@vue/test-utils"
import TmSessionExisting from "common/TmSessionExisting"

describe(`TmSessionExisting`, () => {
	const localVue = createLocalVue()

	let wrapper, $store

	beforeEach(() => {
		$store = {
			commit: jest.fn(),
			dispatch: jest.fn(() => true),
			getters: {
				connected: true
			}
		}

		wrapper = shallowMount(TmSessionExisting, {
			localVue,
			mocks: {
				$router: {
					push: jest.fn()
				},
				$store
			}
		})
	})

	it(`shows a form to sign in with an address`, () => {
		expect(wrapper.vm.$el).toMatchSnapshot()
	})

	describe(`with accounts`, () => {
		beforeEach(() => {
			const getters = {
				session: { accounts: [`foo`, `bar`], insecureMode: true },
				lastPage: `/`
			}
			$store = {
				getters,
				commit: jest.fn(),
				dispatch: jest.fn()
			}
			wrapper = shallowMount(TmSessionWelcome, {
				mocks: {
					$store
				}
			})
		})

		it(`should show sign-in link since we have accounts`, () => {
			wrapper.vm.setState = jest.fn()
			expect(wrapper.find(`#sign-in-with-account`).exists()).toBe(true)
			wrapper.find(`#sign-in-with-account`).trigger(`click`)
			expect(wrapper.vm.setState).toHaveBeenCalledWith(`sign-in`)
		})

		it(`sets desired login method`, () => {
			Object.defineProperty(window.navigator, `userAgent`, {
				value: `Chrome`,
				writable: true
			})
			wrapper.vm.setState(`xxx`)
			expect($store.commit).toHaveBeenCalledWith(`setSessionModalView`, `xxx`)
		})

		it(`has the expected html structure`, () => {
			expect(wrapper.vm.$el).toMatchSnapshot()
		})
	})

	describe(`production`, () => {
		it(`should hide sign in with account if users do not opt in`, () => {
			wrapper.vm.session.accounts = [
				{
					name: `test`
				}
			]
			expect(wrapper.find(`#sign-in-with-account`).exists()).toBe(true)
			wrapper.vm.session.insecureMode = false
			expect(wrapper.find(`#sign-in-with-account`).exists()).toBe(false)
		})

		it(`should hide seed import if not in development`, () => {
			expect(wrapper.find(`#import-seed`).exists()).toBe(true)
			wrapper.vm.session.developmentMode = false
			expect(wrapper.find(`#import-seed`).exists()).toBe(false)
		})
	})
})