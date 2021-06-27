const { MongoDataSource } = require('apollo-datasource-mongodb')
const { ObjectID } = require('mongodb')
const isEmail = require('isemail')

class GroupAPI extends MongoDataSource {
  // (e.g. this.collection.update({_id: 'foo, { $set: { name: 'me' }}})). The model (if applicable) is available at this.model (new this.model({ name: 'Alice' })). The request's context is available at this.context. For example, if you put the logged-in user's ID on context as context.currentUserId:
  // @TODO add createdTime, updatedTime

  initialize(config) {
    super.initialize(config)
    this.context = config.context
  }

  async fetch(groupId) {
    const group = await this.findOneById(groupId)
    const members = await Promise.all(group.members.map(async userId => await this.context.dataSources.userAPI.findOneById(userId) || null))
    const tasks = await Promise.all(group.tasks.map(async taskId => await this.context.dataSources.taskAPI.findOneById(taskId) || null))

    return {
      ...group,
      members: members.filter(m => !!m),
      tasks: tasks.filter(t => !!t),
    }
  }

  async fetchAll() {
    let groups = await this.collection.find().toArray()
    return groups.map(async group => {
      const members = await Promise.all(group.members.map(async userId => await this.context.dataSources.userAPI.findOneById(userId) || null))
      const tasks = await Promise.all(group.tasks.map(async taskId => await this.context.dataSources.taskAPI.findOneById(taskId) || null))
      return {
        ...group,
        // date: new Date(task._doc.date).toISOString(),
        members: members.filter(m => !!m),
        tasks: tasks.filter(t => !!t),
      }
    })
  }

  async create(args) {
    const existingGroup = await this.collection.findOne({ name: args.name })
    if (existingGroup) {
      throw new Error('Group exists already.')
    }
    const { ops } = await this.collection.insertOne({ ...args, members: [], tasks: [] })
    return ops[0]
  }

  async addUserToGroup({ groupId, members }) {
    const query = { _id: groupId }
    let newValues = { $set: { members: members } }
    await this.collection.findOneAndUpdate(query, newValues)
  }

  async addTaskToGroup({ groupId, tasks }) {
    const query = { _id: groupId }
    let newValues = { $set: { tasks: tasks } }
    await this.collection.findOneAndUpdate(query, newValues)
  }

  async delete(args) {
    const query = { _id: new ObjectID(args.groupId) }
    let newValues = { $pull: {} }
    if (args.userId) {
      newValues = { $pull: { members: args.userId.toString() } }
    }

    if (args.taskId) {
      newValues = { $pull: { tasks: args.taskId.toString() } }
    }
    await this.collection.findOneAndUpdate(query, newValues)
  }

  async update({ groupId, name }) {
    const query = { _id: groupId }
    let newValues = { $set: {} }

    if (name) {
      newValues.$set.name = name
    }
    console.log(query, newValues)
    const { value } = await this.collection.findOneAndUpdate(query, newValues, { returnOriginal: false })
    console.log(value)
    return value
  }
}

// class UserAPI extends DataSource {
//   constructor({ store }) {
//     super();
//     this.store = store;
//   }

//   /**
//    * This is a function that gets called by ApolloServer when being setup.
//    * This function gets called with the datasource config including things
//    * like caches and context. We'll assign this.context to the request context
//    * here, so we can know about the user making requests
//    */
//   initialize(config) {
//     this.context = config.context;
//   }

//   /**
//    * User can be called with an argument that includes email, but it doesn't
//    * have to be. If the user is already on the context, it will use that user
//    * instead
//    */
//   async findOrCreateUser({ email: emailArg } = {}) {
//     const email =
//       this.context && this.context.user ? this.context.user.email : emailArg;
//     if (!email || !isEmail.validate(email)) return null;

//     const users = await this.store.users.findOrCreate({ where: { email } });
//     return users && users[0] ? users[0] : null;
//   }

//   async bookTrips({ launchIds }) {
//     const userId = this.context.user.id;
//     if (!userId) return;

//     let results = [];

//     // for each launch id, try to book the trip and add it to the results array
//     // if successful
//     for (const launchId of launchIds) {
//       const res = await this.bookTrip({ launchId });
//       if (res) results.push(res);
//     }

//     return results;
//   }

//   async bookTrip({ launchId }) {
//     const userId = this.context.user.id;
//     const res = await this.store.trips.findOrCreate({
//       where: { userId, launchId },
//     });
//     return res && res.length ? res[0].get() : false;
//   }

//   async cancelTrip({ launchId }) {
//     const userId = this.context.user.id;
//     return !!this.store.trips.destroy({ where: { userId, launchId } });
//   }

//   async getLaunchIdsByUser() {
//     const userId = this.context.user.id;
//     const found = await this.store.trips.findAll({
//       where: { userId },
//     });
//     return found && found.length
//       ? found.map(l => l.dataValues.launchId).filter(l => !!l)
//       : [];
//   }

//   async isBookedOnLaunch({ launchId }) {
//     if (!this.context || !this.context.user) return false;
//     const userId = this.context.user.id;
//     const found = await this.store.trips.findAll({
//       where: { userId, launchId },
//     });
//     return found && found.length > 0;
//   }
// }

module.exports = GroupAPI
