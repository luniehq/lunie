import {oldBondedAtoms} from "renderer/vuex/getters.js"

describe(`Store: getters`, () => {
    it(`oldBondedAtoms`, () => {
        const result = oldBondedAtoms({}, {
            delegation: {
                committedDelegates: {
                    validator1: 42,
                    validator2: 9
                }
            },
            delegates: {
                delegates: [{
                    operator_address: `validator1`,
                    delegator_shares: `1000`,
                    tokens: `1000`
                }, {
                    operator_address: `validator2`,
                    delegator_shares: `1000`,
                    tokens: `100`
                }]
            }
        })

        expect(result).toBe(`42.9`)
    })
})