/** @module Nested_query_user
 * @category window
 *  @description Contain nested query for get notes and favorite notes
 */
module.exports = {
  /**
   * @async
   * @function notes
   * @description Get authors notes
   * @param user Params root query (this info about user)
   * @param args The arguments provided to the field in the GraphQL query
   * @param models Models entities from DB, added across context Apollo
   * @returns {array} Return array author notes
   */
  notes: async(user, args, {models}) => {
    // Find notes where author === user.id
    return await models.Note.find({author: user._id}).sort({_id: -1})
  },

  /**
   * @async
   * @function favorites
   * @description Get list favorites notes user
   * @param user Params root query (this info about user)
   * @param args The arguments provided to the field in the GraphQL query
   * @param models Models entities from DB, added across context Apollo
   * @returns {array} Return array author favorites notes
   */
  favorites: async (user, args, {models}) => {
    return await models.Note.find({favoriteBy: user._id}).sort({_id: -1})
  }
}