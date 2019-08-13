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

export const validatorProfileResultUpdate = data => data.validatorProfiles[0]
