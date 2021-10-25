/**
 *  @category window
 */
const mongoose = require('mongoose');
/**
 * Represents a book.
 * @constructor
 * @param {string} title - The title of the book.
 * @param {string} author - The author of the book.
 *
 * @mermaid
 *   graph TD;
 *     A-->B;
 *     A-->C;
 *     B-->D;
 *     C-->D;
 */
const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      index: {unique: true}
    },
    email: {
      type: String,
      required: true,
      index: {unique: true}
    },
    password: {
      type: String,
      required: true
    },
    avatar: {
      type: String
    }
  },
  {
    // Присваиваем поля createdAt и updatedAt с типом Date
    timestamps: true
  }
)

const User = mongoose.model('User', UserSchema)
module.exports = User