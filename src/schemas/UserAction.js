const { gql } = require('apollo-server')

const userTypeDefs = gql`

  extend type Query {
    users: [User!]
    user(id: ID!): User
    me(id: ID!): User
  }

  extend type Mutation {
    createUser(data: UserCreateInput!) : AuthPayLoad!
    updateUser(data: UserUpdateInput) : User!
    addGroupToUser(data: addGroupToUserInput) : User!
    removeGroupFromUser(data: addGroupToUserInput): User!
    loginUser(data: UserLoginInput!): AuthPayLoad!
  }
  
  input UserCreateInput {
    email: String!
    name: String!
    password: String!
    role: Int!
  }

  input UserUpdateInput {
    userId: ID!
    email: String
    name: String
  }

  input addGroupToUserInput {
    userId: ID!
    groupId: ID!
  }
  
  input UserLoginInput {
    email: String!
    password: String!
  }
  
  type AuthPayLoad {
    name: String
    email: String
    role: Int
    token: String!
    groups: [Group]
  }
`

module.exports = userTypeDefs
