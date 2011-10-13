(function($) {

  // css3 transition-timing-function
  $.switchable.TimingFn = {
    'ease': cubicBezier('.25, .1, .25, 1'),
    'linear': cubicBezier('0, 0, 1, 1'),
    'ease-in': cubicBezier('.42, 0, 1, 1'),
    'ease-out': cubicBezier('0, 0, .58, 1'),
    'ease-in-out': cubicBezier('.42, 0, .58, 1')/*,
    // jQuery Easing
    easeInQuad: cubicBezier('.55, .085, .68, .53'),
    easeOutQuad: cubicBezier('.25, .46, .45, .94'),
    easeInOutQuad: cubicBezier('.455, .03, .515, .955'),

    easeInCubic: cubicBezier('.55, .055, .675, .19'),
    easeOutCubic: cubicBezier('.215, .61, .355, 1'),
    easeInOutCubic: cubicBezier('.645, .045, .355, 1'),

    easeInQuart: cubicBezier('.895, .03, .685, .22'),
    easeOutQuart: cubicBezier('.165, .84, .44, 1'),
    easeInOutQuart: cubicBezier('.77, 0, .175, 1'),

    easeInQuint: cubicBezier('.755, .05, .855, .06'),
    easeOutQuint: cubicBezier('.23, 1, .32, 1'),
    easeInOutQuint: cubicBezier('.86, 0, .07, 1'),

    easeInSine: cubicBezier('.47, 0, .745, .715'),
    easeOutSine: cubicBezier('.39, .575, .565, 1'),
    easeInOutSine: cubicBezier('.445, .05, .55, .95'),

    easeInExpo: cubicBezier('.95, .05, .795, .035'),
    easeOutExpo: cubicBezier('.19, 1, .22, 1'),
    easeInOutExpo: cubicBezier('1, 0, 0, 1'),

    easeInCirc: cubicBezier('.6, .04, .98, .335'),
    easeOutCirc: cubicBezier('.075, .82, .165, 1'),
    easeInOutCirc: cubicBezier('.785, .135, .15, .86'),

    easeInElastic: null,
    easeOutElastic: null,
    easeInOutElastic: null,

    easeInBack: null,
    easeOutBack: null,
    easeInOutBack: null,

    easeInBounce: null,
    easeOutBounce: null,
    easeInOutBounce: null*/
  };


  $.switchable.Easing = function(param) {
    var name, len, i = 0;

    param = param.split(',');
    len = param.length;
    for ( ; i < len; i++ ) {
      param[i] = parseFloat(param[i]);
    }

    if ( len !== 4 ) {
      window.console && console.warn( cubicBezier(param.join(', ')) + ' missing argument.' );
    } else {
      name = 'cubic-bezier-' + param.join('-');

      if ( !$.easing[name] ) {
        var lookup = makeLookup(function(p) {
          return cubicBezierAtTime(p, param[0], param[1], param[2], param[3], 5.0);
        });

        $.easing[name] = function(p, n, firstNum, diff) {
          return lookup.call(null, p);
        };
      }
    }

    return name;
  }


  function cubicBezier(p) {
    return 'cubic-bezier(' + p + ')';
  }


  function makeLookup(fn) {
    var lookupTable = [],
        steps = 101,
        i;

    for ( i = 0; i <= steps; i++ ) {
      lookupTable[i] = fn.call(null, i/steps);
    }

    return function(p) {
      if ( p === 1 ) {
        return lookupTable[steps];
      }

      var sp = steps*p,
          p0 = Math.floor(sp),
          y1 = lookupTable[p0],
          y2 = lookupTable[p0+1];

      return y1+(y2-y1)*(sp-p0);
    }
  }


  // From: http://www.netzgesta.de/dev/cubic-bezier-timing-function.html
  // 1:1 conversion to js from webkit source files
  // UnitBezier.h, WebCore_animation_AnimationBase.cpp
  function cubicBezierAtTime(t, p1x, p1y, p2x, p2y, duration) {
    var ax = bx = cx = ay = by = cy = 0;
    // `ax t^3 + bx t^2 + cx t' expanded using Horner's rule.
    function sampleCurveX(t) {
      return ((ax*t+bx)*t+cx)*t;
    }
    function sampleCurveY(t) {
      return ((ay*t+by)*t+cy)*t;
    }
    function sampleCurveDerivativeX(t) {
      return (3.0*ax*t+2.0*bx)*t+cx;
    }
    // The epsilon value to pass given that the animation is going to run over |dur| seconds. The longer the
    // animation, the more precision is needed in the timing function result to avoid ugly discontinuities.
    function solveEpsilon(duration) {
      return 1.0/(200.0*duration);
    }
    function solve(x, epsilon) {
      return sampleCurveY(solveCurveX(x, epsilon));
    }
    // Given an x value, find a parametric value it came from.
    function solveCurveX(x, epsilon) {
      var t0, t1, t2, x2, d2, i;
      function fabs(n) {
        if ( n >= 0 ) {
          return n;
        } else {
          return 0-n;
        }
      }
      // First try a few iterations of Newton's method -- normally very fast.
      for ( t2 = x, i = 0; i < 8; i++ ) {
        x2 = sampleCurveX(t2)-x;
        if ( fabs(x2) < epsilon ) {
          return t2;
        }
        d2 = sampleCurveDerivativeX(t2);
        if ( fabs(d2) < 1e-6 ) {
          break;
        }
        t2 = t2-x2/d2;
      }
      // Fall back to the bisection method for reliability.
      t0 = 0.0;
      t1 = 1.0;
      t2 = x;
      if ( t2 < t0 ) {
        return t0;
      }
      if ( t2 > t1 ) {
        return t1;
      }
      while ( t0 < t1 ) {
        x2 = sampleCurveX(t2);
        if ( fabs(x2-x) < epsilon ) {
          return t2;
        }
        if ( x > x2 ) {
          t0 = t2;
        } else {
          t1 = t2;
        }
        t2 = (t1-t0)*0.5+t0;
      }
      return t2; // Failure.
    }
    // Calculate the polynomial coefficients, implicit first and last control points are (0,0) and (1,1).
    cx = 3.0*p1x;
    bx = 3.0*(p2x-p1x)-cx;
    ax = 1.0-cx-bx;
    cy = 3.0*p1y;
    by = 3.0*(p2y-p1y)-cy;
    ay = 1.0-cy-by;
    // Convert from input time to parametric value in curve, then from that to output time.
    return solve(t, solveEpsilon(duration));
  }
})(jQuery);