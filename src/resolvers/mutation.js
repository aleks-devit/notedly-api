/**
 * @module Mutation_resolvers
 */
const bcrypt = require('bcrypt')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const {
  AuthenticationError,
  ForbiddenError
} = require('apollo-server-express')
require('dotenv').config()

const gravatar = require('../util/gravatar')

module.exports = {
  /**
   * @function newNote
   * @description Create new note
   * @async
   * @param parent Contain object property root query
   * @param args The arguments provided to the field in the GraphQL query
   * @param models Models entities from DB, added across context Apollo
   * @param user Info about user, added across context Apollo
   * @returns {Object} Info about new note
   */
  newNote: async (parent, args, { models, user }) => {
    // If user not auth, display error
    if(!user){
      throw new AuthenticationError('You must be signed in to create a note')
    }
    // Create note in DB
    return await models.Note.create({
      content: args.content,
      // Create link to entities author in DB
      author: mongoose.Types.ObjectId(user.id)
    });
  },
  /**
   * @function deleteNote
   * @description Delete note
   * @async
   * @param parent Contain object property root query
   * @param id Id note for delete sent in request in params query
   * @param models Models entities from DB, added across context Apollo
   * @param user Info about user, added across context Apollo
   * @returns {boolean} Note deleted or no
   */
  deleteNote: async (parent, { id }, { models, user }) => {
    // If user not auth, display error
    if(!user){
      throw new AuthenticationError('You must be signed in delete a note')
    }

    // Find note in DB across id from arguments
    const note = await models.Note.findById(id)

    // Check user delete their note
    if(note && String(note.author) !== user.id){
      throw new ForbiddenError("You don't have permissions to delete the note")
    }

    try {
      // Call method remove for note
      await note.remove()
      return true;
    } catch (err) {
      return false;
    }
  },

  /**
   * @function updateNote
   * @description Update Note
   * @async
   * @param parent Contain object property root query
   * @param content Modified note sent in request in params query
   * @param id Id note for update sent in request in params query
   * @param models Models entities from DB, added across context Apollo
   * @param user Info about user, added across context Apollo
   * @returns {Object} Info about update note
   */
  updateNote: async (parent, { content, id }, { models, user }) => {
    // If user not auth, display error
    if (!user) {
      throw new AuthenticationError('You must be signed in to update a note');
    }
    // Find note fot update by id from arguments
    const note = await models.Note.findById(id)

    // Check user update their note
    if(note && String(note.author) !== user.id){
      throw new ForbiddenError("You don't have permissions to update the note");
    }
    // Refresh note adn return her
    return await models.Note.findByIdAndUpdate(
      {
        _id: id,
      },
      {
        $set: {
          content
        }
      },
      {
        new: true
      }
    );
  },

  /**
   * @async
   * @function signUp
   * @description method for register user
   * @param parent Contain object property root query
   * @param username Username new user
   * @param email Email new user
   * @param password Password new user
   * @param models Models entities from DB, added across context Apollo
   * @returns {string } Token for auth
   */
  signUp: async (parent, {username, email, password}, {models}) => {
    // Normalize email
    email = email.trim().toLowerCase()
    // Hashed password
    const hashed = await bcrypt.hash(password, 10)
    // Create url for avatar
    const avatar = gravatar(email)
    try{
      // Create new user in DB
      const user = await models.User.create({
        username,
        email,
        avatar,
        password: hashed
      })
      // Create and return jwt token for auth
      return jwt.sign({ id: user._id}, process.env.JWT_SECRET)
    }catch (err){
      console.log(err);
      // If error return error-message
      throw new Error('Error creating account')
    }
  },

  /**
   * @async
   * @function signIn
   * @description method for handle login
   * @param parent Contain object property root query
   * @param username Username new user
   * @param email Email new user
   * @param password Password new user
   * @param models Models entities from DB, added across context Apollo
   * @returns {string } Token for auth
   */
  signIn: async (parent, {username, email, password}, {models}) => {
    if(email){
      // Normalize email
      email = email.trim().toLowerCase()
    }
      // Find user in DB use email and username
    const user = await models.User.findOne({
      $or: [{email}, {username}]
    })

    // If this user isn`t in DB return error
    if(!user){
      throw new AuthenticationError('Error sign in')
    }

    // Check valid password
    const valid = await bcrypt.compare(password, user.password)
    // If password no correct return error
    if(!valid){
      throw new AuthenticationError('Error sign in')
    }

    // Create token for auth
    return jwt.sign({id: user._id}, process.env.JWT_SECRET)
  },

  /**
   * @async
   * @function toggleFavorite
   * @description Help add note in favorite or delete form their
   * @param parent Contain object property root query
   * @param id Id note for delete sent in request in params query
   * @param models Models entities from DB, added across context Apollo
   * @param user Info about user, added across context Apollo
   * @returns {Promise<*>}
   */
  toggleFavorite: async (parent, {id}, {models,user}) => {
    // If user no auth return error
    if(!user){
      throw new AuthenticationError()
    }

    // Get note from db
    let noteCheck = await models.Note.findById(id)
    // Check availability note in favorite list user
    const hasUser = noteCheck.favoriteBy.indexOf(user.id)
    // If user add in favorite list
    if(hasUser >=0) {
      // then find note by id in DB and pull id user from favorite list
      return await models.Note.findByIdAndUpdate(
        id,
        {
          $pull: {
            favoriteBy: mongoose.Types.ObjectId(user.id)
          },
          // and reduce count followers on one
          $inc: {
            favoriteCount: -1
          }
        },
        {
          new: true
        }
      )
      // Else if user have not note in favorite list
    }else{
      // find note by id and add id user in list users added this note in favorite
      return await  models.Note.findByIdAndUpdate(
        id,
        {
          $push: {
            favoriteBy: mongoose.Types.ObjectId(user.id)
          },
          $inc: {
            // increase count on one
            favoriteCount: 1
          }
        },
        {
          new: true
        }
      )
    }
  }
};