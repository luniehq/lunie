const { gql } = require('apollo-server')
const validatorTypeDefs = gql`
  enum ContributionType {
    ARTICLE
    WEBSITE
    PODCAST
    GITHUB
  }

  type ProfileLink {
    twitter: String
    linkedin: String
    github: String
  }

  type ValidatorTeamMember {
    name: String
    photoUrl: String
    profileLink: ProfileLink
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
