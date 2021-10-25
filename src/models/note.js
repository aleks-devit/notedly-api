/**
 * @module Задача параметров модели заметок.
 *
 */
// Запросим библиотеку mongoose
const mongoose = require('mongoose')

// Определяем схему БД заметки
const noteSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    // Добавляем свойство favoriteCount
    favoriteCount: {
      type: Number,
      default: 0
    },
    // Добавляем свойство favoritedBy
    favoriteBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ]
  },
  {
    // Присваиваем поля createdAt и updatedAt с типом данных
    timestamps: true
  }
)

// Определяем модель 'Note' со схемой
const Note = mongoose.model('Note', noteSchema)

// Экспортируем модуль
module.exports = Note