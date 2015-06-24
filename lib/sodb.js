(function() {
  var Cache, Compares, Entry, hash, sodb;

  Cache = require('./cache');

  Compares = require('./compares');

  Entry = require('./entry');

  hash = require('object-hash');

  module.exports = sodb = (function() {
    sodb.prototype.objects = null;

    sodb.prototype.lastInsertId = -1;

    sodb.prototype.cache = null;

    sodb.prototype.options = null;

    function sodb(options) {
      var base;
      this.options = options != null ? options : {};
      this.objects = [];
      (base = this.options).cache || (base.cache = false);
      this.dbRevision = 0;
      this.cache = new Cache(this.options.cache);
    }

    sodb.prototype.add = function(object) {
      var newId;
      this.lastInsertId += 1;
      newId = this.lastInsertId;
      this.objects[newId] = new Entry(object, newId);
      if (this.options.cache) {
        this.dbRevision += 1;
      }
      return this.unref(this.objects[newId]);
    };

    sodb.prototype.where = function() {
      var args, search;
      args = Array.prototype.slice.call(arguments);
      search = args.map(this.expandQuery);
      return this.cache.hit(hash.sha1(search), this.dbRevision, (function(_this) {
        return function() {
          return _this.findResults(search);
        };
      })(this));
    };

    sodb.prototype.findResults = function(search) {
      var compare, condition, field, i, len, results;
      results = this.objects;
      for (i = 0, len = search.length; i < len; i++) {
        condition = search[i];
        field = Object.keys(condition)[0];
        compare = Object.keys(condition[field])[0];
        results = this.runCondition(field, compare, condition[field][compare], results);
      }
      return results.map(this.unref);
    };

    sodb.prototype.findOne = function() {
      return this.where.apply(this, arguments)[0];
    };

    sodb.prototype.unref = function(entry) {
      return new Entry(entry.object, entry.___id);
    };

    sodb.prototype.runCondition = function(field, compare, value, objects) {
      var found, i, len, orCondition, results;
      if (value.constructor === Array) {
        found = [];
        for (i = 0, len = value.length; i < len; i++) {
          orCondition = value[i];
          results = this.runCondition(field, compare, orCondition, objects);
          found = this.join(found, results);
        }
        return found;
      } else {
        return Compares[compare](field, value, objects);
      }
    };

    sodb.prototype.join = function(current, additions) {
      var entry, i, ids, len;
      ids = current.map(function(value) {
        return value.___id;
      });
      for (i = 0, len = additions.length; i < len; i++) {
        entry = additions[i];
        if (ids.indexOf(entry.___id) === -1) {
          current.push(entry);
        }
      }
      return current;
    };

    sodb.prototype.expandQuery = function(search) {
      var i, key, len, ref;
      ref = Object.keys(search);
      for (i = 0, len = ref.length; i < len; i++) {
        key = ref[i];
        if (search[key].constructor !== Object) {
          search[key] = {
            is: search[key]
          };
        }
      }
      return search;
    };

    sodb.prototype.update = function(entry) {
      if (entry.changed()) {
        entry.updateObject();
        this.objects[entry.___id] = entry;
        if (this.options.cache) {
          this.dbRevision += 1;
        }
      }
      return entry;
    };

    sodb.prototype.remove = function(entry) {
      delete this.objects[entry.___id];
      if (this.options.cache) {
        return this.dbRevision += 1;
      }
    };

    sodb.prototype.count = function() {
      var count, i, len, object, ref;
      count = 0;
      ref = this.objects;
      for (i = 0, len = ref.length; i < len; i++) {
        object = ref[i];
        if (object) {
          count += 1;
        }
      }
      return count;
    };

    sodb.prototype.toJSON = function() {
      return JSON.stringify(this.objects);
    };

    sodb.buildFromJSON = function(json) {
      var db, i, len, object, objects;
      objects = JSON.parse(json);
      db = new sodb();
      for (i = 0, len = objects.length; i < len; i++) {
        object = objects[i];
        db.objects[object.___id] = object;
      }
      return db;
    };

    return sodb;

  })();

}).call(this);
