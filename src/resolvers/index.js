// const { paginateResults } = require('../utils')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const { decodedToken } = require('../utils')
const { ObjectID } = require('mongodb')

/* feature check list */
/* @TODO checkList 
/* [x] 讀取 user, 讀取 users, 新增 user, 更新 user(name, email, password), 新增 group 到 user
/* [x] 讀取 task, 讀取 tasks, 新增 task, 更新 task(), 新增 group 到 task
/* [x] 讀取 group, 新增 group, 更新 group(name), 新增 group 到 task
/* [ ] 登入，登出
/* [x] 從群組刪除成員，從任務刪除群組
**/
module.exports = {
  Query: {
    users(_parent, _args, { dataSources, }, _info) {
      return dataSources.userAPI.fetchAll()
    },

    user(_parent, _args, { dataSources, }, _info) {
      return dataSources.userAPI.fetch(_args.id)
    },

    tasks(_parent, _args, { dataSources, }, _info) {
      return dataSources.taskAPI.fetchAll()
    },

    task(_parent, _args, { dataSources, }, _info) {
      return dataSources.taskAPI.fetch(_args.id)
    },

    groups(_parent, _args, { dataSources, }, _info) {
      return dataSources.groupAPI.fetchAll()
    },

    group(_parent, _args, { dataSources, }, _info) {
      return dataSources.groupAPI.fetch(_args.id)
    },

    me: (_, __, { dataSources }) => dataSources.userAPI.fetch(_args.id)
  },

  Mutation: {
    // @TODO add password to updateUser
    createUser: async (root, args, { dataSources }, info) => {
      const { data: { email, name, password, role } } = args
      const newUser = await dataSources.userAPI.create({
        email,
        name,
        role,
        password: bcrypt.hashSync(password, 3),

      })
      return { ...newUser, token: jwt.sign(newUser, process.env.JWT_SECRET) }
    },

    updateUser: async (root, args, { dataSources }, info) => {
      let { data: { email, name, userId } } = args
      userId = new ObjectID(userId)
      const newUser = await dataSources.userAPI.update({ userId, name, email })
      return newUser
    },

    addGroupToUser: async (root, args, { dataSources }, info) => {
      let { data: { groupId, userId } } = args
      userId = new ObjectID(userId)
      const newUser = await dataSources.userAPI.update({ groupId, userId })
      return newUser
    },

    removeGroupFromUser: async (_root, args, { dataSources }, _info) => {
      let { data: { userId, groupId } } = args
      userId = new ObjectID(userId)
      const newUser = await dataSources.userAPI.deleteGroup({ userId, groupId })
      return newUser
    },

    createTask: async (root, args, { dataSources }, info) => {
      const { data } = args
      const createdBy = new ObjectID(data.createdBy)
      const newTask = await dataSources.taskAPI.create({ ...data, createdBy })
      return newTask
    },

    updateTask: async (root, args, { dataSources }, info) => {
      let { data: { title, description, status, taskId } } = args
      taskId = new ObjectID(taskId)
      const newTask = await dataSources.taskAPI.update({ taskId, title, description, status })
      return newTask
    },

    addGroupToTask: async (root, args, { dataSources }, info) => {
      let { data: { groupId, taskId } } = args
      taskId = new ObjectID(taskId)
      const newTask = await dataSources.taskAPI.update({ groupId, taskId })
      return newTask
    },

    removeGroupFromTask: async (_root, args, { dataSources }, _info) => {
      let { data: { taskId, groupId } } = args
      taskId = new ObjectID(taskId)
      const newTask = await dataSources.taskAPI.deleteGroup({ taskId, groupId })
      return newTask
    },

    createGroup: async (root, args, { dataSources }, info) => {
      const { data } = args
      const createdBy = new ObjectID(data.createdBy)
      const newGroup = await dataSources.groupAPI.create({ ...data, createdBy })
      return newGroup
    },

    updateGroup: async (root, args, { dataSources }, info) => {
      let { data: { groupId, name } } = args
      groupId = new ObjectID(groupId)
      const newGroup = await dataSources.groupAPI.update({ groupId, name: name })
      return newGroup
    },

    login: async (_, args, { dataSources }, info) => {
      const { data: { email, password } } = args
      const user = await dataSources.userAPI.fetchByEmail(email)
      if (!user.email) throw new Error('No user with that email')
      const valid = await bcrypt.compare(password, user.password)
      if (!valid) throw new Error('Incorrect password')
      return {
        ...user,
        token: jwt.sign(user, process.env.JWT_SECRET)
      }
    }
  },

}
