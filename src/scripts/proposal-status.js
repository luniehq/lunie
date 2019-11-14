export const getProposalStatus = proposal => {
  switch (proposal.status) {
    case `Passed`:
      return {
        badge: `Passed`,
        color: `green`
      }
    case `Rejected`:
      return {
        badge: `Rejected`,
        color: `red`
      }
    case `DepositPeriod`:
      return {
        badge: `Deposit Period`,
        color: `orange`
      }
    case `VotingPeriod`:
      return {
        badge: `Voting Period`,
        color: `pink`
      }
    default:
      return {
        badge: `Error`,
        color: `grey`
      }
  }
}
