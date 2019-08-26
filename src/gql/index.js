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
