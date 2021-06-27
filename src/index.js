require('dotenv').config()
const { ApolloServer } = require('apollo-server')
const isEmail = require('isemail')
const { MongoClient } = require('mongodb')


const typeDefs = require('./schemas')
const UserAPI = require('./datasources/user')
const TaskAPI = require('./datasources/task')
const GroupAPI = require('./datasources/group')

const resolvers = require('./resolvers')

let db

const dbClient = new MongoClient(process.env.MONGO_DB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

if (!dbClient.isConnected()) {
  dbClient.connect().then(() => {
    db = dbClient.db(process.env.MONGO_DB_NAME) // database name
  })
}

const server = new ApolloServer({
  typeDefs, // schema
  resolvers, //  解析
  context: async ({ req }) => {
    // simple auth check on every request
    // const auth = req.headers && req.headers.authorization || '';
    // const email = Buffer.from(auth, 'base64').toString('ascii');
    // if (!isEmail.validate(email)) return { user: null };
    // // find a user by their email
    // const users = await store.users.findOrCreate({ where: { email } });
    // const user = users && users[0] || null;
    // return { user: { ...user.dataValues } };
    if (!db) {
      try {
        const dbClient = new MongoClient(process.env.MONGO_DB_URI, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        })

        if (!dbClient.isConnected()) await dbClient.connect()
        db = dbClient.db(process.env.MONGO_DB_NAME) // database name
      } catch (e) {
        console.log('--->error while connecting via graphql context (db)', e)
      }
    }

    // return { db, req }
  },
  dataSources: () => ({ // 資料源
    userAPI: new UserAPI(dbClient.db().collection('users')),
    taskAPI: new TaskAPI(dbClient.db().collection('tasks')),
    groupAPI: new GroupAPI(dbClient.db().collection('groups')),
  })
})


server.listen().then(() => {
  console.log(`
    Server is running!
    Listening on port 4000
    Explore at https://studio.apollographql.com/sandbox
  `)
})
