export const getProposalStatus = (proposal) => {
  switch (proposal.status) {
    case `Passed`:
      return {
        caption: `Passed`,
        color: `green`,
      }
    case `Rejected`:
      return {
        caption: `Rejected`,
        color: `red`,
      }
    case `DepositPeriod`:
      return {
        caption: `Deposit Period`,
        color: `orange`,
      }
    case `VotingPeriod`:
      return {
        caption: `Voting Period`,
        color: `highlight`,
      }
    default:
      return {
        caption: `Error`,
        color: `grey`,
      }
  }
}
