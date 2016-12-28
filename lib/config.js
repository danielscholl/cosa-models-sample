const convict = require('convict');
require('dotenv').config();

const _host = process.env.MONGO_HOST || 'localhost';
const _port = process.env.MONGO_PORT || 27017;
const _db = process.env.MONGO_DB || 'local';

var conf = convict({
  env: {
    doc: 'The applicaton environment',
    format: ['production', 'development', 'staging', 'test'],
    default: 'development',
    env: 'NODE_ENV'
  },
  mongo: {
    host: {
      doc: 'Database host name/IP',
      format: String,
      default: 'mongodb://' + _host + ':' + _port + '/' + _db,
      env: 'MONGO_URI'
    }
  }
});

conf.validate({ strict: true });
process.env.COSA_DB_URI = conf.get('mongo.host');

module.exports = conf;
