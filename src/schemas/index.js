const { gql } = require('apollo-server')
const userTypeDefs = require('./UserAction')
const taskTypeDefs = require('./TaskAction')
const groupTypeDefs = require('./GroupAction')
const baseTypeDefs = require('./baseType')

const typeDefs = gql`
  type Query

  type Mutation {
    login(email: String, password: String): User
  }
`

module.exports = [baseTypeDefs, userTypeDefs, groupTypeDefs, taskTypeDefs, typeDefs]
