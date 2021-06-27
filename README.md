## Schema

baseType: User, Group, Task
```
const baseTypeDefs = gql`
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
`
```

Group's query and mutation
```
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
```

Task's query and mutation
```
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
    groups: [ID]
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
```


User's query and mutation
```
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
    login(data: UserLoginInput!): AuthPayLoad!
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
    _id: ID
    name: String
    email: String
    role: Int
    token: String
    groups: [Group]
  }
`
```