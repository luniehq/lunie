const constructProposal = (api, bytes) => {
  let proposal

  try {
    proposal = api.registry.createType('Proposal', bytes.toU8a(true))
  } catch (error) {
    console.log(error)
  }

  return proposal
}

module.exports = { constructProposal }
