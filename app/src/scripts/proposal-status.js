export const governanceStatusEnum = {
  PASSED: "PASSED",
  REJECTED: "REJECTED",
  DEPOSITING: "DEPOSITING",
  VOTING: "VOTING",
  UNKNOWN: "UNKNOWN",
}

export const getProposalStatus = (proposal) => {
  switch (proposal.status) {
    case `Passed`:
      return {
        title: `Passed`,
        value: governanceStatusEnum.PASSED,
        color: `green`,
      }
    case `Rejected`:
      return {
        title: `Rejected`,
        value: governanceStatusEnum.REJECTED,
        color: `red`,
      }
    case `DepositPeriod`:
      return {
        title: `Deposit Period`,
        value: governanceStatusEnum.DEPOSITING,
        color: `orange`,
      }
    case `VotingPeriod`:
      return {
        title: `Voting Period`,
        value: governanceStatusEnum.VOTING,
        color: `highlight`,
      }
    default:
      return {
        title: `Error`,
        value: governanceStatusEnum.UNKNOWN,
        color: `grey`,
      }
  }
}
