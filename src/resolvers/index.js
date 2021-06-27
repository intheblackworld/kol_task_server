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
      // const decoded = decodedToken(_context.req)
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
  // launches: async (_, { pageSize = 20, after }, { dataSources }) => {
  //   const allLaunches = await dataSources.launchAPI.getAllLaunches()
  //   // we want these in reverse chronological order
  //   allLaunches.reverse()
  //   const launches = paginateResults({
  //     after,
  //     pageSize,
  //     results: allLaunches
  //   })
  //   return {
  //     launches,
  //     cursor: launches.length ? launches[launches.length - 1].cursor : null,
  //     // if the cursor at the end of the paginated results is the same as the
  //     // last item in _all_ results, then there are no more results after this
  //     hasMore: launches.length
  //       ? launches[launches.length - 1].cursor !==
  //       allLaunches[allLaunches.length - 1].cursor
  //       : false
  //   }
  // },
  // launch: (_, { id }, { dataSources }) =>
  //   dataSources.launchAPI.getLaunchById({ launchId: id }),
  // },

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
      return { ...newUser, token: jwt.sign(newUser, "kol-task") }
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

    removeGroupFromUser: async (_root, args, {dataSources}, _info) => {
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

    removeGroupFromTask: async (_root, args, {dataSources}, _info) => {
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
      console.log(groupId, 'groupId')
      const newGroup = await dataSources.groupAPI.update({ groupId, name: name })
      return newGroup
    },

    loginUser: async (root, args, { prisma }, info) => {
      const { data: { email, password } } = args
      const [theUser] = await prisma.users({
        where: {
          email
        }
      })
      // @TODO check client response
      if (!theUser) throw new Error('There is no user')
      const isMatch = bcrypt.compareSync(password, theUser.password)
      if (!isMatch) throw new Error('Has no authorization')
      return { token: jwt.sign(theUser, "kol-task") }
    },

    // bookTrips: async (_, { launchIds }, { dataSources }) => {
    //   const results = await dataSources.userAPI.bookTrips({ launchIds })
    //   const launches = await dataSources.launchAPI.getLaunchesByIds({
    //     launchIds,
    //   })

    //   return {
    //     success: results && results.length === launchIds.length,
    //     message:
    //       results.length === launchIds.length
    //         ? 'trips booked successfully'
    //         : `the following launches couldn't be booked: ${launchIds.filter(
    //           id => !results.includes(id),
    //         )}`,
    //     launches,
    //   }
    // },
    // cancelTrip: async (_, { launchId }, { dataSources }) => {
    //   const result = await dataSources.userAPI.cancelTrip({ launchId })

    //   if (!result)
    //     return {
    //       success: false,
    //       message: 'failed to cancel trip',
    //     }

    //   const launch = await dataSources.launchAPI.getLaunchById({ launchId })
    //   return {
    //     success: true,
    //     message: 'trip cancelled',
    //     launches: [launch],
    //   }
    // },
  },

}
