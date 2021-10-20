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
  newNote: async (parent, args, { models, user }) => {
    if(!user){
      throw new AuthenticationError('You must be signed in to create a note')
    }

    return await models.Note.create({
      content: args.content,
      // Ссылаемся на mongo id автора
      author: mongoose.Types.ObjectId(user.id)
    });
  },
  deleteNote: async (parent, { id }, { models, user }) => {
    // Если не пользователь, выбрасываем ошибку авторизации
    if(!user){
      throw new AuthenticationError('You must be signed in delete a note')
    }

    // Находим заметку
    const note = await models.Note.findById(id)

    // Если владелец заметки и текущий пользователь не совпадают, выбрасываем
    // запрет на действие
    if(note && String(note.author) !== user.id){
      throw new ForbiddenError("You don't have permissions to delete the note")
    }

    try {
      await note.remove()
      return true;
    } catch (err) {
      return false;
    }
  },

  updateNote: async (parent, { content, id }, { models, user }) => {
    // Если не пользователь, выбрасываем ошибку авторизации
    if (!user) {
      throw new AuthenticationError('You must be signed in to update a note');
    }
    // Находим заметку
    const note = await models.Note.findById(id)
    // Если владелец заметки и текущий пользователь не совпадают, выбрасываем
    // запрет на действие
    if(note && String(note.author) !== user.id){
      throw new ForbiddenError("You don't have permissions to update the note");
    }
    // Обновляем заметку в БД и возвращаем ее в обновленном виде
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

  signUp: async (parent, {username, email, password}, {models}) => {
    // Нормализуем имейл
    email = email.trim().toLowerCase()
    // Хешируем пароль
    const hashed = await bcrypt.hash(password, 10)
    // Создаем url gravatar-изображения
    const avatar = gravatar(email)
    try{
      const user = await models.User.create({
        username,
        email,
        avatar,
        password: hashed
      })
      // Создаем и возвращаем json web token
      return jwt.sign({ id: user._id}, process.env.JWT_SECRET)
    }catch (err){
      console.log(err);
      // Если при регистрации возникла проблема, выбрасываем ошибку
      throw new Error('Error creating account')
    }
  },

  signIn: async (parent, {username, email, password}, {models}) => {
    if(email){
      // Нормализуем имейл
      email = email.trim().toLowerCase()
    }

    const user = await models.User.findOne({
      $or: [{email}, {username}]
    })

    // Если пользователь не найден, выбрасываем ошибку аутентификации
    if(!user){
      throw new AuthenticationError('Error sign in')
    }

    // Если пароли не совпадают, выбрасываем ошибку аутентификации
    const valid = await bcrypt.compare(password, user.password)
    if(!valid){
      throw new AuthenticationError('Error sign in')
    }

    // Создаем и возвращаем json web token
    return jwt.sign({id: user._id}, process.env.JWT_SECRET)
  },
  toggleFavorite: async (parent, {id}, {models,user}) => {
    // Если контекст пользователя не передан, выбрасываем ошибку
    if(!user){
      throw new AuthenticationError()
    }

    // Проверяем, отмечал ли пользователь заметку как избранную
    let noteCheck = await models.Note.findById(id)
    const hasUser = noteCheck.favoriteBy.indexOf(user.id)

    if(hasUser >=0) {
      return await models.Note.findByIdAndUpdate(
        id,
        {
          $pull: {
            favoriteBy: mongoose.Types.ObjectId(user.id)
          },
          $inc: {
            favoriteCount: -1
          }
        },
        {
          new: true
        }
      )
    }else{
      return await  models.Note.findByIdAndUpdate(
        id,
        {
          $push: {
            favoriteBy: mongoose.Types.ObjectId(user.id)
          },
          $inc: {
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