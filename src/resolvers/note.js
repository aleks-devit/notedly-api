/** @module Nested_query_note
 * @category window
 *  @description Contain nested query for get author and favoriteBy
 */
module.exports = {
  /**
   * @async
   * @function author
   * @description Get author note
   * @param note Params root query (this info about note)
   * @param args The arguments provided to the field in the GraphQL query
   * @param models Models entities from DB, added across context Apollo
   * @returns {object} A return object that contains information about the author of the note
   */
  author: async(note, args, {models}) => {
    // Get from params root query id author of the note and get information about him in table users
    return await models.User.findById(note.author)
  },
  /**
   * @async
   * @function favoriteBy
   * @description Get list users which this note in favorite list
   * @param note Params root query (this info about note)
   * @param args The arguments provided to the field in the GraphQL query
   * @param models Models entities from DB, added across context Apollo
   * @returns {array} A return list users
   */
  favoriteBy: async(note, args, {models}) => {
    return await models.User.find({_id: {$in: note.favoriteBy}})
  }
}