/** @module Query_resolvers*/
module.exports = {
  /**
   * @async
   * @function notes
   * @description get all notes from DB
   * @param parent Contain object property root query
   * @param args The arguments provided to the field in the GraphQL query
   * @param models Models entities from DB, added across context Apollo
   * @returns {array} Array notes
   */
  notes: async (parent, args, { models }) => {
    return await models.Note.find().limit(100)
  },
  /**
   * @async
   * @function note
   * @description get one note from db
   * @param parent Contain object property root query
   * @param args The arguments provided to the field in the GraphQL query
   * @param models Models entities from DB, added across context Apollo
   * @returns {array} Note
   */
  note: async (parent, args, { models }) => {
    return await models.Note.findById(args.id)
  },
  /**
   * @async
   * @function user
   * @description get user from DB by username
   * @param parent Contain object property root query
   * @param username Username
   * @param models Models entities from DB, added across context Apollo
   * @returns {object} User
   */
  user: async (parent, {username}, { models }) => {
    // Find user by name
    return await models.User.findOne({username})
  },
  /**
   * @async
   * @function users
   * @description Get all users from DB
   * @param parent Contain object property root query
   * @param args The arguments provided to the field in the GraphQL query
   * @param models Models entities from DB, added across context Apollo
   * @returns {array} Array users
   */
  users: async (parent, args, {models}) => {
    // Find all users in DB
    return await models.User.find({})
  },
  /**
   * @async
   * @function me
   * @description Get info about me
   * @param parent Contain object property root query
   * @param args The arguments provided to the field in the GraphQL query
   * @param models Models entities from DB, added across context Apollo
   * @param user Get info about me from context
   * @returns {object} Info about me
   */
  me: async (parent, args, {models, user}) => {
    // Find user in DB use id user from context
    return await models.User.findById(user.id)
  },
  /**
   * @async
   * @function noteFeed
   * @description This method help get notes by page
   * @param parent Contain object property root query
   * @param cursor By this value this method get notes
   * @param models Models entities from DB, added across context Apollo
   * @returns {object} This method return object contain: list notes, cursor and bool value about next page
   */
  noteFeed: async (parent, {cursor}, {models}) => {
    // Set limit notes count
    const limit = 10;

    // Set value false to default
    let hasNextPage = false

    // If cursor === null, this method return last notes
    let cursorQuery = {}

    // Если курсор задан, запрос будет искать заметки со значением ObjectId
    // меньше этого курсора
    console.log('1');
    if(cursor) {
      cursorQuery = {_id: {$lt: cursor}}
    }

    // Находим в БД limit + 1 заметок, сортируя их от старых к новым
    let notes = await models.Note.find(cursorQuery)
      .sort({ _id: -1})
      .limit(limit + 1)

    // Если число найденных заметок превышает limit, устанавливаем
    // hasNextPage как true и обрезаем заметки до лимита
    if(notes.length > limit) {
      hasNextPage = true
      notes = notes.slice(0, -1)
    }

    // Новым курсором будет ID Mongo-объекта последнего элемента массива списка
    const newCursor = notes[notes.length - 1]._id

    return {
      notes,
      cursor: newCursor,
      hasNextPage
    }
  }
}