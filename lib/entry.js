(function() {
  var Entry;

  module.exports = Entry = (function() {
    Entry.prototype.___id = null;

    function Entry(object, ___id) {
      var i, key, len, ref;
      this.object = object;
      this.___id = ___id;
      ref = Object.keys(this.object);
      for (i = 0, len = ref.length; i < len; i++) {
        key = ref[i];
        this[key] = this.object[key];
      }
    }

    Entry.prototype.changed = function() {
      var changed, i, key, len, ref;
      changed = false;
      ref = Object.keys(this.object);
      for (i = 0, len = ref.length; i < len; i++) {
        key = ref[i];
        if (this[key] !== this.object[key]) {
          changed = true;
        }
      }
      return changed;
    };

    Entry.prototype.updateObject = function() {
      var i, key, len, ref, results;
      ref = Object.keys(this.object);
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        key = ref[i];
        results.push(this.object[key] = this[key]);
      }
      return results;
    };

    return Entry;

  })();

}).call(this);
