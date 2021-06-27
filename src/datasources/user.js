const { MongoDataSource } = require('apollo-datasource-mongodb')

const isEmail = require('isemail')

const uniqueArray = (list) => list.filter((item, pos, self) => self.indexOf(item) == pos)


class UserAPI extends MongoDataSource {
  // (e.g. this.collection.update({_id: 'foo, { $set: { name: 'me' }}})). The model (if applicable) is available at this.model (new this.model({ name: 'Alice' })). The request's context is available at this.context. For example, if you put the logged-in user's ID on context as context.currentUserId:

  initialize(config) {
    super.initialize(config)
    this.context = config.context
  }

  // @TODO add createdTime, updatedTime

  async fetch(userId) {
    const user = await this.findOneById(userId)
    let groups = []
    if (user.groups) {
      groups = await Promise.all(user.groups.map(async groupId => await this.context.dataSources.groupAPI.findOneById(groupId) || null))
    }

    return {
      ...user,
      groups: groups.filter(g => !!g),
    }
  }

  async fetchAll() {
    let users = await this.collection.find().toArray()
    return users.map(async user => {
      let groups
      if (user.groups) {
        groups = await Promise.all(user.groups.map(async groupId => await this.context.dataSources.groupAPI.findOneById(groupId) || null))
      } else {
        groups = []
      }
      return {
        ...user,
        groups: groups.filter(m => !!m),
      }
    })
  }

  async create(args) {
    const existingUser = await this.collection.findOne({ email: args.email })
    if (existingUser) {
      throw new Error('User exists already.')
    }
    await this.collection.insertOne({ ...args, groups: [] })

    return args
  }

  // @TODO add password to updateUser
  async update(args) {
    const query = { _id: args.userId }
    let newValues = { $set: {} }
    Object.keys(args).forEach(key => {
      if (args[key] && key !== 'userId' && key !== 'groupId') {
        newValues.$set[key] = args[key]
      }
    })

    let groups
    if (args.groupId) {
      // insert groupId to user's groups
      const user = await this.findOneById(args.userId)
      newValues.$set.groups = uniqueArray([...user.groups, args.groupId])

      // insert userId to group's member
      const group = await this.context.dataSources.groupAPI.fetch(args.groupId)
      await this.context.dataSources.groupAPI.addUserToGroup({
        groupId: group._id,
        members: uniqueArray([...group.members.map(m => m.toString()), args.userId.toString()])
      })

      // return groups in this user
      groups = await Promise.all(uniqueArray([...user.groups, args.groupId]).map(async groupId => await this.context.dataSources.groupAPI.findOneById(groupId) || null))
    }

    const { value } = await this.collection.findOneAndUpdate(query, newValues, { returnOriginal: false })
    return groups ? {
      ...value,
      groups: groups.filter(g => !!g),
    } : value

    // { _id: 60d6d4eaadee0be3f205e7c3 } { '$set': { name: 'employee01' } }
    // { _id: '60d6d4eaadee0be3f205e7c3' } { '$set': { groups: [ 60d6f526262780f3c87337e4 ] } }
  }

  async deleteGroup(args) {
    const query = { _id: args.userId }
    let newValues = { $pull: { groups: args.groupId } }
    const { value } = await this.collection.findOneAndUpdate(query, newValues, { returnOriginal: false })

    let groups
    if (args.groupId) {
      // remove userId to group's member
      await this.context.dataSources.groupAPI.delete({
        ...args
      })

      // return groups in this user
      groups = await Promise.all(value.groups.map(async groupId => await this.context.dataSources.groupAPI.findOneById(groupId) || null))
    }
    return groups ? {
      ...value,
      groups: groups.filter(g => !!g),
    } : value
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

module.exports = UserAPI
