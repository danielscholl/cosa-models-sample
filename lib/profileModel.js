const Model = require('cosa').Model;
const moment = require('moment');
const ObjectID = require('bson').ObjectID;

let Profile = Model.define({
  name: 'AccessKeyModel',
  collection: 'keys',

  properties: {
    userid: { type: 'string', required: true, min: 30, max: 40},
    key: { type: 'string', required: true, min: 45, max: 50 },
    created: { type: 'date', default: () => { return new Date(); } },
    expires: { type: 'number', required: true, default: 2592000 },
    lastUpdated: { type: 'date', default: () => { return new Date(); } }
  },

  virtuals: {
    expire: () => { return moment(this.created).add(this.expires, 'seconds').format(); }
  },

  methods: {
    beforeSave: () => { this.lastUpdated = new Date(); }
  }
});

Profile.init = function (user, args) {
  let dto = {userid: user.id, key: args.token, expires: args.expires_in};
  if(args.created_at) { dto.created = new Date(args.created_at); }

  return Profile.create(dto).save();
};

Profile.refresh = function(user, args) {
  let filter = {userid: user.id};
  let dto = {key: args.token, expires: args.expires_in};
  if(args.created_at) { dto.created = new Date(args.created_at); }

  return Profile.update(filter, dto).then(() => { return Profile.findOne(filter); });
};

Profile.byId = function(id) {
  return Profile.findOne({_id: new ObjectID(String(id))});
};

Profile.byUser = function(user) {
  let filter = {userid: user.id};
  return Profile.findOne(filter);
};

module.exports = Profile;