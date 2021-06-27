const { gql } = require('apollo-server')

const groupTypeDefs = gql`
  extend type Query {
    groups: [Group!]
    group(id: ID!): Group
  }

  extend type Mutation {
    createGroup(data: GroupCreateInput!) : Group!
    updateGroup(data: GroupUpdateInput) : Group!
  }

  input GroupCreateInput {
    createdBy: ID!
    name: String!
  }

  input GroupUpdateInput {
    groupId: ID!
    name: String
  }
`

module.exports = groupTypeDefs