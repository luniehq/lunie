const BN = require('bn.js')

const ONE = new BN(1)
const TWO = new BN(2)
const THREE = new BN(3)
const TEN = new BN(10)
const MAX_ITERATIONS = 20

const getFAndFp = ({ totalIssuance, votes, votesWithoutConviction }) => {
  return {
    f: (x) => {
      // with v: votes, vc: votes without conviction, t: total issuance
      // x^3 + v*x^2 - (vc)^2 * t
      return BN(x)
        .pow(THREE)
        .add(votesWithoutConviction.mul(x.pow(TWO)))
        .sub(votes.pow(TWO).mul(totalIssuance))
    },
    fp: (x) => {
      // 3*x^2 + 2*v*x
      return THREE.mul(BN(x).pow(TWO)).add(
        TWO.mul(votesWithoutConviction).mul(x)
      )
    }
  }
}

const raphsonIterations = (f, fp) => {
  const initialGuess = ONE
  let result = { foundRoot: false }
  let i = 1
  while (!result.foundRoot && i < MAX_ITERATIONS) {
    result = newtonRaphson(f, fp, initialGuess.mul(TEN).pow(new BN(i)))
    i++
  }
  return result
}

const constructProposal = (api, bytes) => {
  let proposal

  try {
    proposal = api.registry.createType('Proposal', bytes.toU8a(true))
  } catch (error) {
    console.log(error)
  }

  return proposal
}

module.exports = {
  getFAndFp,
  raphsonIterations,
  constructProposal
}
