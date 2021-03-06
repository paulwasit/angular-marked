(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.angularMarked = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

'use strict';

module.exports = 'hc.marked';

angular.module('hc.marked', [])

.provider('marked', function () {
  var self = this;

  self.setRenderer = function (opts) {
    this.renderer = opts;
  };

  self.setOptions = function (opts) {  // Store options for later
    this.defaults = opts;
  };

  self.$get = ['$log', '$window', function ($log, $window) {
    var m;

    try {
      m = require('marked');
    } catch (e) {
      m = $window.marked || marked;
    }

    if (angular.isUndefined(m)) {
      $log.error('angular-marked Error: marked not loaded.  See installation instructions.');
      return;
    }

    // override rendered markdown html
    // with custom definitions if defined
    if (self.renderer) {
      var r = new m.Renderer();
      var o = Object.keys(self.renderer);
      var l = o.length;

      while (l--) {
        r[o[l]] = self.renderer[o[l]];
      }

      // add the new renderer to the options if need be
      self.defaults = self.defaults || {};
      self.defaults.renderer = r;
    }

    m.setOptions(self.defaults);

    return m;
  }];
})

.directive('marked', ['marked', '$templateRequest', function (marked, $templateRequest) {
	
  return {
		
    restrict: 'AE',
    replace: true,
    scope: {
      opts: '=',
      marked: '=',
      src: '='
    },
    link: function (scope, element, attrs) {
			
      set(scope.marked || element.text() || '');
			
      if (attrs.marked) {
        scope.$watch('marked', set);
      }

      if (attrs.src) {
        scope.$watch('src', function (src) {
          $templateRequest(src, true).then(function (response) {
            set(response);
          });
        });
      }

      function unindent (text) {
        if (!text) { return text; }

        var lines = text
          .replace(/\t/g, '  ')
          .split(/\r?\n/);

        var min = null;
        var len = lines.length;

        for (var i = 0; i < len; i++) {
          var line = lines[i];
          var l = line.match(/^(\s*)/)[0].length;
          if (l === line.length) { continue; }
          min = (l < min || min === null) ? l : min;
        }

        if (min !== null && min > 0) {
          for (i = 0; i < len; i++) {
            lines[i] = lines[i].substr(min);
          }
        }
        return lines.join('\n');
      }

      function set (text) {
				console.log('set');
        text = unindent(text || '');
        element.html(marked(text, scope.opts || null));
				if (MathJax !== undefined) {
					MathJax.Hub.Queue(["Typeset", MathJax.Hub, element[0]]); //useful for watched elements
				}					
      }
    }
  };
	
}]);

},{"marked":"marked"}]},{},[1])(1)
});