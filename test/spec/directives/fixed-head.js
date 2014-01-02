/*global $, describe, it, inject, beforeEach, afterEach, module, expect */

describe('Module: fixedHead', function() {
  'use strict';

  beforeEach(module('fixedHeadTable'));

  var theadTpl = [
    '<thead>',
      '<tr>',
        '<th>#</th>',
        '<th>Thing</th>',
        '<th>Value</th>',
      '</tr>',
    '</thead>'
  ].join('');

  var tbodyTpl = [
    '<tbody>',
      '<tr ng-repeat="item in bag">',
        '<td style="width:40px">{{$index + 1}}</td>',
        '<td>{{item.label}}</td>',
        '<td>{{item.value}}</td>',
      '</tr>',
    '</tbody>'
  ].join('');

  var tfootTpl = [
    '<tfoot>',
      '<tr>',
        '<td colspan="3">Total Fancy: Lots</td>',
      '</tr>',
    '</tfoot>'
  ].join('');

  var makeTableTpl = function(parts) {
    return '<table fixed-head>' + parts.join('') + '</table>';
  };

  var bigBag = (function() {
    var bag = [];
    for(var ix = 250; ix--;) {
      bag.push({label: 'foo', value: ix+'bars'});
    }
    return bag;
  }());

  var compileTpl;
  beforeEach(inject(function($compile) {
    compileTpl = function(tpl, scp) {
      var $el = $compile(angular.element(tpl))(scp);
      scp.$apply();
      return $el;
    };
  }));

  var bigBagScope;
  beforeEach(inject(function($rootScope) {
    bigBagScope = $rootScope.$new();
    bigBagScope.bag = bigBag;
  }));

  describe('layout', function() {
    var table;

    beforeEach(inject(function($timeout) {
      var tpl = makeTableTpl([theadTpl, tbodyTpl, tfootTpl]);
      table = compileTpl(tpl, bigBagScope);
      $(document.body)
        .height('1024px')
        .width('1024px')
        .prepend( $('<div id="container" />').append(table) );

      $('#container table').css('borderSpacing', 0);
      $('#container table').css('margin', 0);
      $('#container table').css('padding', 0);

      $('#container table').css('width', '300px');
      $('#container table').css('height', '300px');

      $timeout.flush();
    }));

    afterEach(function() {
      $('#container').remove();
    });

    it('should fill out table width and height', function() {
      expect(table.width()).toBe(300);

      /**
       * This fails because... it wants the table element to have display
       * block?? Why does the table end up with a height of 5040? Shouldn't the
       * tbody get clipped? Is the test run before the browser has a chance to
       * update layouts?
       */
      expect(table.height()).toBe(300);
    });

    it('should fill out tbody width and height', function() {
      expect(table.find('tbody').width()).toBe(300);
    });

    it('should fill out thead width', function() {
      expect(table.find('thead').width()).toBe(300);
    });

    it('should fill out tfoot width', function() {
      expect(table.find('tfoot').width()).toBe(300);
    });

  });
});
