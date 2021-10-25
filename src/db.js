/**
 * @module  Config DB
 */
const mongoose = require('mongoose')
module.exports = {
  /**
   * This callback helps you set up your database connection via mongoose.
   * @function connect
   * @param {string} DB_HOST Host address DB
   * Many info about set config mongoose  {@link https://mongoosejs.com/}
   */
  connect: DB_HOST => {
    mongoose.set('useNewUrlParser', true)
    // Поставим findOneAndUpdate () вместо findAndModify ()
    mongoose.set('useFindAndModify', false)
    // Поставим createIndex () вместо sureIndex ()
    mongoose.set('useCreateIndex', true)
    // Используем новый механизм обнаружения и мониторинга серверов
    mongoose.set('useUnifiedTopology', true)
    // Подключаемся к БД
    mongoose.connect(DB_HOST)
    // Выводим ошибку при неуспешном подключении
    mongoose.connection.on('error', err => {
      console.error(err)
      console.log(
        'MongoDB connection error. Please make sure MongoDB is running.'
      );
      process.exit()
    })
  },
  close: () => {
    mongoose.connection.close()
  }
}