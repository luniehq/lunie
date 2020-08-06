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

const newtonRaphson = (f, fp, x0, options) => {
  let x1, y, yp, tol, maxIter, iter, verbose, eps

  tol =
    !options || options.tolerance === undefined
      ? new BN(1e-7)
      : options.tolerance
  eps =
    !options || options.epsilon === undefined
      ? new BN(2.220446049250313e-16)
      : options.epsilon
  maxIter =
    !options || options.maxIterations === undefined ? 20 : options.maxIterations
  verbose = !options || options.verbose === undefined ? false : options.verbose

  iter = 0
  while (iter++ < maxIter) {
    // Compute the value of the function:
    y = f(x0)
    yp = fp(x0)

    if (yp.abs().lte(eps.mul(y.abs()))) {
      if (verbose) {
        console.log(
          'Newton-Raphson: failed to converged due to nearly zero first derivative'
        )
      }
      return { foundRoot: false }
    }

    // Update the guess:
    x1 = x0.sub(y.div(yp))

    // Check for convergence:
    if (x1.sub(x0).abs().lte(tol.mul(x1.abs()))) {
      if (verbose) {
        console.log(
          'Newton-Raphson: converged to x = ' +
            x1.toString() +
            ' after ' +
            iter +
            ' iterations'
        )
      }
      return { foundRoot: true, result: x1 }
    }

    // Transfer update to the new guess:
    x0 = x1
  }

  if (verbose) {
    console.log('Newton-Raphson: Maximum iterations reached (' + maxIter + ')')
  }

  return { foundRoot: false }
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
