/**
 * @module  Place_connect_all_resolvers
 * @description This module contain imports regular queries and mutation and nested queries.
 */
const Query = require('./query')
const Mutation = require('./mutation')
const { GraphQLDateTime } = require('graphql-iso-date')
const Note = require('./note')
const User = require('./user')

module.exports = {
  Query,
  Mutation,
  Note,
  User,
  // Add date type
  DateTime: GraphQLDateTime
}