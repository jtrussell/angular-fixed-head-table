(function(ng) { 'use strict';

var demo = ng.module('demo', ['fixedHeadTable']);

demo.controller('FancyCtrl', function() {
  var bagSize = 250
    , fancyStuff = ['Curly Mustache', 'Top Hat', 'Monacle']
    , numFancyStuffs = fancyStuff.length
    , value, ix;

  this.bag = [];
  this.total = 0;

  for(ix = bagSize; ix--;) {
    value = Math.ceil(Math.random() * 100);
    this.bag.push({
      label: fancyStuff[value % numFancyStuffs],
      value: value
    });
    this.total += value;
  }
});

}(angular));
