require('travelstar-pagination/core');

var get = Em.get, set = Em.set, ceil = Math.ceil;

/**
  @extends Ember.Mixin

  Implements common pagination management properties for controllers.
*/
TS.PaginationSupport = Em.Mixin.create({

  isPaginatable: true,

  total: 0,

  rangeStart: 0,

  maxPages: 5,

  rangeWindowSize: 10,

  didRequestRange: Ember.K,

  rangeStop: Em.computed(function() {
    var total = get(this, 'total');
    var rangeStop = get(this, 'rangeStart') + get(this, 'rangeWindowSize');
    if (total > rangeStop) return rangeStop;
    return total;
  }).property('total', 'rangeStart', 'rangeWindowSize'),

  page: Em.computed(function() {
    return ceil(get(this, 'rangeStart') / get(this, 'rangeWindowSize')) + 1;
  }).property('rangeStart', 'rangeWindowSize'),

  totalPages: Em.computed(function() {
    return ceil(get(this, 'total') / get(this, 'rangeWindowSize'));
  }).property('total', 'rangeWindowSize'),

  canPageBackwards: Em.computed(function() {
    return get(this, 'rangeStart') > 0;
  }).property('rangeStart'),

  canPageForwards: Em.computed(function() {
    return get(this, 'total') > get(this, 'rangeStop');
  }).property('total', 'rangeStop'),

  previousPage: function() {
    if (get(this, 'canPageBackwards')) {
      this.decrementProperty('rangeStart', get(this, 'rangeWindowSize'));
    }
  },

  nextPage: function() {
    if (get(this, 'canPageForwards')) {
      this.incrementProperty('rangeStart', get(this, 'rangeWindowSize'));
    }
  },

  firstPage: function() {
    this.pageTo(1);
  },

  lastPage: function() {
    this.pageTo(this.get('totalPages'));
  },

  pageTo: function(page) {
    if (page > 0 && page <= get(this, 'totalPages')) {
      set(this, 'rangeStart', (page - 1) * get(this, 'rangeWindowSize'));
    }
  },

  pageDidChange: Em.observer(function() {
    this.didRequestRange(get(this, 'rangeStart'), get(this, 'rangeStop'));
  }, 'rangeStart', 'rangeStop')

});
