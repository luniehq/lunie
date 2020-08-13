function extractState(
  stashId,
  slashes,
  nominees,
  activeEra,
  submittedIn,
  exposures
) {
  // chilled
  const nomsChilled = nominees.filter((_, index) => {
    if (slashes[index].isNone) {
      return false
    }

    const { lastNonzeroSlash } = slashes[index].unwrap()

    return !lastNonzeroSlash.isZero() && lastNonzeroSlash.gte(submittedIn)
  })

  // first a blanket find of nominations not in the active set
  let nomsInactive = exposures
    .map((exposure, index) =>
      exposure.others.some(({ who }) => who.eq(stashId))
        ? null
        : nominees[index]
    )
    .filter((inactiveId) => !!inactiveId)

  // waiting if validator is inactive or we have not submitted long enough ago
  const nomsWaiting = exposures
    .map((exposure, index) =>
      exposure.total.unwrap().isZero() ||
      (nomsInactive.includes(nominees[index]) &&
        activeEra.sub(submittedIn).lten(2))
        ? nominees[index]
        : null
    )
    .filter((waitingId) => !!waitingId)
    .filter((nominee) => !nomsChilled.includes(nominee))

  // filter based on all inactives
  const nomsActive = nominees.filter(
    (nominee) =>
      !nomsInactive.includes(nominee) && !nomsChilled.includes(nominee)
  )

  // inactive also contains waiting, remove those
  nomsInactive = nomsInactive.filter(
    (nominee) =>
      !nomsWaiting.includes(nominee) && !nomsChilled.includes(nominee)
  )

  return {
    nomsActive,
    nomsChilled,
    nomsInactive,
    nomsWaiting
  }
}

async function getAllDelegationsByType(api, stashId, nominees) {
  const indexes = await api.derive.session.indexes()
  let nominationsOverview

  if (nominees && nominees.length && indexes) {
    const [optNominators, ...exposuresAndSpans] = await api.queryMulti(
      [[api.query.staking.nominators, stashId]]
        .concat(
          api.query.staking.erasStakers
            ? nominees.map((id) => [
                api.query.staking.erasStakers,
                [indexes.activeEra, id]
              ])
            : nominees.map((id) => [api.query.staking.stakers, id])
        )
        .concat(nominees.map((id) => [api.query.staking.slashingSpans, id]))
    )
    const exposures = exposuresAndSpans.slice(0, nominees.length)
    const slashes = exposuresAndSpans.slice(nominees.length)

    nominationsOverview = extractState(
      stashId,
      slashes,
      nominees,
      indexes.activeEra,
      optNominators.unwrapOrDefault().submittedIn,
      exposures
    )
    return nominationsOverview
  }
}

module.exports = { getAllDelegationsByType }
