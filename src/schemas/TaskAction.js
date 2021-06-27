const { gql } = require('apollo-server')

const taskTypeDefs = gql`
  extend type Query {
    tasks: [Task!]
    task(id: ID!): Task
  }

  extend type Mutation {
    createTask(data: TaskCreateInput!) : Task!
    updateTask(data: TaskUpdateInput) : Task!
    addGroupToTask(data: addGroupToTaskInput) : Task!
    removeGroupFromTask(data: addGroupToTaskInput): Task!
  }

  input TaskCreateInput {
    createdBy: ID!
    title: String!
    description: String!
    "0 todo, 1 processing, 2 done"
    status: Int!
  }

  input TaskUpdateInput {
    taskId: ID!
    title: String
    description: String
    "0 todo, 1 processing, 2 done"
    status: Int
  }

  input addGroupToTaskInput {
    taskId: ID!
    groupId: ID!
  }
`

module.exports = taskTypeDefs