/* istanbul ignore file */

import gql from "graphql-tag"

export const ValidatorProfile = gql`
  query validatorProfile($address: String) {
    validatorProfiles: validatorList(
      where: { operator_address: { _eq: $address } }
    ) {
      keybaseId
      lastUpdated
      profileUrl
      userName
      customized
      avatarUrl
    }
  }
`

export const validatorProfileResultUpdate = data =>
  data.validatorProfiles ? data.validatorProfiles[0] : undefined

export const allProposals = gql`
  query allProposals {
    allProposals(order_by: { voting_start_time: desc }) {
      amount
      denom
      deposit_end_time
      description
      final_abstain
      final_no
      final_no_with_veto
      final_yes
      proposal_id
      proposal_status
      submit_time
      title
      type
      voting_end_time
      voting_start_time
    }
  }
`

export const allProposalsUpdate = data =>
  data.allProposals ? data.allProposals : undefined
