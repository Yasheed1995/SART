'use strict';

const debug = require('debug')('sigfox-callback:db');
const mongo = require('mongojs');
const format = require('util').format;
//const dbUrl = process.env.DATABASE_URL || 'mongodb://localhost:27017/sigfox-callback';
//const dbUrl = 'mongodb+srv://brocere01:brocere%5F0211@cluster0-qc3ub.mongodb.net/test?retryWrites=true&w=majority'
//const dbUrl = 'mongodb://brocere01:brocere%5F0211@cluster0-shard-00-00-qc3ub.mongodb.net:27017,cluster0-shard-00-01-qc3ub.mongodb.net:27017,cluster0-shard-00-02-qc3ub.mongodb.net:27017/test?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true&w=majority'
const dbUrl = 'mongodb://brocere:brocere0211@ds121982.mlab.com:21982/sigfox_test'

module.exports = {
  db : undefined,
  connect : function() {
    this.db = mongo(dbUrl, ['calls']);

    this.db.on('error', function(err){
      debug('DB Error - %s', err);
    });
    this.db.on('ready', function(){
      debug('DB ready');
    });

    return;
  },
  insert: function(collectionName, data){
    debug('Insert %o in %s', data, collectionName);
    return new Promise(function(resolve, reject){
      this.db[collectionName].insert(data, function(err, docs){
        if (err){
          debug('Insert err — %s', err);
          return reject(err);
        }
        return resolve(docs);
      });
    }.bind(this));
  },
  /**
  * Find documents in a given collection
  *
  * @param {String} collectionName — name of the collection to look into
  * @param {Object} qry — The filter
  * @param {Object} options
  * @return {Promise}
  */
  find: function(collectionName, qry, options){
    if (!options){
      options = {};
    }
    return new Promise(function(resolve, reject){
      const sort = options.sort || {};
      const limit = options.limit || 10000;
      const skip = options.skip || 0;
      delete options.sort;
      delete options.limit;

      this.db[collectionName]
      .find(qry, options)
      .sort(sort)
      .limit(limit)
      .toArray(function(err, docs){
        if (err){
          debug('Find err — %s', err);
          return reject(err);
        }
        debug('find path: %s', qry.path)
        debug('find %s success', qry)
        return resolve(docs);
      });
    }.bind(this));
  }
};
