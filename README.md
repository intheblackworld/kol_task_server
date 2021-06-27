## Schema

```graphql
type User {
    _id: ID!
    name: String!
    email: String!
    password: String!
    "1 manager, 2 employee, 3 kol"
    role: Int!
    groups: [Group]
  }

  type Group {
    _id: ID!
    name: String!
    createdBy: ID!
    members: [User]
    tasks: [Task]
  }

  type Task {
    _id: ID!
    createdBy: ID!
    title: String!
    description: String!
    "0 todo, 1 processing, 2 done"
    status: Int!
    groups: [Group!]
  }
```
