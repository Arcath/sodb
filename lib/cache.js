(function() {
  var Cache;

  module.exports = Cache = (function() {
    Cache.prototype.cache = {};

    Cache.prototype.enabled = null;

    function Cache(enabled) {
      this.enabled = enabled;
      this.cache = {};
    }

    Cache.prototype.hit = function(key, cacheVersion, createValue) {
      if (this.enabled) {
        return this.findOrCreate(key, cacheVersion, createValue);
      } else {
        return createValue();
      }
    };

    Cache.prototype.findOrCreate = function(key, cacheVersion, createValue) {
      var value;
      if (typeof this.cache[key] === 'undefined' || this.cache[key][1] !== cacheVersion) {
        value = createValue();
        this.cache[key] = [value, cacheVersion];
        return value;
      } else {
        return this.cache[key][0];
      }
    };

    return Cache;

  })();

}).call(this);
