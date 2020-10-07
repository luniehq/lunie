const { gql } = require('apollo-server')
const validatorTypeDefs = gql`
  enum ContributionType {
    ARTICLE
    WEBSITE
    PODCAST
    GITHUB
  }

  type ProfileLinks {
    twitter: String
    linkedin: String
    github: String
  }

  type ValidatorTeamMember {
    name: String
    photoUrl: String
    profileLinks: ProfileLinks
  }

  type ContributionLink {
    title: String
    url: String
    type: ContributionType
  }

  type ValidatorNetwork {
    name: String
    votingPower: String
    expectedReturns: String
  }
`

module.exports = validatorTypeDefs
