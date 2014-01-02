
angular.module('fixedHeadTable', []);

/*global alert */

angular.module('fixedHeadTable').directive('fixedHead', ['$timeout', function($timeout) {
  'use strict';
  return {
    link: function(scope, element, attrs) {
      var ng = angular;

      var map = function(arr, ittr) {
        var mapped = [];
        ng.forEach(arr, function() {
          mapped.push(ittr.apply(this, arguments));
        });
        return mapped;
      };

      /**
       * Lock a cells width and height in place
       *
       * Inspects the actual width and height of the element and gives it inline
       * styles to preserve that... should, you know... the parent's display
       * property change or anything.
       *
       * @param {Object} cell A DOM node, either TD or TH
       */
      var freezeCellSize = function(cell) {
        var width = cell.offsetWidth + 'px';
        cell.style.width = width;

        var height = cell.offsetHeight + 'px';
        cell.style.height = height;
      };

      var layout = null;

      /**
       * Get layout info about the table
       *
       * Info is cached for subsequent call.
       *
       * @return {Object}
       */
      var getLayout = function() {
        if(layout) { return layout; }
        var thead = element.find('thead')
          , tbody = element.find('tbody')
          , tfoot = element.find('tfoot');

        layout = {
          table: {
            height: parseInt(element.css('height'), 10),
            maxHeight: parseInt(element.css('maxHeight'), 10)
          },
          thead: {
            height: thead[0] ? thead[0].offsetHeight : 0
          },
          tbody: {
            firstRow: {
              colWidths: map(tbody.find('tr')[0].children, function(td) {
                return td.offsetWidth;
              })
            }
          },
          tfoot: {
            height: tfoot[0] ? tfoot[0].offsetHeight : 0
          }
        };

        return layout;
      };

      /**
       * Locks widths of the first row cells
       *
       * This keeps tbody from collapsing.
       */
      var doLayoutFirstRow = function() {
        var tbody = element.find('tbody')
          , firstRow = ng.element(tbody.find('tr')[0]).children()
          , layout = getLayout();
        angular.forEach(firstRow, function(cell, ix) {
          ng.element(cell).css('width', layout.tbody.firstRow.colWidths[ix] + 'px');
        });
      };

      /**
       * Locks thead, tbody, and tfoot layout
       */
      var doLayout = function() {
        var layout = getLayout();

        var thead = element.find('thead')
          , tbody = element.find('tbody')
          , tfoot = element.find('tfoot');

        // First set some things in stone.
        var colHeaders = thead.find('tr').children()
          , colFooters = tfoot.find('tr').children();

        angular.forEach(colHeaders, freezeCellSize);
        angular.forEach(colFooters, freezeCellSize);
        doLayoutFirstRow();

        // Need position to make things sing
        element.css('position', 'relative');
        thead.css('position', 'absolute');
        tbody.css('position', 'relative');
        tfoot.css('position', 'absolute');

        // And block display
        thead.css('display', 'block');
        tbody.css('display', 'block');
        tfoot.css('display', 'block');

        // Make sure the thead and tfoot are visible
        var theadHeight = layout.thead.height
          , tfootHeight = layout.tfoot.height;
        tbody.css('marginTop', theadHeight + 'px');
        tbody.css('marginBottom', tfootHeight + 'px');

        tfoot.css('thead', 0);
        tfoot.css('bottom', 0);

        if(layout.table.maxHeight) {
          tbody.css('maxHeight', (layout.table.maxHeight - theadHeight - tfootHeight) + 'px');
          tbody.css('overflow', 'scroll');
        } else {
          tbody.css('height', (layout.table.height - theadHeight - tfootHeight) + 'px');
          tbody.css('overflow', 'scroll');
        }

      };
          
      /**
       * A bit of a hack. We must give the table rows a chance to be created
       * (there's likely an ngRepeat sitting below us). At this point in time
       * directives on child elements won't have had a chance to run so we'll
       * use a timeout to let the current execution stack run its course before
       * we try to figure out widths and heighst.
       */
      $timeout(function() {
        doLayout();

        scope.$watch(function() {
          return element.find('tbody').find('tr')[0];
        }, doLayoutFirstRow);
      });
    }
  };
}]);
