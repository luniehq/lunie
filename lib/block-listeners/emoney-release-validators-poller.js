async function pollForValidators(eMoneyNetwork) {
  const { result } = await global.fetch(
    `${eMoneyNetwork.api_url}/staking/validators`
  )
  return result
}

module.exports = { pollForValidators }
