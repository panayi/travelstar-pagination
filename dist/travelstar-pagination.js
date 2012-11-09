
loader.register('travelstar-pagination/core', function(require) {
TS = window.TS || Em.Namespace.create();

});

loader.register('travelstar-pagination/main', function(require) {
require('travelstar-pagination/core');
require('travelstar-pagination/mixins/paginatable');
require('travelstar-pagination/views/pagination');

});

loader.register('travelstar-pagination/mixins/pagination_support', function(require) {
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

});

loader.register('travelstar-pagination/views/pagination', function(require) {
require('travelstar-pagination/core');

var get = Em.get, ceil = Math.ceil;

TS.PaginationView = Em.View.extend({
  templateName: 'shared/pagination',
  classNames: ['pagination'],

  pages: function() {
    var pages = [];
    var controller = get(this, 'controller');

    if (controller) {
      var totalPages = get(controller, 'totalPages'),
          currentPage = get(controller, 'page'),
          maxPages = get(controller, 'maxPages') || totalPages,
          start = currentPage - ceil(maxPages / 2),
          stop;

      if (start < 1) start = 1;

      stop = start + maxPages - 1;
      if (stop > totalPages) stop = totalPages;

      for (var idx = start; idx <= stop; idx++) {
        pages.push({ idx: idx, isCurrent: idx === currentPage });
      }
    }
    return pages;
  }.property('controller.page', 'controller.totalPages'),

  disablePrev: Em.computed(function() {
    return !get(this, 'controller.canPageBackwards');
  }).property('controller.canPageBackwards'),

  disableNext: Em.computed(function() {
    return !get(this, 'controller.canPageForwards');
  }).property('controller.canPageForwards'),

  showFirst: function() {
    return !this.get('pages').findProperty('idx', 1);
  }.property('pages'),

  previousPage: function() {
    Em.tryInvoke(get(this, 'controller'), 'previousPage');
  },

  nextPage: function() {
    Em.tryInvoke(get(this, 'controller'), 'nextPage');
  },

  firstPage: function() {
    Em.tryInvoke(get(this, 'controller'), 'firstPage');
  },

  lastPage: function() {
    Em.tryInvoke(get(this, 'controller'), 'lastPage');
  },

  pageTo: function(event) {
    var idx = get(event.context, 'idx');
    Em.tryInvoke(get(this, 'controller'), 'pageTo', [idx]);
  }
});
});

loader.register('travelstar-pagination/~templates/pagination', function(require) {

return Ember.Handlebars.compile("<ul>    \n  <li {{bindAttr class=\"view.disablePrev:disabled :first-child\"}}>\n    <a href=\"#\" {{action firstPage target=\"view\"}}>\n      <i class=\"icon-caret-left\"></i><i class=\"icon-caret-left\" style=\"margin-left:-12px\"></i>\n    </a>\n  </li>\n  <li {{bindAttr class=\"view.disablePrev:disabled\"}}> \n    <a href=\"#\" {{action previousPage target=\"view\"}}> \n      <i class=\"icon-caret-left\"></i>\n    </a>\n  </li>\n  {{#each view.pages}}\n  <li {{bindAttr class=\"isCurrent:active\"}}>\n    <a href=\"#\" {{action pageTo this target=\"view\"}}>\n      {{idx}}\n    </a>\n  </li>\n  {{/each}}\n  <li {{bindAttr class=\"view.disableNext:disabled\"}}>\n    <a href=\"#\" {{action nextPage target=\"view\"}}>\n      <i class=\"icon-caret-right\"></i>\n    </a>\n  </li>\n  <li {{bindAttr class=\"view.disableNext:disabled\"}}>\n    <a href=\"#\" {{action lastPage target=\"view\"}}>\n      <i class=\"icon-caret-right\" style=\"margin-right:-12px\"></i><i class=\"icon-caret-right\"></i>\n    </a>\n  </li>\n</ul>\n");

});
