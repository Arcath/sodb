(function() {
  module.exports = {
    is: function(field, value, objects) {
      return objects.filter(function(entry) {
        return entry[field] === value;
      });
    },
    gt: function(field, value, objects) {
      return objects.filter(function(entry) {
        return entry[field] > value;
      });
    },
    lt: function(field, value, objects) {
      return objects.filter(function(entry) {
        return entry[field] < value;
      });
    },
    gte: function(field, value, objects) {
      return objects.filter(function(entry) {
        return entry[field] >= value;
      });
    },
    lte: function(field, value, objects) {
      return objects.filter(function(entry) {
        return entry[field] <= value;
      });
    },
    isnot: function(field, value, objects) {
      return objects.filter(function(entry) {
        return entry[field] !== value;
      });
    }
  };

}).call(this);
