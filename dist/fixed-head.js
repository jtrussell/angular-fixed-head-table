
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
          , tfoot = element.find('tfoot');

        layout = {
          table: {
            height: parseInt(element.css('height'), 10),
            maxHeight: parseInt(element.css('maxHeight'), 10)
          },
          thead: {
            height: thead[0] ? thead[0].offsetHeight : 0
          },
          tfoot: {
            height: tfoot[0] ? tfoot[0].offsetHeight : 0
          }
        };

        return layout;
      };

      var layoutFirstRow = null;

      /**
       * Get layout info for the first row
       *
       * Info is a cached for subsequent calls
       *
       * @return {Object} The layout information
       */
      var getLayoutFirstRow = function() {
        if(layoutFirstRow) { return layoutFirstRow; }

        var firstRow = element.find('tbody').find('tr')[0];
        if(!firstRow) {
          return null;
        }

        layoutFirstRow = {
          colWidths: map(firstRow.children, function(td) {
            return td.offsetWidth;
          })
        };

        return layoutFirstRow;
      };

      /**
       * Locks widths of the first row cells
       *
       * This keeps tbody from collapsing.
       *
       * @return {Boolean} Whether or not we could set row layout
       */
      var doLayoutFirstRow = function() {
        var tbody = element.find('tbody')
          , firstRow = ng.element(tbody.find('tr')[0]).children()
          , layout = getLayoutFirstRow();

        // There may not be no rows (yet?)
        if(!layout) {
          return false;
        }

        angular.forEach(firstRow, function(cell, ix) {
          ng.element(cell).css('width', layout.colWidths[ix] + 'px');
        });

        return true;
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
        } else {
          tbody.css('height', (layout.table.height - theadHeight - tfootHeight) + 'px');
        }
        if('visible' === tbody.css('overflow') || '' === tbody.css('overflow')) {
          tbody.css('overflow', 'auto');
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
        doLayoutFirstRow();
        doLayout();

        scope.$watch(function() {
          return element.find('tbody').find('tr')[0];
        }, doLayoutFirstRow);
      });
    }
  };
}]);
