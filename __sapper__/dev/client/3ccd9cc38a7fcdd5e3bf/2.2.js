(window["webpackJsonp"] = window["webpackJsonp"] || []).push([[2],{

/***/ "./node_modules/impress.js/js/impress.js":
/*!***********************************************!*\
  !*** ./node_modules/impress.js/js/impress.js ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports) {

// This file was automatically generated from files in src/ directory.

/*! Licensed under MIT License - http://github.com/impress/impress.js */
/**
 * impress.js
 *
 * impress.js is a presentation tool based on the power of CSS3 transforms and transitions
 * in modern browsers and inspired by the idea behind prezi.com.
 *
 *
 * Copyright 2011-2012 Bartek Szopka (@bartaz), 2016-2020 Henrik Ingo (@henrikingo)
 *
 * Released under the MIT License.
 *
 * ------------------------------------------------
 *  author:  Bartek Szopka, Henrik Ingo
 *  version: 1.1.0
 *  url:     http://impress.js.org
 *  source:  http://github.com/impress/impress.js/
 */

// You are one of those who like to know how things work inside?
// Let me show you the cogs that make impress.js run...
( function( document, window ) {
    "use strict";
    var lib;

    // HELPER FUNCTIONS

    // `pfx` is a function that takes a standard CSS property name as a parameter
    // and returns it's prefixed version valid for current browser it runs in.
    // The code is heavily inspired by Modernizr http://www.modernizr.com/
    var pfx = ( function() {

        var style = document.createElement( "dummy" ).style,
            prefixes = "Webkit Moz O ms Khtml".split( " " ),
            memory = {};

        return function( prop ) {
            if ( typeof memory[ prop ] === "undefined" ) {

                var ucProp  = prop.charAt( 0 ).toUpperCase() + prop.substr( 1 ),
                    props   = ( prop + " " + prefixes.join( ucProp + " " ) + ucProp ).split( " " );

                memory[ prop ] = null;
                for ( var i in props ) {
                    if ( style[ props[ i ] ] !== undefined ) {
                        memory[ prop ] = props[ i ];
                        break;
                    }
                }

            }

            return memory[ prop ];
        };

    } )();

    var validateOrder = function( order, fallback ) {
        var validChars = "xyz";
        var returnStr = "";
        if ( typeof order === "string" ) {
            for ( var i in order.split( "" ) ) {
                if ( validChars.indexOf( order[ i ] ) >= 0 ) {
                    returnStr += order[ i ];

                    // Each of x,y,z can be used only once.
                    validChars = validChars.split( order[ i ] ).join( "" );
                }
            }
        }
        if ( returnStr ) {
            return returnStr;
        } else if ( fallback !== undefined ) {
            return fallback;
        } else {
            return "xyz";
        }
    };

    // `css` function applies the styles given in `props` object to the element
    // given as `el`. It runs all property names through `pfx` function to make
    // sure proper prefixed version of the property is used.
    var css = function( el, props ) {
        var key, pkey;
        for ( key in props ) {
            if ( props.hasOwnProperty( key ) ) {
                pkey = pfx( key );
                if ( pkey !== null ) {
                    el.style[ pkey ] = props[ key ];
                }
            }
        }
        return el;
    };

    // `translate` builds a translate transform string for given data.
    var translate = function( t ) {
        return " translate3d(" + t.x + "px," + t.y + "px," + t.z + "px) ";
    };

    // `rotate` builds a rotate transform string for given data.
    // By default the rotations are in X Y Z order that can be reverted by passing `true`
    // as second parameter.
    var rotate = function( r, revert ) {
        var order = r.order ? r.order : "xyz";
        var css = "";
        var axes = order.split( "" );
        if ( revert ) {
            axes = axes.reverse();
        }

        for ( var i = 0; i < axes.length; i++ ) {
            css += " rotate" + axes[ i ].toUpperCase() + "(" + r[ axes[ i ] ] + "deg)";
        }
        return css;
    };

    // `scale` builds a scale transform string for given data.
    var scale = function( s ) {
        return " scale(" + s + ") ";
    };

    // `computeWindowScale` counts the scale factor between window size and size
    // defined for the presentation in the config.
    var computeWindowScale = function( config ) {
        var hScale = window.innerHeight / config.height,
            wScale = window.innerWidth / config.width,
            scale = hScale > wScale ? wScale : hScale;

        if ( config.maxScale && scale > config.maxScale ) {
            scale = config.maxScale;
        }

        if ( config.minScale && scale < config.minScale ) {
            scale = config.minScale;
        }

        return scale;
    };

    // CHECK SUPPORT
    var body = document.body;
    var impressSupported =

                          // Browser should support CSS 3D transtorms
                           ( pfx( "perspective" ) !== null ) &&

                          // And `classList` and `dataset` APIs
                           ( body.classList ) &&
                           ( body.dataset );

    if ( !impressSupported ) {

        // We can't be sure that `classList` is supported
        body.className += " impress-not-supported ";
    }

    // GLOBALS AND DEFAULTS

    // This is where the root elements of all impress.js instances will be kept.
    // Yes, this means you can have more than one instance on a page, but I'm not
    // sure if it makes any sense in practice ;)
    var roots = {};

    var preInitPlugins = [];
    var preStepLeavePlugins = [];

    // Some default config values.
    var defaults = {
        width: 1024,
        height: 768,
        maxScale: 1,
        minScale: 0,

        perspective: 1000,

        transitionDuration: 1000
    };

    // It's just an empty function ... and a useless comment.
    var empty = function() { return false; };

    // IMPRESS.JS API

    // And that's where interesting things will start to happen.
    // It's the core `impress` function that returns the impress.js API
    // for a presentation based on the element with given id ("impress"
    // by default).
    var impress = window.impress = function( rootId ) {

        // If impress.js is not supported by the browser return a dummy API
        // it may not be a perfect solution but we return early and avoid
        // running code that may use features not implemented in the browser.
        if ( !impressSupported ) {
            return {
                init: empty,
                goto: empty,
                prev: empty,
                next: empty,
                swipe: empty,
                tear: empty,
                lib: {}
            };
        }

        rootId = rootId || "impress";

        // If given root is already initialized just return the API
        if ( roots[ "impress-root-" + rootId ] ) {
            return roots[ "impress-root-" + rootId ];
        }

        // The gc library depends on being initialized before we do any changes to DOM.
        lib = initLibraries( rootId );

        body.classList.remove( "impress-not-supported" );
        body.classList.add( "impress-supported" );

        // Data of all presentation steps
        var stepsData = {};

        // Element of currently active step
        var activeStep = null;

        // Current state (position, rotation and scale) of the presentation
        var currentState = null;

        // Array of step elements
        var steps = null;

        // Configuration options
        var config = null;

        // Scale factor of the browser window
        var windowScale = null;

        // Root presentation elements
        var root = lib.util.byId( rootId );
        var canvas = document.createElement( "div" );

        var initialized = false;

        // STEP EVENTS
        //
        // There are currently two step events triggered by impress.js
        // `impress:stepenter` is triggered when the step is shown on the
        // screen (the transition from the previous one is finished) and
        // `impress:stepleave` is triggered when the step is left (the
        // transition to next step just starts).

        // Reference to last entered step
        var lastEntered = null;

        // `onStepEnter` is called whenever the step element is entered
        // but the event is triggered only if the step is different than
        // last entered step.
        // We sometimes call `goto`, and therefore `onStepEnter`, just to redraw a step, such as
        // after screen resize. In this case - more precisely, in any case - we trigger a
        // `impress:steprefresh` event.
        var onStepEnter = function( step ) {
            if ( lastEntered !== step ) {
                lib.util.triggerEvent( step, "impress:stepenter" );
                lastEntered = step;
            }
            lib.util.triggerEvent( step, "impress:steprefresh" );
        };

        // `onStepLeave` is called whenever the currentStep element is left
        // but the event is triggered only if the currentStep is the same as
        // lastEntered step.
        var onStepLeave = function( currentStep, nextStep ) {
            if ( lastEntered === currentStep ) {
                lib.util.triggerEvent( currentStep, "impress:stepleave", { next: nextStep } );
                lastEntered = null;
            }
        };

        // `initStep` initializes given step element by reading data from its
        // data attributes and setting correct styles.
        var initStep = function( el, idx ) {
            var data = el.dataset,
                step = {
                    translate: {
                        x: lib.util.toNumber( data.x ),
                        y: lib.util.toNumber( data.y ),
                        z: lib.util.toNumber( data.z )
                    },
                    rotate: {
                        x: lib.util.toNumber( data.rotateX ),
                        y: lib.util.toNumber( data.rotateY ),
                        z: lib.util.toNumber( data.rotateZ || data.rotate ),
                        order: validateOrder( data.rotateOrder )
                    },
                    scale: lib.util.toNumber( data.scale, 1 ),
                    transitionDuration: lib.util.toNumber(
                        data.transitionDuration, config.transitionDuration
                    ),
                    el: el
                };

            if ( !el.id ) {
                el.id = "step-" + ( idx + 1 );
            }

            stepsData[ "impress-" + el.id ] = step;

            css( el, {
                position: "absolute",
                transform: "translate(-50%,-50%)" +
                           translate( step.translate ) +
                           rotate( step.rotate ) +
                           scale( step.scale ),
                transformStyle: "preserve-3d"
            } );
        };

        // Initialize all steps.
        // Read the data-* attributes, store in internal stepsData, and render with CSS.
        var initAllSteps = function() {
            steps = lib.util.$$( ".step", root );
            steps.forEach( initStep );
        };

        // `init` API function that initializes (and runs) the presentation.
        var init = function() {
            if ( initialized ) { return; }
            execPreInitPlugins( root );

            // First we set up the viewport for mobile devices.
            // For some reason iPad goes nuts when it is not done properly.
            var meta = lib.util.$( "meta[name='viewport']" ) || document.createElement( "meta" );
            meta.content = "width=device-width, minimum-scale=1, maximum-scale=1, user-scalable=no";
            if ( meta.parentNode !== document.head ) {
                meta.name = "viewport";
                document.head.appendChild( meta );
            }

            // Initialize configuration object
            var rootData = root.dataset;
            config = {
                width: lib.util.toNumber( rootData.width, defaults.width ),
                height: lib.util.toNumber( rootData.height, defaults.height ),
                maxScale: lib.util.toNumber( rootData.maxScale, defaults.maxScale ),
                minScale: lib.util.toNumber( rootData.minScale, defaults.minScale ),
                perspective: lib.util.toNumber( rootData.perspective, defaults.perspective ),
                transitionDuration: lib.util.toNumber(
                    rootData.transitionDuration, defaults.transitionDuration
                )
            };

            windowScale = computeWindowScale( config );

            // Wrap steps with "canvas" element
            lib.util.arrayify( root.childNodes ).forEach( function( el ) {
                canvas.appendChild( el );
            } );
            root.appendChild( canvas );

            // Set initial styles
            document.documentElement.style.height = "100%";

            css( body, {
                height: "100%",
                overflow: "hidden"
            } );

            var rootStyles = {
                position: "absolute",
                transformOrigin: "top left",
                transition: "all 0s ease-in-out",
                transformStyle: "preserve-3d"
            };

            css( root, rootStyles );
            css( root, {
                top: "50%",
                left: "50%",
                perspective: ( config.perspective / windowScale ) + "px",
                transform: scale( windowScale )
            } );
            css( canvas, rootStyles );

            body.classList.remove( "impress-disabled" );
            body.classList.add( "impress-enabled" );

            // Get and init steps
            initAllSteps();

            // Set a default initial state of the canvas
            currentState = {
                translate: { x: 0, y: 0, z: 0 },
                rotate:    { x: 0, y: 0, z: 0, order: "xyz" },
                scale:     1
            };

            initialized = true;

            lib.util.triggerEvent( root, "impress:init",
                                   { api: roots[ "impress-root-" + rootId ] } );
        };

        // `getStep` is a helper function that returns a step element defined by parameter.
        // If a number is given, step with index given by the number is returned, if a string
        // is given step element with such id is returned, if DOM element is given it is returned
        // if it is a correct step element.
        var getStep = function( step ) {
            if ( typeof step === "number" ) {
                step = step < 0 ? steps[ steps.length + step ] : steps[ step ];
            } else if ( typeof step === "string" ) {
                step = lib.util.byId( step );
            }
            return ( step && step.id && stepsData[ "impress-" + step.id ] ) ? step : null;
        };

        // Used to reset timeout for `impress:stepenter` event
        var stepEnterTimeout = null;

        // `goto` API function that moves to step given as `el` parameter (by index, id or element).
        // `duration` optionally given as second parameter, is the transition duration in css.
        // `reason` is the string "next", "prev" or "goto" (default) and will be made available to
        // preStepLeave plugins.
        // `origEvent` may contain event that caused the call to goto, such as a key press event
        var goto = function( el, duration, reason, origEvent ) {
            reason = reason || "goto";
            origEvent = origEvent || null;

            if ( !initialized ) {
                return false;
            }

            // Re-execute initAllSteps for each transition. This allows to edit step attributes
            // dynamically, such as change their coordinates, or even remove or add steps, and have
            // that change apply when goto() is called.
            initAllSteps();

            if ( !( el = getStep( el ) ) ) {
                return false;
            }

            // Sometimes it's possible to trigger focus on first link with some keyboard action.
            // Browser in such a case tries to scroll the page to make this element visible
            // (even that body overflow is set to hidden) and it breaks our careful positioning.
            //
            // So, as a lousy (and lazy) workaround we will make the page scroll back to the top
            // whenever slide is selected
            //
            // If you are reading this and know any better way to handle it, I'll be glad to hear
            // about it!
            window.scrollTo( 0, 0 );

            var step = stepsData[ "impress-" + el.id ];
            duration = ( duration !== undefined ? duration : step.transitionDuration );

            // If we are in fact moving to another step, start with executing the registered
            // preStepLeave plugins.
            if ( activeStep && activeStep !== el ) {
                var event = { target: activeStep, detail: {} };
                event.detail.next = el;
                event.detail.transitionDuration = duration;
                event.detail.reason = reason;
                if ( origEvent ) {
                    event.origEvent = origEvent;
                }

                if ( execPreStepLeavePlugins( event ) === false ) {

                    // PreStepLeave plugins are allowed to abort the transition altogether, by
                    // returning false.
                    // see stop and substep plugins for an example of doing just that
                    return false;
                }

                // Plugins are allowed to change the detail values
                el = event.detail.next;
                step = stepsData[ "impress-" + el.id ];
                duration = event.detail.transitionDuration;
            }

            if ( activeStep ) {
                activeStep.classList.remove( "active" );
                body.classList.remove( "impress-on-" + activeStep.id );
            }
            el.classList.add( "active" );

            body.classList.add( "impress-on-" + el.id );

            // Compute target state of the canvas based on given step
            var target = {
                rotate: {
                    x: -step.rotate.x,
                    y: -step.rotate.y,
                    z: -step.rotate.z,
                    order: step.rotate.order
                },
                translate: {
                    x: -step.translate.x,
                    y: -step.translate.y,
                    z: -step.translate.z
                },
                scale: 1 / step.scale
            };

            // Check if the transition is zooming in or not.
            //
            // This information is used to alter the transition style:
            // when we are zooming in - we start with move and rotate transition
            // and the scaling is delayed, but when we are zooming out we start
            // with scaling down and move and rotation are delayed.
            var zoomin = target.scale >= currentState.scale;

            duration = lib.util.toNumber( duration, config.transitionDuration );
            var delay = ( duration / 2 );

            // If the same step is re-selected, force computing window scaling,
            // because it is likely to be caused by window resize
            if ( el === activeStep ) {
                windowScale = computeWindowScale( config );
            }

            var targetScale = target.scale * windowScale;

            // Trigger leave of currently active element (if it's not the same step again)
            if ( activeStep && activeStep !== el ) {
                onStepLeave( activeStep, el );
            }

            // Now we alter transforms of `root` and `canvas` to trigger transitions.
            //
            // And here is why there are two elements: `root` and `canvas` - they are
            // being animated separately:
            // `root` is used for scaling and `canvas` for translate and rotations.
            // Transitions on them are triggered with different delays (to make
            // visually nice and "natural" looking transitions), so we need to know
            // that both of them are finished.
            css( root, {

                // To keep the perspective look similar for different scales
                // we need to "scale" the perspective, too
                // For IE 11 support we must specify perspective independent
                // of transform.
                perspective: ( config.perspective / targetScale ) + "px",
                transform: scale( targetScale ),
                transitionDuration: duration + "ms",
                transitionDelay: ( zoomin ? delay : 0 ) + "ms"
            } );

            css( canvas, {
                transform: rotate( target.rotate, true ) + translate( target.translate ),
                transitionDuration: duration + "ms",
                transitionDelay: ( zoomin ? 0 : delay ) + "ms"
            } );

            // Here is a tricky part...
            //
            // If there is no change in scale or no change in rotation and translation, it means
            // there was actually no delay - because there was no transition on `root` or `canvas`
            // elements. We want to trigger `impress:stepenter` event in the correct moment, so
            // here we compare the current and target values to check if delay should be taken into
            // account.
            //
            // I know that this `if` statement looks scary, but it's pretty simple when you know
            // what is going on - it's simply comparing all the values.
            if ( currentState.scale === target.scale ||
                ( currentState.rotate.x === target.rotate.x &&
                  currentState.rotate.y === target.rotate.y &&
                  currentState.rotate.z === target.rotate.z &&
                  currentState.translate.x === target.translate.x &&
                  currentState.translate.y === target.translate.y &&
                  currentState.translate.z === target.translate.z ) ) {
                delay = 0;
            }

            // Store current state
            currentState = target;
            activeStep = el;

            // And here is where we trigger `impress:stepenter` event.
            // We simply set up a timeout to fire it taking transition duration (and possible delay)
            // into account.
            //
            // I really wanted to make it in more elegant way. The `transitionend` event seemed to
            // be the best way to do it, but the fact that I'm using transitions on two separate
            // elements and that the `transitionend` event is only triggered when there was a
            // transition (change in the values) caused some bugs and made the code really
            // complicated, cause I had to handle all the conditions separately. And it still
            // needed a `setTimeout` fallback for the situations when there is no transition at all.
            // So I decided that I'd rather make the code simpler than use shiny new
            // `transitionend`.
            //
            // If you want learn something interesting and see how it was done with `transitionend`
            // go back to version 0.5.2 of impress.js:
            // http://github.com/bartaz/impress.js/blob/0.5.2/js/impress.js
            window.clearTimeout( stepEnterTimeout );
            stepEnterTimeout = window.setTimeout( function() {
                onStepEnter( activeStep );
            }, duration + delay );

            return el;
        };

        // `prev` API function goes to previous step (in document order)
        // `event` is optional, may contain the event that caused the need to call prev()
        var prev = function( origEvent ) {
            var prev = steps.indexOf( activeStep ) - 1;
            prev = prev >= 0 ? steps[ prev ] : steps[ steps.length - 1 ];

            return goto( prev, undefined, "prev", origEvent );
        };

        // `next` API function goes to next step (in document order)
        // `event` is optional, may contain the event that caused the need to call next()
        var next = function( origEvent ) {
            var next = steps.indexOf( activeStep ) + 1;
            next = next < steps.length ? steps[ next ] : steps[ 0 ];

            return goto( next, undefined, "next", origEvent );
        };

        // Swipe for touch devices by @and3rson.
        // Below we extend the api to control the animation between the currently
        // active step and a presumed next/prev step. See touch plugin for
        // an example of using this api.

        // Helper function
        var interpolate = function( a, b, k ) {
            return a + ( b - a ) * k;
        };

        // Animate a swipe.
        //
        // Pct is a value between -1.0 and +1.0, designating the current length
        // of the swipe.
        //
        // If pct is negative, swipe towards the next() step, if positive,
        // towards the prev() step.
        //
        // Note that pre-stepleave plugins such as goto can mess with what is a
        // next() and prev() step, so we need to trigger the pre-stepleave event
        // here, even if a swipe doesn't guarantee that the transition will
        // actually happen.
        //
        // Calling swipe(), with any value of pct, won't in itself cause a
        // transition to happen, this is just to animate the swipe. Once the
        // transition is committed - such as at a touchend event - caller is
        // responsible for also calling prev()/next() as appropriate.
        //
        // Note: For now, this function is made available to be used by the swipe plugin (which
        // is the UI counterpart to this). It is a semi-internal API and intentionally not
        // documented in DOCUMENTATION.md.
        var swipe = function( pct ) {
            if ( Math.abs( pct ) > 1 ) {
                return;
            }

            // Prepare & execute the preStepLeave event
            var event = { target: activeStep, detail: {} };
            event.detail.swipe = pct;

            // Will be ignored within swipe animation, but just in case a plugin wants to read this,
            // humor them
            event.detail.transitionDuration = config.transitionDuration;
            var idx; // Needed by jshint
            if ( pct < 0 ) {
                idx = steps.indexOf( activeStep ) + 1;
                event.detail.next = idx < steps.length ? steps[ idx ] : steps[ 0 ];
                event.detail.reason = "next";
            } else if ( pct > 0 ) {
                idx = steps.indexOf( activeStep ) - 1;
                event.detail.next = idx >= 0 ? steps[ idx ] : steps[ steps.length - 1 ];
                event.detail.reason = "prev";
            } else {

                // No move
                return;
            }
            if ( execPreStepLeavePlugins( event ) === false ) {

                // If a preStepLeave plugin wants to abort the transition, don't animate a swipe
                // For stop, this is probably ok. For substep, the plugin it self might want to do
                // some animation, but that's not the current implementation.
                return false;
            }
            var nextElement = event.detail.next;

            var nextStep = stepsData[ "impress-" + nextElement.id ];

            // If the same step is re-selected, force computing window scaling,
            var nextScale = nextStep.scale * windowScale;
            var k = Math.abs( pct );

            var interpolatedStep = {
                translate: {
                    x: interpolate( currentState.translate.x, -nextStep.translate.x, k ),
                    y: interpolate( currentState.translate.y, -nextStep.translate.y, k ),
                    z: interpolate( currentState.translate.z, -nextStep.translate.z, k )
                },
                rotate: {
                    x: interpolate( currentState.rotate.x, -nextStep.rotate.x, k ),
                    y: interpolate( currentState.rotate.y, -nextStep.rotate.y, k ),
                    z: interpolate( currentState.rotate.z, -nextStep.rotate.z, k ),

                    // Unfortunately there's a discontinuity if rotation order changes. Nothing I
                    // can do about it?
                    order: k < 0.7 ? currentState.rotate.order : nextStep.rotate.order
                },
                scale: interpolate( currentState.scale * windowScale, nextScale, k )
            };

            css( root, {

                // To keep the perspective look similar for different scales
                // we need to 'scale' the perspective, too
                perspective: config.perspective / interpolatedStep.scale + "px",
                transform: scale( interpolatedStep.scale ),
                transitionDuration: "0ms",
                transitionDelay: "0ms"
            } );

            css( canvas, {
                transform: rotate( interpolatedStep.rotate, true ) +
                           translate( interpolatedStep.translate ),
                transitionDuration: "0ms",
                transitionDelay: "0ms"
            } );
        };

        // Teardown impress
        // Resets the DOM to the state it was before impress().init() was called.
        // (If you called impress(rootId).init() for multiple different rootId's, then you must
        // also call tear() once for each of them.)
        var tear = function() {
            lib.gc.teardown();
            delete roots[ "impress-root-" + rootId ];
        };

        // Adding some useful classes to step elements.
        //
        // All the steps that have not been shown yet are given `future` class.
        // When the step is entered the `future` class is removed and the `present`
        // class is given. When the step is left `present` class is replaced with
        // `past` class.
        //
        // So every step element is always in one of three possible states:
        // `future`, `present` and `past`.
        //
        // There classes can be used in CSS to style different types of steps.
        // For example the `present` class can be used to trigger some custom
        // animations when step is shown.
        lib.gc.addEventListener( root, "impress:init", function() {

            // STEP CLASSES
            steps.forEach( function( step ) {
                step.classList.add( "future" );
            } );

            lib.gc.addEventListener( root, "impress:stepenter", function( event ) {
                event.target.classList.remove( "past" );
                event.target.classList.remove( "future" );
                event.target.classList.add( "present" );
            }, false );

            lib.gc.addEventListener( root, "impress:stepleave", function( event ) {
                event.target.classList.remove( "present" );
                event.target.classList.add( "past" );
            }, false );

        }, false );

        // Adding hash change support.
        lib.gc.addEventListener( root, "impress:init", function() {

            // Last hash detected
            var lastHash = "";

            // `#/step-id` is used instead of `#step-id` to prevent default browser
            // scrolling to element in hash.
            //
            // And it has to be set after animation finishes, because in Chrome it
            // makes transtion laggy.
            // BUG: http://code.google.com/p/chromium/issues/detail?id=62820
            lib.gc.addEventListener( root, "impress:stepenter", function( event ) {
                window.location.hash = lastHash = "#/" + event.target.id;
            }, false );

            lib.gc.addEventListener( window, "hashchange", function() {

                // When the step is entered hash in the location is updated
                // (just few lines above from here), so the hash change is
                // triggered and we would call `goto` again on the same element.
                //
                // To avoid this we store last entered hash and compare.
                if ( window.location.hash !== lastHash ) {
                    goto( lib.util.getElementFromHash() );
                }
            }, false );

            // START
            // by selecting step defined in url or first step of the presentation
            goto( lib.util.getElementFromHash() || steps[ 0 ], 0 );
        }, false );

        body.classList.add( "impress-disabled" );

        // Store and return API for given impress.js root element
        return ( roots[ "impress-root-" + rootId ] = {
            init: init,
            goto: goto,
            next: next,
            prev: prev,
            swipe: swipe,
            tear: tear,
            lib: lib
        } );

    };

    // Flag that can be used in JS to check if browser have passed the support test
    impress.supported = impressSupported;

    // ADD and INIT LIBRARIES
    // Library factories are defined in src/lib/*.js, and register themselves by calling
    // impress.addLibraryFactory(libraryFactoryObject). They're stored here, and used to augment
    // the API with library functions when client calls impress(rootId).
    // See src/lib/README.md for clearer example.
    // (Advanced usage: For different values of rootId, a different instance of the libaries are
    // generated, in case they need to hold different state for different root elements.)
    var libraryFactories = {};
    impress.addLibraryFactory = function( obj ) {
        for ( var libname in obj ) {
            if ( obj.hasOwnProperty( libname ) ) {
                libraryFactories[ libname ] = obj[ libname ];
            }
        }
    };

    // Call each library factory, and return the lib object that is added to the api.
    var initLibraries = function( rootId ) { //jshint ignore:line
        var lib = {};
        for ( var libname in libraryFactories ) {
            if ( libraryFactories.hasOwnProperty( libname ) ) {
                if ( lib[ libname ] !== undefined ) {
                    throw "impress.js ERROR: Two libraries both tried to use libname: " +  libname;
                }
                lib[ libname ] = libraryFactories[ libname ]( rootId );
            }
        }
        return lib;
    };

    // `addPreInitPlugin` allows plugins to register a function that should
    // be run (synchronously) at the beginning of init, before
    // impress().init() itself executes.
    impress.addPreInitPlugin = function( plugin, weight ) {
        weight = parseInt( weight ) || 10;
        if ( weight <= 0 ) {
            throw "addPreInitPlugin: weight must be a positive integer";
        }

        if ( preInitPlugins[ weight ] === undefined ) {
            preInitPlugins[ weight ] = [];
        }
        preInitPlugins[ weight ].push( plugin );
    };

    // Called at beginning of init, to execute all pre-init plugins.
    var execPreInitPlugins = function( root ) { //jshint ignore:line
        for ( var i = 0; i < preInitPlugins.length; i++ ) {
            var thisLevel = preInitPlugins[ i ];
            if ( thisLevel !== undefined ) {
                for ( var j = 0; j < thisLevel.length; j++ ) {
                    thisLevel[ j ]( root );
                }
            }
        }
    };

    // `addPreStepLeavePlugin` allows plugins to register a function that should
    // be run (synchronously) at the beginning of goto()
    impress.addPreStepLeavePlugin = function( plugin, weight ) { //jshint ignore:line
        weight = parseInt( weight ) || 10;
        if ( weight <= 0 ) {
            throw "addPreStepLeavePlugin: weight must be a positive integer";
        }

        if ( preStepLeavePlugins[ weight ] === undefined ) {
            preStepLeavePlugins[ weight ] = [];
        }
        preStepLeavePlugins[ weight ].push( plugin );
    };

    // Called at beginning of goto(), to execute all preStepLeave plugins.
    var execPreStepLeavePlugins = function( event ) { //jshint ignore:line
        for ( var i = 0; i < preStepLeavePlugins.length; i++ ) {
            var thisLevel = preStepLeavePlugins[ i ];
            if ( thisLevel !== undefined ) {
                for ( var j = 0; j < thisLevel.length; j++ ) {
                    if ( thisLevel[ j ]( event ) === false ) {

                        // If a plugin returns false, the stepleave event (and related transition)
                        // is aborted
                        return false;
                    }
                }
            }
        }
    };

} )( document, window );

// THAT'S ALL FOLKS!
//
// Thanks for reading it all.
// Or thanks for scrolling down and reading the last part.
//
// I've learnt a lot when building impress.js and I hope this code and comments
// will help somebody learn at least some part of it.

/**
 * Garbage collection utility
 *
 * This library allows plugins to add elements and event listeners they add to the DOM. The user
 * can call `impress().lib.gc.teardown()` to cause all of them to be removed from DOM, so that
 * the document is in the state it was before calling `impress().init()`.
 *
 * In addition to just adding elements and event listeners to the garbage collector, plugins
 * can also register callback functions to do arbitrary cleanup upon teardown.
 *
 * Henrik Ingo (c) 2016
 * MIT License
 */

( function( document, window ) {
    "use strict";
    var roots = [];
    var rootsCount = 0;
    var startingState = { roots: [] };

    var libraryFactory = function( rootId ) {
        if ( roots[ rootId ] ) {
            return roots[ rootId ];
        }

        // Per root global variables (instance variables?)
        var elementList = [];
        var eventListenerList = [];
        var callbackList = [];

        recordStartingState( rootId );

        // LIBRARY FUNCTIONS
        // Definitions of the library functions we return as an object at the end

        // `pushElement` adds a DOM element to the gc stack
        var pushElement = function( element ) {
            elementList.push( element );
        };

        // `appendChild` is a convenience wrapper that combines DOM appendChild with gc.pushElement
        var appendChild = function( parent, element ) {
            parent.appendChild( element );
            pushElement( element );
        };

        // `pushEventListener` adds an event listener to the gc stack
        var pushEventListener = function( target, type, listenerFunction ) {
            eventListenerList.push( { target:target, type:type, listener:listenerFunction } );
        };

        // `addEventListener` combines DOM addEventListener with gc.pushEventListener
        var addEventListener = function( target, type, listenerFunction ) {
            target.addEventListener( type, listenerFunction );
            pushEventListener( target, type, listenerFunction );
        };

        // `pushCallback` If the above utilities are not enough, plugins can add their own callback
        // function to do arbitrary things.
        var pushCallback = function( callback ) {
            callbackList.push( callback );
        };
        pushCallback( function( rootId ) { resetStartingState( rootId ); } );

        // `teardown` will
        // - execute all callbacks in LIFO order
        // - call `removeChild` on all DOM elements in LIFO order
        // - call `removeEventListener` on all event listeners in LIFO order
        // The goal of a teardown is to return to the same state that the DOM was before
        // `impress().init()` was called.
        var teardown = function() {

            // Execute the callbacks in LIFO order
            var i; // Needed by jshint
            for ( i = callbackList.length - 1; i >= 0; i-- ) {
                callbackList[ i ]( rootId );
            }
            callbackList = [];
            for ( i = 0; i < elementList.length; i++ ) {
                elementList[ i ].parentElement.removeChild( elementList[ i ] );
            }
            elementList = [];
            for ( i = 0; i < eventListenerList.length; i++ ) {
                var target   = eventListenerList[ i ].target;
                var type     = eventListenerList[ i ].type;
                var listener = eventListenerList[ i ].listener;
                target.removeEventListener( type, listener );
            }
        };

        var lib = {
            pushElement: pushElement,
            appendChild: appendChild,
            pushEventListener: pushEventListener,
            addEventListener: addEventListener,
            pushCallback: pushCallback,
            teardown: teardown
        };
        roots[ rootId ] = lib;
        rootsCount++;
        return lib;
    };

    // Let impress core know about the existence of this library
    window.impress.addLibraryFactory( { gc: libraryFactory } );

    // CORE INIT
    // The library factory (gc(rootId)) is called at the beginning of impress(rootId).init()
    // For the purposes of teardown(), we can use this as an opportunity to save the state
    // of a few things in the DOM in their virgin state, before impress().init() did anything.
    // Note: These could also be recorded by the code in impress.js core as these values
    // are changed, but in an effort to not deviate too much from upstream, I'm adding
    // them here rather than the core itself.
    var recordStartingState = function( rootId ) {
        startingState.roots[ rootId ] = {};
        startingState.roots[ rootId ].steps = [];

        // Record whether the steps have an id or not
        var steps = document.getElementById( rootId ).querySelectorAll( ".step" );
        for ( var i = 0; i < steps.length; i++ ) {
            var el = steps[ i ];
            startingState.roots[ rootId ].steps.push( {
                el: el,
                id: el.getAttribute( "id" )
            } );
        }

        // In the rare case of multiple roots, the following is changed on first init() and
        // reset at last tear().
        if ( rootsCount === 0 ) {
            startingState.body = {};

            // It is customary for authors to set body.class="impress-not-supported" as a starting
            // value, which can then be removed by impress().init(). But it is not required.
            // Remember whether it was there or not.
            if ( document.body.classList.contains( "impress-not-supported" ) ) {
                startingState.body.impressNotSupported = true;
            } else {
                startingState.body.impressNotSupported = false;
            }

            // If there's a <meta name="viewport"> element, its contents will be overwritten by init
            var metas = document.head.querySelectorAll( "meta" );
            for ( i = 0; i < metas.length; i++ ) {
                var m = metas[ i ];
                if ( m.name === "viewport" ) {
                    startingState.meta = m.content;
                }
            }
        }
    };

    // CORE TEARDOWN
    var resetStartingState = function( rootId ) {

        // Reset body element
        document.body.classList.remove( "impress-enabled" );
        document.body.classList.remove( "impress-disabled" );

        var root = document.getElementById( rootId );
        var activeId = root.querySelector( ".active" ).id;
        document.body.classList.remove( "impress-on-" + activeId );

        document.documentElement.style.height = "";
        document.body.style.height = "";
        document.body.style.overflow = "";

        // Remove style values from the root and step elements
        // Note: We remove the ones set by impress.js core. Otoh, we didn't preserve any original
        // values. A more sophisticated implementation could keep track of original values and then
        // reset those.
        var steps = root.querySelectorAll( ".step" );
        for ( var i = 0; i < steps.length; i++ ) {
            steps[ i ].classList.remove( "future" );
            steps[ i ].classList.remove( "past" );
            steps[ i ].classList.remove( "present" );
            steps[ i ].classList.remove( "active" );
            steps[ i ].style.position = "";
            steps[ i ].style.transform = "";
            steps[ i ].style[ "transform-style" ] = "";
        }
        root.style.position = "";
        root.style[ "transform-origin" ] = "";
        root.style.transition = "";
        root.style[ "transform-style" ] = "";
        root.style.top = "";
        root.style.left = "";
        root.style.transform = "";

        // Reset id of steps ("step-1" id's are auto generated)
        steps = startingState.roots[ rootId ].steps;
        var step;
        while ( step = steps.pop() ) {
            if ( step.id === null ) {
                step.el.removeAttribute( "id" );
            } else {
                step.el.setAttribute( "id", step.id );
            }
        }
        delete startingState.roots[ rootId ];

        // Move step div elements away from canvas, then delete canvas
        // Note: There's an implicit assumption here that the canvas div is the only child element
        // of the root div. If there would be something else, it's gonna be lost.
        var canvas = root.firstChild;
        var canvasHTML = canvas.innerHTML;
        root.innerHTML = canvasHTML;

        if ( roots[ rootId ] !== undefined ) {
            delete roots[ rootId ];
            rootsCount--;
        }
        if ( rootsCount === 0 ) {

            // In the rare case that more than one impress root elements were initialized, these
            // are only reset when all are uninitialized.
            document.body.classList.remove( "impress-supported" );
            if ( startingState.body.impressNotSupported ) {
                document.body.classList.add( "impress-not-supported" );
            }

            // We need to remove or reset the meta element inserted by impress.js
            var metas = document.head.querySelectorAll( "meta" );
            for ( i = 0; i < metas.length; i++ ) {
                var m = metas[ i ];
                if ( m.name === "viewport" ) {
                    if ( startingState.meta !== undefined ) {
                        m.content = startingState.meta;
                    } else {
                        m.parentElement.removeChild( m );
                    }
                }
            }
        }

    };

} )( document, window );

/**
 * Common utility functions
 *
 * Copyright 2011-2012 Bartek Szopka (@bartaz)
 * Henrik Ingo (c) 2016
 * MIT License
 */

( function( document, window ) {
    "use strict";
    var roots = [];

    var libraryFactory = function( rootId ) {
        if ( roots[ rootId ] ) {
            return roots[ rootId ];
        }

        // `$` returns first element for given CSS `selector` in the `context` of
        // the given element or whole document.
        var $ = function( selector, context ) {
            context = context || document;
            return context.querySelector( selector );
        };

        // `$$` return an array of elements for given CSS `selector` in the `context` of
        // the given element or whole document.
        var $$ = function( selector, context ) {
            context = context || document;
            return arrayify( context.querySelectorAll( selector ) );
        };

        // `arrayify` takes an array-like object and turns it into real Array
        // to make all the Array.prototype goodness available.
        var arrayify = function( a ) {
            return [].slice.call( a );
        };

        // `byId` returns element with given `id` - you probably have guessed that ;)
        var byId = function( id ) {
            return document.getElementById( id );
        };

        // `getElementFromHash` returns an element located by id from hash part of
        // window location.
        var getElementFromHash = function() {

            // Get id from url # by removing `#` or `#/` from the beginning,
            // so both "fallback" `#slide-id` and "enhanced" `#/slide-id` will work
            return byId( window.location.hash.replace( /^#\/?/, "" ) );
        };

        // `getUrlParamValue` return a given URL parameter value if it exists
        // `undefined` if it doesn't exist
        var getUrlParamValue = function( parameter ) {
            var chunk = window.location.search.split( parameter + "=" )[ 1 ];
            var value = chunk && chunk.split( "&" )[ 0 ];

            if ( value !== "" ) {
                return value;
            }
        };

        // Throttling function calls, by Remy Sharp
        // http://remysharp.com/2010/07/21/throttling-function-calls/
        var throttle = function( fn, delay ) {
            var timer = null;
            return function() {
                var context = this, args = arguments;
                window.clearTimeout( timer );
                timer = window.setTimeout( function() {
                    fn.apply( context, args );
                }, delay );
            };
        };

        // `toNumber` takes a value given as `numeric` parameter and tries to turn
        // it into a number. If it is not possible it returns 0 (or other value
        // given as `fallback`).
        var toNumber = function( numeric, fallback ) {
            return isNaN( numeric ) ? ( fallback || 0 ) : Number( numeric );
        };

        // `triggerEvent` builds a custom DOM event with given `eventName` and `detail` data
        // and triggers it on element given as `el`.
        var triggerEvent = function( el, eventName, detail ) {
            var event = document.createEvent( "CustomEvent" );
            event.initCustomEvent( eventName, true, true, detail );
            el.dispatchEvent( event );
        };

        var lib = {
            $: $,
            $$: $$,
            arrayify: arrayify,
            byId: byId,
            getElementFromHash: getElementFromHash,
            throttle: throttle,
            toNumber: toNumber,
            triggerEvent: triggerEvent,
            getUrlParamValue: getUrlParamValue
        };
        roots[ rootId ] = lib;
        return lib;
    };

    // Let impress core know about the existence of this library
    window.impress.addLibraryFactory( { util: libraryFactory } );

} )( document, window );

/**
 * Autoplay plugin - Automatically advance slideshow after N seconds
 *
 * Copyright 2016 Henrik Ingo, henrik.ingo@avoinelama.fi
 * Released under the MIT license.
 */
/* global clearTimeout, setTimeout, document */

( function( document ) {
    "use strict";

    var autoplayDefault = 0;
    var currentStepTimeout = 0;
    var api = null;
    var timeoutHandle = null;
    var root = null;
    var util;

    // On impress:init, check whether there is a default setting, as well as
    // handle step-1.
    document.addEventListener( "impress:init", function( event ) {
        util = event.detail.api.lib.util;

        // Getting API from event data instead of global impress().init().
        // You don't even need to know what is the id of the root element
        // or anything. `impress:init` event data gives you everything you
        // need to control the presentation that was just initialized.
        api = event.detail.api;
        root = event.target;

        // Element attributes starting with "data-", become available under
        // element.dataset. In addition hyphenized words become camelCased.
        var data = root.dataset;
        var autoplay = util.getUrlParamValue( "impress-autoplay" ) || data.autoplay;

        if ( autoplay ) {
            autoplayDefault = util.toNumber( autoplay, 0 );
        }

        var toolbar = document.querySelector( "#impress-toolbar" );
        if ( toolbar ) {
            addToolbarButton( toolbar );
        }

        api.lib.gc.pushCallback( function() {
            clearTimeout( timeoutHandle );
        } );

        // Note that right after impress:init event, also impress:stepenter is
        // triggered for the first slide, so that's where code flow continues.
    }, false );

    document.addEventListener( "impress:autoplay:pause", function( event ) {
        status = "paused";
        reloadTimeout( event );
    }, false );

    document.addEventListener( "impress:autoplay:play", function( event ) {
        status = "playing";
        reloadTimeout( event );
    }, false );

    // If default autoplay time was defined in the presentation root, or
    // in this step, set timeout.
    var reloadTimeout = function( event ) {
        var step = event.target;
        currentStepTimeout = util.toNumber( step.dataset.autoplay, autoplayDefault );
        if ( status === "paused" ) {
            setAutoplayTimeout( 0 );
        } else {
            setAutoplayTimeout( currentStepTimeout );
        }
    };

    document.addEventListener( "impress:stepenter", function( event ) {
        reloadTimeout( event );
    }, false );

    document.addEventListener( "impress:substep:enter", function( event ) {
        reloadTimeout( event );
    }, false );

    /**
     * Set timeout after which we move to next() step.
     */
    var setAutoplayTimeout = function( timeout ) {
        if ( timeoutHandle ) {
            clearTimeout( timeoutHandle );
        }

        if ( timeout > 0 ) {
            timeoutHandle = setTimeout( function() { api.next(); }, timeout * 1000 );
        }
        setButtonText();
    };

    /*** Toolbar plugin integration *******************************************/
    var status = "not clicked";
    var toolbarButton = null;

    var makeDomElement = function( html ) {
        var tempDiv = document.createElement( "div" );
        tempDiv.innerHTML = html;
        return tempDiv.firstChild;
    };

    var toggleStatus = function() {
        if ( currentStepTimeout > 0 && status !== "paused" ) {
            status = "paused";
        } else {
            status = "playing";
        }
    };

    var getButtonText = function() {
        if ( currentStepTimeout > 0 && status !== "paused" ) {
            return "||"; // Pause
        } else {
            return "&#9654;"; // Play
        }
    };

    var setButtonText = function() {
        if ( toolbarButton ) {

            // Keep button size the same even if label content is changing
            var buttonWidth = toolbarButton.offsetWidth;
            var buttonHeight = toolbarButton.offsetHeight;
            toolbarButton.innerHTML = getButtonText();
            if ( !toolbarButton.style.width ) {
                toolbarButton.style.width = buttonWidth + "px";
            }
            if ( !toolbarButton.style.height ) {
                toolbarButton.style.height = buttonHeight + "px";
            }
        }
    };

    var addToolbarButton = function( toolbar ) {
        var html = '<button id="impress-autoplay-playpause" ' + // jshint ignore:line
                   'title="Autoplay" class="impress-autoplay">' + // jshint ignore:line
                   getButtonText() + "</button>"; // jshint ignore:line
        toolbarButton = makeDomElement( html );
        toolbarButton.addEventListener( "click", function() {
            toggleStatus();
            if ( status === "playing" ) {
                if ( autoplayDefault === 0 ) {
                    autoplayDefault = 7;
                }
                if ( currentStepTimeout === 0 ) {
                    currentStepTimeout = autoplayDefault;
                }
                setAutoplayTimeout( currentStepTimeout );
            } else if ( status === "paused" ) {
                setAutoplayTimeout( 0 );
            }
        } );

        util.triggerEvent( toolbar, "impress:toolbar:appendChild",
                      { group: 10, element: toolbarButton } );
    };

} )( document );

/**
 * Blackout plugin
 *
 * Press b or . to hide all slides, and b or . again to show them.
 * Also navigating to a different slide will show them again (impress:stepleave).
 *
 * Copyright 2014 @Strikeskids
 * Released under the MIT license.
 */
/* global document */

( function( document ) {
    "use strict";

    var canvas = null;
    var blackedOut = false;
    var util = null;
    var root = null;
    var api = null;

    // While waiting for a shared library of utilities, copying these 2 from main impress.js
    var css = function( el, props ) {
        var key, pkey;
        for ( key in props ) {
            if ( props.hasOwnProperty( key ) ) {
                pkey = pfx( key );
                if ( pkey !== null ) {
                    el.style[ pkey ] = props[ key ];
                }
            }
        }
        return el;
    };

    var pfx = ( function() {

        var style = document.createElement( "dummy" ).style,
            prefixes = "Webkit Moz O ms Khtml".split( " " ),
            memory = {};

        return function( prop ) {
            if ( typeof memory[ prop ] === "undefined" ) {

                var ucProp  = prop.charAt( 0 ).toUpperCase() + prop.substr( 1 ),
                    props   = ( prop + " " + prefixes.join( ucProp + " " ) + ucProp ).split( " " );

                memory[ prop ] = null;
                for ( var i in props ) {
                    if ( style[ props[ i ] ] !== undefined ) {
                        memory[ prop ] = props[ i ];
                        break;
                    }
                }

            }

            return memory[ prop ];
        };

    } )();

    var removeBlackout = function() {
        if ( blackedOut ) {
            css( canvas, {
                display: "block"
            } );
            blackedOut = false;
            util.triggerEvent( root, "impress:autoplay:play", {} );
        }
    };

    var blackout = function() {
        if ( blackedOut ) {
            removeBlackout();
        } else {
            css( canvas, {
                display: ( blackedOut = !blackedOut ) ? "none" : "block"
            } );
            blackedOut = true;
            util.triggerEvent( root, "impress:autoplay:pause", {} );
        }
    };

    // Wait for impress.js to be initialized
    document.addEventListener( "impress:init", function( event ) {
        api = event.detail.api;
        util = api.lib.util;
        root = event.target;
        canvas = root.firstElementChild;
        var gc = api.lib.gc;
        var util = api.lib.util;

        gc.addEventListener( document, "keydown", function( event ) {

            // Accept b or . -> . is sent by presentation remote controllers
            if ( event.keyCode === 66 || event.keyCode === 190 ) {
                event.preventDefault();
                if ( !blackedOut ) {
                    blackout();
                } else {
                    removeBlackout();
                }
            }
        }, false );

        gc.addEventListener( document, "keyup", function( event ) {

            // Accept b or . -> . is sent by presentation remote controllers
            if ( event.keyCode === 66 || event.keyCode === 190 ) {
                event.preventDefault();
            }
        }, false );

    }, false );

    document.addEventListener( "impress:stepleave", function() {
        removeBlackout();
    }, false );

} )( document );


/**
 * Extras Plugin
 *
 * This plugin performs initialization (like calling mermaid.initialize())
 * for the extras/ plugins if they are loaded into a presentation.
 *
 * See README.md for details.
 *
 * Copyright 2016 Henrik Ingo (@henrikingo)
 * Released under the MIT license.
 */
/* global markdown, hljs, mermaid, impress, document, window */

( function( document, window ) {
    "use strict";

    var preInit = function() {
        if ( window.markdown ) {

            // Unlike the other extras, Markdown.js doesn't by default do anything in
            // particular. We do it ourselves here.
            // In addition, we use "-----" as a delimiter for new slide.

            // Query all .markdown elements and translate to HTML
            var markdownDivs = document.querySelectorAll( ".markdown" );
            for ( var idx = 0; idx < markdownDivs.length; idx++ ) {
              var element = markdownDivs[ idx ];
              var dialect = element.dataset.markdownDialect;

              var slides = element.textContent.split( /^-----$/m );
              var i = slides.length - 1;
              element.innerHTML = markdown.toHTML( slides[ i ], dialect );

              // If there's an id, unset it for last, and all other, elements,
              // and then set it for the first.
              var id = null;
              if ( element.id ) {
                id = element.id;
                element.id = "";
              }
              i--;
              while ( i >= 0 ) {
                var newElement = element.cloneNode( false );
                newElement.innerHTML = markdown.toHTML( slides[ i ] );
                element.parentNode.insertBefore( newElement, element );
                element = newElement;
                i--;
              }
              if ( id !== null ) {
                element.id = id;
              }
            }
        } // Markdown

        if ( window.hljs ) {
            hljs.initHighlightingOnLoad();
        }

        if ( window.mermaid ) {
            mermaid.initialize( { startOnLoad:true } );
        }
    };

    // Register the plugin to be called in pre-init phase
    // Note: Markdown.js should run early/first, because it creates new div elements.
    // So add this with a lower-than-default weight.
    impress.addPreInitPlugin( preInit, 1 );

} )( document, window );


/**
 * Form support
 *
 * Functionality to better support use of input, textarea, button... elements in a presentation.
 *
 * This plugin does two things:
 *
 * Set stopPropagation on any element that might take text input. This allows users to type, for
 * example, the letter 'P' into a form field, without causing the presenter console to spring up.
 *
 * On impress:stepleave, de-focus any potentially active
 * element. This is to prevent the focus from being left in a form element that is no longer visible
 * in the window, and user therefore typing garbage into the form.
 *
 * TODO: Currently it is not possible to use TAB to navigate between form elements. Impress.js, and
 * in particular the navigation plugin, unfortunately must fully take control of the tab key,
 * otherwise a user could cause the browser to scroll to a link or button that's not on the current
 * step. However, it could be possible to allow tab navigation between form elements, as long as
 * they are on the active step. This is a topic for further study.
 *
 * Copyright 2016 Henrik Ingo
 * MIT License
 */
/* global document */
( function( document ) {
    "use strict";
    var root;
    var api;

    document.addEventListener( "impress:init", function( event ) {
        root = event.target;
        api = event.detail.api;
        var gc = api.lib.gc;

        var selectors = [ "input", "textarea", "select", "[contenteditable=true]" ];
        for ( var selector of selectors ) {
            var elements = document.querySelectorAll( selector );
            if ( !elements ) {
                continue;
            }

            for ( var i = 0; i < elements.length; i++ ) {
                var e = elements[ i ];
                gc.addEventListener( e, "keydown", function( event ) {
                    event.stopPropagation();
                } );
                gc.addEventListener( e, "keyup", function( event ) {
                    event.stopPropagation();
                } );
            }
        }
    }, false );

    document.addEventListener( "impress:stepleave", function() {
        document.activeElement.blur();
    }, false );

} )( document );


/**
 * Fullscreen plugin
 *
 * Press F5 to enter fullscreen and ESC to exit fullscreen mode.
 *
 * Copyright 2019 @giflw
 * Released under the MIT license.
 */
/* global document */

( function( document ) {
    "use strict";

    function enterFullscreen() {
        var elem = document.documentElement;
        if ( !document.fullscreenElement ) {
            elem.requestFullscreen();
        }
    }

    function exitFullscreen() {
        if ( document.fullscreenElement ) {
            document.exitFullscreen();
        }
    }

    // Wait for impress.js to be initialized
    document.addEventListener( "impress:init", function( event ) {
        var api = event.detail.api;
        var root = event.target;
        var gc = api.lib.gc;
        var util = api.lib.util;

        gc.addEventListener( document, "keydown", function( event ) {

            // 116 (F5) is sent by presentation remote controllers
            if ( event.code === "F5" ) {
                event.preventDefault();
                enterFullscreen();
                util.triggerEvent( root.querySelector( ".active" ), "impress:steprefresh" );
            }

            // 27 (Escape) is sent by presentation remote controllers
            if ( event.key === "Escape" || event.key === "F5" ) {
                event.preventDefault();
                exitFullscreen();
                util.triggerEvent( root.querySelector( ".active" ), "impress:steprefresh" );
            }
        }, false );

        util.triggerEvent( document, "impress:help:add",
            { command: "F5 / ESC", text: "Fullscreen: Enter / Exit", row: 200 } );

    }, false );

} )( document );


/**
 * Goto Plugin
 *
 * The goto plugin is a pre-stepleave plugin. It is executed before impress:stepleave,
 * and will alter the destination where to transition next.
 *
 * Example:
 *
 *         <!-- When leaving this step, go directly to "step-5" -->
 *         <div class="step" data-goto="step-5">
 *
 *         <!-- When leaving this step with next(), go directly to "step-5", instead of next step.
 *              If moving backwards to previous step - e.g. prev() instead of next() -
 *              then go to "step-1". -->
 *         <div class="step" data-goto-next="step-5" data-goto-prev="step-1">
 *
 *        <!-- data-goto-key-list and data-goto-next-list allow you to build advanced non-linear
 *             navigation. -->
 *        <div class="step"
 *             data-goto-key-list="ArrowUp ArrowDown ArrowRight ArrowLeft"
 *             data-goto-next-list="step-4 step-3 step-2 step-5">
 *
 * See https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key/Key_Values for a table
 * of what strings to use for each key.
 *
 * Copyright 2016-2017 Henrik Ingo (@henrikingo)
 * Released under the MIT license.
 */
/* global window, document, impress */

( function( document, window ) {
    "use strict";
    var lib;

    document.addEventListener( "impress:init", function( event ) {
        lib = event.detail.api.lib;
    }, false );

    var isNumber = function( numeric ) {
        return !isNaN( numeric );
    };

    var goto = function( event ) {
        if ( ( !event ) || ( !event.target ) ) {
            return;
        }

        var data = event.target.dataset;
        var steps = document.querySelectorAll( ".step" );

        // Data-goto-key-list="" & data-goto-next-list="" //////////////////////////////////////////
        if ( data.gotoKeyList !== undefined &&
             data.gotoNextList !== undefined &&
             event.origEvent !== undefined &&
             event.origEvent.key !== undefined ) {
            var keylist = data.gotoKeyList.split( " " );
            var nextlist = data.gotoNextList.split( " " );

            if ( keylist.length !== nextlist.length ) {
                window.console.log(
                    "impress goto plugin: data-goto-key-list and data-goto-next-list don't match:"
                );
                window.console.log( keylist );
                window.console.log( nextlist );

                // Don't return, allow the other categories to work despite this error
            } else {
                var index = keylist.indexOf( event.origEvent.key );
                if ( index >= 0 ) {
                    var next = nextlist[ index ];
                    if ( isNumber( next ) ) {
                        event.detail.next = steps[ next ];

                        // If the new next element has its own transitionDuration, we're responsible
                        // for setting that on the event as well
                        event.detail.transitionDuration = lib.util.toNumber(
                            event.detail.next.dataset.transitionDuration,
                            event.detail.transitionDuration
                        );
                        return;
                    } else {
                        var newTarget = document.getElementById( next );
                        if ( newTarget && newTarget.classList.contains( "step" ) ) {
                            event.detail.next = newTarget;
                            event.detail.transitionDuration = lib.util.toNumber(
                                event.detail.next.dataset.transitionDuration,
                                event.detail.transitionDuration
                            );
                            return;
                        } else {
                            window.console.log( "impress goto plugin: " + next +
                                                " is not a step in this impress presentation." );
                        }
                    }
                }
            }
        }

        // Data-goto-next="" & data-goto-prev="" ///////////////////////////////////////////////////

        // Handle event.target data-goto-next attribute
        if ( isNumber( data.gotoNext ) && event.detail.reason === "next" ) {
            event.detail.next = steps[ data.gotoNext ];

            // If the new next element has its own transitionDuration, we're responsible for setting
            // that on the event as well
            event.detail.transitionDuration = lib.util.toNumber(
                event.detail.next.dataset.transitionDuration, event.detail.transitionDuration
            );
            return;
        }
        if ( data.gotoNext && event.detail.reason === "next" ) {
            var newTarget = document.getElementById( data.gotoNext ); // jshint ignore:line
            if ( newTarget && newTarget.classList.contains( "step" ) ) {
                event.detail.next = newTarget;
                event.detail.transitionDuration = lib.util.toNumber(
                    event.detail.next.dataset.transitionDuration,
                    event.detail.transitionDuration
                );
                return;
            } else {
                window.console.log( "impress goto plugin: " + data.gotoNext +
                                    " is not a step in this impress presentation." );
            }
        }

        // Handle event.target data-goto-prev attribute
        if ( isNumber( data.gotoPrev ) && event.detail.reason === "prev" ) {
            event.detail.next = steps[ data.gotoPrev ];
            event.detail.transitionDuration = lib.util.toNumber(
                event.detail.next.dataset.transitionDuration, event.detail.transitionDuration
            );
            return;
        }
        if ( data.gotoPrev && event.detail.reason === "prev" ) {
            var newTarget = document.getElementById( data.gotoPrev ); // jshint ignore:line
            if ( newTarget && newTarget.classList.contains( "step" ) ) {
                event.detail.next = newTarget;
                event.detail.transitionDuration = lib.util.toNumber(
                    event.detail.next.dataset.transitionDuration, event.detail.transitionDuration
                );
                return;
            } else {
                window.console.log( "impress goto plugin: " + data.gotoPrev +
                                    " is not a step in this impress presentation." );
            }
        }

        // Data-goto="" ///////////////////////////////////////////////////////////////////////////

        // Handle event.target data-goto attribute
        if ( isNumber( data.goto ) ) {
            event.detail.next = steps[ data.goto ];
            event.detail.transitionDuration = lib.util.toNumber(
                event.detail.next.dataset.transitionDuration, event.detail.transitionDuration
            );
            return;
        }
        if ( data.goto ) {
            var newTarget = document.getElementById( data.goto ); // jshint ignore:line
            if ( newTarget && newTarget.classList.contains( "step" ) ) {
                event.detail.next = newTarget;
                event.detail.transitionDuration = lib.util.toNumber(
                    event.detail.next.dataset.transitionDuration, event.detail.transitionDuration
                );
                return;
            } else {
                window.console.log( "impress goto plugin: " + data.goto +
                                    " is not a step in this impress presentation." );
            }
        }
    };

    // Register the plugin to be called in pre-stepleave phase
    impress.addPreStepLeavePlugin( goto );

} )( document, window );


/**
 * Help popup plugin
 *
 * Example:
 *
 *     <!-- Show a help popup at start, or if user presses "H" -->
 *     <div id="impress-help"></div>
 *
 * For developers:
 *
 * Typical use for this plugin, is for plugins that support some keypress, to add a line
 * to the help popup produced by this plugin. For example "P: Presenter console".
 *
 * Copyright 2016 Henrik Ingo (@henrikingo)
 * Released under the MIT license.
 */
/* global window, document */

( function( document, window ) {
    "use strict";
    var rows = [];
    var timeoutHandle;

    var triggerEvent = function( el, eventName, detail ) {
        var event = document.createEvent( "CustomEvent" );
        event.initCustomEvent( eventName, true, true, detail );
        el.dispatchEvent( event );
    };

    var renderHelpDiv = function() {
        var helpDiv = document.getElementById( "impress-help" );
        if ( helpDiv ) {
            var html = [];
            for ( var row in rows ) {
                for ( var arrayItem in row ) {
                    html.push( rows[ row ][ arrayItem ] );
                }
            }
            if ( html ) {
                helpDiv.innerHTML = "<table>\n" + html.join( "\n" ) + "</table>\n";
            }
        }
    };

    var toggleHelp = function() {
        var helpDiv = document.getElementById( "impress-help" );
        if ( !helpDiv ) {
            return;
        }

        if ( helpDiv.style.display === "block" ) {
            helpDiv.style.display = "none";
        } else {
            helpDiv.style.display = "block";
            window.clearTimeout( timeoutHandle );
        }
    };

    document.addEventListener( "keyup", function( event ) {

        if ( event.keyCode === 72 || event.keyCode === 191 ) { // "h" || "?"
            event.preventDefault();
            toggleHelp();
        }
    }, false );

    // API
    // Other plugins can add help texts, typically if they support an action on a keypress.
    /**
     * Add a help text to the help popup.
     *
     * :param: e.detail.command  Example: "H"
     * :param: e.detail.text     Example: "Show this help."
     * :param: e.detail.row      Row index from 0 to 9 where to place this help text. Example: 0
     */
    document.addEventListener( "impress:help:add", function( e ) {

        // The idea is for the sender of the event to supply a unique row index, used for sorting.
        // But just in case two plugins would ever use the same row index, we wrap each row into
        // its own array. If there are more than one entry for the same index, they are shown in
        // first come, first serve ordering.
        var rowIndex = e.detail.row;
        if ( typeof rows[ rowIndex ] !== "object" || !rows[ rowIndex ].isArray ) {
            rows[ rowIndex ] = [];
        }
        rows[ e.detail.row ].push( "<tr><td><strong>" + e.detail.command + "</strong></td><td>" +
                                   e.detail.text + "</td></tr>" );
        renderHelpDiv();
    } );

    document.addEventListener( "impress:init", function( e ) {
        renderHelpDiv();

        // At start, show the help for 7 seconds.
        var helpDiv = document.getElementById( "impress-help" );
        if ( helpDiv ) {
            helpDiv.style.display = "block";
            timeoutHandle = window.setTimeout( function() {
                var helpDiv = document.getElementById( "impress-help" );
                helpDiv.style.display = "none";
            }, 7000 );

            // Regster callback to empty the help div on teardown
            var api = e.detail.api;
            api.lib.gc.pushCallback( function() {
                window.clearTimeout( timeoutHandle );
                helpDiv.style.display = "";
                helpDiv.innerHTML = "";
                rows = [];
            } );
        }

        // Use our own API to register the help text for "h"
        triggerEvent( document, "impress:help:add",
                      { command: "H", text: "Show this help", row: 0 } );
    } );

} )( document, window );


/**
 * Adds a presenter console to impress.js
 *
 * MIT Licensed, see license.txt.
 *
 * Copyright 2012, 2013, 2015 impress-console contributors (see README.txt)
 *
 * version: 1.3-dev
 *
 */

// This file contains so much HTML, that we will just respectfully disagree about js
/* jshint quotmark:single */
/* global navigator, top, setInterval, clearInterval, document, window */

( function( document, window ) {
    'use strict';

    // TODO: Move this to src/lib/util.js
    var triggerEvent = function( el, eventName, detail ) {
        var event = document.createEvent( 'CustomEvent' );
        event.initCustomEvent( eventName, true, true, detail );
        el.dispatchEvent( event );
    };

    // Create Language object depending on browsers language setting
    var lang;
    switch ( navigator.language ) {
    case 'de':
        lang = {
            'noNotes': '<div class="noNotes">Keine Notizen hierzu</div>',
            'restart': 'Neustart',
            'clickToOpen': 'Klicken um Sprecherkonsole zu öffnen',
            'prev': 'zurück',
            'next': 'weiter',
            'loading': 'initalisiere',
            'ready': 'Bereit',
            'moving': 'in Bewegung',
            'useAMPM': false
        };
        break;
    case 'en': // jshint ignore:line
    default : // jshint ignore:line
        lang = {
            'noNotes': '<div class="noNotes">No notes for this step</div>',
            'restart': 'Restart',
            'clickToOpen': 'Click to open speaker console',
            'prev': 'Prev',
            'next': 'Next',
            'loading': 'Loading',
            'ready': 'Ready',
            'moving': 'Moving',
            'useAMPM': false
        };
        break;
    }

    // Settings to set iframe in speaker console
    const preViewDefaultFactor = 0.7;
    const preViewMinimumFactor = 0.5;
    const preViewGap    = 4;

    // This is the default template for the speaker console window
    const consoleTemplate = '<!DOCTYPE html>' +
        '<html id="impressconsole"><head>' +

          // Order is important: If user provides a cssFile, those will win, because they're later
          '{{cssStyle}}' +
          '{{cssLink}}' +
        '</head><body>' +
        '<div id="console">' +
          '<div id="views">' +
            '<iframe id="slideView" scrolling="no"></iframe>' +
            '<iframe id="preView" scrolling="no"></iframe>' +
            '<div id="blocker"></div>' +
          '</div>' +
          '<div id="notes"></div>' +
        '</div>' +
        '<div id="controls"> ' +
          '<div id="prev"><a  href="#" onclick="impress().prev(); return false;" />' +
            '{{prev}}</a></div>' +
          '<div id="next"><a  href="#" onclick="impress().next(); return false;" />' +
            '{{next}}</a></div>' +
          '<div id="clock">--:--</div>' +
          '<div id="timer" onclick="timerReset()">00m 00s</div>' +
          '<div id="status">{{loading}}</div>' +
        '</div>' +
        '</body></html>';

    // Default css location
    var cssFileOldDefault = 'css/impressConsole.css';
    var cssFile = undefined; // jshint ignore:line

    // Css for styling iframs on the console
    var cssFileIframeOldDefault = 'css/iframe.css';
    var cssFileIframe = undefined; // jshint ignore:line

    // All console windows, so that you can call impressConsole() repeatedly.
    var allConsoles = {};

    // Zero padding helper function:
    var zeroPad = function( i ) {
        return ( i < 10 ? '0' : '' ) + i;
    };

    // The console object
    var impressConsole = window.impressConsole = function( rootId ) {

        rootId = rootId || 'impress';

        if ( allConsoles[ rootId ] ) {
            return allConsoles[ rootId ];
        }

        // Root presentation elements
        var root = document.getElementById( rootId );

        var consoleWindow = null;

        var nextStep = function() {
            var classes = '';
            var nextElement = document.querySelector( '.active' );

            // Return to parents as long as there is no next sibling
            while ( !nextElement.nextElementSibling && nextElement.parentNode ) {
                nextElement = nextElement.parentNode;
            }
            nextElement = nextElement.nextElementSibling;
            while ( nextElement ) {
                classes = nextElement.attributes[ 'class' ];
                if ( classes && classes.value.indexOf( 'step' ) !== -1 ) {
                    consoleWindow.document.getElementById( 'blocker' ).innerHTML = lang.next;
                    return nextElement;
                }

                if ( nextElement.firstElementChild ) { // First go into deep
                    nextElement = nextElement.firstElementChild;
                } else {

                    // Go to next sibling or through parents until there is a next sibling
                    while ( !nextElement.nextElementSibling && nextElement.parentNode ) {
                        nextElement = nextElement.parentNode;
                    }
                    nextElement = nextElement.nextElementSibling;
                }
            }

            // No next element. Pick the first
            consoleWindow.document.getElementById( 'blocker' ).innerHTML = lang.restart;
            return document.querySelector( '.step' );
        };

        // Sync the notes to the step
        var onStepLeave = function() {
            if ( consoleWindow ) {

                // Set notes to next steps notes.
                var newNotes = document.querySelector( '.active' ).querySelector( '.notes' );
                if ( newNotes ) {
                    newNotes = newNotes.innerHTML;
                } else {
                    newNotes = lang.noNotes;
                }
                consoleWindow.document.getElementById( 'notes' ).innerHTML = newNotes;

                // Set the views
                var baseURL = document.URL.substring( 0, document.URL.search( '#/' ) );
                var slideSrc = baseURL + '#' + document.querySelector( '.active' ).id;
                var preSrc = baseURL + '#' + nextStep().id;
                var slideView = consoleWindow.document.getElementById( 'slideView' );

                // Setting them when they are already set causes glithes in Firefox, so check first:
                if ( slideView.src !== slideSrc ) {
                    slideView.src = slideSrc;
                }
                var preView = consoleWindow.document.getElementById( 'preView' );
                if ( preView.src !== preSrc ) {
                    preView.src = preSrc;
                }

                consoleWindow.document.getElementById( 'status' ).innerHTML =
                    '<span class="moving">' + lang.moving + '</span>';
            }
        };

        // Sync the previews to the step
        var onStepEnter = function() {
            if ( consoleWindow ) {

                // We do everything here again, because if you stopped the previos step to
                // early, the onstepleave trigger is not called for that step, so
                // we need this to sync things.
                var newNotes = document.querySelector( '.active' ).querySelector( '.notes' );
                if ( newNotes ) {
                    newNotes = newNotes.innerHTML;
                } else {
                    newNotes = lang.noNotes;
                }
                var notes = consoleWindow.document.getElementById( 'notes' );
                notes.innerHTML = newNotes;
                notes.scrollTop = 0;

                // Set the views
                var baseURL = document.URL.substring( 0, document.URL.search( '#/' ) );
                var slideSrc = baseURL + '#' + document.querySelector( '.active' ).id;
                var preSrc = baseURL + '#' + nextStep().id;
                var slideView = consoleWindow.document.getElementById( 'slideView' );

                // Setting them when they are already set causes glithes in Firefox, so check first:
                if ( slideView.src !== slideSrc ) {
                    slideView.src = slideSrc;
                }
                var preView = consoleWindow.document.getElementById( 'preView' );
                if ( preView.src !== preSrc ) {
                    preView.src = preSrc;
                }

                consoleWindow.document.getElementById( 'status' ).innerHTML =
                    '<span  class="ready">' + lang.ready + '</span>';
            }
        };

        // Sync substeps
        var onSubstep = function( event ) {
            if ( consoleWindow ) {
                if ( event.detail.reason === 'next' ) {
                    onSubstepShow();
                }
                if ( event.detail.reason === 'prev' ) {
                    onSubstepHide();
                }
            }
        };

        var onSubstepShow = function() {
            var slideView = consoleWindow.document.getElementById( 'slideView' );
            triggerEventInView( slideView, 'impress:substep:show' );
        };

        var onSubstepHide = function() {
            var slideView = consoleWindow.document.getElementById( 'slideView' );
            triggerEventInView( slideView, 'impress:substep:hide' );
        };

        var triggerEventInView = function( frame, eventName, detail ) {

            // Note: Unfortunately Chrome does not allow createEvent on file:// URLs, so this won't
            // work. This does work on Firefox, and should work if viewing the presentation on a
            // http:// URL on Chrome.
            var event = frame.contentDocument.createEvent( 'CustomEvent' );
            event.initCustomEvent( eventName, true, true, detail );
            frame.contentDocument.dispatchEvent( event );
        };

        var spaceHandler = function() {
            var notes = consoleWindow.document.getElementById( 'notes' );
            if ( notes.scrollTopMax - notes.scrollTop > 20 ) {
               notes.scrollTop = notes.scrollTop + notes.clientHeight * 0.8;
            } else {
               window.impress().next();
            }
        };

        var timerReset = function() {
            consoleWindow.timerStart = new Date();
        };

        // Show a clock
        var clockTick = function() {
            var now = new Date();
            var hours = now.getHours();
            var minutes = now.getMinutes();
            var seconds = now.getSeconds();
            var ampm = '';

            if ( lang.useAMPM ) {
                ampm = ( hours < 12 ) ? 'AM' : 'PM';
                hours = ( hours > 12 ) ? hours - 12 : hours;
                hours = ( hours === 0 ) ? 12 : hours;
            }

            // Clock
            var clockStr = zeroPad( hours ) + ':' + zeroPad( minutes ) + ':' + zeroPad( seconds ) +
                           ' ' + ampm;
            consoleWindow.document.getElementById( 'clock' ).firstChild.nodeValue = clockStr;

            // Timer
            seconds = Math.floor( ( now - consoleWindow.timerStart ) / 1000 );
            minutes = Math.floor( seconds / 60 );
            seconds = Math.floor( seconds % 60 );
            consoleWindow.document.getElementById( 'timer' ).firstChild.nodeValue =
                zeroPad( minutes ) + 'm ' + zeroPad( seconds ) + 's';

            if ( !consoleWindow.initialized ) {

                // Nudge the slide windows after load, or they will scrolled wrong on Firefox.
                consoleWindow.document.getElementById( 'slideView' ).contentWindow.scrollTo( 0, 0 );
                consoleWindow.document.getElementById( 'preView' ).contentWindow.scrollTo( 0, 0 );
                consoleWindow.initialized = true;
            }
        };

        var registerKeyEvent = function( keyCodes, handler, window ) {
            if ( window === undefined ) {
                window = consoleWindow;
            }

            // Prevent default keydown action when one of supported key is pressed
            window.document.addEventListener( 'keydown', function( event ) {
                if ( !event.ctrlKey && !event.altKey && !event.shiftKey && !event.metaKey &&
                     keyCodes.indexOf( event.keyCode ) !== -1 ) {
                    event.preventDefault();
                }
            }, false );

            // Trigger impress action on keyup
            window.document.addEventListener( 'keyup', function( event ) {
                if ( !event.ctrlKey && !event.altKey && !event.shiftKey && !event.metaKey &&
                     keyCodes.indexOf( event.keyCode ) !== -1 ) {
                        handler();
                        event.preventDefault();
                }
            }, false );
        };

        var consoleOnLoad = function() {
                var slideView = consoleWindow.document.getElementById( 'slideView' );
                var preView = consoleWindow.document.getElementById( 'preView' );

                // Firefox:
                slideView.contentDocument.body.classList.add( 'impress-console' );
                preView.contentDocument.body.classList.add( 'impress-console' );
                if ( cssFileIframe !== undefined ) {
                    slideView.contentDocument.head.insertAdjacentHTML(
                        'beforeend',
                        '<link rel="stylesheet" type="text/css" href="' + cssFileIframe + '">'
                    );
                    preView.contentDocument.head.insertAdjacentHTML(
                        'beforeend',
                        '<link rel="stylesheet" type="text/css" href="' + cssFileIframe + '">'
                    );
                }

                // Chrome:
                slideView.addEventListener( 'load', function() {
                        slideView.contentDocument.body.classList.add( 'impress-console' );
                        if ( cssFileIframe !== undefined ) {
                            slideView.contentDocument.head.insertAdjacentHTML(
                                'beforeend',
                                '<link rel="stylesheet" type="text/css" href="' +
                                    cssFileIframe + '">'
                            );
                        }
                } );
                preView.addEventListener( 'load', function() {
                        preView.contentDocument.body.classList.add( 'impress-console' );
                        if ( cssFileIframe !== undefined ) {
                            preView.contentDocument.head.insertAdjacentHTML(
                                'beforeend',
                                '<link rel="stylesheet" type="text/css" href="' +
                                    cssFileIframe + '">' );
                        }
                } );
        };

        var open = function() {
            if ( top.isconsoleWindow ) {
                return;
            }

            if ( consoleWindow && !consoleWindow.closed ) {
                consoleWindow.focus();
            } else {
                consoleWindow = window.open( '', 'impressConsole' );

                // If opening failes this may be because the browser prevents this from
                // not (or less) interactive JavaScript...
                if ( consoleWindow == null ) {

                    // ... so I add a button to klick.
                    // workaround on firefox
                    var message = document.createElement( 'div' );
                    message.id = 'impress-console-button';
                    message.style.position = 'fixed';
                    message.style.left = 0;
                    message.style.top = 0;
                    message.style.right = 0;
                    message.style.bottom = 0;
                    message.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
                    var clickStr = 'var x = document.getElementById(\'impress-console-button\');' +
                                     'x.parentNode.removeChild(x);' +
                                     'var r = document.getElementById(\'' + rootId + '\');' +
                                     'impress(\'' + rootId +
                                     '\').lib.util.triggerEvent(r, \'impress:console:open\', {})';
                    var styleStr = 'margin: 25vh 25vw;width:50vw;height:50vh;';
                    message.innerHTML = '<button style="' + styleStr + '" ' +
                                                 'onclick="' + clickStr + '">' +
                                        lang.clickToOpen +
                                        '</button>';
                    document.body.appendChild( message );
                    return;
                }

                var cssLink = '';
                if ( cssFile !== undefined ) {
                    cssLink = '<link rel="stylesheet" type="text/css" media="screen" href="' +
                              cssFile + '">';
                }

                // This sets the window location to the main window location, so css can be loaded:
                consoleWindow.document.open();

                // Write the template:
                consoleWindow.document.write(

                    // CssStyleStr is lots of inline <style></style> defined at the end of this file
                    consoleTemplate.replace( '{{cssStyle}}', cssStyleStr() )
                                   .replace( '{{cssLink}}', cssLink )
                                   .replace( /{{.*?}}/gi, function( x ) {
                                       return lang[ x.substring( 2, x.length - 2 ) ]; }
                                   )
                );
                consoleWindow.document.title = 'Speaker Console (' + document.title + ')';
                consoleWindow.impress = window.impress;

                // We set this flag so we can detect it later, to prevent infinite popups.
                consoleWindow.isconsoleWindow = true;

                // Set the onload function:
                consoleWindow.onload = consoleOnLoad;

                // Add clock tick
                consoleWindow.timerStart = new Date();
                consoleWindow.timerReset = timerReset;
                consoleWindow.clockInterval = setInterval( allConsoles[ rootId ].clockTick, 1000 );

                // Keyboard navigation handlers
                // 33: pg up, 37: left, 38: up
                registerKeyEvent( [ 33, 37, 38 ], window.impress().prev );

                // 34: pg down, 39: right, 40: down
                registerKeyEvent( [ 34, 39, 40 ], window.impress().next );

                // 32: space
                registerKeyEvent( [ 32 ], spaceHandler );

                // 82: R
                registerKeyEvent( [ 82 ], timerReset );

                // Cleanup
                consoleWindow.onbeforeunload = function() {

                    // I don't know why onunload doesn't work here.
                    clearInterval( consoleWindow.clockInterval );
                };

                // It will need a little nudge on Firefox, but only after loading:
                onStepEnter();
                consoleWindow.initialized = false;
                consoleWindow.document.close();

                //Catch any window resize to pass size on
                window.onresize = resize;
                consoleWindow.onresize = resize;

                return consoleWindow;
            }
        };

        var resize = function() {
            var slideView = consoleWindow.document.getElementById( 'slideView' );
            var preView = consoleWindow.document.getElementById( 'preView' );

            // Get ratio of presentation
            var ratio = window.innerHeight / window.innerWidth;

            // Get size available for views
            var views = consoleWindow.document.getElementById( 'views' );

            // SlideView may have a border or some padding:
            // asuming same border width on both direktions
            var delta = slideView.offsetWidth - slideView.clientWidth;

            // Set views
            var slideViewWidth = ( views.clientWidth - delta );
            var slideViewHeight = Math.floor( slideViewWidth * ratio );

            var preViewTop = slideViewHeight + preViewGap;

            var preViewWidth = Math.floor( slideViewWidth * preViewDefaultFactor );
            var preViewHeight = Math.floor( slideViewHeight * preViewDefaultFactor );

            // Shrink preview to fit into space available
            if ( views.clientHeight - delta < preViewTop + preViewHeight ) {
                preViewHeight = views.clientHeight - delta - preViewTop;
                preViewWidth = Math.floor( preViewHeight / ratio );
            }

            // If preview is not high enough forget ratios!
            if ( preViewWidth <= Math.floor( slideViewWidth * preViewMinimumFactor ) ) {
                slideViewWidth = ( views.clientWidth - delta );
                slideViewHeight = Math.floor( ( views.clientHeight - delta - preViewGap ) /
                                             ( 1 + preViewMinimumFactor ) );

                preViewTop = slideViewHeight + preViewGap;

                preViewWidth = Math.floor( slideViewWidth * preViewMinimumFactor );
                preViewHeight = views.clientHeight - delta - preViewTop;
            }

            // Set the calculated into styles
            slideView.style.width = slideViewWidth + 'px';
            slideView.style.height = slideViewHeight + 'px';

            preView.style.top = preViewTop + 'px';

            preView.style.width = preViewWidth + 'px';
            preView.style.height = preViewHeight + 'px';
        };

        var _init = function( cssConsole, cssIframe ) {
            if ( cssConsole !== undefined ) {
                cssFile = cssConsole;
            }

            // You can also specify the css in the presentation root div:
            // <div id="impress" data-console-css=..." data-console-css-iframe="...">
            else if ( root.dataset.consoleCss !== undefined ) {
                cssFile = root.dataset.consoleCss;
            }

            if ( cssIframe !== undefined ) {
                cssFileIframe = cssIframe;
            } else if ( root.dataset.consoleCssIframe !== undefined ) {
                cssFileIframe = root.dataset.consoleCssIframe;
            }

            // Register the event
            root.addEventListener( 'impress:stepleave', onStepLeave );
            root.addEventListener( 'impress:stepenter', onStepEnter );
            root.addEventListener( 'impress:substep:stepleaveaborted', onSubstep );
            root.addEventListener( 'impress:substep:show', onSubstepShow );
            root.addEventListener( 'impress:substep:hide', onSubstepHide );

            //When the window closes, clean up after ourselves.
            window.onunload = function() {
                if ( consoleWindow && !consoleWindow.closed ) {
                    consoleWindow.close();
                }
            };

            //Open speaker console when they press 'p'
            registerKeyEvent( [ 80 ], open, window );

            //Btw, you can also launch console automatically:
            //<div id="impress" data-console-autolaunch="true">
            if ( root.dataset.consoleAutolaunch === 'true' ) {
                open();
            }
        };

        var init = function( cssConsole, cssIframe ) {
            if ( ( cssConsole === undefined || cssConsole === cssFileOldDefault ) &&
                 ( cssIframe === undefined  || cssIframe === cssFileIframeOldDefault ) ) {
                window.console.log( 'impressConsole().init() is deprecated. ' +
                                   'impressConsole is now initialized automatically when you ' +
                                   'call impress().init().' );
            }
            _init( cssConsole, cssIframe );
        };

        // New API for impress.js plugins is based on using events
        root.addEventListener( 'impress:console:open', function() {
            open();
        } );

        /**
         * Register a key code to an event handler
         *
         * :param: event.detail.keyCodes    List of key codes
         * :param: event.detail.handler     A function registered as the event handler
         * :param: event.detail.window      The console window to register the keycode in
         */
        root.addEventListener( 'impress:console:registerKeyEvent', function( event ) {
            registerKeyEvent( event.detail.keyCodes, event.detail.handler, event.detail.window );
        } );

        // Return the object
        allConsoles[ rootId ] = { init: init, open: open, clockTick: clockTick,
                               registerKeyEvent: registerKeyEvent, _init: _init };
        return allConsoles[ rootId ];

    };

    // This initializes impressConsole automatically when initializing impress itself
    document.addEventListener( 'impress:init', function( event ) {

        // Note: impressConsole wants the id string, not the DOM element directly
        impressConsole( event.target.id )._init();

        // Add 'P' to the help popup
        triggerEvent( document, 'impress:help:add',
                        { command: 'P', text: 'Presenter console', row: 10 } );
    } );

    // Returns a string to be used inline as a css <style> element in the console window.
    // Apologies for length, but hiding it here at the end to keep it away from rest of the code.
    var cssStyleStr = function() {
        return `<style>
            #impressconsole body {
                background-color: rgb(255, 255, 255);
                padding: 0;
                margin: 0;
                font-family: verdana, arial, sans-serif;
                font-size: 2vw;
            }

            #impressconsole div#console {
                position: absolute;
                top: 0.5vw;
                left: 0.5vw;
                right: 0.5vw;
                bottom: 3vw;
                margin: 0;
            }

            #impressconsole div#views, #impressconsole div#notes {
                position: absolute;
                top: 0;
                bottom: 0;
            }

            #impressconsole div#views {
                left: 0;
                right: 50vw;
                overflow: hidden;
            }

            #impressconsole div#blocker {
                position: absolute;
                right: 0;
                bottom: 0;
            }

            #impressconsole div#notes {
                left: 50vw;
                right: 0;
                overflow-x: hidden;
                overflow-y: auto;
                padding: 0.3ex;
                background-color: rgb(255, 255, 255);
                border: solid 1px rgb(120, 120, 120);
            }

            #impressconsole div#notes .noNotes {
                color: rgb(200, 200, 200);
            }

            #impressconsole div#notes p {
                margin-top: 0;
            }

            #impressconsole iframe {
                position: absolute;
                margin: 0;
                padding: 0;
                left: 0;
                border: solid 1px rgb(120, 120, 120);
            }

            #impressconsole iframe#slideView {
                top: 0;
                width: 49vw;
                height: 49vh;
            }

            #impressconsole iframe#preView {
                opacity: 0.7;
                top: 50vh;
                width: 30vw;
                height: 30vh;
            }

            #impressconsole div#controls {
                margin: 0;
                position: absolute;
                bottom: 0.25vw;
                left: 0.5vw;
                right: 0.5vw;
                height: 2.5vw;
                background-color: rgb(255, 255, 255);
                background-color: rgba(255, 255, 255, 0.6);
            }

            #impressconsole div#prev, div#next {
            }

            #impressconsole div#prev a, #impressconsole div#next a {
                display: block;
                border: solid 1px rgb(70, 70, 70);
                border-radius: 0.5vw;
                font-size: 1.5vw;
                padding: 0.25vw;
                text-decoration: none;
                background-color: rgb(220, 220, 220);
                color: rgb(0, 0, 0);
            }

            #impressconsole div#prev a:hover, #impressconsole div#next a:hover {
                background-color: rgb(245, 245, 245);
            }

            #impressconsole div#prev {
                float: left;
            }

            #impressconsole div#next {
                float: right;
            }

            #impressconsole div#status {
                margin-left: 2em;
                margin-right: 2em;
                text-align: center;
                float: right;
            }

            #impressconsole div#clock {
                margin-left: 2em;
                margin-right: 2em;
                text-align: center;
                float: left;
            }

            #impressconsole div#timer {
                margin-left: 2em;
                margin-right: 2em;
                text-align: center;
                float: left;
            }

            #impressconsole span.moving {
                color: rgb(255, 0, 0);
            }

            #impressconsole span.ready {
                color: rgb(0, 128, 0);
            }
        </style>`;
    };

} )( document, window );

/**
 * Media Plugin
 *
 * This plugin will do the following things:
 *
 *  - Add a special class when playing (body.impress-media-video-playing
 *    and body.impress-media-video-playing) and pausing media (body.impress-media-video-paused
 *    and body.impress-media-audio-paused) (removing them when ending).
 *    This can be useful for example for darkening the background or fading out other elements
 *    while a video is playing.
 *    Only media at the current step are taken into account. All classes are removed when leaving
 *    a step.
 *
 *  - Introduce the following new data attributes:
 *
 *    - data-media-autoplay="true": Autostart media when entering its step.
 *    - data-media-autostop="true": Stop media (= pause and reset to start), when leaving its
 *      step.
 *    - data-media-autopause="true": Pause media but keep current time when leaving its step.
 *
 *    When these attributes are added to a step they are inherited by all media on this step.
 *    Of course this setting can be overwritten by adding different attributes to inidvidual
 *    media.
 *
 *    The same rule applies when this attributes is added to the root element. Settings can be
 *    overwritten for individual steps and media.
 *
 *    Examples:
 *    - data-media-autoplay="true" data-media-autostop="true": start media on enter, stop on
 *      leave, restart from beginning when re-entering the step.
 *
 *    - data-media-autoplay="true" data-media-autopause="true": start media on enter, pause on
 *      leave, resume on re-enter
 *
 *    - data-media-autoplay="true" data-media-autostop="true" data-media-autopause="true": start
 *      media on enter, stop on leave (stop overwrites pause).
 *
 *    - data-media-autoplay="true" data-media-autopause="false": let media start automatically
 *      when entering a step and let it play when leaving the step.
 *
 *    - <div id="impress" data-media-autoplay="true"> ... <div class="step"
 *      data-media-autoplay="false">
 *      All media is startet automatically on all steps except the one that has the
 *      data-media-autoplay="false" attribute.
 *
 *  - Pro tip: Use <audio onended="impress().next()"> or <video onended="impress().next()"> to
 *    proceed to the next step automatically, when the end of the media is reached.
 *
 *
 * Copyright 2018 Holger Teichert (@complanar)
 * Released under the MIT license.
 */
/* global window, document */

( function( document, window ) {
    "use strict";
    var root, api, gc, attributeTracker;

    attributeTracker = [];

    // Function names
    var enhanceMediaNodes,
        enhanceMedia,
        removeMediaClasses,
        onStepenterDetectImpressConsole,
        onStepenter,
        onStepleave,
        onPlay,
        onPause,
        onEnded,
        getMediaAttribute,
        teardown;

    document.addEventListener( "impress:init", function( event ) {
        root = event.target;
        api = event.detail.api;
        gc = api.lib.gc;

        enhanceMedia();

        gc.pushCallback( teardown );
    }, false );

    teardown = function() {
        var el, i;
        removeMediaClasses();
        for ( i = 0; i < attributeTracker.length; i += 1 ) {
            el = attributeTracker[ i ];
            el.node.removeAttribute( el.attr );
        }
        attributeTracker = [];
    };

    getMediaAttribute = function( attributeName, nodes ) {
        var attrName, attrValue, i, node;
        attrName = "data-media-" + attributeName;

        // Look for attributes in all nodes
        for ( i = 0; i < nodes.length; i += 1 ) {
            node = nodes[ i ];

            // First test, if the attribute exists, because some browsers may return
            // an empty string for non-existing attributes - specs are not clear at that point
            if ( node.hasAttribute( attrName ) ) {

                // Attribute found, return their parsed boolean value, empty strings count as true
                // to enable empty value booleans (common in html5 but not allowed in well formed
                // xml).
                attrValue = node.getAttribute( attrName );
                if ( attrValue === "" || attrValue === "true" ) {
                    return true;
                } else {
                    return false;
                }
            }

            // No attribute found at current node, proceed with next round
        }

        // Last resort: no attribute found - return undefined to distiguish from false
        return undefined;
    };

    onPlay = function( event ) {
        var type = event.target.nodeName.toLowerCase();
        document.body.classList.add( "impress-media-" + type + "-playing" );
        document.body.classList.remove( "impress-media-" + type + "-paused" );
    };

    onPause = function( event ) {
        var type = event.target.nodeName.toLowerCase();
        document.body.classList.add( "impress-media-" + type + "-paused" );
        document.body.classList.remove( "impress-media-" + type + "-playing" );
    };

    onEnded = function( event ) {
        var type = event.target.nodeName.toLowerCase();
        document.body.classList.remove( "impress-media-" + type + "-playing" );
        document.body.classList.remove( "impress-media-" + type + "-paused" );
    };

    removeMediaClasses = function() {
        var type, types;
        types = [ "video", "audio" ];
        for ( type in types ) {
            document.body.classList.remove( "impress-media-" + types[ type ] + "-playing" );
            document.body.classList.remove( "impress-media-" + types[ type ] + "-paused" );
        }
    };

    enhanceMediaNodes = function() {
        var i, id, media, mediaElement, type;

        media = root.querySelectorAll( "audio, video" );
        for ( i = 0; i < media.length; i += 1 ) {
            type = media[ i ].nodeName.toLowerCase();

            // Set an id to identify each media node - used e.g. for cross references by
            // the consoleMedia plugin
            mediaElement = media[ i ];
            id = mediaElement.getAttribute( "id" );
            if ( id === undefined || id === null ) {
                mediaElement.setAttribute( "id", "media-" + type + "-" + i );
                attributeTracker.push( { "node": mediaElement, "attr": "id" } );
            }
            gc.addEventListener( mediaElement, "play", onPlay );
            gc.addEventListener( mediaElement, "playing", onPlay );
            gc.addEventListener( mediaElement, "pause", onPause );
            gc.addEventListener( mediaElement, "ended", onEnded );
        }
    };

    enhanceMedia = function() {
        var steps, stepElement, i;
        enhanceMediaNodes();
        steps = document.getElementsByClassName( "step" );
        for ( i = 0; i < steps.length; i += 1 ) {
            stepElement = steps[ i ];

            gc.addEventListener( stepElement, "impress:stepenter", onStepenter );
            gc.addEventListener( stepElement, "impress:stepleave", onStepleave );
        }
    };

    onStepenterDetectImpressConsole = function() {
        return {
            "preview": ( window.frameElement !== null && window.frameElement.id === "preView" ),
            "slideView": ( window.frameElement !== null && window.frameElement.id === "slideView" )
        };
    };

    onStepenter = function( event ) {
        var stepElement, media, mediaElement, i, onConsole, autoplay;
        if ( ( !event ) || ( !event.target ) ) {
            return;
        }

        stepElement = event.target;
        removeMediaClasses();

        media = stepElement.querySelectorAll( "audio, video" );
        for ( i = 0; i < media.length; i += 1 ) {
            mediaElement = media[ i ];

            // Autoplay when (maybe inherited) autoplay setting is true,
            // but only if not on preview of the next step in impressConsole
            onConsole = onStepenterDetectImpressConsole();
            autoplay = getMediaAttribute( "autoplay", [ mediaElement, stepElement, root ] );
            if ( autoplay && !onConsole.preview ) {
                if ( onConsole.slideView ) {
                    mediaElement.muted = true;
                }
                mediaElement.play();
            }
        }
    };

    onStepleave = function( event ) {
        var stepElement, media, i, mediaElement, autoplay, autopause, autostop;
        if ( ( !event || !event.target ) ) {
            return;
        }

        stepElement = event.target;
        media = event.target.querySelectorAll( "audio, video" );
        for ( i = 0; i < media.length; i += 1 ) {
            mediaElement = media[ i ];

            autoplay = getMediaAttribute( "autoplay", [ mediaElement, stepElement, root ] );
            autopause = getMediaAttribute( "autopause", [ mediaElement, stepElement, root ] );
            autostop = getMediaAttribute( "autostop",  [ mediaElement, stepElement, root ] );

            // If both autostop and autopause are undefined, set it to the value of autoplay
            if ( autostop === undefined && autopause === undefined ) {
                autostop = autoplay;
            }

            if ( autopause || autostop ) {
                mediaElement.pause();
                if ( autostop ) {
                    mediaElement.currentTime = 0;
                }
            }
        }
        removeMediaClasses();
    };

} )( document, window );

/**
 * Mobile devices support
 *
 * Allow presentation creators to hide all but 3 slides, to save resources, particularly on mobile
 * devices, using classes body.impress-mobile, .step.prev, .step.active and .step.next.
 *
 * Note: This plugin does not take into account possible redirections done with skip, goto etc
 * plugins. Basically it wouldn't work as intended in such cases, but the active step will at least
 * be correct.
 *
 * Adapted to a plugin from a submission by @Kzeni:
 * https://github.com/impress/impress.js/issues/333
 */
/* global document, navigator */
( function( document ) {
    "use strict";

    var getNextStep = function( el ) {
        var steps = document.querySelectorAll( ".step" );
        for ( var i = 0; i < steps.length; i++ ) {
            if ( steps[ i ] === el ) {
                if ( i + 1 < steps.length ) {
                    return steps[ i + 1 ];
                } else {
                    return steps[ 0 ];
                }
            }
        }
    };
    var getPrevStep = function( el ) {
        var steps = document.querySelectorAll( ".step" );
        for ( var i = steps.length - 1; i >= 0; i-- ) {
            if ( steps[ i ] === el ) {
                if ( i - 1 >= 0 ) {
                    return steps[ i - 1 ];
                } else {
                    return steps[ steps.length - 1 ];
                }
            }
        }
    };

    // Detect mobile browsers & add CSS class as appropriate.
    document.addEventListener( "impress:init", function( event ) {
        var body = document.body;
        if ( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
                 navigator.userAgent
             ) ) {
            body.classList.add( "impress-mobile" );
        }

        // Unset all this on teardown
        var api = event.detail.api;
        api.lib.gc.pushCallback( function() {
            document.body.classList.remove( "impress-mobile" );
            var prev = document.getElementsByClassName( "prev" )[ 0 ];
            var next = document.getElementsByClassName( "next" )[ 0 ];
            if ( typeof prev !== "undefined" ) {
                prev.classList.remove( "prev" );
            }
            if ( typeof next !== "undefined" ) {
                next.classList.remove( "next" );
            }
        } );
    } );

    // Add prev and next classes to the siblings of the newly entered active step element
    // Remove prev and next classes from their current step elements
    // Note: As an exception we break namespacing rules, as these are useful general purpose
    // classes. (Naming rules would require us to use css classes mobile-next and mobile-prev,
    // based on plugin name.)
    document.addEventListener( "impress:stepenter", function( event ) {
	      var oldprev = document.getElementsByClassName( "prev" )[ 0 ];
	      var oldnext = document.getElementsByClassName( "next" )[ 0 ];

	      var prev = getPrevStep( event.target );
	      prev.classList.add( "prev" );
	      var next = getNextStep( event.target );
	      next.classList.add( "next" );

	      if ( typeof oldprev !== "undefined" ) {
		      oldprev.classList.remove( "prev" );
              }
	      if ( typeof oldnext !== "undefined" ) {
		      oldnext.classList.remove( "next" );
              }
    } );
} )( document );


/**
 * Mouse timeout plugin
 *
 * After 3 seconds of mouse inactivity, add the css class
 * `body.impress-mouse-timeout`. On `mousemove`, `click` or `touch`, remove the
 * class.
 *
 * The use case for this plugin is to use CSS to hide elements from the screen
 * and only make them visible when the mouse is moved. Examples where this
 * might be used are: the toolbar from the toolbar plugin, and the mouse cursor
 * itself.
 *
 * Example CSS:
 *
 *     body.impress-mouse-timeout {
 *         cursor: none;
 *     }
 *     body.impress-mouse-timeout div#impress-toolbar {
 *         display: none;
 *     }
 *
 *
 * Copyright 2016 Henrik Ingo (@henrikingo)
 * Released under the MIT license.
 */
/* global window, document */
( function( document, window ) {
    "use strict";
    var timeout = 3;
    var timeoutHandle;

    var hide = function() {

        // Mouse is now inactive
        document.body.classList.add( "impress-mouse-timeout" );
    };

    var show = function() {
        if ( timeoutHandle ) {
            window.clearTimeout( timeoutHandle );
        }

        // Mouse is now active
        document.body.classList.remove( "impress-mouse-timeout" );

        // Then set new timeout after which it is considered inactive again
        timeoutHandle = window.setTimeout( hide, timeout * 1000 );
    };

    document.addEventListener( "impress:init", function( event ) {
        var api = event.detail.api;
        var gc = api.lib.gc;
        gc.addEventListener( document, "mousemove", show );
        gc.addEventListener( document, "click", show );
        gc.addEventListener( document, "touch", show );

        // Set first timeout
        show();

        // Unset all this on teardown
        gc.pushCallback( function() {
            window.clearTimeout( timeoutHandle );
            document.body.classList.remove( "impress-mouse-timeout" );
        } );
    }, false );

} )( document, window );

/**
 * Navigation events plugin
 *
 * As you can see this part is separate from the impress.js core code.
 * It's because these navigation actions only need what impress.js provides with
 * its simple API.
 *
 * This plugin is what we call an _init plugin_. It's a simple kind of
 * impress.js plugin. When loaded, it starts listening to the `impress:init`
 * event. That event listener initializes the plugin functionality - in this
 * case we listen to some keypress and mouse events. The only dependencies on
 * core impress.js functionality is the `impress:init` method, as well as using
 * the public api `next(), prev(),` etc when keys are pressed.
 *
 * Copyright 2011-2012 Bartek Szopka (@bartaz)
 * Released under the MIT license.
 * ------------------------------------------------
 *  author:  Bartek Szopka
 *  version: 0.5.3
 *  url:     http://bartaz.github.com/impress.js/
 *  source:  http://github.com/bartaz/impress.js/
 *
 */
/* global document */
( function( document ) {
    "use strict";

    // Wait for impress.js to be initialized
    document.addEventListener( "impress:init", function( event ) {

        // Getting API from event data.
        // So you don't event need to know what is the id of the root element
        // or anything. `impress:init` event data gives you everything you
        // need to control the presentation that was just initialized.
        var api = event.detail.api;
        var gc = api.lib.gc;
        var util = api.lib.util;

        // Supported keys are:
        // [space] - quite common in presentation software to move forward
        // [up] [right] / [down] [left] - again common and natural addition,
        // [pgdown] / [pgup] - often triggered by remote controllers,
        // [tab] - this one is quite controversial, but the reason it ended up on
        //   this list is quite an interesting story... Remember that strange part
        //   in the impress.js code where window is scrolled to 0,0 on every presentation
        //   step, because sometimes browser scrolls viewport because of the focused element?
        //   Well, the [tab] key by default navigates around focusable elements, so clicking
        //   it very often caused scrolling to focused element and breaking impress.js
        //   positioning. I didn't want to just prevent this default action, so I used [tab]
        //   as another way to moving to next step... And yes, I know that for the sake of
        //   consistency I should add [shift+tab] as opposite action...
        var isNavigationEvent = function( event ) {

            // Don't trigger navigation for example when user returns to browser window with ALT+TAB
            if ( event.altKey || event.ctrlKey || event.metaKey ) {
                return false;
            }

            // In the case of TAB, we force step navigation always, overriding the browser
            // navigation between input elements, buttons and links.
            if ( event.keyCode === 9 ) {
                return true;
            }

            // With the sole exception of TAB, we also ignore keys pressed if shift is down.
            if ( event.shiftKey ) {
                return false;
            }

            if ( ( event.keyCode >= 32 && event.keyCode <= 34 ) ||
                 ( event.keyCode >= 37 && event.keyCode <= 40 ) ) {
                return true;
            }
        };

        // KEYBOARD NAVIGATION HANDLERS

        // Prevent default keydown action when one of supported key is pressed.
        gc.addEventListener( document, "keydown", function( event ) {
            if ( isNavigationEvent( event ) ) {
                event.preventDefault();
            }
        }, false );

        // Trigger impress action (next or prev) on keyup.
        gc.addEventListener( document, "keyup", function( event ) {
            if ( isNavigationEvent( event ) ) {
                if ( event.shiftKey ) {
                    switch ( event.keyCode ) {
                        case 9: // Shift+tab
                            api.prev();
                            break;
                    }
                } else {
                    switch ( event.keyCode ) {
                        case 33: // Pg up
                        case 37: // Left
                        case 38: // Up
                                 api.prev( event );
                                 break;
                        case 9:  // Tab
                        case 32: // Space
                        case 34: // Pg down
                        case 39: // Right
                        case 40: // Down
                                 api.next( event );
                                 break;
                    }
                }
                event.preventDefault();
            }
        }, false );

        // Delegated handler for clicking on the links to presentation steps
        gc.addEventListener( document, "click", function( event ) {

            // Event delegation with "bubbling"
            // check if event target (or any of its parents is a link)
            var target = event.target;
            try {
                while ( ( target.tagName !== "A" ) &&
                        ( target !== document.documentElement ) ) {
                    target = target.parentNode;
                }

                if ( target.tagName === "A" ) {
                    var href = target.getAttribute( "href" );

                    // If it's a link to presentation step, target this step
                    if ( href && href[ 0 ] === "#" ) {
                        target = document.getElementById( href.slice( 1 ) );
                    }
                }

                if ( api.goto( target ) ) {
                    event.stopImmediatePropagation();
                    event.preventDefault();
                }
            }
            catch ( err ) {

                // For example, when clicking on the button to launch speaker console, the button
                // is immediately deleted from the DOM. In this case target is a DOM element when
                // we get it, but turns out to be null if you try to actually do anything with it.
                if ( err instanceof TypeError &&
                     err.message === "target is null" ) {
                    return;
                }
                throw err;
            }
        }, false );

        // Delegated handler for clicking on step elements
        gc.addEventListener( document, "click", function( event ) {
            var target = event.target;
            try {

                // Find closest step element that is not active
                while ( !( target.classList.contains( "step" ) &&
                        !target.classList.contains( "active" ) ) &&
                        ( target !== document.documentElement ) ) {
                    target = target.parentNode;
                }

                if ( api.goto( target ) ) {
                    event.preventDefault();
                }
            }
            catch ( err ) {

                // For example, when clicking on the button to launch speaker console, the button
                // is immediately deleted from the DOM. In this case target is a DOM element when
                // we get it, but turns out to be null if you try to actually do anything with it.
                if ( err instanceof TypeError &&
                     err.message === "target is null" ) {
                    return;
                }
                throw err;
            }
        }, false );

        // Add a line to the help popup
        util.triggerEvent( document, "impress:help:add", { command: "Left &amp; Right",
                                                           text: "Previous &amp; Next step",
                                                           row: 1 } );

    }, false );

} )( document );


/**
 * Navigation UI plugin
 *
 * This plugin provides UI elements "back", "forward" and a list to select
 * a specific slide number.
 *
 * The navigation controls are added to the toolbar plugin via DOM events. User must enable the
 * toolbar in a presentation to have them visible.
 *
 * Copyright 2016 Henrik Ingo (@henrikingo)
 * Released under the MIT license.
 */

// This file contains so much HTML, that we will just respectfully disagree about js
/* jshint quotmark:single */
/* global document */

( function( document ) {
    'use strict';
    var toolbar;
    var api;
    var root;
    var steps;
    var hideSteps = [];
    var prev;
    var select;
    var next;

    var triggerEvent = function( el, eventName, detail ) {
        var event = document.createEvent( 'CustomEvent' );
        event.initCustomEvent( eventName, true, true, detail );
        el.dispatchEvent( event );
    };

    var makeDomElement = function( html ) {
        var tempDiv = document.createElement( 'div' );
        tempDiv.innerHTML = html;
        return tempDiv.firstChild;
    };

    var selectOptionsHtml = function() {
        var options = '';
        for ( var i = 0; i < steps.length; i++ ) {

            // Omit steps that are listed as hidden from select widget
            if ( hideSteps.indexOf( steps[ i ] ) < 0 ) {
                options = options + '<option value="' + steps[ i ].id + '">' + // jshint ignore:line
                                    steps[ i ].id + '</option>' + '\n'; // jshint ignore:line
            }
        }
        return options;
    };

    var addNavigationControls = function( event ) {
        api = event.detail.api;
        var gc = api.lib.gc;
        root = event.target;
        steps = root.querySelectorAll( '.step' );

        var prevHtml   = '<button id="impress-navigation-ui-prev" title="Previous" ' +
                         'class="impress-navigation-ui">&lt;</button>';
        var selectHtml = '<select id="impress-navigation-ui-select" title="Go to" ' +
                         'class="impress-navigation-ui">' + '\n' +
                           selectOptionsHtml() +
                           '</select>';
        var nextHtml   = '<button id="impress-navigation-ui-next" title="Next" ' +
                         'class="impress-navigation-ui">&gt;</button>';

        prev = makeDomElement( prevHtml );
        prev.addEventListener( 'click',
            function() {
                api.prev();
        } );
        select = makeDomElement( selectHtml );
        select.addEventListener( 'change',
            function( event ) {
                api.goto( event.target.value );
        } );
        gc.addEventListener( root, 'impress:steprefresh', function( event ) {

            // As impress.js core now allows to dynamically edit the steps, including adding,
            // removing, and reordering steps, we need to requery and redraw the select list on
            // every stepenter event.
            steps = root.querySelectorAll( '.step' );
            select.innerHTML = '\n' + selectOptionsHtml();

            // Make sure the list always shows the step we're actually on, even if it wasn't
            // selected from the list
            select.value = event.target.id;
        } );
        next = makeDomElement( nextHtml );
        next.addEventListener( 'click',
            function() {
                api.next();
        } );

        triggerEvent( toolbar, 'impress:toolbar:appendChild', { group: 0, element: prev } );
        triggerEvent( toolbar, 'impress:toolbar:appendChild', { group: 0, element: select } );
        triggerEvent( toolbar, 'impress:toolbar:appendChild', { group: 0, element: next } );

    };

    // API for not listing given step in the select widget.
    // For example, if you set class="skip" on some element, you may not want it to show up in the
    // list either. Otoh we cannot assume that, or anything else, so steps that user wants omitted
    // must be specifically added with this API call.
    document.addEventListener( 'impress:navigation-ui:hideStep', function( event ) {
        hideSteps.push( event.target );
        if ( select ) {
            select.innerHTML = selectOptionsHtml();
        }
    }, false );

    // Wait for impress.js to be initialized
    document.addEventListener( 'impress:init', function( event ) {
        toolbar = document.querySelector( '#impress-toolbar' );
        if ( toolbar ) {
            addNavigationControls( event );
        }
    }, false );

} )( document );


/* global document */
( function( document ) {
    "use strict";
    var root;
    var stepids = [];

    // Get stepids from the steps under impress root
    var getSteps = function() {
        stepids = [];
        var steps = root.querySelectorAll( ".step" );
        for ( var i = 0; i < steps.length; i++ )
        {
          stepids[ i + 1 ] = steps[ i ].id;
        }
        };

    // Wait for impress.js to be initialized
    document.addEventListener( "impress:init", function( event ) {
            root = event.target;
        getSteps();
        var gc = event.detail.api.lib.gc;
        gc.pushCallback( function() {
            stepids = [];
            if ( progressbar ) {
                progressbar.style.width = "";
                        }
            if ( progress ) {
                progress.innerHTML = "";
                        }
        } );
    } );

    var progressbar = document.querySelector( "div.impress-progressbar div" );
    var progress = document.querySelector( "div.impress-progress" );

    if ( null !== progressbar || null !== progress ) {
        document.addEventListener( "impress:stepleave", function( event ) {
            updateProgressbar( event.detail.next.id );
        } );

        document.addEventListener( "impress:steprefresh", function( event ) {
            getSteps();
            updateProgressbar( event.target.id );
        } );

    }

    function updateProgressbar( slideId ) {
        var slideNumber = stepids.indexOf( slideId );
        if ( null !== progressbar ) {
                        var width = 100 / ( stepids.length - 1 ) * ( slideNumber );
            progressbar.style.width = width.toFixed( 2 ) + "%";
        }
        if ( null !== progress ) {
            progress.innerHTML = slideNumber + "/" + ( stepids.length - 1 );
        }
    }
} )( document );

/**
 * Relative Positioning Plugin
 *
 * This plugin provides support for defining the coordinates of a step relative
 * to the previous step. This is often more convenient when creating presentations,
 * since as you add, remove or move steps, you may not need to edit the positions
 * as much as is the case with the absolute coordinates supported by impress.js
 * core.
 *
 * Example:
 *
 *         <!-- Position step 1000 px to the right and 500 px up from the previous step. -->
 *         <div class="step" data-rel-x="1000" data-rel-y="500">
 *
 * Following html attributes are supported for step elements:
 *
 *     data-rel-x
 *     data-rel-y
 *     data-rel-z
 *
 * These values are also inherited from the previous step. This makes it easy to
 * create a boring presentation where each slide shifts for example 1000px down
 * from the previous.
 *
 * In addition to plain numbers, which are pixel values, it is also possible to
 * define relative positions as a multiple of screen height and width, using
 * a unit of "h" and "w", respectively, appended to the number.
 *
 * Example:
 *
 *        <div class="step" data-rel-x="1.5w" data-rel-y="1.5h">
 *
 * This plugin is a *pre-init plugin*. It is called synchronously from impress.js
 * core at the beginning of `impress().init()`. This allows it to process its own
 * data attributes first, and possibly alter the data-x, data-y and data-z attributes
 * that will then be processed by `impress().init()`.
 *
 * (Another name for this kind of plugin might be called a *filter plugin*, but
 * *pre-init plugin* is more generic, as a plugin might do whatever it wants in
 * the pre-init stage.)
 *
 * Copyright 2016 Henrik Ingo (@henrikingo)
 * Released under the MIT license.
 */

/* global document, window */

( function( document, window ) {
    "use strict";

    var startingState = {};

    /**
     * Copied from core impress.js. We currently lack a library mechanism to
     * to share utility functions like this.
     */
    var toNumber = function( numeric, fallback ) {
        return isNaN( numeric ) ? ( fallback || 0 ) : Number( numeric );
    };

    /**
     * Extends toNumber() to correctly compute also relative-to-screen-size values 5w and 5h.
     *
     * Returns the computed value in pixels with w/h postfix removed.
     */
    var toNumberAdvanced = function( numeric, fallback ) {
        if ( typeof numeric !== "string" ) {
            return toNumber( numeric, fallback );
        }
        var ratio = numeric.match( /^([+-]*[\d\.]+)([wh])$/ );
        if ( ratio == null ) {
            return toNumber( numeric, fallback );
        } else {
            var value = parseFloat( ratio[ 1 ] );
            var multiplier = ratio[ 2 ] === "w" ? window.innerWidth : window.innerHeight;
            return value * multiplier;
        }
    };

    var computeRelativePositions = function( el, prev ) {
        var data = el.dataset;

        if ( !prev ) {

            // For the first step, inherit these defaults
            prev = { x:0, y:0, z:0, relative: { x:0, y:0, z:0 } };
        }

        if ( data.relTo ) {

            var ref = document.getElementById( data.relTo );
            if ( ref ) {

                // Test, if it is a previous step that already has some assigned position data
                if ( el.compareDocumentPosition( ref ) & Node.DOCUMENT_POSITION_PRECEDING ) {
                    prev.x = toNumber( ref.getAttribute( "data-x" ) );
                    prev.y = toNumber( ref.getAttribute( "data-y" ) );
                    prev.z = toNumber( ref.getAttribute( "data-z" ) );
                    prev.relative = {};
                } else {
                    window.console.error(
                        "impress.js rel plugin: Step \"" + data.relTo + "\" is not defined " +
                        "*before* the current step. Referencing is limited to previously defined " +
                        "steps. Please check your markup. Ignoring data-rel-to attribute of " +
                        "this step. Have a look at the documentation for how to create relative " +
                        "positioning to later shown steps with the help of the goto plugin."
                    );
                }
            } else {

                // Step not found
                window.console.warn(
                    "impress.js rel plugin: \"" + data.relTo + "\" is not a valid step in this " +
                    "impress.js presentation. Please check your markup. Ignoring data-rel-to " +
                    "attribute of this step."
                );
            }
        }

        var step = {
                x: toNumber( data.x, prev.x ),
                y: toNumber( data.y, prev.y ),
                z: toNumber( data.z, prev.z ),
                relative: {
                    x: toNumberAdvanced( data.relX, prev.relative.x ),
                    y: toNumberAdvanced( data.relY, prev.relative.y ),
                    z: toNumberAdvanced( data.relZ, prev.relative.z )
                }
            };

        // Relative position is ignored/zero if absolute is given.
        // Note that this also has the effect of resetting any inherited relative values.
        if ( data.x !== undefined ) {
            step.relative.x = 0;
        }
        if ( data.y !== undefined ) {
            step.relative.y = 0;
        }
        if ( data.z !== undefined ) {
            step.relative.z = 0;
        }

        // Apply relative position to absolute position, if non-zero
        // Note that at this point, the relative values contain a number value of pixels.
        step.x = step.x + step.relative.x;
        step.y = step.y + step.relative.y;
        step.z = step.z + step.relative.z;

        return step;
    };

    var rel = function( root ) {
        var steps = root.querySelectorAll( ".step" );
        var prev;
        startingState[ root.id ] = [];
        for ( var i = 0; i < steps.length; i++ ) {
            var el = steps[ i ];
            startingState[ root.id ].push( {
                el: el,
                x: el.getAttribute( "data-x" ),
                y: el.getAttribute( "data-y" ),
                z: el.getAttribute( "data-z" ),
                relX: el.getAttribute( "data-rel-x" ),
                relY: el.getAttribute( "data-rel-y" ),
                relZ: el.getAttribute( "data-rel-z" )
            } );
            var step = computeRelativePositions( el, prev );

            // Apply relative position (if non-zero)
            el.setAttribute( "data-x", step.x );
            el.setAttribute( "data-y", step.y );
            el.setAttribute( "data-z", step.z );
            prev = step;
        }
    };

    // Register the plugin to be called in pre-init phase
    window.impress.addPreInitPlugin( rel );

    // Register teardown callback to reset the data.x, .y, .z values.
    document.addEventListener( "impress:init", function( event ) {
        var root = event.target;
        event.detail.api.lib.gc.pushCallback( function() {
            var steps = startingState[ root.id ];
            var step;
            while ( step = steps.pop() ) {

                // Reset x/y/z in cases where this plugin has changed it.
                if ( step.relX !== null ) {
                    if ( step.x === null ) {
                        step.el.removeAttribute( "data-x" );
                    } else {
                        step.el.setAttribute( "data-x", step.x );
                    }
                }
                if ( step.relY !== null ) {
                    if ( step.y === null ) {
                        step.el.removeAttribute( "data-y" );
                    } else {
                        step.el.setAttribute( "data-y", step.y );
                    }
                }
                if ( step.relZ !== null ) {
                    if ( step.z === null ) {
                        step.el.removeAttribute( "data-z" );
                    } else {
                        step.el.setAttribute( "data-z", step.z );
                    }
                }
            }
            delete startingState[ root.id ];
        } );
    }, false );
} )( document, window );


/**
 * Resize plugin
 *
 * Rescale the presentation after a window resize.
 *
 * Copyright 2011-2012 Bartek Szopka (@bartaz)
 * Released under the MIT license.
 * ------------------------------------------------
 *  author:  Bartek Szopka
 *  version: 0.5.3
 *  url:     http://bartaz.github.com/impress.js/
 *  source:  http://github.com/bartaz/impress.js/
 *
 */

/* global document, window */

( function( document, window ) {
    "use strict";

    // Wait for impress.js to be initialized
    document.addEventListener( "impress:init", function( event ) {
        var api = event.detail.api;

        // Rescale presentation when window is resized
        api.lib.gc.addEventListener( window, "resize", api.lib.util.throttle( function() {

            // Force going to active step again, to trigger rescaling
            api.goto( document.querySelector( ".step.active" ), 500 );
        }, 250 ), false );
    }, false );

} )( document, window );


/**
 * Skip Plugin
 *
 * Example:
 *
 *    <!-- This slide is disabled in presentations, when moving with next()
 *         and prev() commands, but you can still move directly to it, for
 *         example with a url (anything using goto()). -->
 *         <div class="step skip">
 *
 * Copyright 2016 Henrik Ingo (@henrikingo)
 * Released under the MIT license.
 */

/* global document, window */

( function( document, window ) {
    "use strict";
    var util;

    document.addEventListener( "impress:init", function( event ) {
        util = event.detail.api.lib.util;
    }, false );

    var getNextStep = function( el ) {
        var steps = document.querySelectorAll( ".step" );
        for ( var i = 0; i < steps.length; i++ ) {
            if ( steps[ i ] === el ) {
                if ( i + 1 < steps.length ) {
                    return steps[ i + 1 ];
                } else {
                    return steps[ 0 ];
                }
            }
        }
    };
    var getPrevStep = function( el ) {
        var steps = document.querySelectorAll( ".step" );
        for ( var i = steps.length - 1; i >= 0; i-- ) {
            if ( steps[ i ] === el ) {
                if ( i - 1 >= 0 ) {
                    return steps[ i - 1 ];
                } else {
                    return steps[ steps.length - 1 ];
                }
            }
        }
    };

    var skip = function( event ) {
        if ( ( !event ) || ( !event.target ) ) {
            return;
        }

        if ( event.detail.next.classList.contains( "skip" ) ) {
            if ( event.detail.reason === "next" ) {

                // Go to the next next step instead
                event.detail.next = getNextStep( event.detail.next );

                // Recursively call this plugin again, until there's a step not to skip
                skip( event );
            } else if ( event.detail.reason === "prev" ) {

                // Go to the previous previous step instead
                event.detail.next = getPrevStep( event.detail.next );
                skip( event );
            }

            // If the new next element has its own transitionDuration, we're responsible for setting
            // that on the event as well
            event.detail.transitionDuration = util.toNumber(
                event.detail.next.dataset.transitionDuration, event.detail.transitionDuration
            );
        }
    };

    // Register the plugin to be called in pre-stepleave phase
    // The weight makes this plugin run early. This is a good thing, because this plugin calls
    // itself recursively.
    window.impress.addPreStepLeavePlugin( skip, 1 );

} )( document, window );


/**
 * Stop Plugin
 *
 * Example:
 *
 *        <!-- Stop at this slide.
 *             (For example, when used on the last slide, this prevents the
 *             presentation from wrapping back to the beginning.) -->
 *        <div class="step stop">
 *
 * Copyright 2016 Henrik Ingo (@henrikingo)
 * Released under the MIT license.
 */
/* global document, window */
( function( document, window ) {
    "use strict";

    var stop = function( event ) {
        if ( ( !event ) || ( !event.target ) ) {
            return;
        }

        if ( event.target.classList.contains( "stop" ) ) {
            if ( event.detail.reason === "next" ) {
                return false;
            }
        }
    };

    // Register the plugin to be called in pre-stepleave phase
    // The weight makes this plugin run fairly early.
    window.impress.addPreStepLeavePlugin( stop, 2 );

} )( document, window );


/**
 * Substep Plugin
 *
 * Copyright 2017 Henrik Ingo (@henrikingo)
 * Released under the MIT license.
 */

/* global document, window */

( function( document, window ) {
    "use strict";

    // Copied from core impress.js. Good candidate for moving to src/lib/util.js.
    var triggerEvent = function( el, eventName, detail ) {
        var event = document.createEvent( "CustomEvent" );
        event.initCustomEvent( eventName, true, true, detail );
        el.dispatchEvent( event );
    };

    var activeStep = null;
    document.addEventListener( "impress:stepenter", function( event ) {
        activeStep = event.target;
    }, false );

    var substep = function( event ) {
        if ( ( !event ) || ( !event.target ) ) {
            return;
        }

        var step = event.target;
        var el; // Needed by jshint
        if ( event.detail.reason === "next" ) {
            el = showSubstepIfAny( step );
            if ( el ) {

                // Send a message to others, that we aborted a stepleave event.
                triggerEvent( step, "impress:substep:stepleaveaborted",
                              { reason: "next", substep: el } );

                // Autoplay uses this for reloading itself
                triggerEvent( step, "impress:substep:enter",
                              { reason: "next", substep: el } );

                // Returning false aborts the stepleave event
                return false;
            }
        }
        if ( event.detail.reason === "prev" ) {
            el = hideSubstepIfAny( step );
            if ( el ) {
                triggerEvent( step, "impress:substep:stepleaveaborted",
                              { reason: "prev", substep: el } );

                triggerEvent( step, "impress:substep:leave",
                              { reason: "prev", substep: el } );

                return false;
            }
        }
    };

    var showSubstepIfAny = function( step ) {
        var substeps = step.querySelectorAll( ".substep" );
        var visible = step.querySelectorAll( ".substep-visible" );
        if ( substeps.length > 0 ) {
            return showSubstep( substeps, visible );
        }
    };

    var showSubstep = function( substeps, visible ) {
        if ( visible.length < substeps.length ) {
            for ( var i = 0; i < substeps.length; i++ ) {
                substeps[ i ].classList.remove( "substep-active" );
            }
            var el = substeps[ visible.length ];
            el.classList.add( "substep-visible" );
            el.classList.add( "substep-active" );
            return el;
        }
    };

    var hideSubstepIfAny = function( step ) {
        var substeps = step.querySelectorAll( ".substep" );
        var visible = step.querySelectorAll( ".substep-visible" );
        if ( substeps.length > 0 ) {
            return hideSubstep( visible );
        }
    };

    var hideSubstep = function( visible ) {
        if ( visible.length > 0 ) {
            var current = -1;
            for ( var i = 0; i < visible.length; i++ ) {
                if ( visible[ i ].classList.contains( "substep-active" ) ) {
                    current = i;
                }
                visible[ i ].classList.remove( "substep-active" );
            }
            if ( current > 0 ) {
                visible[ current - 1 ].classList.add( "substep-active" );
            }
            var el = visible[ visible.length - 1 ];
            el.classList.remove( "substep-visible" );
            return el;
        }
    };

    // Register the plugin to be called in pre-stepleave phase.
    // The weight makes this plugin run before other preStepLeave plugins.
    window.impress.addPreStepLeavePlugin( substep, 1 );

    // When entering a step, in particular when re-entering, make sure that all substeps are hidden
    // at first
    document.addEventListener( "impress:stepenter", function( event ) {
        var step = event.target;
        var visible = step.querySelectorAll( ".substep-visible" );
        for ( var i = 0; i < visible.length; i++ ) {
            visible[ i ].classList.remove( "substep-visible" );
        }
    }, false );

    // API for others to reveal/hide next substep ////////////////////////////////////////////////
    document.addEventListener( "impress:substep:show", function() {
        showSubstepIfAny( activeStep );
    }, false );

    document.addEventListener( "impress:substep:hide", function() {
        hideSubstepIfAny( activeStep );
    }, false );

} )( document, window );

/**
 * Support for swipe and tap on touch devices
 *
 * This plugin implements navigation for plugin devices, via swiping left/right,
 * or tapping on the left/right edges of the screen.
 *
 *
 *
 * Copyright 2015: Andrew Dunai (@and3rson)
 * Modified to a plugin, 2016: Henrik Ingo (@henrikingo)
 *
 * MIT License
 */
/* global document, window */
( function( document, window ) {
    "use strict";

    // Touch handler to detect swiping left and right based on window size.
    // If the difference in X change is bigger than 1/20 of the screen width,
    // we simply call an appropriate API function to complete the transition.
    var startX = 0;
    var lastX = 0;
    var lastDX = 0;
    var threshold = window.innerWidth / 20;

    document.addEventListener( "touchstart", function( event ) {
        lastX = startX = event.touches[ 0 ].clientX;
    } );

    document.addEventListener( "touchmove", function( event ) {
         var x = event.touches[ 0 ].clientX;
         var diff = x - startX;

         // To be used in touchend
         lastDX = lastX - x;
         lastX = x;

         window.impress().swipe( diff / window.innerWidth );
     } );

     document.addEventListener( "touchend", function() {
         var totalDiff = lastX - startX;
         if ( Math.abs( totalDiff ) > window.innerWidth / 5 && ( totalDiff * lastDX ) <= 0 ) {
             if ( totalDiff > window.innerWidth / 5 && lastDX <= 0 ) {
                 window.impress().prev();
             } else if ( totalDiff < -window.innerWidth / 5 && lastDX >= 0 ) {
                 window.impress().next();
             }
         } else if ( Math.abs( lastDX ) > threshold ) {
             if ( lastDX < -threshold ) {
                 window.impress().prev();
             } else if ( lastDX > threshold ) {
                 window.impress().next();
             }
         } else {

             // No movement - move (back) to the current slide
             window.impress().goto( document.querySelector( "#impress .step.active" ) );
         }
     } );

     document.addEventListener( "touchcancel", function() {

             // Move (back) to the current slide
             window.impress().goto( document.querySelector( "#impress .step.active" ) );
     } );

} )( document, window );

/**
 * Toolbar plugin
 *
 * This plugin provides a generic graphical toolbar. Other plugins that
 * want to expose a button or other widget, can add those to this toolbar.
 *
 * Using a single consolidated toolbar for all GUI widgets makes it easier
 * to position and style the toolbar rather than having to do that for lots
 * of different divs.
 *
 *
 * *** For presentation authors: *****************************************
 *
 * To add/activate the toolbar in your presentation, add this div:
 *
 *     <div id="impress-toolbar"></div>
 *
 * Styling the toolbar is left to presentation author. Here's an example CSS:
 *
 *    .impress-enabled div#impress-toolbar {
 *        position: fixed;
 *        right: 1px;
 *        bottom: 1px;
 *        opacity: 0.6;
 *    }
 *    .impress-enabled div#impress-toolbar > span {
 *        margin-right: 10px;
 *    }
 *
 * The [mouse-timeout](../mouse-timeout/README.md) plugin can be leveraged to hide
 * the toolbar from sight, and only make it visible when mouse is moved.
 *
 *    body.impress-mouse-timeout div#impress-toolbar {
 *        display: none;
 *    }
 *
 *
 * *** For plugin authors **********************************************
 *
 * To add a button to the toolbar, trigger the `impress:toolbar:appendChild`
 * or `impress:toolbar:insertBefore` events as appropriate. The detail object
 * should contain following parameters:
 *
 *    { group : 1,                       // integer. Widgets with the same group are grouped inside
 *                                       // the same <span> element.
 *      html : "<button>Click</button>", // The html to add.
 *      callback : "mycallback",         // Toolbar plugin will trigger event
 *                                       // `impress:toolbar:added:mycallback` when done.
 *      before: element }                // The reference element for an insertBefore() call.
 *
 * You should also listen to the `impress:toolbar:added:mycallback` event. At
 * this point you can find the new widget in the DOM, and for example add an
 * event listener to it.
 *
 * You are free to use any integer for the group. It's ok to leave gaps. It's
 * ok to co-locate with widgets for another plugin, if you think they belong
 * together.
 *
 * See navigation-ui for an example.
 *
 * Copyright 2016 Henrik Ingo (@henrikingo)
 * Released under the MIT license.
 */

/* global document */

( function( document ) {
    "use strict";
    var toolbar = document.getElementById( "impress-toolbar" );
    var groups = [];

    /**
     * Get the span element that is a child of toolbar, identified by index.
     *
     * If span element doesn't exist yet, it is created.
     *
     * Note: Because of Run-to-completion, this is not a race condition.
     * https://developer.mozilla.org/en/docs/Web/JavaScript/EventLoop#Run-to-completion
     *
     * :param: index   Method will return the element <span id="impress-toolbar-group-{index}">
     */
    var getGroupElement = function( index ) {
        var id = "impress-toolbar-group-" + index;
        if ( !groups[ index ] ) {
            groups[ index ] = document.createElement( "span" );
            groups[ index ].id = id;
            var nextIndex = getNextGroupIndex( index );
            if ( nextIndex === undefined ) {
                toolbar.appendChild( groups[ index ] );
            } else {
                toolbar.insertBefore( groups[ index ], groups[ nextIndex ] );
            }
        }
        return groups[ index ];
    };

    /**
     * Get the span element from groups[] that is immediately after given index.
     *
     * This can be used to find the reference node for an insertBefore() call.
     * If no element exists at a larger index, returns undefined. (In this case,
     * you'd use appendChild() instead.)
     *
     * Note that index needn't itself exist in groups[].
     */
    var getNextGroupIndex = function( index ) {
        var i = index + 1;
        while ( !groups[ i ] && i < groups.length ) {
            i++;
        }
        if ( i < groups.length ) {
            return i;
        }
    };

    // API
    // Other plugins can add and remove buttons by sending them as events.
    // In return, toolbar plugin will trigger events when button was added.
    if ( toolbar ) {
        /**
         * Append a widget inside toolbar span element identified by given group index.
         *
         * :param: e.detail.group    integer specifying the span element where widget will be placed
         * :param: e.detail.element  a dom element to add to the toolbar
         */
        toolbar.addEventListener( "impress:toolbar:appendChild", function( e ) {
            var group = getGroupElement( e.detail.group );
            group.appendChild( e.detail.element );
        } );

        /**
         * Add a widget to toolbar using insertBefore() DOM method.
         *
         * :param: e.detail.before   the reference dom element, before which new element is added
         * :param: e.detail.element  a dom element to add to the toolbar
         */
        toolbar.addEventListener( "impress:toolbar:insertBefore", function( e ) {
            toolbar.insertBefore( e.detail.element, e.detail.before );
        } );

        /**
         * Remove the widget in e.detail.remove.
         */
        toolbar.addEventListener( "impress:toolbar:removeWidget", function( e ) {
            toolbar.removeChild( e.detail.remove );
        } );

        document.addEventListener( "impress:init", function( event ) {
            var api = event.detail.api;
            api.lib.gc.pushCallback( function() {
                toolbar.innerHTML = "";
                groups = [];
            } );
        } );
    } // If toolbar

} )( document );


/***/ })

}]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvaW1wcmVzcy5qcy9qcy9pbXByZXNzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQSxLQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsd0JBQXdCLGlCQUFpQjtBQUN6QztBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBLCtDQUErQztBQUMvQzs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7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O0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLDRCQUE0QixxQkFBcUI7QUFDakQ7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBLEtBQUs7O0FBRUw7QUFDQTtBQUNBLEtBQUs7O0FBRUwsQ0FBQzs7O0FBR0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTOztBQUVUO0FBQ0EsYUFBYSxrRUFBa0U7O0FBRS9FLEtBQUs7O0FBRUwsQ0FBQzs7O0FBR0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLEtBQUs7O0FBRUw7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFD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QUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsc0RBQXNEO0FBQ3REO0FBQ0EsaUJBQWlCOztBQUVqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTs7QUFFYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsYUFBYTtBQUNiOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGdHQUFnRztBQUNoRyxrRUFBa0U7QUFDbEUsMEZBQTBGO0FBQzFGO0FBQ0EsK0ZBQStGO0FBQy9GLHNEQUFzRCxXQUFXLFlBQVk7QUFDN0U7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQSxnREFBZ0QsVUFBVTtBQUMxRCxnREFBZ0QsU0FBUztBQUN6RCxnREFBZ0QsS0FBSztBQUNyRCxxRkFBcUY7QUFDckY7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxTQUFTOztBQUVUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7O0FBRVQ7QUFDQSxpQ0FBaUM7QUFDakM7QUFDQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLHlCQUF5QixtREFBbUQ7QUFDNUUsS0FBSzs7QUFFTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFF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O0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1QsS0FBSzs7QUFFTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTCxDQUFDOzs7QUFHRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNULEtBQUs7O0FBRUwsQ0FBQzs7QUFFRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7O0FBRVQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTOztBQUVUO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7O0FBRVQ7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUzs7QUFFVDtBQUNBLDBEQUEwRCxxQkFBcUI7QUFDL0UsZ0ZBQWdGO0FBQ2hGLG1FQUFtRTs7QUFFbkUsS0FBSzs7QUFFTCxDQUFDOzs7QUFHRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0Esd0JBQXdCLGtCQUFrQjs7QUFFMUM7QUFDQTtBQUNBO0FBQ0EsdUVBQXVFO0FBQ3ZFO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSw0REFBNEQ7QUFDNUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDREQUE0RDs7QUFFNUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTOztBQUVULCtEQUErRCwwQkFBMEI7QUFDekYsK0RBQStELDRCQUE0QjtBQUMzRiwrREFBK0QsMEJBQTBCOztBQUV6Rjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7O0FBRUwsQ0FBQzs7O0FBR0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHdCQUF3QixrQkFBa0I7QUFDMUM7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1QsS0FBSzs7QUFFTDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7O0FBRVQ7QUFDQTtBQUNBO0FBQ0EsU0FBUzs7QUFFVDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUM7O0FBRUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7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O0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBLHlCQUF5QjtBQUN6QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx1RkFBdUYsTUFBTTtBQUM3RjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTOztBQUVUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTOztBQUVUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTOztBQUVUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2IsU0FBUztBQUNULEtBQUs7O0FBRUwsQ0FBQyIsImZpbGUiOiIzY2NkOWNjMzhhN2ZjZGQ1ZTNiZi8yLjIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBUaGlzIGZpbGUgd2FzIGF1dG9tYXRpY2FsbHkgZ2VuZXJhdGVkIGZyb20gZmlsZXMgaW4gc3JjLyBkaXJlY3RvcnkuXG5cbi8qISBMaWNlbnNlZCB1bmRlciBNSVQgTGljZW5zZSAtIGh0dHA6Ly9naXRodWIuY29tL2ltcHJlc3MvaW1wcmVzcy5qcyAqL1xuLyoqXG4gKiBpbXByZXNzLmpzXG4gKlxuICogaW1wcmVzcy5qcyBpcyBhIHByZXNlbnRhdGlvbiB0b29sIGJhc2VkIG9uIHRoZSBwb3dlciBvZiBDU1MzIHRyYW5zZm9ybXMgYW5kIHRyYW5zaXRpb25zXG4gKiBpbiBtb2Rlcm4gYnJvd3NlcnMgYW5kIGluc3BpcmVkIGJ5IHRoZSBpZGVhIGJlaGluZCBwcmV6aS5jb20uXG4gKlxuICpcbiAqIENvcHlyaWdodCAyMDExLTIwMTIgQmFydGVrIFN6b3BrYSAoQGJhcnRheiksIDIwMTYtMjAyMCBIZW5yaWsgSW5nbyAoQGhlbnJpa2luZ28pXG4gKlxuICogUmVsZWFzZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlLlxuICpcbiAqIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICogIGF1dGhvcjogIEJhcnRlayBTem9wa2EsIEhlbnJpayBJbmdvXG4gKiAgdmVyc2lvbjogMS4xLjBcbiAqICB1cmw6ICAgICBodHRwOi8vaW1wcmVzcy5qcy5vcmdcbiAqICBzb3VyY2U6ICBodHRwOi8vZ2l0aHViLmNvbS9pbXByZXNzL2ltcHJlc3MuanMvXG4gKi9cblxuLy8gWW91IGFyZSBvbmUgb2YgdGhvc2Ugd2hvIGxpa2UgdG8ga25vdyBob3cgdGhpbmdzIHdvcmsgaW5zaWRlP1xuLy8gTGV0IG1lIHNob3cgeW91IHRoZSBjb2dzIHRoYXQgbWFrZSBpbXByZXNzLmpzIHJ1bi4uLlxuKCBmdW5jdGlvbiggZG9jdW1lbnQsIHdpbmRvdyApIHtcbiAgICBcInVzZSBzdHJpY3RcIjtcbiAgICB2YXIgbGliO1xuXG4gICAgLy8gSEVMUEVSIEZVTkNUSU9OU1xuXG4gICAgLy8gYHBmeGAgaXMgYSBmdW5jdGlvbiB0aGF0IHRha2VzIGEgc3RhbmRhcmQgQ1NTIHByb3BlcnR5IG5hbWUgYXMgYSBwYXJhbWV0ZXJcbiAgICAvLyBhbmQgcmV0dXJucyBpdCdzIHByZWZpeGVkIHZlcnNpb24gdmFsaWQgZm9yIGN1cnJlbnQgYnJvd3NlciBpdCBydW5zIGluLlxuICAgIC8vIFRoZSBjb2RlIGlzIGhlYXZpbHkgaW5zcGlyZWQgYnkgTW9kZXJuaXpyIGh0dHA6Ly93d3cubW9kZXJuaXpyLmNvbS9cbiAgICB2YXIgcGZ4ID0gKCBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgc3R5bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCBcImR1bW15XCIgKS5zdHlsZSxcbiAgICAgICAgICAgIHByZWZpeGVzID0gXCJXZWJraXQgTW96IE8gbXMgS2h0bWxcIi5zcGxpdCggXCIgXCIgKSxcbiAgICAgICAgICAgIG1lbW9yeSA9IHt9O1xuXG4gICAgICAgIHJldHVybiBmdW5jdGlvbiggcHJvcCApIHtcbiAgICAgICAgICAgIGlmICggdHlwZW9mIG1lbW9yeVsgcHJvcCBdID09PSBcInVuZGVmaW5lZFwiICkge1xuXG4gICAgICAgICAgICAgICAgdmFyIHVjUHJvcCAgPSBwcm9wLmNoYXJBdCggMCApLnRvVXBwZXJDYXNlKCkgKyBwcm9wLnN1YnN0ciggMSApLFxuICAgICAgICAgICAgICAgICAgICBwcm9wcyAgID0gKCBwcm9wICsgXCIgXCIgKyBwcmVmaXhlcy5qb2luKCB1Y1Byb3AgKyBcIiBcIiApICsgdWNQcm9wICkuc3BsaXQoIFwiIFwiICk7XG5cbiAgICAgICAgICAgICAgICBtZW1vcnlbIHByb3AgXSA9IG51bGw7XG4gICAgICAgICAgICAgICAgZm9yICggdmFyIGkgaW4gcHJvcHMgKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICggc3R5bGVbIHByb3BzWyBpIF0gXSAhPT0gdW5kZWZpbmVkICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbWVtb3J5WyBwcm9wIF0gPSBwcm9wc1sgaSBdO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIG1lbW9yeVsgcHJvcCBdO1xuICAgICAgICB9O1xuXG4gICAgfSApKCk7XG5cbiAgICB2YXIgdmFsaWRhdGVPcmRlciA9IGZ1bmN0aW9uKCBvcmRlciwgZmFsbGJhY2sgKSB7XG4gICAgICAgIHZhciB2YWxpZENoYXJzID0gXCJ4eXpcIjtcbiAgICAgICAgdmFyIHJldHVyblN0ciA9IFwiXCI7XG4gICAgICAgIGlmICggdHlwZW9mIG9yZGVyID09PSBcInN0cmluZ1wiICkge1xuICAgICAgICAgICAgZm9yICggdmFyIGkgaW4gb3JkZXIuc3BsaXQoIFwiXCIgKSApIHtcbiAgICAgICAgICAgICAgICBpZiAoIHZhbGlkQ2hhcnMuaW5kZXhPZiggb3JkZXJbIGkgXSApID49IDAgKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVyblN0ciArPSBvcmRlclsgaSBdO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIEVhY2ggb2YgeCx5LHogY2FuIGJlIHVzZWQgb25seSBvbmNlLlxuICAgICAgICAgICAgICAgICAgICB2YWxpZENoYXJzID0gdmFsaWRDaGFycy5zcGxpdCggb3JkZXJbIGkgXSApLmpvaW4oIFwiXCIgKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCByZXR1cm5TdHIgKSB7XG4gICAgICAgICAgICByZXR1cm4gcmV0dXJuU3RyO1xuICAgICAgICB9IGVsc2UgaWYgKCBmYWxsYmFjayAhPT0gdW5kZWZpbmVkICkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbGxiYWNrO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIFwieHl6XCI7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLy8gYGNzc2AgZnVuY3Rpb24gYXBwbGllcyB0aGUgc3R5bGVzIGdpdmVuIGluIGBwcm9wc2Agb2JqZWN0IHRvIHRoZSBlbGVtZW50XG4gICAgLy8gZ2l2ZW4gYXMgYGVsYC4gSXQgcnVucyBhbGwgcHJvcGVydHkgbmFtZXMgdGhyb3VnaCBgcGZ4YCBmdW5jdGlvbiB0byBtYWtlXG4gICAgLy8gc3VyZSBwcm9wZXIgcHJlZml4ZWQgdmVyc2lvbiBvZiB0aGUgcHJvcGVydHkgaXMgdXNlZC5cbiAgICB2YXIgY3NzID0gZnVuY3Rpb24oIGVsLCBwcm9wcyApIHtcbiAgICAgICAgdmFyIGtleSwgcGtleTtcbiAgICAgICAgZm9yICgga2V5IGluIHByb3BzICkge1xuICAgICAgICAgICAgaWYgKCBwcm9wcy5oYXNPd25Qcm9wZXJ0eSgga2V5ICkgKSB7XG4gICAgICAgICAgICAgICAgcGtleSA9IHBmeCgga2V5ICk7XG4gICAgICAgICAgICAgICAgaWYgKCBwa2V5ICE9PSBudWxsICkge1xuICAgICAgICAgICAgICAgICAgICBlbC5zdHlsZVsgcGtleSBdID0gcHJvcHNbIGtleSBdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZWw7XG4gICAgfTtcblxuICAgIC8vIGB0cmFuc2xhdGVgIGJ1aWxkcyBhIHRyYW5zbGF0ZSB0cmFuc2Zvcm0gc3RyaW5nIGZvciBnaXZlbiBkYXRhLlxuICAgIHZhciB0cmFuc2xhdGUgPSBmdW5jdGlvbiggdCApIHtcbiAgICAgICAgcmV0dXJuIFwiIHRyYW5zbGF0ZTNkKFwiICsgdC54ICsgXCJweCxcIiArIHQueSArIFwicHgsXCIgKyB0LnogKyBcInB4KSBcIjtcbiAgICB9O1xuXG4gICAgLy8gYHJvdGF0ZWAgYnVpbGRzIGEgcm90YXRlIHRyYW5zZm9ybSBzdHJpbmcgZm9yIGdpdmVuIGRhdGEuXG4gICAgLy8gQnkgZGVmYXVsdCB0aGUgcm90YXRpb25zIGFyZSBpbiBYIFkgWiBvcmRlciB0aGF0IGNhbiBiZSByZXZlcnRlZCBieSBwYXNzaW5nIGB0cnVlYFxuICAgIC8vIGFzIHNlY29uZCBwYXJhbWV0ZXIuXG4gICAgdmFyIHJvdGF0ZSA9IGZ1bmN0aW9uKCByLCByZXZlcnQgKSB7XG4gICAgICAgIHZhciBvcmRlciA9IHIub3JkZXIgPyByLm9yZGVyIDogXCJ4eXpcIjtcbiAgICAgICAgdmFyIGNzcyA9IFwiXCI7XG4gICAgICAgIHZhciBheGVzID0gb3JkZXIuc3BsaXQoIFwiXCIgKTtcbiAgICAgICAgaWYgKCByZXZlcnQgKSB7XG4gICAgICAgICAgICBheGVzID0gYXhlcy5yZXZlcnNlKCk7XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKCB2YXIgaSA9IDA7IGkgPCBheGVzLmxlbmd0aDsgaSsrICkge1xuICAgICAgICAgICAgY3NzICs9IFwiIHJvdGF0ZVwiICsgYXhlc1sgaSBdLnRvVXBwZXJDYXNlKCkgKyBcIihcIiArIHJbIGF4ZXNbIGkgXSBdICsgXCJkZWcpXCI7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNzcztcbiAgICB9O1xuXG4gICAgLy8gYHNjYWxlYCBidWlsZHMgYSBzY2FsZSB0cmFuc2Zvcm0gc3RyaW5nIGZvciBnaXZlbiBkYXRhLlxuICAgIHZhciBzY2FsZSA9IGZ1bmN0aW9uKCBzICkge1xuICAgICAgICByZXR1cm4gXCIgc2NhbGUoXCIgKyBzICsgXCIpIFwiO1xuICAgIH07XG5cbiAgICAvLyBgY29tcHV0ZVdpbmRvd1NjYWxlYCBjb3VudHMgdGhlIHNjYWxlIGZhY3RvciBiZXR3ZWVuIHdpbmRvdyBzaXplIGFuZCBzaXplXG4gICAgLy8gZGVmaW5lZCBmb3IgdGhlIHByZXNlbnRhdGlvbiBpbiB0aGUgY29uZmlnLlxuICAgIHZhciBjb21wdXRlV2luZG93U2NhbGUgPSBmdW5jdGlvbiggY29uZmlnICkge1xuICAgICAgICB2YXIgaFNjYWxlID0gd2luZG93LmlubmVySGVpZ2h0IC8gY29uZmlnLmhlaWdodCxcbiAgICAgICAgICAgIHdTY2FsZSA9IHdpbmRvdy5pbm5lcldpZHRoIC8gY29uZmlnLndpZHRoLFxuICAgICAgICAgICAgc2NhbGUgPSBoU2NhbGUgPiB3U2NhbGUgPyB3U2NhbGUgOiBoU2NhbGU7XG5cbiAgICAgICAgaWYgKCBjb25maWcubWF4U2NhbGUgJiYgc2NhbGUgPiBjb25maWcubWF4U2NhbGUgKSB7XG4gICAgICAgICAgICBzY2FsZSA9IGNvbmZpZy5tYXhTY2FsZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICggY29uZmlnLm1pblNjYWxlICYmIHNjYWxlIDwgY29uZmlnLm1pblNjYWxlICkge1xuICAgICAgICAgICAgc2NhbGUgPSBjb25maWcubWluU2NhbGU7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gc2NhbGU7XG4gICAgfTtcblxuICAgIC8vIENIRUNLIFNVUFBPUlRcbiAgICB2YXIgYm9keSA9IGRvY3VtZW50LmJvZHk7XG4gICAgdmFyIGltcHJlc3NTdXBwb3J0ZWQgPVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEJyb3dzZXIgc2hvdWxkIHN1cHBvcnQgQ1NTIDNEIHRyYW5zdG9ybXNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICggcGZ4KCBcInBlcnNwZWN0aXZlXCIgKSAhPT0gbnVsbCApICYmXG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gQW5kIGBjbGFzc0xpc3RgIGFuZCBgZGF0YXNldGAgQVBJc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgKCBib2R5LmNsYXNzTGlzdCApICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAoIGJvZHkuZGF0YXNldCApO1xuXG4gICAgaWYgKCAhaW1wcmVzc1N1cHBvcnRlZCApIHtcblxuICAgICAgICAvLyBXZSBjYW4ndCBiZSBzdXJlIHRoYXQgYGNsYXNzTGlzdGAgaXMgc3VwcG9ydGVkXG4gICAgICAgIGJvZHkuY2xhc3NOYW1lICs9IFwiIGltcHJlc3Mtbm90LXN1cHBvcnRlZCBcIjtcbiAgICB9XG5cbiAgICAvLyBHTE9CQUxTIEFORCBERUZBVUxUU1xuXG4gICAgLy8gVGhpcyBpcyB3aGVyZSB0aGUgcm9vdCBlbGVtZW50cyBvZiBhbGwgaW1wcmVzcy5qcyBpbnN0YW5jZXMgd2lsbCBiZSBrZXB0LlxuICAgIC8vIFllcywgdGhpcyBtZWFucyB5b3UgY2FuIGhhdmUgbW9yZSB0aGFuIG9uZSBpbnN0YW5jZSBvbiBhIHBhZ2UsIGJ1dCBJJ20gbm90XG4gICAgLy8gc3VyZSBpZiBpdCBtYWtlcyBhbnkgc2Vuc2UgaW4gcHJhY3RpY2UgOylcbiAgICB2YXIgcm9vdHMgPSB7fTtcblxuICAgIHZhciBwcmVJbml0UGx1Z2lucyA9IFtdO1xuICAgIHZhciBwcmVTdGVwTGVhdmVQbHVnaW5zID0gW107XG5cbiAgICAvLyBTb21lIGRlZmF1bHQgY29uZmlnIHZhbHVlcy5cbiAgICB2YXIgZGVmYXVsdHMgPSB7XG4gICAgICAgIHdpZHRoOiAxMDI0LFxuICAgICAgICBoZWlnaHQ6IDc2OCxcbiAgICAgICAgbWF4U2NhbGU6IDEsXG4gICAgICAgIG1pblNjYWxlOiAwLFxuXG4gICAgICAgIHBlcnNwZWN0aXZlOiAxMDAwLFxuXG4gICAgICAgIHRyYW5zaXRpb25EdXJhdGlvbjogMTAwMFxuICAgIH07XG5cbiAgICAvLyBJdCdzIGp1c3QgYW4gZW1wdHkgZnVuY3Rpb24gLi4uIGFuZCBhIHVzZWxlc3MgY29tbWVudC5cbiAgICB2YXIgZW1wdHkgPSBmdW5jdGlvbigpIHsgcmV0dXJuIGZhbHNlOyB9O1xuXG4gICAgLy8gSU1QUkVTUy5KUyBBUElcblxuICAgIC8vIEFuZCB0aGF0J3Mgd2hlcmUgaW50ZXJlc3RpbmcgdGhpbmdzIHdpbGwgc3RhcnQgdG8gaGFwcGVuLlxuICAgIC8vIEl0J3MgdGhlIGNvcmUgYGltcHJlc3NgIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyB0aGUgaW1wcmVzcy5qcyBBUElcbiAgICAvLyBmb3IgYSBwcmVzZW50YXRpb24gYmFzZWQgb24gdGhlIGVsZW1lbnQgd2l0aCBnaXZlbiBpZCAoXCJpbXByZXNzXCJcbiAgICAvLyBieSBkZWZhdWx0KS5cbiAgICB2YXIgaW1wcmVzcyA9IHdpbmRvdy5pbXByZXNzID0gZnVuY3Rpb24oIHJvb3RJZCApIHtcblxuICAgICAgICAvLyBJZiBpbXByZXNzLmpzIGlzIG5vdCBzdXBwb3J0ZWQgYnkgdGhlIGJyb3dzZXIgcmV0dXJuIGEgZHVtbXkgQVBJXG4gICAgICAgIC8vIGl0IG1heSBub3QgYmUgYSBwZXJmZWN0IHNvbHV0aW9uIGJ1dCB3ZSByZXR1cm4gZWFybHkgYW5kIGF2b2lkXG4gICAgICAgIC8vIHJ1bm5pbmcgY29kZSB0aGF0IG1heSB1c2UgZmVhdHVyZXMgbm90IGltcGxlbWVudGVkIGluIHRoZSBicm93c2VyLlxuICAgICAgICBpZiAoICFpbXByZXNzU3VwcG9ydGVkICkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBpbml0OiBlbXB0eSxcbiAgICAgICAgICAgICAgICBnb3RvOiBlbXB0eSxcbiAgICAgICAgICAgICAgICBwcmV2OiBlbXB0eSxcbiAgICAgICAgICAgICAgICBuZXh0OiBlbXB0eSxcbiAgICAgICAgICAgICAgICBzd2lwZTogZW1wdHksXG4gICAgICAgICAgICAgICAgdGVhcjogZW1wdHksXG4gICAgICAgICAgICAgICAgbGliOiB7fVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJvb3RJZCA9IHJvb3RJZCB8fCBcImltcHJlc3NcIjtcblxuICAgICAgICAvLyBJZiBnaXZlbiByb290IGlzIGFscmVhZHkgaW5pdGlhbGl6ZWQganVzdCByZXR1cm4gdGhlIEFQSVxuICAgICAgICBpZiAoIHJvb3RzWyBcImltcHJlc3Mtcm9vdC1cIiArIHJvb3RJZCBdICkge1xuICAgICAgICAgICAgcmV0dXJuIHJvb3RzWyBcImltcHJlc3Mtcm9vdC1cIiArIHJvb3RJZCBdO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gVGhlIGdjIGxpYnJhcnkgZGVwZW5kcyBvbiBiZWluZyBpbml0aWFsaXplZCBiZWZvcmUgd2UgZG8gYW55IGNoYW5nZXMgdG8gRE9NLlxuICAgICAgICBsaWIgPSBpbml0TGlicmFyaWVzKCByb290SWQgKTtcblxuICAgICAgICBib2R5LmNsYXNzTGlzdC5yZW1vdmUoIFwiaW1wcmVzcy1ub3Qtc3VwcG9ydGVkXCIgKTtcbiAgICAgICAgYm9keS5jbGFzc0xpc3QuYWRkKCBcImltcHJlc3Mtc3VwcG9ydGVkXCIgKTtcblxuICAgICAgICAvLyBEYXRhIG9mIGFsbCBwcmVzZW50YXRpb24gc3RlcHNcbiAgICAgICAgdmFyIHN0ZXBzRGF0YSA9IHt9O1xuXG4gICAgICAgIC8vIEVsZW1lbnQgb2YgY3VycmVudGx5IGFjdGl2ZSBzdGVwXG4gICAgICAgIHZhciBhY3RpdmVTdGVwID0gbnVsbDtcblxuICAgICAgICAvLyBDdXJyZW50IHN0YXRlIChwb3NpdGlvbiwgcm90YXRpb24gYW5kIHNjYWxlKSBvZiB0aGUgcHJlc2VudGF0aW9uXG4gICAgICAgIHZhciBjdXJyZW50U3RhdGUgPSBudWxsO1xuXG4gICAgICAgIC8vIEFycmF5IG9mIHN0ZXAgZWxlbWVudHNcbiAgICAgICAgdmFyIHN0ZXBzID0gbnVsbDtcblxuICAgICAgICAvLyBDb25maWd1cmF0aW9uIG9wdGlvbnNcbiAgICAgICAgdmFyIGNvbmZpZyA9IG51bGw7XG5cbiAgICAgICAgLy8gU2NhbGUgZmFjdG9yIG9mIHRoZSBicm93c2VyIHdpbmRvd1xuICAgICAgICB2YXIgd2luZG93U2NhbGUgPSBudWxsO1xuXG4gICAgICAgIC8vIFJvb3QgcHJlc2VudGF0aW9uIGVsZW1lbnRzXG4gICAgICAgIHZhciByb290ID0gbGliLnV0aWwuYnlJZCggcm9vdElkICk7XG4gICAgICAgIHZhciBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCBcImRpdlwiICk7XG5cbiAgICAgICAgdmFyIGluaXRpYWxpemVkID0gZmFsc2U7XG5cbiAgICAgICAgLy8gU1RFUCBFVkVOVFNcbiAgICAgICAgLy9cbiAgICAgICAgLy8gVGhlcmUgYXJlIGN1cnJlbnRseSB0d28gc3RlcCBldmVudHMgdHJpZ2dlcmVkIGJ5IGltcHJlc3MuanNcbiAgICAgICAgLy8gYGltcHJlc3M6c3RlcGVudGVyYCBpcyB0cmlnZ2VyZWQgd2hlbiB0aGUgc3RlcCBpcyBzaG93biBvbiB0aGVcbiAgICAgICAgLy8gc2NyZWVuICh0aGUgdHJhbnNpdGlvbiBmcm9tIHRoZSBwcmV2aW91cyBvbmUgaXMgZmluaXNoZWQpIGFuZFxuICAgICAgICAvLyBgaW1wcmVzczpzdGVwbGVhdmVgIGlzIHRyaWdnZXJlZCB3aGVuIHRoZSBzdGVwIGlzIGxlZnQgKHRoZVxuICAgICAgICAvLyB0cmFuc2l0aW9uIHRvIG5leHQgc3RlcCBqdXN0IHN0YXJ0cykuXG5cbiAgICAgICAgLy8gUmVmZXJlbmNlIHRvIGxhc3QgZW50ZXJlZCBzdGVwXG4gICAgICAgIHZhciBsYXN0RW50ZXJlZCA9IG51bGw7XG5cbiAgICAgICAgLy8gYG9uU3RlcEVudGVyYCBpcyBjYWxsZWQgd2hlbmV2ZXIgdGhlIHN0ZXAgZWxlbWVudCBpcyBlbnRlcmVkXG4gICAgICAgIC8vIGJ1dCB0aGUgZXZlbnQgaXMgdHJpZ2dlcmVkIG9ubHkgaWYgdGhlIHN0ZXAgaXMgZGlmZmVyZW50IHRoYW5cbiAgICAgICAgLy8gbGFzdCBlbnRlcmVkIHN0ZXAuXG4gICAgICAgIC8vIFdlIHNvbWV0aW1lcyBjYWxsIGBnb3RvYCwgYW5kIHRoZXJlZm9yZSBgb25TdGVwRW50ZXJgLCBqdXN0IHRvIHJlZHJhdyBhIHN0ZXAsIHN1Y2ggYXNcbiAgICAgICAgLy8gYWZ0ZXIgc2NyZWVuIHJlc2l6ZS4gSW4gdGhpcyBjYXNlIC0gbW9yZSBwcmVjaXNlbHksIGluIGFueSBjYXNlIC0gd2UgdHJpZ2dlciBhXG4gICAgICAgIC8vIGBpbXByZXNzOnN0ZXByZWZyZXNoYCBldmVudC5cbiAgICAgICAgdmFyIG9uU3RlcEVudGVyID0gZnVuY3Rpb24oIHN0ZXAgKSB7XG4gICAgICAgICAgICBpZiAoIGxhc3RFbnRlcmVkICE9PSBzdGVwICkge1xuICAgICAgICAgICAgICAgIGxpYi51dGlsLnRyaWdnZXJFdmVudCggc3RlcCwgXCJpbXByZXNzOnN0ZXBlbnRlclwiICk7XG4gICAgICAgICAgICAgICAgbGFzdEVudGVyZWQgPSBzdGVwO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbGliLnV0aWwudHJpZ2dlckV2ZW50KCBzdGVwLCBcImltcHJlc3M6c3RlcHJlZnJlc2hcIiApO1xuICAgICAgICB9O1xuXG4gICAgICAgIC8vIGBvblN0ZXBMZWF2ZWAgaXMgY2FsbGVkIHdoZW5ldmVyIHRoZSBjdXJyZW50U3RlcCBlbGVtZW50IGlzIGxlZnRcbiAgICAgICAgLy8gYnV0IHRoZSBldmVudCBpcyB0cmlnZ2VyZWQgb25seSBpZiB0aGUgY3VycmVudFN0ZXAgaXMgdGhlIHNhbWUgYXNcbiAgICAgICAgLy8gbGFzdEVudGVyZWQgc3RlcC5cbiAgICAgICAgdmFyIG9uU3RlcExlYXZlID0gZnVuY3Rpb24oIGN1cnJlbnRTdGVwLCBuZXh0U3RlcCApIHtcbiAgICAgICAgICAgIGlmICggbGFzdEVudGVyZWQgPT09IGN1cnJlbnRTdGVwICkge1xuICAgICAgICAgICAgICAgIGxpYi51dGlsLnRyaWdnZXJFdmVudCggY3VycmVudFN0ZXAsIFwiaW1wcmVzczpzdGVwbGVhdmVcIiwgeyBuZXh0OiBuZXh0U3RlcCB9ICk7XG4gICAgICAgICAgICAgICAgbGFzdEVudGVyZWQgPSBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIC8vIGBpbml0U3RlcGAgaW5pdGlhbGl6ZXMgZ2l2ZW4gc3RlcCBlbGVtZW50IGJ5IHJlYWRpbmcgZGF0YSBmcm9tIGl0c1xuICAgICAgICAvLyBkYXRhIGF0dHJpYnV0ZXMgYW5kIHNldHRpbmcgY29ycmVjdCBzdHlsZXMuXG4gICAgICAgIHZhciBpbml0U3RlcCA9IGZ1bmN0aW9uKCBlbCwgaWR4ICkge1xuICAgICAgICAgICAgdmFyIGRhdGEgPSBlbC5kYXRhc2V0LFxuICAgICAgICAgICAgICAgIHN0ZXAgPSB7XG4gICAgICAgICAgICAgICAgICAgIHRyYW5zbGF0ZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgeDogbGliLnV0aWwudG9OdW1iZXIoIGRhdGEueCApLFxuICAgICAgICAgICAgICAgICAgICAgICAgeTogbGliLnV0aWwudG9OdW1iZXIoIGRhdGEueSApLFxuICAgICAgICAgICAgICAgICAgICAgICAgejogbGliLnV0aWwudG9OdW1iZXIoIGRhdGEueiApXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHJvdGF0ZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgeDogbGliLnV0aWwudG9OdW1iZXIoIGRhdGEucm90YXRlWCApLFxuICAgICAgICAgICAgICAgICAgICAgICAgeTogbGliLnV0aWwudG9OdW1iZXIoIGRhdGEucm90YXRlWSApLFxuICAgICAgICAgICAgICAgICAgICAgICAgejogbGliLnV0aWwudG9OdW1iZXIoIGRhdGEucm90YXRlWiB8fCBkYXRhLnJvdGF0ZSApLFxuICAgICAgICAgICAgICAgICAgICAgICAgb3JkZXI6IHZhbGlkYXRlT3JkZXIoIGRhdGEucm90YXRlT3JkZXIgKVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBzY2FsZTogbGliLnV0aWwudG9OdW1iZXIoIGRhdGEuc2NhbGUsIDEgKSxcbiAgICAgICAgICAgICAgICAgICAgdHJhbnNpdGlvbkR1cmF0aW9uOiBsaWIudXRpbC50b051bWJlcihcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEudHJhbnNpdGlvbkR1cmF0aW9uLCBjb25maWcudHJhbnNpdGlvbkR1cmF0aW9uXG4gICAgICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgICAgIGVsOiBlbFxuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGlmICggIWVsLmlkICkge1xuICAgICAgICAgICAgICAgIGVsLmlkID0gXCJzdGVwLVwiICsgKCBpZHggKyAxICk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHN0ZXBzRGF0YVsgXCJpbXByZXNzLVwiICsgZWwuaWQgXSA9IHN0ZXA7XG5cbiAgICAgICAgICAgIGNzcyggZWwsIHtcbiAgICAgICAgICAgICAgICBwb3NpdGlvbjogXCJhYnNvbHV0ZVwiLFxuICAgICAgICAgICAgICAgIHRyYW5zZm9ybTogXCJ0cmFuc2xhdGUoLTUwJSwtNTAlKVwiICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIHRyYW5zbGF0ZSggc3RlcC50cmFuc2xhdGUgKSArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICByb3RhdGUoIHN0ZXAucm90YXRlICkgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgc2NhbGUoIHN0ZXAuc2NhbGUgKSxcbiAgICAgICAgICAgICAgICB0cmFuc2Zvcm1TdHlsZTogXCJwcmVzZXJ2ZS0zZFwiXG4gICAgICAgICAgICB9ICk7XG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gSW5pdGlhbGl6ZSBhbGwgc3RlcHMuXG4gICAgICAgIC8vIFJlYWQgdGhlIGRhdGEtKiBhdHRyaWJ1dGVzLCBzdG9yZSBpbiBpbnRlcm5hbCBzdGVwc0RhdGEsIGFuZCByZW5kZXIgd2l0aCBDU1MuXG4gICAgICAgIHZhciBpbml0QWxsU3RlcHMgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHN0ZXBzID0gbGliLnV0aWwuJCQoIFwiLnN0ZXBcIiwgcm9vdCApO1xuICAgICAgICAgICAgc3RlcHMuZm9yRWFjaCggaW5pdFN0ZXAgKTtcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBgaW5pdGAgQVBJIGZ1bmN0aW9uIHRoYXQgaW5pdGlhbGl6ZXMgKGFuZCBydW5zKSB0aGUgcHJlc2VudGF0aW9uLlxuICAgICAgICB2YXIgaW5pdCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaWYgKCBpbml0aWFsaXplZCApIHsgcmV0dXJuOyB9XG4gICAgICAgICAgICBleGVjUHJlSW5pdFBsdWdpbnMoIHJvb3QgKTtcblxuICAgICAgICAgICAgLy8gRmlyc3Qgd2Ugc2V0IHVwIHRoZSB2aWV3cG9ydCBmb3IgbW9iaWxlIGRldmljZXMuXG4gICAgICAgICAgICAvLyBGb3Igc29tZSByZWFzb24gaVBhZCBnb2VzIG51dHMgd2hlbiBpdCBpcyBub3QgZG9uZSBwcm9wZXJseS5cbiAgICAgICAgICAgIHZhciBtZXRhID0gbGliLnV0aWwuJCggXCJtZXRhW25hbWU9J3ZpZXdwb3J0J11cIiApIHx8IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoIFwibWV0YVwiICk7XG4gICAgICAgICAgICBtZXRhLmNvbnRlbnQgPSBcIndpZHRoPWRldmljZS13aWR0aCwgbWluaW11bS1zY2FsZT0xLCBtYXhpbXVtLXNjYWxlPTEsIHVzZXItc2NhbGFibGU9bm9cIjtcbiAgICAgICAgICAgIGlmICggbWV0YS5wYXJlbnROb2RlICE9PSBkb2N1bWVudC5oZWFkICkge1xuICAgICAgICAgICAgICAgIG1ldGEubmFtZSA9IFwidmlld3BvcnRcIjtcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKCBtZXRhICk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIEluaXRpYWxpemUgY29uZmlndXJhdGlvbiBvYmplY3RcbiAgICAgICAgICAgIHZhciByb290RGF0YSA9IHJvb3QuZGF0YXNldDtcbiAgICAgICAgICAgIGNvbmZpZyA9IHtcbiAgICAgICAgICAgICAgICB3aWR0aDogbGliLnV0aWwudG9OdW1iZXIoIHJvb3REYXRhLndpZHRoLCBkZWZhdWx0cy53aWR0aCApLFxuICAgICAgICAgICAgICAgIGhlaWdodDogbGliLnV0aWwudG9OdW1iZXIoIHJvb3REYXRhLmhlaWdodCwgZGVmYXVsdHMuaGVpZ2h0ICksXG4gICAgICAgICAgICAgICAgbWF4U2NhbGU6IGxpYi51dGlsLnRvTnVtYmVyKCByb290RGF0YS5tYXhTY2FsZSwgZGVmYXVsdHMubWF4U2NhbGUgKSxcbiAgICAgICAgICAgICAgICBtaW5TY2FsZTogbGliLnV0aWwudG9OdW1iZXIoIHJvb3REYXRhLm1pblNjYWxlLCBkZWZhdWx0cy5taW5TY2FsZSApLFxuICAgICAgICAgICAgICAgIHBlcnNwZWN0aXZlOiBsaWIudXRpbC50b051bWJlciggcm9vdERhdGEucGVyc3BlY3RpdmUsIGRlZmF1bHRzLnBlcnNwZWN0aXZlICksXG4gICAgICAgICAgICAgICAgdHJhbnNpdGlvbkR1cmF0aW9uOiBsaWIudXRpbC50b051bWJlcihcbiAgICAgICAgICAgICAgICAgICAgcm9vdERhdGEudHJhbnNpdGlvbkR1cmF0aW9uLCBkZWZhdWx0cy50cmFuc2l0aW9uRHVyYXRpb25cbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICB3aW5kb3dTY2FsZSA9IGNvbXB1dGVXaW5kb3dTY2FsZSggY29uZmlnICk7XG5cbiAgICAgICAgICAgIC8vIFdyYXAgc3RlcHMgd2l0aCBcImNhbnZhc1wiIGVsZW1lbnRcbiAgICAgICAgICAgIGxpYi51dGlsLmFycmF5aWZ5KCByb290LmNoaWxkTm9kZXMgKS5mb3JFYWNoKCBmdW5jdGlvbiggZWwgKSB7XG4gICAgICAgICAgICAgICAgY2FudmFzLmFwcGVuZENoaWxkKCBlbCApO1xuICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgcm9vdC5hcHBlbmRDaGlsZCggY2FudmFzICk7XG5cbiAgICAgICAgICAgIC8vIFNldCBpbml0aWFsIHN0eWxlc1xuICAgICAgICAgICAgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnN0eWxlLmhlaWdodCA9IFwiMTAwJVwiO1xuXG4gICAgICAgICAgICBjc3MoIGJvZHksIHtcbiAgICAgICAgICAgICAgICBoZWlnaHQ6IFwiMTAwJVwiLFxuICAgICAgICAgICAgICAgIG92ZXJmbG93OiBcImhpZGRlblwiXG4gICAgICAgICAgICB9ICk7XG5cbiAgICAgICAgICAgIHZhciByb290U3R5bGVzID0ge1xuICAgICAgICAgICAgICAgIHBvc2l0aW9uOiBcImFic29sdXRlXCIsXG4gICAgICAgICAgICAgICAgdHJhbnNmb3JtT3JpZ2luOiBcInRvcCBsZWZ0XCIsXG4gICAgICAgICAgICAgICAgdHJhbnNpdGlvbjogXCJhbGwgMHMgZWFzZS1pbi1vdXRcIixcbiAgICAgICAgICAgICAgICB0cmFuc2Zvcm1TdHlsZTogXCJwcmVzZXJ2ZS0zZFwiXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBjc3MoIHJvb3QsIHJvb3RTdHlsZXMgKTtcbiAgICAgICAgICAgIGNzcyggcm9vdCwge1xuICAgICAgICAgICAgICAgIHRvcDogXCI1MCVcIixcbiAgICAgICAgICAgICAgICBsZWZ0OiBcIjUwJVwiLFxuICAgICAgICAgICAgICAgIHBlcnNwZWN0aXZlOiAoIGNvbmZpZy5wZXJzcGVjdGl2ZSAvIHdpbmRvd1NjYWxlICkgKyBcInB4XCIsXG4gICAgICAgICAgICAgICAgdHJhbnNmb3JtOiBzY2FsZSggd2luZG93U2NhbGUgKVxuICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgY3NzKCBjYW52YXMsIHJvb3RTdHlsZXMgKTtcblxuICAgICAgICAgICAgYm9keS5jbGFzc0xpc3QucmVtb3ZlKCBcImltcHJlc3MtZGlzYWJsZWRcIiApO1xuICAgICAgICAgICAgYm9keS5jbGFzc0xpc3QuYWRkKCBcImltcHJlc3MtZW5hYmxlZFwiICk7XG5cbiAgICAgICAgICAgIC8vIEdldCBhbmQgaW5pdCBzdGVwc1xuICAgICAgICAgICAgaW5pdEFsbFN0ZXBzKCk7XG5cbiAgICAgICAgICAgIC8vIFNldCBhIGRlZmF1bHQgaW5pdGlhbCBzdGF0ZSBvZiB0aGUgY2FudmFzXG4gICAgICAgICAgICBjdXJyZW50U3RhdGUgPSB7XG4gICAgICAgICAgICAgICAgdHJhbnNsYXRlOiB7IHg6IDAsIHk6IDAsIHo6IDAgfSxcbiAgICAgICAgICAgICAgICByb3RhdGU6ICAgIHsgeDogMCwgeTogMCwgejogMCwgb3JkZXI6IFwieHl6XCIgfSxcbiAgICAgICAgICAgICAgICBzY2FsZTogICAgIDFcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGluaXRpYWxpemVkID0gdHJ1ZTtcblxuICAgICAgICAgICAgbGliLnV0aWwudHJpZ2dlckV2ZW50KCByb290LCBcImltcHJlc3M6aW5pdFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IGFwaTogcm9vdHNbIFwiaW1wcmVzcy1yb290LVwiICsgcm9vdElkIF0gfSApO1xuICAgICAgICB9O1xuXG4gICAgICAgIC8vIGBnZXRTdGVwYCBpcyBhIGhlbHBlciBmdW5jdGlvbiB0aGF0IHJldHVybnMgYSBzdGVwIGVsZW1lbnQgZGVmaW5lZCBieSBwYXJhbWV0ZXIuXG4gICAgICAgIC8vIElmIGEgbnVtYmVyIGlzIGdpdmVuLCBzdGVwIHdpdGggaW5kZXggZ2l2ZW4gYnkgdGhlIG51bWJlciBpcyByZXR1cm5lZCwgaWYgYSBzdHJpbmdcbiAgICAgICAgLy8gaXMgZ2l2ZW4gc3RlcCBlbGVtZW50IHdpdGggc3VjaCBpZCBpcyByZXR1cm5lZCwgaWYgRE9NIGVsZW1lbnQgaXMgZ2l2ZW4gaXQgaXMgcmV0dXJuZWRcbiAgICAgICAgLy8gaWYgaXQgaXMgYSBjb3JyZWN0IHN0ZXAgZWxlbWVudC5cbiAgICAgICAgdmFyIGdldFN0ZXAgPSBmdW5jdGlvbiggc3RlcCApIHtcbiAgICAgICAgICAgIGlmICggdHlwZW9mIHN0ZXAgPT09IFwibnVtYmVyXCIgKSB7XG4gICAgICAgICAgICAgICAgc3RlcCA9IHN0ZXAgPCAwID8gc3RlcHNbIHN0ZXBzLmxlbmd0aCArIHN0ZXAgXSA6IHN0ZXBzWyBzdGVwIF07XG4gICAgICAgICAgICB9IGVsc2UgaWYgKCB0eXBlb2Ygc3RlcCA9PT0gXCJzdHJpbmdcIiApIHtcbiAgICAgICAgICAgICAgICBzdGVwID0gbGliLnV0aWwuYnlJZCggc3RlcCApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuICggc3RlcCAmJiBzdGVwLmlkICYmIHN0ZXBzRGF0YVsgXCJpbXByZXNzLVwiICsgc3RlcC5pZCBdICkgPyBzdGVwIDogbnVsbDtcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBVc2VkIHRvIHJlc2V0IHRpbWVvdXQgZm9yIGBpbXByZXNzOnN0ZXBlbnRlcmAgZXZlbnRcbiAgICAgICAgdmFyIHN0ZXBFbnRlclRpbWVvdXQgPSBudWxsO1xuXG4gICAgICAgIC8vIGBnb3RvYCBBUEkgZnVuY3Rpb24gdGhhdCBtb3ZlcyB0byBzdGVwIGdpdmVuIGFzIGBlbGAgcGFyYW1ldGVyIChieSBpbmRleCwgaWQgb3IgZWxlbWVudCkuXG4gICAgICAgIC8vIGBkdXJhdGlvbmAgb3B0aW9uYWxseSBnaXZlbiBhcyBzZWNvbmQgcGFyYW1ldGVyLCBpcyB0aGUgdHJhbnNpdGlvbiBkdXJhdGlvbiBpbiBjc3MuXG4gICAgICAgIC8vIGByZWFzb25gIGlzIHRoZSBzdHJpbmcgXCJuZXh0XCIsIFwicHJldlwiIG9yIFwiZ290b1wiIChkZWZhdWx0KSBhbmQgd2lsbCBiZSBtYWRlIGF2YWlsYWJsZSB0b1xuICAgICAgICAvLyBwcmVTdGVwTGVhdmUgcGx1Z2lucy5cbiAgICAgICAgLy8gYG9yaWdFdmVudGAgbWF5IGNvbnRhaW4gZXZlbnQgdGhhdCBjYXVzZWQgdGhlIGNhbGwgdG8gZ290bywgc3VjaCBhcyBhIGtleSBwcmVzcyBldmVudFxuICAgICAgICB2YXIgZ290byA9IGZ1bmN0aW9uKCBlbCwgZHVyYXRpb24sIHJlYXNvbiwgb3JpZ0V2ZW50ICkge1xuICAgICAgICAgICAgcmVhc29uID0gcmVhc29uIHx8IFwiZ290b1wiO1xuICAgICAgICAgICAgb3JpZ0V2ZW50ID0gb3JpZ0V2ZW50IHx8IG51bGw7XG5cbiAgICAgICAgICAgIGlmICggIWluaXRpYWxpemVkICkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gUmUtZXhlY3V0ZSBpbml0QWxsU3RlcHMgZm9yIGVhY2ggdHJhbnNpdGlvbi4gVGhpcyBhbGxvd3MgdG8gZWRpdCBzdGVwIGF0dHJpYnV0ZXNcbiAgICAgICAgICAgIC8vIGR5bmFtaWNhbGx5LCBzdWNoIGFzIGNoYW5nZSB0aGVpciBjb29yZGluYXRlcywgb3IgZXZlbiByZW1vdmUgb3IgYWRkIHN0ZXBzLCBhbmQgaGF2ZVxuICAgICAgICAgICAgLy8gdGhhdCBjaGFuZ2UgYXBwbHkgd2hlbiBnb3RvKCkgaXMgY2FsbGVkLlxuICAgICAgICAgICAgaW5pdEFsbFN0ZXBzKCk7XG5cbiAgICAgICAgICAgIGlmICggISggZWwgPSBnZXRTdGVwKCBlbCApICkgKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBTb21ldGltZXMgaXQncyBwb3NzaWJsZSB0byB0cmlnZ2VyIGZvY3VzIG9uIGZpcnN0IGxpbmsgd2l0aCBzb21lIGtleWJvYXJkIGFjdGlvbi5cbiAgICAgICAgICAgIC8vIEJyb3dzZXIgaW4gc3VjaCBhIGNhc2UgdHJpZXMgdG8gc2Nyb2xsIHRoZSBwYWdlIHRvIG1ha2UgdGhpcyBlbGVtZW50IHZpc2libGVcbiAgICAgICAgICAgIC8vIChldmVuIHRoYXQgYm9keSBvdmVyZmxvdyBpcyBzZXQgdG8gaGlkZGVuKSBhbmQgaXQgYnJlYWtzIG91ciBjYXJlZnVsIHBvc2l0aW9uaW5nLlxuICAgICAgICAgICAgLy9cbiAgICAgICAgICAgIC8vIFNvLCBhcyBhIGxvdXN5IChhbmQgbGF6eSkgd29ya2Fyb3VuZCB3ZSB3aWxsIG1ha2UgdGhlIHBhZ2Ugc2Nyb2xsIGJhY2sgdG8gdGhlIHRvcFxuICAgICAgICAgICAgLy8gd2hlbmV2ZXIgc2xpZGUgaXMgc2VsZWN0ZWRcbiAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAvLyBJZiB5b3UgYXJlIHJlYWRpbmcgdGhpcyBhbmQga25vdyBhbnkgYmV0dGVyIHdheSB0byBoYW5kbGUgaXQsIEknbGwgYmUgZ2xhZCB0byBoZWFyXG4gICAgICAgICAgICAvLyBhYm91dCBpdCFcbiAgICAgICAgICAgIHdpbmRvdy5zY3JvbGxUbyggMCwgMCApO1xuXG4gICAgICAgICAgICB2YXIgc3RlcCA9IHN0ZXBzRGF0YVsgXCJpbXByZXNzLVwiICsgZWwuaWQgXTtcbiAgICAgICAgICAgIGR1cmF0aW9uID0gKCBkdXJhdGlvbiAhPT0gdW5kZWZpbmVkID8gZHVyYXRpb24gOiBzdGVwLnRyYW5zaXRpb25EdXJhdGlvbiApO1xuXG4gICAgICAgICAgICAvLyBJZiB3ZSBhcmUgaW4gZmFjdCBtb3ZpbmcgdG8gYW5vdGhlciBzdGVwLCBzdGFydCB3aXRoIGV4ZWN1dGluZyB0aGUgcmVnaXN0ZXJlZFxuICAgICAgICAgICAgLy8gcHJlU3RlcExlYXZlIHBsdWdpbnMuXG4gICAgICAgICAgICBpZiAoIGFjdGl2ZVN0ZXAgJiYgYWN0aXZlU3RlcCAhPT0gZWwgKSB7XG4gICAgICAgICAgICAgICAgdmFyIGV2ZW50ID0geyB0YXJnZXQ6IGFjdGl2ZVN0ZXAsIGRldGFpbDoge30gfTtcbiAgICAgICAgICAgICAgICBldmVudC5kZXRhaWwubmV4dCA9IGVsO1xuICAgICAgICAgICAgICAgIGV2ZW50LmRldGFpbC50cmFuc2l0aW9uRHVyYXRpb24gPSBkdXJhdGlvbjtcbiAgICAgICAgICAgICAgICBldmVudC5kZXRhaWwucmVhc29uID0gcmVhc29uO1xuICAgICAgICAgICAgICAgIGlmICggb3JpZ0V2ZW50ICkge1xuICAgICAgICAgICAgICAgICAgICBldmVudC5vcmlnRXZlbnQgPSBvcmlnRXZlbnQ7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKCBleGVjUHJlU3RlcExlYXZlUGx1Z2lucyggZXZlbnQgKSA9PT0gZmFsc2UgKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gUHJlU3RlcExlYXZlIHBsdWdpbnMgYXJlIGFsbG93ZWQgdG8gYWJvcnQgdGhlIHRyYW5zaXRpb24gYWx0b2dldGhlciwgYnlcbiAgICAgICAgICAgICAgICAgICAgLy8gcmV0dXJuaW5nIGZhbHNlLlxuICAgICAgICAgICAgICAgICAgICAvLyBzZWUgc3RvcCBhbmQgc3Vic3RlcCBwbHVnaW5zIGZvciBhbiBleGFtcGxlIG9mIGRvaW5nIGp1c3QgdGhhdFxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gUGx1Z2lucyBhcmUgYWxsb3dlZCB0byBjaGFuZ2UgdGhlIGRldGFpbCB2YWx1ZXNcbiAgICAgICAgICAgICAgICBlbCA9IGV2ZW50LmRldGFpbC5uZXh0O1xuICAgICAgICAgICAgICAgIHN0ZXAgPSBzdGVwc0RhdGFbIFwiaW1wcmVzcy1cIiArIGVsLmlkIF07XG4gICAgICAgICAgICAgICAgZHVyYXRpb24gPSBldmVudC5kZXRhaWwudHJhbnNpdGlvbkR1cmF0aW9uO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoIGFjdGl2ZVN0ZXAgKSB7XG4gICAgICAgICAgICAgICAgYWN0aXZlU3RlcC5jbGFzc0xpc3QucmVtb3ZlKCBcImFjdGl2ZVwiICk7XG4gICAgICAgICAgICAgICAgYm9keS5jbGFzc0xpc3QucmVtb3ZlKCBcImltcHJlc3Mtb24tXCIgKyBhY3RpdmVTdGVwLmlkICk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbC5jbGFzc0xpc3QuYWRkKCBcImFjdGl2ZVwiICk7XG5cbiAgICAgICAgICAgIGJvZHkuY2xhc3NMaXN0LmFkZCggXCJpbXByZXNzLW9uLVwiICsgZWwuaWQgKTtcblxuICAgICAgICAgICAgLy8gQ29tcHV0ZSB0YXJnZXQgc3RhdGUgb2YgdGhlIGNhbnZhcyBiYXNlZCBvbiBnaXZlbiBzdGVwXG4gICAgICAgICAgICB2YXIgdGFyZ2V0ID0ge1xuICAgICAgICAgICAgICAgIHJvdGF0ZToge1xuICAgICAgICAgICAgICAgICAgICB4OiAtc3RlcC5yb3RhdGUueCxcbiAgICAgICAgICAgICAgICAgICAgeTogLXN0ZXAucm90YXRlLnksXG4gICAgICAgICAgICAgICAgICAgIHo6IC1zdGVwLnJvdGF0ZS56LFxuICAgICAgICAgICAgICAgICAgICBvcmRlcjogc3RlcC5yb3RhdGUub3JkZXJcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHRyYW5zbGF0ZToge1xuICAgICAgICAgICAgICAgICAgICB4OiAtc3RlcC50cmFuc2xhdGUueCxcbiAgICAgICAgICAgICAgICAgICAgeTogLXN0ZXAudHJhbnNsYXRlLnksXG4gICAgICAgICAgICAgICAgICAgIHo6IC1zdGVwLnRyYW5zbGF0ZS56XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBzY2FsZTogMSAvIHN0ZXAuc2NhbGVcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIC8vIENoZWNrIGlmIHRoZSB0cmFuc2l0aW9uIGlzIHpvb21pbmcgaW4gb3Igbm90LlxuICAgICAgICAgICAgLy9cbiAgICAgICAgICAgIC8vIFRoaXMgaW5mb3JtYXRpb24gaXMgdXNlZCB0byBhbHRlciB0aGUgdHJhbnNpdGlvbiBzdHlsZTpcbiAgICAgICAgICAgIC8vIHdoZW4gd2UgYXJlIHpvb21pbmcgaW4gLSB3ZSBzdGFydCB3aXRoIG1vdmUgYW5kIHJvdGF0ZSB0cmFuc2l0aW9uXG4gICAgICAgICAgICAvLyBhbmQgdGhlIHNjYWxpbmcgaXMgZGVsYXllZCwgYnV0IHdoZW4gd2UgYXJlIHpvb21pbmcgb3V0IHdlIHN0YXJ0XG4gICAgICAgICAgICAvLyB3aXRoIHNjYWxpbmcgZG93biBhbmQgbW92ZSBhbmQgcm90YXRpb24gYXJlIGRlbGF5ZWQuXG4gICAgICAgICAgICB2YXIgem9vbWluID0gdGFyZ2V0LnNjYWxlID49IGN1cnJlbnRTdGF0ZS5zY2FsZTtcblxuICAgICAgICAgICAgZHVyYXRpb24gPSBsaWIudXRpbC50b051bWJlciggZHVyYXRpb24sIGNvbmZpZy50cmFuc2l0aW9uRHVyYXRpb24gKTtcbiAgICAgICAgICAgIHZhciBkZWxheSA9ICggZHVyYXRpb24gLyAyICk7XG5cbiAgICAgICAgICAgIC8vIElmIHRoZSBzYW1lIHN0ZXAgaXMgcmUtc2VsZWN0ZWQsIGZvcmNlIGNvbXB1dGluZyB3aW5kb3cgc2NhbGluZyxcbiAgICAgICAgICAgIC8vIGJlY2F1c2UgaXQgaXMgbGlrZWx5IHRvIGJlIGNhdXNlZCBieSB3aW5kb3cgcmVzaXplXG4gICAgICAgICAgICBpZiAoIGVsID09PSBhY3RpdmVTdGVwICkge1xuICAgICAgICAgICAgICAgIHdpbmRvd1NjYWxlID0gY29tcHV0ZVdpbmRvd1NjYWxlKCBjb25maWcgKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIHRhcmdldFNjYWxlID0gdGFyZ2V0LnNjYWxlICogd2luZG93U2NhbGU7XG5cbiAgICAgICAgICAgIC8vIFRyaWdnZXIgbGVhdmUgb2YgY3VycmVudGx5IGFjdGl2ZSBlbGVtZW50IChpZiBpdCdzIG5vdCB0aGUgc2FtZSBzdGVwIGFnYWluKVxuICAgICAgICAgICAgaWYgKCBhY3RpdmVTdGVwICYmIGFjdGl2ZVN0ZXAgIT09IGVsICkge1xuICAgICAgICAgICAgICAgIG9uU3RlcExlYXZlKCBhY3RpdmVTdGVwLCBlbCApO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBOb3cgd2UgYWx0ZXIgdHJhbnNmb3JtcyBvZiBgcm9vdGAgYW5kIGBjYW52YXNgIHRvIHRyaWdnZXIgdHJhbnNpdGlvbnMuXG4gICAgICAgICAgICAvL1xuICAgICAgICAgICAgLy8gQW5kIGhlcmUgaXMgd2h5IHRoZXJlIGFyZSB0d28gZWxlbWVudHM6IGByb290YCBhbmQgYGNhbnZhc2AgLSB0aGV5IGFyZVxuICAgICAgICAgICAgLy8gYmVpbmcgYW5pbWF0ZWQgc2VwYXJhdGVseTpcbiAgICAgICAgICAgIC8vIGByb290YCBpcyB1c2VkIGZvciBzY2FsaW5nIGFuZCBgY2FudmFzYCBmb3IgdHJhbnNsYXRlIGFuZCByb3RhdGlvbnMuXG4gICAgICAgICAgICAvLyBUcmFuc2l0aW9ucyBvbiB0aGVtIGFyZSB0cmlnZ2VyZWQgd2l0aCBkaWZmZXJlbnQgZGVsYXlzICh0byBtYWtlXG4gICAgICAgICAgICAvLyB2aXN1YWxseSBuaWNlIGFuZCBcIm5hdHVyYWxcIiBsb29raW5nIHRyYW5zaXRpb25zKSwgc28gd2UgbmVlZCB0byBrbm93XG4gICAgICAgICAgICAvLyB0aGF0IGJvdGggb2YgdGhlbSBhcmUgZmluaXNoZWQuXG4gICAgICAgICAgICBjc3MoIHJvb3QsIHtcblxuICAgICAgICAgICAgICAgIC8vIFRvIGtlZXAgdGhlIHBlcnNwZWN0aXZlIGxvb2sgc2ltaWxhciBmb3IgZGlmZmVyZW50IHNjYWxlc1xuICAgICAgICAgICAgICAgIC8vIHdlIG5lZWQgdG8gXCJzY2FsZVwiIHRoZSBwZXJzcGVjdGl2ZSwgdG9vXG4gICAgICAgICAgICAgICAgLy8gRm9yIElFIDExIHN1cHBvcnQgd2UgbXVzdCBzcGVjaWZ5IHBlcnNwZWN0aXZlIGluZGVwZW5kZW50XG4gICAgICAgICAgICAgICAgLy8gb2YgdHJhbnNmb3JtLlxuICAgICAgICAgICAgICAgIHBlcnNwZWN0aXZlOiAoIGNvbmZpZy5wZXJzcGVjdGl2ZSAvIHRhcmdldFNjYWxlICkgKyBcInB4XCIsXG4gICAgICAgICAgICAgICAgdHJhbnNmb3JtOiBzY2FsZSggdGFyZ2V0U2NhbGUgKSxcbiAgICAgICAgICAgICAgICB0cmFuc2l0aW9uRHVyYXRpb246IGR1cmF0aW9uICsgXCJtc1wiLFxuICAgICAgICAgICAgICAgIHRyYW5zaXRpb25EZWxheTogKCB6b29taW4gPyBkZWxheSA6IDAgKSArIFwibXNcIlxuICAgICAgICAgICAgfSApO1xuXG4gICAgICAgICAgICBjc3MoIGNhbnZhcywge1xuICAgICAgICAgICAgICAgIHRyYW5zZm9ybTogcm90YXRlKCB0YXJnZXQucm90YXRlLCB0cnVlICkgKyB0cmFuc2xhdGUoIHRhcmdldC50cmFuc2xhdGUgKSxcbiAgICAgICAgICAgICAgICB0cmFuc2l0aW9uRHVyYXRpb246IGR1cmF0aW9uICsgXCJtc1wiLFxuICAgICAgICAgICAgICAgIHRyYW5zaXRpb25EZWxheTogKCB6b29taW4gPyAwIDogZGVsYXkgKSArIFwibXNcIlxuICAgICAgICAgICAgfSApO1xuXG4gICAgICAgICAgICAvLyBIZXJlIGlzIGEgdHJpY2t5IHBhcnQuLi5cbiAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAvLyBJZiB0aGVyZSBpcyBubyBjaGFuZ2UgaW4gc2NhbGUgb3Igbm8gY2hhbmdlIGluIHJvdGF0aW9uIGFuZCB0cmFuc2xhdGlvbiwgaXQgbWVhbnNcbiAgICAgICAgICAgIC8vIHRoZXJlIHdhcyBhY3R1YWxseSBubyBkZWxheSAtIGJlY2F1c2UgdGhlcmUgd2FzIG5vIHRyYW5zaXRpb24gb24gYHJvb3RgIG9yIGBjYW52YXNgXG4gICAgICAgICAgICAvLyBlbGVtZW50cy4gV2Ugd2FudCB0byB0cmlnZ2VyIGBpbXByZXNzOnN0ZXBlbnRlcmAgZXZlbnQgaW4gdGhlIGNvcnJlY3QgbW9tZW50LCBzb1xuICAgICAgICAgICAgLy8gaGVyZSB3ZSBjb21wYXJlIHRoZSBjdXJyZW50IGFuZCB0YXJnZXQgdmFsdWVzIHRvIGNoZWNrIGlmIGRlbGF5IHNob3VsZCBiZSB0YWtlbiBpbnRvXG4gICAgICAgICAgICAvLyBhY2NvdW50LlxuICAgICAgICAgICAgLy9cbiAgICAgICAgICAgIC8vIEkga25vdyB0aGF0IHRoaXMgYGlmYCBzdGF0ZW1lbnQgbG9va3Mgc2NhcnksIGJ1dCBpdCdzIHByZXR0eSBzaW1wbGUgd2hlbiB5b3Uga25vd1xuICAgICAgICAgICAgLy8gd2hhdCBpcyBnb2luZyBvbiAtIGl0J3Mgc2ltcGx5IGNvbXBhcmluZyBhbGwgdGhlIHZhbHVlcy5cbiAgICAgICAgICAgIGlmICggY3VycmVudFN0YXRlLnNjYWxlID09PSB0YXJnZXQuc2NhbGUgfHxcbiAgICAgICAgICAgICAgICAoIGN1cnJlbnRTdGF0ZS5yb3RhdGUueCA9PT0gdGFyZ2V0LnJvdGF0ZS54ICYmXG4gICAgICAgICAgICAgICAgICBjdXJyZW50U3RhdGUucm90YXRlLnkgPT09IHRhcmdldC5yb3RhdGUueSAmJlxuICAgICAgICAgICAgICAgICAgY3VycmVudFN0YXRlLnJvdGF0ZS56ID09PSB0YXJnZXQucm90YXRlLnogJiZcbiAgICAgICAgICAgICAgICAgIGN1cnJlbnRTdGF0ZS50cmFuc2xhdGUueCA9PT0gdGFyZ2V0LnRyYW5zbGF0ZS54ICYmXG4gICAgICAgICAgICAgICAgICBjdXJyZW50U3RhdGUudHJhbnNsYXRlLnkgPT09IHRhcmdldC50cmFuc2xhdGUueSAmJlxuICAgICAgICAgICAgICAgICAgY3VycmVudFN0YXRlLnRyYW5zbGF0ZS56ID09PSB0YXJnZXQudHJhbnNsYXRlLnogKSApIHtcbiAgICAgICAgICAgICAgICBkZWxheSA9IDA7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIFN0b3JlIGN1cnJlbnQgc3RhdGVcbiAgICAgICAgICAgIGN1cnJlbnRTdGF0ZSA9IHRhcmdldDtcbiAgICAgICAgICAgIGFjdGl2ZVN0ZXAgPSBlbDtcblxuICAgICAgICAgICAgLy8gQW5kIGhlcmUgaXMgd2hlcmUgd2UgdHJpZ2dlciBgaW1wcmVzczpzdGVwZW50ZXJgIGV2ZW50LlxuICAgICAgICAgICAgLy8gV2Ugc2ltcGx5IHNldCB1cCBhIHRpbWVvdXQgdG8gZmlyZSBpdCB0YWtpbmcgdHJhbnNpdGlvbiBkdXJhdGlvbiAoYW5kIHBvc3NpYmxlIGRlbGF5KVxuICAgICAgICAgICAgLy8gaW50byBhY2NvdW50LlxuICAgICAgICAgICAgLy9cbiAgICAgICAgICAgIC8vIEkgcmVhbGx5IHdhbnRlZCB0byBtYWtlIGl0IGluIG1vcmUgZWxlZ2FudCB3YXkuIFRoZSBgdHJhbnNpdGlvbmVuZGAgZXZlbnQgc2VlbWVkIHRvXG4gICAgICAgICAgICAvLyBiZSB0aGUgYmVzdCB3YXkgdG8gZG8gaXQsIGJ1dCB0aGUgZmFjdCB0aGF0IEknbSB1c2luZyB0cmFuc2l0aW9ucyBvbiB0d28gc2VwYXJhdGVcbiAgICAgICAgICAgIC8vIGVsZW1lbnRzIGFuZCB0aGF0IHRoZSBgdHJhbnNpdGlvbmVuZGAgZXZlbnQgaXMgb25seSB0cmlnZ2VyZWQgd2hlbiB0aGVyZSB3YXMgYVxuICAgICAgICAgICAgLy8gdHJhbnNpdGlvbiAoY2hhbmdlIGluIHRoZSB2YWx1ZXMpIGNhdXNlZCBzb21lIGJ1Z3MgYW5kIG1hZGUgdGhlIGNvZGUgcmVhbGx5XG4gICAgICAgICAgICAvLyBjb21wbGljYXRlZCwgY2F1c2UgSSBoYWQgdG8gaGFuZGxlIGFsbCB0aGUgY29uZGl0aW9ucyBzZXBhcmF0ZWx5LiBBbmQgaXQgc3RpbGxcbiAgICAgICAgICAgIC8vIG5lZWRlZCBhIGBzZXRUaW1lb3V0YCBmYWxsYmFjayBmb3IgdGhlIHNpdHVhdGlvbnMgd2hlbiB0aGVyZSBpcyBubyB0cmFuc2l0aW9uIGF0IGFsbC5cbiAgICAgICAgICAgIC8vIFNvIEkgZGVjaWRlZCB0aGF0IEknZCByYXRoZXIgbWFrZSB0aGUgY29kZSBzaW1wbGVyIHRoYW4gdXNlIHNoaW55IG5ld1xuICAgICAgICAgICAgLy8gYHRyYW5zaXRpb25lbmRgLlxuICAgICAgICAgICAgLy9cbiAgICAgICAgICAgIC8vIElmIHlvdSB3YW50IGxlYXJuIHNvbWV0aGluZyBpbnRlcmVzdGluZyBhbmQgc2VlIGhvdyBpdCB3YXMgZG9uZSB3aXRoIGB0cmFuc2l0aW9uZW5kYFxuICAgICAgICAgICAgLy8gZ28gYmFjayB0byB2ZXJzaW9uIDAuNS4yIG9mIGltcHJlc3MuanM6XG4gICAgICAgICAgICAvLyBodHRwOi8vZ2l0aHViLmNvbS9iYXJ0YXovaW1wcmVzcy5qcy9ibG9iLzAuNS4yL2pzL2ltcHJlc3MuanNcbiAgICAgICAgICAgIHdpbmRvdy5jbGVhclRpbWVvdXQoIHN0ZXBFbnRlclRpbWVvdXQgKTtcbiAgICAgICAgICAgIHN0ZXBFbnRlclRpbWVvdXQgPSB3aW5kb3cuc2V0VGltZW91dCggZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgb25TdGVwRW50ZXIoIGFjdGl2ZVN0ZXAgKTtcbiAgICAgICAgICAgIH0sIGR1cmF0aW9uICsgZGVsYXkgKTtcblxuICAgICAgICAgICAgcmV0dXJuIGVsO1xuICAgICAgICB9O1xuXG4gICAgICAgIC8vIGBwcmV2YCBBUEkgZnVuY3Rpb24gZ29lcyB0byBwcmV2aW91cyBzdGVwIChpbiBkb2N1bWVudCBvcmRlcilcbiAgICAgICAgLy8gYGV2ZW50YCBpcyBvcHRpb25hbCwgbWF5IGNvbnRhaW4gdGhlIGV2ZW50IHRoYXQgY2F1c2VkIHRoZSBuZWVkIHRvIGNhbGwgcHJldigpXG4gICAgICAgIHZhciBwcmV2ID0gZnVuY3Rpb24oIG9yaWdFdmVudCApIHtcbiAgICAgICAgICAgIHZhciBwcmV2ID0gc3RlcHMuaW5kZXhPZiggYWN0aXZlU3RlcCApIC0gMTtcbiAgICAgICAgICAgIHByZXYgPSBwcmV2ID49IDAgPyBzdGVwc1sgcHJldiBdIDogc3RlcHNbIHN0ZXBzLmxlbmd0aCAtIDEgXTtcblxuICAgICAgICAgICAgcmV0dXJuIGdvdG8oIHByZXYsIHVuZGVmaW5lZCwgXCJwcmV2XCIsIG9yaWdFdmVudCApO1xuICAgICAgICB9O1xuXG4gICAgICAgIC8vIGBuZXh0YCBBUEkgZnVuY3Rpb24gZ29lcyB0byBuZXh0IHN0ZXAgKGluIGRvY3VtZW50IG9yZGVyKVxuICAgICAgICAvLyBgZXZlbnRgIGlzIG9wdGlvbmFsLCBtYXkgY29udGFpbiB0aGUgZXZlbnQgdGhhdCBjYXVzZWQgdGhlIG5lZWQgdG8gY2FsbCBuZXh0KClcbiAgICAgICAgdmFyIG5leHQgPSBmdW5jdGlvbiggb3JpZ0V2ZW50ICkge1xuICAgICAgICAgICAgdmFyIG5leHQgPSBzdGVwcy5pbmRleE9mKCBhY3RpdmVTdGVwICkgKyAxO1xuICAgICAgICAgICAgbmV4dCA9IG5leHQgPCBzdGVwcy5sZW5ndGggPyBzdGVwc1sgbmV4dCBdIDogc3RlcHNbIDAgXTtcblxuICAgICAgICAgICAgcmV0dXJuIGdvdG8oIG5leHQsIHVuZGVmaW5lZCwgXCJuZXh0XCIsIG9yaWdFdmVudCApO1xuICAgICAgICB9O1xuXG4gICAgICAgIC8vIFN3aXBlIGZvciB0b3VjaCBkZXZpY2VzIGJ5IEBhbmQzcnNvbi5cbiAgICAgICAgLy8gQmVsb3cgd2UgZXh0ZW5kIHRoZSBhcGkgdG8gY29udHJvbCB0aGUgYW5pbWF0aW9uIGJldHdlZW4gdGhlIGN1cnJlbnRseVxuICAgICAgICAvLyBhY3RpdmUgc3RlcCBhbmQgYSBwcmVzdW1lZCBuZXh0L3ByZXYgc3RlcC4gU2VlIHRvdWNoIHBsdWdpbiBmb3JcbiAgICAgICAgLy8gYW4gZXhhbXBsZSBvZiB1c2luZyB0aGlzIGFwaS5cblxuICAgICAgICAvLyBIZWxwZXIgZnVuY3Rpb25cbiAgICAgICAgdmFyIGludGVycG9sYXRlID0gZnVuY3Rpb24oIGEsIGIsIGsgKSB7XG4gICAgICAgICAgICByZXR1cm4gYSArICggYiAtIGEgKSAqIGs7XG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gQW5pbWF0ZSBhIHN3aXBlLlxuICAgICAgICAvL1xuICAgICAgICAvLyBQY3QgaXMgYSB2YWx1ZSBiZXR3ZWVuIC0xLjAgYW5kICsxLjAsIGRlc2lnbmF0aW5nIHRoZSBjdXJyZW50IGxlbmd0aFxuICAgICAgICAvLyBvZiB0aGUgc3dpcGUuXG4gICAgICAgIC8vXG4gICAgICAgIC8vIElmIHBjdCBpcyBuZWdhdGl2ZSwgc3dpcGUgdG93YXJkcyB0aGUgbmV4dCgpIHN0ZXAsIGlmIHBvc2l0aXZlLFxuICAgICAgICAvLyB0b3dhcmRzIHRoZSBwcmV2KCkgc3RlcC5cbiAgICAgICAgLy9cbiAgICAgICAgLy8gTm90ZSB0aGF0IHByZS1zdGVwbGVhdmUgcGx1Z2lucyBzdWNoIGFzIGdvdG8gY2FuIG1lc3Mgd2l0aCB3aGF0IGlzIGFcbiAgICAgICAgLy8gbmV4dCgpIGFuZCBwcmV2KCkgc3RlcCwgc28gd2UgbmVlZCB0byB0cmlnZ2VyIHRoZSBwcmUtc3RlcGxlYXZlIGV2ZW50XG4gICAgICAgIC8vIGhlcmUsIGV2ZW4gaWYgYSBzd2lwZSBkb2Vzbid0IGd1YXJhbnRlZSB0aGF0IHRoZSB0cmFuc2l0aW9uIHdpbGxcbiAgICAgICAgLy8gYWN0dWFsbHkgaGFwcGVuLlxuICAgICAgICAvL1xuICAgICAgICAvLyBDYWxsaW5nIHN3aXBlKCksIHdpdGggYW55IHZhbHVlIG9mIHBjdCwgd29uJ3QgaW4gaXRzZWxmIGNhdXNlIGFcbiAgICAgICAgLy8gdHJhbnNpdGlvbiB0byBoYXBwZW4sIHRoaXMgaXMganVzdCB0byBhbmltYXRlIHRoZSBzd2lwZS4gT25jZSB0aGVcbiAgICAgICAgLy8gdHJhbnNpdGlvbiBpcyBjb21taXR0ZWQgLSBzdWNoIGFzIGF0IGEgdG91Y2hlbmQgZXZlbnQgLSBjYWxsZXIgaXNcbiAgICAgICAgLy8gcmVzcG9uc2libGUgZm9yIGFsc28gY2FsbGluZyBwcmV2KCkvbmV4dCgpIGFzIGFwcHJvcHJpYXRlLlxuICAgICAgICAvL1xuICAgICAgICAvLyBOb3RlOiBGb3Igbm93LCB0aGlzIGZ1bmN0aW9uIGlzIG1hZGUgYXZhaWxhYmxlIHRvIGJlIHVzZWQgYnkgdGhlIHN3aXBlIHBsdWdpbiAod2hpY2hcbiAgICAgICAgLy8gaXMgdGhlIFVJIGNvdW50ZXJwYXJ0IHRvIHRoaXMpLiBJdCBpcyBhIHNlbWktaW50ZXJuYWwgQVBJIGFuZCBpbnRlbnRpb25hbGx5IG5vdFxuICAgICAgICAvLyBkb2N1bWVudGVkIGluIERPQ1VNRU5UQVRJT04ubWQuXG4gICAgICAgIHZhciBzd2lwZSA9IGZ1bmN0aW9uKCBwY3QgKSB7XG4gICAgICAgICAgICBpZiAoIE1hdGguYWJzKCBwY3QgKSA+IDEgKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBQcmVwYXJlICYgZXhlY3V0ZSB0aGUgcHJlU3RlcExlYXZlIGV2ZW50XG4gICAgICAgICAgICB2YXIgZXZlbnQgPSB7IHRhcmdldDogYWN0aXZlU3RlcCwgZGV0YWlsOiB7fSB9O1xuICAgICAgICAgICAgZXZlbnQuZGV0YWlsLnN3aXBlID0gcGN0O1xuXG4gICAgICAgICAgICAvLyBXaWxsIGJlIGlnbm9yZWQgd2l0aGluIHN3aXBlIGFuaW1hdGlvbiwgYnV0IGp1c3QgaW4gY2FzZSBhIHBsdWdpbiB3YW50cyB0byByZWFkIHRoaXMsXG4gICAgICAgICAgICAvLyBodW1vciB0aGVtXG4gICAgICAgICAgICBldmVudC5kZXRhaWwudHJhbnNpdGlvbkR1cmF0aW9uID0gY29uZmlnLnRyYW5zaXRpb25EdXJhdGlvbjtcbiAgICAgICAgICAgIHZhciBpZHg7IC8vIE5lZWRlZCBieSBqc2hpbnRcbiAgICAgICAgICAgIGlmICggcGN0IDwgMCApIHtcbiAgICAgICAgICAgICAgICBpZHggPSBzdGVwcy5pbmRleE9mKCBhY3RpdmVTdGVwICkgKyAxO1xuICAgICAgICAgICAgICAgIGV2ZW50LmRldGFpbC5uZXh0ID0gaWR4IDwgc3RlcHMubGVuZ3RoID8gc3RlcHNbIGlkeCBdIDogc3RlcHNbIDAgXTtcbiAgICAgICAgICAgICAgICBldmVudC5kZXRhaWwucmVhc29uID0gXCJuZXh0XCI7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKCBwY3QgPiAwICkge1xuICAgICAgICAgICAgICAgIGlkeCA9IHN0ZXBzLmluZGV4T2YoIGFjdGl2ZVN0ZXAgKSAtIDE7XG4gICAgICAgICAgICAgICAgZXZlbnQuZGV0YWlsLm5leHQgPSBpZHggPj0gMCA/IHN0ZXBzWyBpZHggXSA6IHN0ZXBzWyBzdGVwcy5sZW5ndGggLSAxIF07XG4gICAgICAgICAgICAgICAgZXZlbnQuZGV0YWlsLnJlYXNvbiA9IFwicHJldlwiO1xuICAgICAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgICAgIC8vIE5vIG1vdmVcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIGV4ZWNQcmVTdGVwTGVhdmVQbHVnaW5zKCBldmVudCApID09PSBmYWxzZSApIHtcblxuICAgICAgICAgICAgICAgIC8vIElmIGEgcHJlU3RlcExlYXZlIHBsdWdpbiB3YW50cyB0byBhYm9ydCB0aGUgdHJhbnNpdGlvbiwgZG9uJ3QgYW5pbWF0ZSBhIHN3aXBlXG4gICAgICAgICAgICAgICAgLy8gRm9yIHN0b3AsIHRoaXMgaXMgcHJvYmFibHkgb2suIEZvciBzdWJzdGVwLCB0aGUgcGx1Z2luIGl0IHNlbGYgbWlnaHQgd2FudCB0byBkb1xuICAgICAgICAgICAgICAgIC8vIHNvbWUgYW5pbWF0aW9uLCBidXQgdGhhdCdzIG5vdCB0aGUgY3VycmVudCBpbXBsZW1lbnRhdGlvbi5cbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgbmV4dEVsZW1lbnQgPSBldmVudC5kZXRhaWwubmV4dDtcblxuICAgICAgICAgICAgdmFyIG5leHRTdGVwID0gc3RlcHNEYXRhWyBcImltcHJlc3MtXCIgKyBuZXh0RWxlbWVudC5pZCBdO1xuXG4gICAgICAgICAgICAvLyBJZiB0aGUgc2FtZSBzdGVwIGlzIHJlLXNlbGVjdGVkLCBmb3JjZSBjb21wdXRpbmcgd2luZG93IHNjYWxpbmcsXG4gICAgICAgICAgICB2YXIgbmV4dFNjYWxlID0gbmV4dFN0ZXAuc2NhbGUgKiB3aW5kb3dTY2FsZTtcbiAgICAgICAgICAgIHZhciBrID0gTWF0aC5hYnMoIHBjdCApO1xuXG4gICAgICAgICAgICB2YXIgaW50ZXJwb2xhdGVkU3RlcCA9IHtcbiAgICAgICAgICAgICAgICB0cmFuc2xhdGU6IHtcbiAgICAgICAgICAgICAgICAgICAgeDogaW50ZXJwb2xhdGUoIGN1cnJlbnRTdGF0ZS50cmFuc2xhdGUueCwgLW5leHRTdGVwLnRyYW5zbGF0ZS54LCBrICksXG4gICAgICAgICAgICAgICAgICAgIHk6IGludGVycG9sYXRlKCBjdXJyZW50U3RhdGUudHJhbnNsYXRlLnksIC1uZXh0U3RlcC50cmFuc2xhdGUueSwgayApLFxuICAgICAgICAgICAgICAgICAgICB6OiBpbnRlcnBvbGF0ZSggY3VycmVudFN0YXRlLnRyYW5zbGF0ZS56LCAtbmV4dFN0ZXAudHJhbnNsYXRlLnosIGsgKVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgcm90YXRlOiB7XG4gICAgICAgICAgICAgICAgICAgIHg6IGludGVycG9sYXRlKCBjdXJyZW50U3RhdGUucm90YXRlLngsIC1uZXh0U3RlcC5yb3RhdGUueCwgayApLFxuICAgICAgICAgICAgICAgICAgICB5OiBpbnRlcnBvbGF0ZSggY3VycmVudFN0YXRlLnJvdGF0ZS55LCAtbmV4dFN0ZXAucm90YXRlLnksIGsgKSxcbiAgICAgICAgICAgICAgICAgICAgejogaW50ZXJwb2xhdGUoIGN1cnJlbnRTdGF0ZS5yb3RhdGUueiwgLW5leHRTdGVwLnJvdGF0ZS56LCBrICksXG5cbiAgICAgICAgICAgICAgICAgICAgLy8gVW5mb3J0dW5hdGVseSB0aGVyZSdzIGEgZGlzY29udGludWl0eSBpZiByb3RhdGlvbiBvcmRlciBjaGFuZ2VzLiBOb3RoaW5nIElcbiAgICAgICAgICAgICAgICAgICAgLy8gY2FuIGRvIGFib3V0IGl0P1xuICAgICAgICAgICAgICAgICAgICBvcmRlcjogayA8IDAuNyA/IGN1cnJlbnRTdGF0ZS5yb3RhdGUub3JkZXIgOiBuZXh0U3RlcC5yb3RhdGUub3JkZXJcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHNjYWxlOiBpbnRlcnBvbGF0ZSggY3VycmVudFN0YXRlLnNjYWxlICogd2luZG93U2NhbGUsIG5leHRTY2FsZSwgayApXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBjc3MoIHJvb3QsIHtcblxuICAgICAgICAgICAgICAgIC8vIFRvIGtlZXAgdGhlIHBlcnNwZWN0aXZlIGxvb2sgc2ltaWxhciBmb3IgZGlmZmVyZW50IHNjYWxlc1xuICAgICAgICAgICAgICAgIC8vIHdlIG5lZWQgdG8gJ3NjYWxlJyB0aGUgcGVyc3BlY3RpdmUsIHRvb1xuICAgICAgICAgICAgICAgIHBlcnNwZWN0aXZlOiBjb25maWcucGVyc3BlY3RpdmUgLyBpbnRlcnBvbGF0ZWRTdGVwLnNjYWxlICsgXCJweFwiLFxuICAgICAgICAgICAgICAgIHRyYW5zZm9ybTogc2NhbGUoIGludGVycG9sYXRlZFN0ZXAuc2NhbGUgKSxcbiAgICAgICAgICAgICAgICB0cmFuc2l0aW9uRHVyYXRpb246IFwiMG1zXCIsXG4gICAgICAgICAgICAgICAgdHJhbnNpdGlvbkRlbGF5OiBcIjBtc1wiXG4gICAgICAgICAgICB9ICk7XG5cbiAgICAgICAgICAgIGNzcyggY2FudmFzLCB7XG4gICAgICAgICAgICAgICAgdHJhbnNmb3JtOiByb3RhdGUoIGludGVycG9sYXRlZFN0ZXAucm90YXRlLCB0cnVlICkgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgdHJhbnNsYXRlKCBpbnRlcnBvbGF0ZWRTdGVwLnRyYW5zbGF0ZSApLFxuICAgICAgICAgICAgICAgIHRyYW5zaXRpb25EdXJhdGlvbjogXCIwbXNcIixcbiAgICAgICAgICAgICAgICB0cmFuc2l0aW9uRGVsYXk6IFwiMG1zXCJcbiAgICAgICAgICAgIH0gKTtcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBUZWFyZG93biBpbXByZXNzXG4gICAgICAgIC8vIFJlc2V0cyB0aGUgRE9NIHRvIHRoZSBzdGF0ZSBpdCB3YXMgYmVmb3JlIGltcHJlc3MoKS5pbml0KCkgd2FzIGNhbGxlZC5cbiAgICAgICAgLy8gKElmIHlvdSBjYWxsZWQgaW1wcmVzcyhyb290SWQpLmluaXQoKSBmb3IgbXVsdGlwbGUgZGlmZmVyZW50IHJvb3RJZCdzLCB0aGVuIHlvdSBtdXN0XG4gICAgICAgIC8vIGFsc28gY2FsbCB0ZWFyKCkgb25jZSBmb3IgZWFjaCBvZiB0aGVtLilcbiAgICAgICAgdmFyIHRlYXIgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGxpYi5nYy50ZWFyZG93bigpO1xuICAgICAgICAgICAgZGVsZXRlIHJvb3RzWyBcImltcHJlc3Mtcm9vdC1cIiArIHJvb3RJZCBdO1xuICAgICAgICB9O1xuXG4gICAgICAgIC8vIEFkZGluZyBzb21lIHVzZWZ1bCBjbGFzc2VzIHRvIHN0ZXAgZWxlbWVudHMuXG4gICAgICAgIC8vXG4gICAgICAgIC8vIEFsbCB0aGUgc3RlcHMgdGhhdCBoYXZlIG5vdCBiZWVuIHNob3duIHlldCBhcmUgZ2l2ZW4gYGZ1dHVyZWAgY2xhc3MuXG4gICAgICAgIC8vIFdoZW4gdGhlIHN0ZXAgaXMgZW50ZXJlZCB0aGUgYGZ1dHVyZWAgY2xhc3MgaXMgcmVtb3ZlZCBhbmQgdGhlIGBwcmVzZW50YFxuICAgICAgICAvLyBjbGFzcyBpcyBnaXZlbi4gV2hlbiB0aGUgc3RlcCBpcyBsZWZ0IGBwcmVzZW50YCBjbGFzcyBpcyByZXBsYWNlZCB3aXRoXG4gICAgICAgIC8vIGBwYXN0YCBjbGFzcy5cbiAgICAgICAgLy9cbiAgICAgICAgLy8gU28gZXZlcnkgc3RlcCBlbGVtZW50IGlzIGFsd2F5cyBpbiBvbmUgb2YgdGhyZWUgcG9zc2libGUgc3RhdGVzOlxuICAgICAgICAvLyBgZnV0dXJlYCwgYHByZXNlbnRgIGFuZCBgcGFzdGAuXG4gICAgICAgIC8vXG4gICAgICAgIC8vIFRoZXJlIGNsYXNzZXMgY2FuIGJlIHVzZWQgaW4gQ1NTIHRvIHN0eWxlIGRpZmZlcmVudCB0eXBlcyBvZiBzdGVwcy5cbiAgICAgICAgLy8gRm9yIGV4YW1wbGUgdGhlIGBwcmVzZW50YCBjbGFzcyBjYW4gYmUgdXNlZCB0byB0cmlnZ2VyIHNvbWUgY3VzdG9tXG4gICAgICAgIC8vIGFuaW1hdGlvbnMgd2hlbiBzdGVwIGlzIHNob3duLlxuICAgICAgICBsaWIuZ2MuYWRkRXZlbnRMaXN0ZW5lciggcm9vdCwgXCJpbXByZXNzOmluaXRcIiwgZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAgIC8vIFNURVAgQ0xBU1NFU1xuICAgICAgICAgICAgc3RlcHMuZm9yRWFjaCggZnVuY3Rpb24oIHN0ZXAgKSB7XG4gICAgICAgICAgICAgICAgc3RlcC5jbGFzc0xpc3QuYWRkKCBcImZ1dHVyZVwiICk7XG4gICAgICAgICAgICB9ICk7XG5cbiAgICAgICAgICAgIGxpYi5nYy5hZGRFdmVudExpc3RlbmVyKCByb290LCBcImltcHJlc3M6c3RlcGVudGVyXCIsIGZ1bmN0aW9uKCBldmVudCApIHtcbiAgICAgICAgICAgICAgICBldmVudC50YXJnZXQuY2xhc3NMaXN0LnJlbW92ZSggXCJwYXN0XCIgKTtcbiAgICAgICAgICAgICAgICBldmVudC50YXJnZXQuY2xhc3NMaXN0LnJlbW92ZSggXCJmdXR1cmVcIiApO1xuICAgICAgICAgICAgICAgIGV2ZW50LnRhcmdldC5jbGFzc0xpc3QuYWRkKCBcInByZXNlbnRcIiApO1xuICAgICAgICAgICAgfSwgZmFsc2UgKTtcblxuICAgICAgICAgICAgbGliLmdjLmFkZEV2ZW50TGlzdGVuZXIoIHJvb3QsIFwiaW1wcmVzczpzdGVwbGVhdmVcIiwgZnVuY3Rpb24oIGV2ZW50ICkge1xuICAgICAgICAgICAgICAgIGV2ZW50LnRhcmdldC5jbGFzc0xpc3QucmVtb3ZlKCBcInByZXNlbnRcIiApO1xuICAgICAgICAgICAgICAgIGV2ZW50LnRhcmdldC5jbGFzc0xpc3QuYWRkKCBcInBhc3RcIiApO1xuICAgICAgICAgICAgfSwgZmFsc2UgKTtcblxuICAgICAgICB9LCBmYWxzZSApO1xuXG4gICAgICAgIC8vIEFkZGluZyBoYXNoIGNoYW5nZSBzdXBwb3J0LlxuICAgICAgICBsaWIuZ2MuYWRkRXZlbnRMaXN0ZW5lciggcm9vdCwgXCJpbXByZXNzOmluaXRcIiwgZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAgIC8vIExhc3QgaGFzaCBkZXRlY3RlZFxuICAgICAgICAgICAgdmFyIGxhc3RIYXNoID0gXCJcIjtcblxuICAgICAgICAgICAgLy8gYCMvc3RlcC1pZGAgaXMgdXNlZCBpbnN0ZWFkIG9mIGAjc3RlcC1pZGAgdG8gcHJldmVudCBkZWZhdWx0IGJyb3dzZXJcbiAgICAgICAgICAgIC8vIHNjcm9sbGluZyB0byBlbGVtZW50IGluIGhhc2guXG4gICAgICAgICAgICAvL1xuICAgICAgICAgICAgLy8gQW5kIGl0IGhhcyB0byBiZSBzZXQgYWZ0ZXIgYW5pbWF0aW9uIGZpbmlzaGVzLCBiZWNhdXNlIGluIENocm9tZSBpdFxuICAgICAgICAgICAgLy8gbWFrZXMgdHJhbnN0aW9uIGxhZ2d5LlxuICAgICAgICAgICAgLy8gQlVHOiBodHRwOi8vY29kZS5nb29nbGUuY29tL3AvY2hyb21pdW0vaXNzdWVzL2RldGFpbD9pZD02MjgyMFxuICAgICAgICAgICAgbGliLmdjLmFkZEV2ZW50TGlzdGVuZXIoIHJvb3QsIFwiaW1wcmVzczpzdGVwZW50ZXJcIiwgZnVuY3Rpb24oIGV2ZW50ICkge1xuICAgICAgICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbi5oYXNoID0gbGFzdEhhc2ggPSBcIiMvXCIgKyBldmVudC50YXJnZXQuaWQ7XG4gICAgICAgICAgICB9LCBmYWxzZSApO1xuXG4gICAgICAgICAgICBsaWIuZ2MuYWRkRXZlbnRMaXN0ZW5lciggd2luZG93LCBcImhhc2hjaGFuZ2VcIiwgZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAgICAgICAvLyBXaGVuIHRoZSBzdGVwIGlzIGVudGVyZWQgaGFzaCBpbiB0aGUgbG9jYXRpb24gaXMgdXBkYXRlZFxuICAgICAgICAgICAgICAgIC8vIChqdXN0IGZldyBsaW5lcyBhYm92ZSBmcm9tIGhlcmUpLCBzbyB0aGUgaGFzaCBjaGFuZ2UgaXNcbiAgICAgICAgICAgICAgICAvLyB0cmlnZ2VyZWQgYW5kIHdlIHdvdWxkIGNhbGwgYGdvdG9gIGFnYWluIG9uIHRoZSBzYW1lIGVsZW1lbnQuXG4gICAgICAgICAgICAgICAgLy9cbiAgICAgICAgICAgICAgICAvLyBUbyBhdm9pZCB0aGlzIHdlIHN0b3JlIGxhc3QgZW50ZXJlZCBoYXNoIGFuZCBjb21wYXJlLlxuICAgICAgICAgICAgICAgIGlmICggd2luZG93LmxvY2F0aW9uLmhhc2ggIT09IGxhc3RIYXNoICkge1xuICAgICAgICAgICAgICAgICAgICBnb3RvKCBsaWIudXRpbC5nZXRFbGVtZW50RnJvbUhhc2goKSApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sIGZhbHNlICk7XG5cbiAgICAgICAgICAgIC8vIFNUQVJUXG4gICAgICAgICAgICAvLyBieSBzZWxlY3Rpbmcgc3RlcCBkZWZpbmVkIGluIHVybCBvciBmaXJzdCBzdGVwIG9mIHRoZSBwcmVzZW50YXRpb25cbiAgICAgICAgICAgIGdvdG8oIGxpYi51dGlsLmdldEVsZW1lbnRGcm9tSGFzaCgpIHx8IHN0ZXBzWyAwIF0sIDAgKTtcbiAgICAgICAgfSwgZmFsc2UgKTtcblxuICAgICAgICBib2R5LmNsYXNzTGlzdC5hZGQoIFwiaW1wcmVzcy1kaXNhYmxlZFwiICk7XG5cbiAgICAgICAgLy8gU3RvcmUgYW5kIHJldHVybiBBUEkgZm9yIGdpdmVuIGltcHJlc3MuanMgcm9vdCBlbGVtZW50XG4gICAgICAgIHJldHVybiAoIHJvb3RzWyBcImltcHJlc3Mtcm9vdC1cIiArIHJvb3RJZCBdID0ge1xuICAgICAgICAgICAgaW5pdDogaW5pdCxcbiAgICAgICAgICAgIGdvdG86IGdvdG8sXG4gICAgICAgICAgICBuZXh0OiBuZXh0LFxuICAgICAgICAgICAgcHJldjogcHJldixcbiAgICAgICAgICAgIHN3aXBlOiBzd2lwZSxcbiAgICAgICAgICAgIHRlYXI6IHRlYXIsXG4gICAgICAgICAgICBsaWI6IGxpYlxuICAgICAgICB9ICk7XG5cbiAgICB9O1xuXG4gICAgLy8gRmxhZyB0aGF0IGNhbiBiZSB1c2VkIGluIEpTIHRvIGNoZWNrIGlmIGJyb3dzZXIgaGF2ZSBwYXNzZWQgdGhlIHN1cHBvcnQgdGVzdFxuICAgIGltcHJlc3Muc3VwcG9ydGVkID0gaW1wcmVzc1N1cHBvcnRlZDtcblxuICAgIC8vIEFERCBhbmQgSU5JVCBMSUJSQVJJRVNcbiAgICAvLyBMaWJyYXJ5IGZhY3RvcmllcyBhcmUgZGVmaW5lZCBpbiBzcmMvbGliLyouanMsIGFuZCByZWdpc3RlciB0aGVtc2VsdmVzIGJ5IGNhbGxpbmdcbiAgICAvLyBpbXByZXNzLmFkZExpYnJhcnlGYWN0b3J5KGxpYnJhcnlGYWN0b3J5T2JqZWN0KS4gVGhleSdyZSBzdG9yZWQgaGVyZSwgYW5kIHVzZWQgdG8gYXVnbWVudFxuICAgIC8vIHRoZSBBUEkgd2l0aCBsaWJyYXJ5IGZ1bmN0aW9ucyB3aGVuIGNsaWVudCBjYWxscyBpbXByZXNzKHJvb3RJZCkuXG4gICAgLy8gU2VlIHNyYy9saWIvUkVBRE1FLm1kIGZvciBjbGVhcmVyIGV4YW1wbGUuXG4gICAgLy8gKEFkdmFuY2VkIHVzYWdlOiBGb3IgZGlmZmVyZW50IHZhbHVlcyBvZiByb290SWQsIGEgZGlmZmVyZW50IGluc3RhbmNlIG9mIHRoZSBsaWJhcmllcyBhcmVcbiAgICAvLyBnZW5lcmF0ZWQsIGluIGNhc2UgdGhleSBuZWVkIHRvIGhvbGQgZGlmZmVyZW50IHN0YXRlIGZvciBkaWZmZXJlbnQgcm9vdCBlbGVtZW50cy4pXG4gICAgdmFyIGxpYnJhcnlGYWN0b3JpZXMgPSB7fTtcbiAgICBpbXByZXNzLmFkZExpYnJhcnlGYWN0b3J5ID0gZnVuY3Rpb24oIG9iaiApIHtcbiAgICAgICAgZm9yICggdmFyIGxpYm5hbWUgaW4gb2JqICkge1xuICAgICAgICAgICAgaWYgKCBvYmouaGFzT3duUHJvcGVydHkoIGxpYm5hbWUgKSApIHtcbiAgICAgICAgICAgICAgICBsaWJyYXJ5RmFjdG9yaWVzWyBsaWJuYW1lIF0gPSBvYmpbIGxpYm5hbWUgXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvLyBDYWxsIGVhY2ggbGlicmFyeSBmYWN0b3J5LCBhbmQgcmV0dXJuIHRoZSBsaWIgb2JqZWN0IHRoYXQgaXMgYWRkZWQgdG8gdGhlIGFwaS5cbiAgICB2YXIgaW5pdExpYnJhcmllcyA9IGZ1bmN0aW9uKCByb290SWQgKSB7IC8vanNoaW50IGlnbm9yZTpsaW5lXG4gICAgICAgIHZhciBsaWIgPSB7fTtcbiAgICAgICAgZm9yICggdmFyIGxpYm5hbWUgaW4gbGlicmFyeUZhY3RvcmllcyApIHtcbiAgICAgICAgICAgIGlmICggbGlicmFyeUZhY3Rvcmllcy5oYXNPd25Qcm9wZXJ0eSggbGlibmFtZSApICkge1xuICAgICAgICAgICAgICAgIGlmICggbGliWyBsaWJuYW1lIF0gIT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgXCJpbXByZXNzLmpzIEVSUk9SOiBUd28gbGlicmFyaWVzIGJvdGggdHJpZWQgdG8gdXNlIGxpYm5hbWU6IFwiICsgIGxpYm5hbWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGxpYlsgbGlibmFtZSBdID0gbGlicmFyeUZhY3Rvcmllc1sgbGlibmFtZSBdKCByb290SWQgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbGliO1xuICAgIH07XG5cbiAgICAvLyBgYWRkUHJlSW5pdFBsdWdpbmAgYWxsb3dzIHBsdWdpbnMgdG8gcmVnaXN0ZXIgYSBmdW5jdGlvbiB0aGF0IHNob3VsZFxuICAgIC8vIGJlIHJ1biAoc3luY2hyb25vdXNseSkgYXQgdGhlIGJlZ2lubmluZyBvZiBpbml0LCBiZWZvcmVcbiAgICAvLyBpbXByZXNzKCkuaW5pdCgpIGl0c2VsZiBleGVjdXRlcy5cbiAgICBpbXByZXNzLmFkZFByZUluaXRQbHVnaW4gPSBmdW5jdGlvbiggcGx1Z2luLCB3ZWlnaHQgKSB7XG4gICAgICAgIHdlaWdodCA9IHBhcnNlSW50KCB3ZWlnaHQgKSB8fCAxMDtcbiAgICAgICAgaWYgKCB3ZWlnaHQgPD0gMCApIHtcbiAgICAgICAgICAgIHRocm93IFwiYWRkUHJlSW5pdFBsdWdpbjogd2VpZ2h0IG11c3QgYmUgYSBwb3NpdGl2ZSBpbnRlZ2VyXCI7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIHByZUluaXRQbHVnaW5zWyB3ZWlnaHQgXSA9PT0gdW5kZWZpbmVkICkge1xuICAgICAgICAgICAgcHJlSW5pdFBsdWdpbnNbIHdlaWdodCBdID0gW107XG4gICAgICAgIH1cbiAgICAgICAgcHJlSW5pdFBsdWdpbnNbIHdlaWdodCBdLnB1c2goIHBsdWdpbiApO1xuICAgIH07XG5cbiAgICAvLyBDYWxsZWQgYXQgYmVnaW5uaW5nIG9mIGluaXQsIHRvIGV4ZWN1dGUgYWxsIHByZS1pbml0IHBsdWdpbnMuXG4gICAgdmFyIGV4ZWNQcmVJbml0UGx1Z2lucyA9IGZ1bmN0aW9uKCByb290ICkgeyAvL2pzaGludCBpZ25vcmU6bGluZVxuICAgICAgICBmb3IgKCB2YXIgaSA9IDA7IGkgPCBwcmVJbml0UGx1Z2lucy5sZW5ndGg7IGkrKyApIHtcbiAgICAgICAgICAgIHZhciB0aGlzTGV2ZWwgPSBwcmVJbml0UGx1Z2luc1sgaSBdO1xuICAgICAgICAgICAgaWYgKCB0aGlzTGV2ZWwgIT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgICAgICAgICBmb3IgKCB2YXIgaiA9IDA7IGogPCB0aGlzTGV2ZWwubGVuZ3RoOyBqKysgKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXNMZXZlbFsgaiBdKCByb290ICk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8vIGBhZGRQcmVTdGVwTGVhdmVQbHVnaW5gIGFsbG93cyBwbHVnaW5zIHRvIHJlZ2lzdGVyIGEgZnVuY3Rpb24gdGhhdCBzaG91bGRcbiAgICAvLyBiZSBydW4gKHN5bmNocm9ub3VzbHkpIGF0IHRoZSBiZWdpbm5pbmcgb2YgZ290bygpXG4gICAgaW1wcmVzcy5hZGRQcmVTdGVwTGVhdmVQbHVnaW4gPSBmdW5jdGlvbiggcGx1Z2luLCB3ZWlnaHQgKSB7IC8vanNoaW50IGlnbm9yZTpsaW5lXG4gICAgICAgIHdlaWdodCA9IHBhcnNlSW50KCB3ZWlnaHQgKSB8fCAxMDtcbiAgICAgICAgaWYgKCB3ZWlnaHQgPD0gMCApIHtcbiAgICAgICAgICAgIHRocm93IFwiYWRkUHJlU3RlcExlYXZlUGx1Z2luOiB3ZWlnaHQgbXVzdCBiZSBhIHBvc2l0aXZlIGludGVnZXJcIjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICggcHJlU3RlcExlYXZlUGx1Z2luc1sgd2VpZ2h0IF0gPT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgICAgIHByZVN0ZXBMZWF2ZVBsdWdpbnNbIHdlaWdodCBdID0gW107XG4gICAgICAgIH1cbiAgICAgICAgcHJlU3RlcExlYXZlUGx1Z2luc1sgd2VpZ2h0IF0ucHVzaCggcGx1Z2luICk7XG4gICAgfTtcblxuICAgIC8vIENhbGxlZCBhdCBiZWdpbm5pbmcgb2YgZ290bygpLCB0byBleGVjdXRlIGFsbCBwcmVTdGVwTGVhdmUgcGx1Z2lucy5cbiAgICB2YXIgZXhlY1ByZVN0ZXBMZWF2ZVBsdWdpbnMgPSBmdW5jdGlvbiggZXZlbnQgKSB7IC8vanNoaW50IGlnbm9yZTpsaW5lXG4gICAgICAgIGZvciAoIHZhciBpID0gMDsgaSA8IHByZVN0ZXBMZWF2ZVBsdWdpbnMubGVuZ3RoOyBpKysgKSB7XG4gICAgICAgICAgICB2YXIgdGhpc0xldmVsID0gcHJlU3RlcExlYXZlUGx1Z2luc1sgaSBdO1xuICAgICAgICAgICAgaWYgKCB0aGlzTGV2ZWwgIT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgICAgICAgICBmb3IgKCB2YXIgaiA9IDA7IGogPCB0aGlzTGV2ZWwubGVuZ3RoOyBqKysgKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICggdGhpc0xldmVsWyBqIF0oIGV2ZW50ICkgPT09IGZhbHNlICkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBJZiBhIHBsdWdpbiByZXR1cm5zIGZhbHNlLCB0aGUgc3RlcGxlYXZlIGV2ZW50IChhbmQgcmVsYXRlZCB0cmFuc2l0aW9uKVxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gaXMgYWJvcnRlZFxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcblxufSApKCBkb2N1bWVudCwgd2luZG93ICk7XG5cbi8vIFRIQVQnUyBBTEwgRk9MS1MhXG4vL1xuLy8gVGhhbmtzIGZvciByZWFkaW5nIGl0IGFsbC5cbi8vIE9yIHRoYW5rcyBmb3Igc2Nyb2xsaW5nIGRvd24gYW5kIHJlYWRpbmcgdGhlIGxhc3QgcGFydC5cbi8vXG4vLyBJJ3ZlIGxlYXJudCBhIGxvdCB3aGVuIGJ1aWxkaW5nIGltcHJlc3MuanMgYW5kIEkgaG9wZSB0aGlzIGNvZGUgYW5kIGNvbW1lbnRzXG4vLyB3aWxsIGhlbHAgc29tZWJvZHkgbGVhcm4gYXQgbGVhc3Qgc29tZSBwYXJ0IG9mIGl0LlxuXG4vKipcbiAqIEdhcmJhZ2UgY29sbGVjdGlvbiB1dGlsaXR5XG4gKlxuICogVGhpcyBsaWJyYXJ5IGFsbG93cyBwbHVnaW5zIHRvIGFkZCBlbGVtZW50cyBhbmQgZXZlbnQgbGlzdGVuZXJzIHRoZXkgYWRkIHRvIHRoZSBET00uIFRoZSB1c2VyXG4gKiBjYW4gY2FsbCBgaW1wcmVzcygpLmxpYi5nYy50ZWFyZG93bigpYCB0byBjYXVzZSBhbGwgb2YgdGhlbSB0byBiZSByZW1vdmVkIGZyb20gRE9NLCBzbyB0aGF0XG4gKiB0aGUgZG9jdW1lbnQgaXMgaW4gdGhlIHN0YXRlIGl0IHdhcyBiZWZvcmUgY2FsbGluZyBgaW1wcmVzcygpLmluaXQoKWAuXG4gKlxuICogSW4gYWRkaXRpb24gdG8ganVzdCBhZGRpbmcgZWxlbWVudHMgYW5kIGV2ZW50IGxpc3RlbmVycyB0byB0aGUgZ2FyYmFnZSBjb2xsZWN0b3IsIHBsdWdpbnNcbiAqIGNhbiBhbHNvIHJlZ2lzdGVyIGNhbGxiYWNrIGZ1bmN0aW9ucyB0byBkbyBhcmJpdHJhcnkgY2xlYW51cCB1cG9uIHRlYXJkb3duLlxuICpcbiAqIEhlbnJpayBJbmdvIChjKSAyMDE2XG4gKiBNSVQgTGljZW5zZVxuICovXG5cbiggZnVuY3Rpb24oIGRvY3VtZW50LCB3aW5kb3cgKSB7XG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG4gICAgdmFyIHJvb3RzID0gW107XG4gICAgdmFyIHJvb3RzQ291bnQgPSAwO1xuICAgIHZhciBzdGFydGluZ1N0YXRlID0geyByb290czogW10gfTtcblxuICAgIHZhciBsaWJyYXJ5RmFjdG9yeSA9IGZ1bmN0aW9uKCByb290SWQgKSB7XG4gICAgICAgIGlmICggcm9vdHNbIHJvb3RJZCBdICkge1xuICAgICAgICAgICAgcmV0dXJuIHJvb3RzWyByb290SWQgXTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFBlciByb290IGdsb2JhbCB2YXJpYWJsZXMgKGluc3RhbmNlIHZhcmlhYmxlcz8pXG4gICAgICAgIHZhciBlbGVtZW50TGlzdCA9IFtdO1xuICAgICAgICB2YXIgZXZlbnRMaXN0ZW5lckxpc3QgPSBbXTtcbiAgICAgICAgdmFyIGNhbGxiYWNrTGlzdCA9IFtdO1xuXG4gICAgICAgIHJlY29yZFN0YXJ0aW5nU3RhdGUoIHJvb3RJZCApO1xuXG4gICAgICAgIC8vIExJQlJBUlkgRlVOQ1RJT05TXG4gICAgICAgIC8vIERlZmluaXRpb25zIG9mIHRoZSBsaWJyYXJ5IGZ1bmN0aW9ucyB3ZSByZXR1cm4gYXMgYW4gb2JqZWN0IGF0IHRoZSBlbmRcblxuICAgICAgICAvLyBgcHVzaEVsZW1lbnRgIGFkZHMgYSBET00gZWxlbWVudCB0byB0aGUgZ2Mgc3RhY2tcbiAgICAgICAgdmFyIHB1c2hFbGVtZW50ID0gZnVuY3Rpb24oIGVsZW1lbnQgKSB7XG4gICAgICAgICAgICBlbGVtZW50TGlzdC5wdXNoKCBlbGVtZW50ICk7XG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gYGFwcGVuZENoaWxkYCBpcyBhIGNvbnZlbmllbmNlIHdyYXBwZXIgdGhhdCBjb21iaW5lcyBET00gYXBwZW5kQ2hpbGQgd2l0aCBnYy5wdXNoRWxlbWVudFxuICAgICAgICB2YXIgYXBwZW5kQ2hpbGQgPSBmdW5jdGlvbiggcGFyZW50LCBlbGVtZW50ICkge1xuICAgICAgICAgICAgcGFyZW50LmFwcGVuZENoaWxkKCBlbGVtZW50ICk7XG4gICAgICAgICAgICBwdXNoRWxlbWVudCggZWxlbWVudCApO1xuICAgICAgICB9O1xuXG4gICAgICAgIC8vIGBwdXNoRXZlbnRMaXN0ZW5lcmAgYWRkcyBhbiBldmVudCBsaXN0ZW5lciB0byB0aGUgZ2Mgc3RhY2tcbiAgICAgICAgdmFyIHB1c2hFdmVudExpc3RlbmVyID0gZnVuY3Rpb24oIHRhcmdldCwgdHlwZSwgbGlzdGVuZXJGdW5jdGlvbiApIHtcbiAgICAgICAgICAgIGV2ZW50TGlzdGVuZXJMaXN0LnB1c2goIHsgdGFyZ2V0OnRhcmdldCwgdHlwZTp0eXBlLCBsaXN0ZW5lcjpsaXN0ZW5lckZ1bmN0aW9uIH0gKTtcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBgYWRkRXZlbnRMaXN0ZW5lcmAgY29tYmluZXMgRE9NIGFkZEV2ZW50TGlzdGVuZXIgd2l0aCBnYy5wdXNoRXZlbnRMaXN0ZW5lclxuICAgICAgICB2YXIgYWRkRXZlbnRMaXN0ZW5lciA9IGZ1bmN0aW9uKCB0YXJnZXQsIHR5cGUsIGxpc3RlbmVyRnVuY3Rpb24gKSB7XG4gICAgICAgICAgICB0YXJnZXQuYWRkRXZlbnRMaXN0ZW5lciggdHlwZSwgbGlzdGVuZXJGdW5jdGlvbiApO1xuICAgICAgICAgICAgcHVzaEV2ZW50TGlzdGVuZXIoIHRhcmdldCwgdHlwZSwgbGlzdGVuZXJGdW5jdGlvbiApO1xuICAgICAgICB9O1xuXG4gICAgICAgIC8vIGBwdXNoQ2FsbGJhY2tgIElmIHRoZSBhYm92ZSB1dGlsaXRpZXMgYXJlIG5vdCBlbm91Z2gsIHBsdWdpbnMgY2FuIGFkZCB0aGVpciBvd24gY2FsbGJhY2tcbiAgICAgICAgLy8gZnVuY3Rpb24gdG8gZG8gYXJiaXRyYXJ5IHRoaW5ncy5cbiAgICAgICAgdmFyIHB1c2hDYWxsYmFjayA9IGZ1bmN0aW9uKCBjYWxsYmFjayApIHtcbiAgICAgICAgICAgIGNhbGxiYWNrTGlzdC5wdXNoKCBjYWxsYmFjayApO1xuICAgICAgICB9O1xuICAgICAgICBwdXNoQ2FsbGJhY2soIGZ1bmN0aW9uKCByb290SWQgKSB7IHJlc2V0U3RhcnRpbmdTdGF0ZSggcm9vdElkICk7IH0gKTtcblxuICAgICAgICAvLyBgdGVhcmRvd25gIHdpbGxcbiAgICAgICAgLy8gLSBleGVjdXRlIGFsbCBjYWxsYmFja3MgaW4gTElGTyBvcmRlclxuICAgICAgICAvLyAtIGNhbGwgYHJlbW92ZUNoaWxkYCBvbiBhbGwgRE9NIGVsZW1lbnRzIGluIExJRk8gb3JkZXJcbiAgICAgICAgLy8gLSBjYWxsIGByZW1vdmVFdmVudExpc3RlbmVyYCBvbiBhbGwgZXZlbnQgbGlzdGVuZXJzIGluIExJRk8gb3JkZXJcbiAgICAgICAgLy8gVGhlIGdvYWwgb2YgYSB0ZWFyZG93biBpcyB0byByZXR1cm4gdG8gdGhlIHNhbWUgc3RhdGUgdGhhdCB0aGUgRE9NIHdhcyBiZWZvcmVcbiAgICAgICAgLy8gYGltcHJlc3MoKS5pbml0KClgIHdhcyBjYWxsZWQuXG4gICAgICAgIHZhciB0ZWFyZG93biA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgICAgICAvLyBFeGVjdXRlIHRoZSBjYWxsYmFja3MgaW4gTElGTyBvcmRlclxuICAgICAgICAgICAgdmFyIGk7IC8vIE5lZWRlZCBieSBqc2hpbnRcbiAgICAgICAgICAgIGZvciAoIGkgPSBjYWxsYmFja0xpc3QubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0gKSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2tMaXN0WyBpIF0oIHJvb3RJZCApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2FsbGJhY2tMaXN0ID0gW107XG4gICAgICAgICAgICBmb3IgKCBpID0gMDsgaSA8IGVsZW1lbnRMaXN0Lmxlbmd0aDsgaSsrICkge1xuICAgICAgICAgICAgICAgIGVsZW1lbnRMaXN0WyBpIF0ucGFyZW50RWxlbWVudC5yZW1vdmVDaGlsZCggZWxlbWVudExpc3RbIGkgXSApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxlbWVudExpc3QgPSBbXTtcbiAgICAgICAgICAgIGZvciAoIGkgPSAwOyBpIDwgZXZlbnRMaXN0ZW5lckxpc3QubGVuZ3RoOyBpKysgKSB7XG4gICAgICAgICAgICAgICAgdmFyIHRhcmdldCAgID0gZXZlbnRMaXN0ZW5lckxpc3RbIGkgXS50YXJnZXQ7XG4gICAgICAgICAgICAgICAgdmFyIHR5cGUgICAgID0gZXZlbnRMaXN0ZW5lckxpc3RbIGkgXS50eXBlO1xuICAgICAgICAgICAgICAgIHZhciBsaXN0ZW5lciA9IGV2ZW50TGlzdGVuZXJMaXN0WyBpIF0ubGlzdGVuZXI7XG4gICAgICAgICAgICAgICAgdGFyZ2V0LnJlbW92ZUV2ZW50TGlzdGVuZXIoIHR5cGUsIGxpc3RlbmVyICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgdmFyIGxpYiA9IHtcbiAgICAgICAgICAgIHB1c2hFbGVtZW50OiBwdXNoRWxlbWVudCxcbiAgICAgICAgICAgIGFwcGVuZENoaWxkOiBhcHBlbmRDaGlsZCxcbiAgICAgICAgICAgIHB1c2hFdmVudExpc3RlbmVyOiBwdXNoRXZlbnRMaXN0ZW5lcixcbiAgICAgICAgICAgIGFkZEV2ZW50TGlzdGVuZXI6IGFkZEV2ZW50TGlzdGVuZXIsXG4gICAgICAgICAgICBwdXNoQ2FsbGJhY2s6IHB1c2hDYWxsYmFjayxcbiAgICAgICAgICAgIHRlYXJkb3duOiB0ZWFyZG93blxuICAgICAgICB9O1xuICAgICAgICByb290c1sgcm9vdElkIF0gPSBsaWI7XG4gICAgICAgIHJvb3RzQ291bnQrKztcbiAgICAgICAgcmV0dXJuIGxpYjtcbiAgICB9O1xuXG4gICAgLy8gTGV0IGltcHJlc3MgY29yZSBrbm93IGFib3V0IHRoZSBleGlzdGVuY2Ugb2YgdGhpcyBsaWJyYXJ5XG4gICAgd2luZG93LmltcHJlc3MuYWRkTGlicmFyeUZhY3RvcnkoIHsgZ2M6IGxpYnJhcnlGYWN0b3J5IH0gKTtcblxuICAgIC8vIENPUkUgSU5JVFxuICAgIC8vIFRoZSBsaWJyYXJ5IGZhY3RvcnkgKGdjKHJvb3RJZCkpIGlzIGNhbGxlZCBhdCB0aGUgYmVnaW5uaW5nIG9mIGltcHJlc3Mocm9vdElkKS5pbml0KClcbiAgICAvLyBGb3IgdGhlIHB1cnBvc2VzIG9mIHRlYXJkb3duKCksIHdlIGNhbiB1c2UgdGhpcyBhcyBhbiBvcHBvcnR1bml0eSB0byBzYXZlIHRoZSBzdGF0ZVxuICAgIC8vIG9mIGEgZmV3IHRoaW5ncyBpbiB0aGUgRE9NIGluIHRoZWlyIHZpcmdpbiBzdGF0ZSwgYmVmb3JlIGltcHJlc3MoKS5pbml0KCkgZGlkIGFueXRoaW5nLlxuICAgIC8vIE5vdGU6IFRoZXNlIGNvdWxkIGFsc28gYmUgcmVjb3JkZWQgYnkgdGhlIGNvZGUgaW4gaW1wcmVzcy5qcyBjb3JlIGFzIHRoZXNlIHZhbHVlc1xuICAgIC8vIGFyZSBjaGFuZ2VkLCBidXQgaW4gYW4gZWZmb3J0IHRvIG5vdCBkZXZpYXRlIHRvbyBtdWNoIGZyb20gdXBzdHJlYW0sIEknbSBhZGRpbmdcbiAgICAvLyB0aGVtIGhlcmUgcmF0aGVyIHRoYW4gdGhlIGNvcmUgaXRzZWxmLlxuICAgIHZhciByZWNvcmRTdGFydGluZ1N0YXRlID0gZnVuY3Rpb24oIHJvb3RJZCApIHtcbiAgICAgICAgc3RhcnRpbmdTdGF0ZS5yb290c1sgcm9vdElkIF0gPSB7fTtcbiAgICAgICAgc3RhcnRpbmdTdGF0ZS5yb290c1sgcm9vdElkIF0uc3RlcHMgPSBbXTtcblxuICAgICAgICAvLyBSZWNvcmQgd2hldGhlciB0aGUgc3RlcHMgaGF2ZSBhbiBpZCBvciBub3RcbiAgICAgICAgdmFyIHN0ZXBzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoIHJvb3RJZCApLnF1ZXJ5U2VsZWN0b3JBbGwoIFwiLnN0ZXBcIiApO1xuICAgICAgICBmb3IgKCB2YXIgaSA9IDA7IGkgPCBzdGVwcy5sZW5ndGg7IGkrKyApIHtcbiAgICAgICAgICAgIHZhciBlbCA9IHN0ZXBzWyBpIF07XG4gICAgICAgICAgICBzdGFydGluZ1N0YXRlLnJvb3RzWyByb290SWQgXS5zdGVwcy5wdXNoKCB7XG4gICAgICAgICAgICAgICAgZWw6IGVsLFxuICAgICAgICAgICAgICAgIGlkOiBlbC5nZXRBdHRyaWJ1dGUoIFwiaWRcIiApXG4gICAgICAgICAgICB9ICk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBJbiB0aGUgcmFyZSBjYXNlIG9mIG11bHRpcGxlIHJvb3RzLCB0aGUgZm9sbG93aW5nIGlzIGNoYW5nZWQgb24gZmlyc3QgaW5pdCgpIGFuZFxuICAgICAgICAvLyByZXNldCBhdCBsYXN0IHRlYXIoKS5cbiAgICAgICAgaWYgKCByb290c0NvdW50ID09PSAwICkge1xuICAgICAgICAgICAgc3RhcnRpbmdTdGF0ZS5ib2R5ID0ge307XG5cbiAgICAgICAgICAgIC8vIEl0IGlzIGN1c3RvbWFyeSBmb3IgYXV0aG9ycyB0byBzZXQgYm9keS5jbGFzcz1cImltcHJlc3Mtbm90LXN1cHBvcnRlZFwiIGFzIGEgc3RhcnRpbmdcbiAgICAgICAgICAgIC8vIHZhbHVlLCB3aGljaCBjYW4gdGhlbiBiZSByZW1vdmVkIGJ5IGltcHJlc3MoKS5pbml0KCkuIEJ1dCBpdCBpcyBub3QgcmVxdWlyZWQuXG4gICAgICAgICAgICAvLyBSZW1lbWJlciB3aGV0aGVyIGl0IHdhcyB0aGVyZSBvciBub3QuXG4gICAgICAgICAgICBpZiAoIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LmNvbnRhaW5zKCBcImltcHJlc3Mtbm90LXN1cHBvcnRlZFwiICkgKSB7XG4gICAgICAgICAgICAgICAgc3RhcnRpbmdTdGF0ZS5ib2R5LmltcHJlc3NOb3RTdXBwb3J0ZWQgPSB0cnVlO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBzdGFydGluZ1N0YXRlLmJvZHkuaW1wcmVzc05vdFN1cHBvcnRlZCA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBJZiB0aGVyZSdzIGEgPG1ldGEgbmFtZT1cInZpZXdwb3J0XCI+IGVsZW1lbnQsIGl0cyBjb250ZW50cyB3aWxsIGJlIG92ZXJ3cml0dGVuIGJ5IGluaXRcbiAgICAgICAgICAgIHZhciBtZXRhcyA9IGRvY3VtZW50LmhlYWQucXVlcnlTZWxlY3RvckFsbCggXCJtZXRhXCIgKTtcbiAgICAgICAgICAgIGZvciAoIGkgPSAwOyBpIDwgbWV0YXMubGVuZ3RoOyBpKysgKSB7XG4gICAgICAgICAgICAgICAgdmFyIG0gPSBtZXRhc1sgaSBdO1xuICAgICAgICAgICAgICAgIGlmICggbS5uYW1lID09PSBcInZpZXdwb3J0XCIgKSB7XG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0aW5nU3RhdGUubWV0YSA9IG0uY29udGVudDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLy8gQ09SRSBURUFSRE9XTlxuICAgIHZhciByZXNldFN0YXJ0aW5nU3RhdGUgPSBmdW5jdGlvbiggcm9vdElkICkge1xuXG4gICAgICAgIC8vIFJlc2V0IGJvZHkgZWxlbWVudFxuICAgICAgICBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5yZW1vdmUoIFwiaW1wcmVzcy1lbmFibGVkXCIgKTtcbiAgICAgICAgZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QucmVtb3ZlKCBcImltcHJlc3MtZGlzYWJsZWRcIiApO1xuXG4gICAgICAgIHZhciByb290ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoIHJvb3RJZCApO1xuICAgICAgICB2YXIgYWN0aXZlSWQgPSByb290LnF1ZXJ5U2VsZWN0b3IoIFwiLmFjdGl2ZVwiICkuaWQ7XG4gICAgICAgIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnJlbW92ZSggXCJpbXByZXNzLW9uLVwiICsgYWN0aXZlSWQgKTtcblxuICAgICAgICBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc3R5bGUuaGVpZ2h0ID0gXCJcIjtcbiAgICAgICAgZG9jdW1lbnQuYm9keS5zdHlsZS5oZWlnaHQgPSBcIlwiO1xuICAgICAgICBkb2N1bWVudC5ib2R5LnN0eWxlLm92ZXJmbG93ID0gXCJcIjtcblxuICAgICAgICAvLyBSZW1vdmUgc3R5bGUgdmFsdWVzIGZyb20gdGhlIHJvb3QgYW5kIHN0ZXAgZWxlbWVudHNcbiAgICAgICAgLy8gTm90ZTogV2UgcmVtb3ZlIHRoZSBvbmVzIHNldCBieSBpbXByZXNzLmpzIGNvcmUuIE90b2gsIHdlIGRpZG4ndCBwcmVzZXJ2ZSBhbnkgb3JpZ2luYWxcbiAgICAgICAgLy8gdmFsdWVzLiBBIG1vcmUgc29waGlzdGljYXRlZCBpbXBsZW1lbnRhdGlvbiBjb3VsZCBrZWVwIHRyYWNrIG9mIG9yaWdpbmFsIHZhbHVlcyBhbmQgdGhlblxuICAgICAgICAvLyByZXNldCB0aG9zZS5cbiAgICAgICAgdmFyIHN0ZXBzID0gcm9vdC5xdWVyeVNlbGVjdG9yQWxsKCBcIi5zdGVwXCIgKTtcbiAgICAgICAgZm9yICggdmFyIGkgPSAwOyBpIDwgc3RlcHMubGVuZ3RoOyBpKysgKSB7XG4gICAgICAgICAgICBzdGVwc1sgaSBdLmNsYXNzTGlzdC5yZW1vdmUoIFwiZnV0dXJlXCIgKTtcbiAgICAgICAgICAgIHN0ZXBzWyBpIF0uY2xhc3NMaXN0LnJlbW92ZSggXCJwYXN0XCIgKTtcbiAgICAgICAgICAgIHN0ZXBzWyBpIF0uY2xhc3NMaXN0LnJlbW92ZSggXCJwcmVzZW50XCIgKTtcbiAgICAgICAgICAgIHN0ZXBzWyBpIF0uY2xhc3NMaXN0LnJlbW92ZSggXCJhY3RpdmVcIiApO1xuICAgICAgICAgICAgc3RlcHNbIGkgXS5zdHlsZS5wb3NpdGlvbiA9IFwiXCI7XG4gICAgICAgICAgICBzdGVwc1sgaSBdLnN0eWxlLnRyYW5zZm9ybSA9IFwiXCI7XG4gICAgICAgICAgICBzdGVwc1sgaSBdLnN0eWxlWyBcInRyYW5zZm9ybS1zdHlsZVwiIF0gPSBcIlwiO1xuICAgICAgICB9XG4gICAgICAgIHJvb3Quc3R5bGUucG9zaXRpb24gPSBcIlwiO1xuICAgICAgICByb290LnN0eWxlWyBcInRyYW5zZm9ybS1vcmlnaW5cIiBdID0gXCJcIjtcbiAgICAgICAgcm9vdC5zdHlsZS50cmFuc2l0aW9uID0gXCJcIjtcbiAgICAgICAgcm9vdC5zdHlsZVsgXCJ0cmFuc2Zvcm0tc3R5bGVcIiBdID0gXCJcIjtcbiAgICAgICAgcm9vdC5zdHlsZS50b3AgPSBcIlwiO1xuICAgICAgICByb290LnN0eWxlLmxlZnQgPSBcIlwiO1xuICAgICAgICByb290LnN0eWxlLnRyYW5zZm9ybSA9IFwiXCI7XG5cbiAgICAgICAgLy8gUmVzZXQgaWQgb2Ygc3RlcHMgKFwic3RlcC0xXCIgaWQncyBhcmUgYXV0byBnZW5lcmF0ZWQpXG4gICAgICAgIHN0ZXBzID0gc3RhcnRpbmdTdGF0ZS5yb290c1sgcm9vdElkIF0uc3RlcHM7XG4gICAgICAgIHZhciBzdGVwO1xuICAgICAgICB3aGlsZSAoIHN0ZXAgPSBzdGVwcy5wb3AoKSApIHtcbiAgICAgICAgICAgIGlmICggc3RlcC5pZCA9PT0gbnVsbCApIHtcbiAgICAgICAgICAgICAgICBzdGVwLmVsLnJlbW92ZUF0dHJpYnV0ZSggXCJpZFwiICk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHN0ZXAuZWwuc2V0QXR0cmlidXRlKCBcImlkXCIsIHN0ZXAuaWQgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBkZWxldGUgc3RhcnRpbmdTdGF0ZS5yb290c1sgcm9vdElkIF07XG5cbiAgICAgICAgLy8gTW92ZSBzdGVwIGRpdiBlbGVtZW50cyBhd2F5IGZyb20gY2FudmFzLCB0aGVuIGRlbGV0ZSBjYW52YXNcbiAgICAgICAgLy8gTm90ZTogVGhlcmUncyBhbiBpbXBsaWNpdCBhc3N1bXB0aW9uIGhlcmUgdGhhdCB0aGUgY2FudmFzIGRpdiBpcyB0aGUgb25seSBjaGlsZCBlbGVtZW50XG4gICAgICAgIC8vIG9mIHRoZSByb290IGRpdi4gSWYgdGhlcmUgd291bGQgYmUgc29tZXRoaW5nIGVsc2UsIGl0J3MgZ29ubmEgYmUgbG9zdC5cbiAgICAgICAgdmFyIGNhbnZhcyA9IHJvb3QuZmlyc3RDaGlsZDtcbiAgICAgICAgdmFyIGNhbnZhc0hUTUwgPSBjYW52YXMuaW5uZXJIVE1MO1xuICAgICAgICByb290LmlubmVySFRNTCA9IGNhbnZhc0hUTUw7XG5cbiAgICAgICAgaWYgKCByb290c1sgcm9vdElkIF0gIT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgICAgIGRlbGV0ZSByb290c1sgcm9vdElkIF07XG4gICAgICAgICAgICByb290c0NvdW50LS07XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCByb290c0NvdW50ID09PSAwICkge1xuXG4gICAgICAgICAgICAvLyBJbiB0aGUgcmFyZSBjYXNlIHRoYXQgbW9yZSB0aGFuIG9uZSBpbXByZXNzIHJvb3QgZWxlbWVudHMgd2VyZSBpbml0aWFsaXplZCwgdGhlc2VcbiAgICAgICAgICAgIC8vIGFyZSBvbmx5IHJlc2V0IHdoZW4gYWxsIGFyZSB1bmluaXRpYWxpemVkLlxuICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QucmVtb3ZlKCBcImltcHJlc3Mtc3VwcG9ydGVkXCIgKTtcbiAgICAgICAgICAgIGlmICggc3RhcnRpbmdTdGF0ZS5ib2R5LmltcHJlc3NOb3RTdXBwb3J0ZWQgKSB7XG4gICAgICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QuYWRkKCBcImltcHJlc3Mtbm90LXN1cHBvcnRlZFwiICk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIFdlIG5lZWQgdG8gcmVtb3ZlIG9yIHJlc2V0IHRoZSBtZXRhIGVsZW1lbnQgaW5zZXJ0ZWQgYnkgaW1wcmVzcy5qc1xuICAgICAgICAgICAgdmFyIG1ldGFzID0gZG9jdW1lbnQuaGVhZC5xdWVyeVNlbGVjdG9yQWxsKCBcIm1ldGFcIiApO1xuICAgICAgICAgICAgZm9yICggaSA9IDA7IGkgPCBtZXRhcy5sZW5ndGg7IGkrKyApIHtcbiAgICAgICAgICAgICAgICB2YXIgbSA9IG1ldGFzWyBpIF07XG4gICAgICAgICAgICAgICAgaWYgKCBtLm5hbWUgPT09IFwidmlld3BvcnRcIiApIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCBzdGFydGluZ1N0YXRlLm1ldGEgIT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0uY29udGVudCA9IHN0YXJ0aW5nU3RhdGUubWV0YTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0ucGFyZW50RWxlbWVudC5yZW1vdmVDaGlsZCggbSApO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICB9O1xuXG59ICkoIGRvY3VtZW50LCB3aW5kb3cgKTtcblxuLyoqXG4gKiBDb21tb24gdXRpbGl0eSBmdW5jdGlvbnNcbiAqXG4gKiBDb3B5cmlnaHQgMjAxMS0yMDEyIEJhcnRlayBTem9wa2EgKEBiYXJ0YXopXG4gKiBIZW5yaWsgSW5nbyAoYykgMjAxNlxuICogTUlUIExpY2Vuc2VcbiAqL1xuXG4oIGZ1bmN0aW9uKCBkb2N1bWVudCwgd2luZG93ICkge1xuICAgIFwidXNlIHN0cmljdFwiO1xuICAgIHZhciByb290cyA9IFtdO1xuXG4gICAgdmFyIGxpYnJhcnlGYWN0b3J5ID0gZnVuY3Rpb24oIHJvb3RJZCApIHtcbiAgICAgICAgaWYgKCByb290c1sgcm9vdElkIF0gKSB7XG4gICAgICAgICAgICByZXR1cm4gcm9vdHNbIHJvb3RJZCBdO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gYCRgIHJldHVybnMgZmlyc3QgZWxlbWVudCBmb3IgZ2l2ZW4gQ1NTIGBzZWxlY3RvcmAgaW4gdGhlIGBjb250ZXh0YCBvZlxuICAgICAgICAvLyB0aGUgZ2l2ZW4gZWxlbWVudCBvciB3aG9sZSBkb2N1bWVudC5cbiAgICAgICAgdmFyICQgPSBmdW5jdGlvbiggc2VsZWN0b3IsIGNvbnRleHQgKSB7XG4gICAgICAgICAgICBjb250ZXh0ID0gY29udGV4dCB8fCBkb2N1bWVudDtcbiAgICAgICAgICAgIHJldHVybiBjb250ZXh0LnF1ZXJ5U2VsZWN0b3IoIHNlbGVjdG9yICk7XG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gYCQkYCByZXR1cm4gYW4gYXJyYXkgb2YgZWxlbWVudHMgZm9yIGdpdmVuIENTUyBgc2VsZWN0b3JgIGluIHRoZSBgY29udGV4dGAgb2ZcbiAgICAgICAgLy8gdGhlIGdpdmVuIGVsZW1lbnQgb3Igd2hvbGUgZG9jdW1lbnQuXG4gICAgICAgIHZhciAkJCA9IGZ1bmN0aW9uKCBzZWxlY3RvciwgY29udGV4dCApIHtcbiAgICAgICAgICAgIGNvbnRleHQgPSBjb250ZXh0IHx8IGRvY3VtZW50O1xuICAgICAgICAgICAgcmV0dXJuIGFycmF5aWZ5KCBjb250ZXh0LnF1ZXJ5U2VsZWN0b3JBbGwoIHNlbGVjdG9yICkgKTtcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBgYXJyYXlpZnlgIHRha2VzIGFuIGFycmF5LWxpa2Ugb2JqZWN0IGFuZCB0dXJucyBpdCBpbnRvIHJlYWwgQXJyYXlcbiAgICAgICAgLy8gdG8gbWFrZSBhbGwgdGhlIEFycmF5LnByb3RvdHlwZSBnb29kbmVzcyBhdmFpbGFibGUuXG4gICAgICAgIHZhciBhcnJheWlmeSA9IGZ1bmN0aW9uKCBhICkge1xuICAgICAgICAgICAgcmV0dXJuIFtdLnNsaWNlLmNhbGwoIGEgKTtcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBgYnlJZGAgcmV0dXJucyBlbGVtZW50IHdpdGggZ2l2ZW4gYGlkYCAtIHlvdSBwcm9iYWJseSBoYXZlIGd1ZXNzZWQgdGhhdCA7KVxuICAgICAgICB2YXIgYnlJZCA9IGZ1bmN0aW9uKCBpZCApIHtcbiAgICAgICAgICAgIHJldHVybiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCggaWQgKTtcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBgZ2V0RWxlbWVudEZyb21IYXNoYCByZXR1cm5zIGFuIGVsZW1lbnQgbG9jYXRlZCBieSBpZCBmcm9tIGhhc2ggcGFydCBvZlxuICAgICAgICAvLyB3aW5kb3cgbG9jYXRpb24uXG4gICAgICAgIHZhciBnZXRFbGVtZW50RnJvbUhhc2ggPSBmdW5jdGlvbigpIHtcblxuICAgICAgICAgICAgLy8gR2V0IGlkIGZyb20gdXJsICMgYnkgcmVtb3ZpbmcgYCNgIG9yIGAjL2AgZnJvbSB0aGUgYmVnaW5uaW5nLFxuICAgICAgICAgICAgLy8gc28gYm90aCBcImZhbGxiYWNrXCIgYCNzbGlkZS1pZGAgYW5kIFwiZW5oYW5jZWRcIiBgIy9zbGlkZS1pZGAgd2lsbCB3b3JrXG4gICAgICAgICAgICByZXR1cm4gYnlJZCggd2luZG93LmxvY2F0aW9uLmhhc2gucmVwbGFjZSggL14jXFwvPy8sIFwiXCIgKSApO1xuICAgICAgICB9O1xuXG4gICAgICAgIC8vIGBnZXRVcmxQYXJhbVZhbHVlYCByZXR1cm4gYSBnaXZlbiBVUkwgcGFyYW1ldGVyIHZhbHVlIGlmIGl0IGV4aXN0c1xuICAgICAgICAvLyBgdW5kZWZpbmVkYCBpZiBpdCBkb2Vzbid0IGV4aXN0XG4gICAgICAgIHZhciBnZXRVcmxQYXJhbVZhbHVlID0gZnVuY3Rpb24oIHBhcmFtZXRlciApIHtcbiAgICAgICAgICAgIHZhciBjaHVuayA9IHdpbmRvdy5sb2NhdGlvbi5zZWFyY2guc3BsaXQoIHBhcmFtZXRlciArIFwiPVwiIClbIDEgXTtcbiAgICAgICAgICAgIHZhciB2YWx1ZSA9IGNodW5rICYmIGNodW5rLnNwbGl0KCBcIiZcIiApWyAwIF07XG5cbiAgICAgICAgICAgIGlmICggdmFsdWUgIT09IFwiXCIgKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIC8vIFRocm90dGxpbmcgZnVuY3Rpb24gY2FsbHMsIGJ5IFJlbXkgU2hhcnBcbiAgICAgICAgLy8gaHR0cDovL3JlbXlzaGFycC5jb20vMjAxMC8wNy8yMS90aHJvdHRsaW5nLWZ1bmN0aW9uLWNhbGxzL1xuICAgICAgICB2YXIgdGhyb3R0bGUgPSBmdW5jdGlvbiggZm4sIGRlbGF5ICkge1xuICAgICAgICAgICAgdmFyIHRpbWVyID0gbnVsbDtcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICB2YXIgY29udGV4dCA9IHRoaXMsIGFyZ3MgPSBhcmd1bWVudHM7XG4gICAgICAgICAgICAgICAgd2luZG93LmNsZWFyVGltZW91dCggdGltZXIgKTtcbiAgICAgICAgICAgICAgICB0aW1lciA9IHdpbmRvdy5zZXRUaW1lb3V0KCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgZm4uYXBwbHkoIGNvbnRleHQsIGFyZ3MgKTtcbiAgICAgICAgICAgICAgICB9LCBkZWxheSApO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBgdG9OdW1iZXJgIHRha2VzIGEgdmFsdWUgZ2l2ZW4gYXMgYG51bWVyaWNgIHBhcmFtZXRlciBhbmQgdHJpZXMgdG8gdHVyblxuICAgICAgICAvLyBpdCBpbnRvIGEgbnVtYmVyLiBJZiBpdCBpcyBub3QgcG9zc2libGUgaXQgcmV0dXJucyAwIChvciBvdGhlciB2YWx1ZVxuICAgICAgICAvLyBnaXZlbiBhcyBgZmFsbGJhY2tgKS5cbiAgICAgICAgdmFyIHRvTnVtYmVyID0gZnVuY3Rpb24oIG51bWVyaWMsIGZhbGxiYWNrICkge1xuICAgICAgICAgICAgcmV0dXJuIGlzTmFOKCBudW1lcmljICkgPyAoIGZhbGxiYWNrIHx8IDAgKSA6IE51bWJlciggbnVtZXJpYyApO1xuICAgICAgICB9O1xuXG4gICAgICAgIC8vIGB0cmlnZ2VyRXZlbnRgIGJ1aWxkcyBhIGN1c3RvbSBET00gZXZlbnQgd2l0aCBnaXZlbiBgZXZlbnROYW1lYCBhbmQgYGRldGFpbGAgZGF0YVxuICAgICAgICAvLyBhbmQgdHJpZ2dlcnMgaXQgb24gZWxlbWVudCBnaXZlbiBhcyBgZWxgLlxuICAgICAgICB2YXIgdHJpZ2dlckV2ZW50ID0gZnVuY3Rpb24oIGVsLCBldmVudE5hbWUsIGRldGFpbCApIHtcbiAgICAgICAgICAgIHZhciBldmVudCA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50KCBcIkN1c3RvbUV2ZW50XCIgKTtcbiAgICAgICAgICAgIGV2ZW50LmluaXRDdXN0b21FdmVudCggZXZlbnROYW1lLCB0cnVlLCB0cnVlLCBkZXRhaWwgKTtcbiAgICAgICAgICAgIGVsLmRpc3BhdGNoRXZlbnQoIGV2ZW50ICk7XG4gICAgICAgIH07XG5cbiAgICAgICAgdmFyIGxpYiA9IHtcbiAgICAgICAgICAgICQ6ICQsXG4gICAgICAgICAgICAkJDogJCQsXG4gICAgICAgICAgICBhcnJheWlmeTogYXJyYXlpZnksXG4gICAgICAgICAgICBieUlkOiBieUlkLFxuICAgICAgICAgICAgZ2V0RWxlbWVudEZyb21IYXNoOiBnZXRFbGVtZW50RnJvbUhhc2gsXG4gICAgICAgICAgICB0aHJvdHRsZTogdGhyb3R0bGUsXG4gICAgICAgICAgICB0b051bWJlcjogdG9OdW1iZXIsXG4gICAgICAgICAgICB0cmlnZ2VyRXZlbnQ6IHRyaWdnZXJFdmVudCxcbiAgICAgICAgICAgIGdldFVybFBhcmFtVmFsdWU6IGdldFVybFBhcmFtVmFsdWVcbiAgICAgICAgfTtcbiAgICAgICAgcm9vdHNbIHJvb3RJZCBdID0gbGliO1xuICAgICAgICByZXR1cm4gbGliO1xuICAgIH07XG5cbiAgICAvLyBMZXQgaW1wcmVzcyBjb3JlIGtub3cgYWJvdXQgdGhlIGV4aXN0ZW5jZSBvZiB0aGlzIGxpYnJhcnlcbiAgICB3aW5kb3cuaW1wcmVzcy5hZGRMaWJyYXJ5RmFjdG9yeSggeyB1dGlsOiBsaWJyYXJ5RmFjdG9yeSB9ICk7XG5cbn0gKSggZG9jdW1lbnQsIHdpbmRvdyApO1xuXG4vKipcbiAqIEF1dG9wbGF5IHBsdWdpbiAtIEF1dG9tYXRpY2FsbHkgYWR2YW5jZSBzbGlkZXNob3cgYWZ0ZXIgTiBzZWNvbmRzXG4gKlxuICogQ29weXJpZ2h0IDIwMTYgSGVucmlrIEluZ28sIGhlbnJpay5pbmdvQGF2b2luZWxhbWEuZmlcbiAqIFJlbGVhc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZS5cbiAqL1xuLyogZ2xvYmFsIGNsZWFyVGltZW91dCwgc2V0VGltZW91dCwgZG9jdW1lbnQgKi9cblxuKCBmdW5jdGlvbiggZG9jdW1lbnQgKSB7XG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgICB2YXIgYXV0b3BsYXlEZWZhdWx0ID0gMDtcbiAgICB2YXIgY3VycmVudFN0ZXBUaW1lb3V0ID0gMDtcbiAgICB2YXIgYXBpID0gbnVsbDtcbiAgICB2YXIgdGltZW91dEhhbmRsZSA9IG51bGw7XG4gICAgdmFyIHJvb3QgPSBudWxsO1xuICAgIHZhciB1dGlsO1xuXG4gICAgLy8gT24gaW1wcmVzczppbml0LCBjaGVjayB3aGV0aGVyIHRoZXJlIGlzIGEgZGVmYXVsdCBzZXR0aW5nLCBhcyB3ZWxsIGFzXG4gICAgLy8gaGFuZGxlIHN0ZXAtMS5cbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCBcImltcHJlc3M6aW5pdFwiLCBmdW5jdGlvbiggZXZlbnQgKSB7XG4gICAgICAgIHV0aWwgPSBldmVudC5kZXRhaWwuYXBpLmxpYi51dGlsO1xuXG4gICAgICAgIC8vIEdldHRpbmcgQVBJIGZyb20gZXZlbnQgZGF0YSBpbnN0ZWFkIG9mIGdsb2JhbCBpbXByZXNzKCkuaW5pdCgpLlxuICAgICAgICAvLyBZb3UgZG9uJ3QgZXZlbiBuZWVkIHRvIGtub3cgd2hhdCBpcyB0aGUgaWQgb2YgdGhlIHJvb3QgZWxlbWVudFxuICAgICAgICAvLyBvciBhbnl0aGluZy4gYGltcHJlc3M6aW5pdGAgZXZlbnQgZGF0YSBnaXZlcyB5b3UgZXZlcnl0aGluZyB5b3VcbiAgICAgICAgLy8gbmVlZCB0byBjb250cm9sIHRoZSBwcmVzZW50YXRpb24gdGhhdCB3YXMganVzdCBpbml0aWFsaXplZC5cbiAgICAgICAgYXBpID0gZXZlbnQuZGV0YWlsLmFwaTtcbiAgICAgICAgcm9vdCA9IGV2ZW50LnRhcmdldDtcblxuICAgICAgICAvLyBFbGVtZW50IGF0dHJpYnV0ZXMgc3RhcnRpbmcgd2l0aCBcImRhdGEtXCIsIGJlY29tZSBhdmFpbGFibGUgdW5kZXJcbiAgICAgICAgLy8gZWxlbWVudC5kYXRhc2V0LiBJbiBhZGRpdGlvbiBoeXBoZW5pemVkIHdvcmRzIGJlY29tZSBjYW1lbENhc2VkLlxuICAgICAgICB2YXIgZGF0YSA9IHJvb3QuZGF0YXNldDtcbiAgICAgICAgdmFyIGF1dG9wbGF5ID0gdXRpbC5nZXRVcmxQYXJhbVZhbHVlKCBcImltcHJlc3MtYXV0b3BsYXlcIiApIHx8IGRhdGEuYXV0b3BsYXk7XG5cbiAgICAgICAgaWYgKCBhdXRvcGxheSApIHtcbiAgICAgICAgICAgIGF1dG9wbGF5RGVmYXVsdCA9IHV0aWwudG9OdW1iZXIoIGF1dG9wbGF5LCAwICk7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgdG9vbGJhciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoIFwiI2ltcHJlc3MtdG9vbGJhclwiICk7XG4gICAgICAgIGlmICggdG9vbGJhciApIHtcbiAgICAgICAgICAgIGFkZFRvb2xiYXJCdXR0b24oIHRvb2xiYXIgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGFwaS5saWIuZ2MucHVzaENhbGxiYWNrKCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGNsZWFyVGltZW91dCggdGltZW91dEhhbmRsZSApO1xuICAgICAgICB9ICk7XG5cbiAgICAgICAgLy8gTm90ZSB0aGF0IHJpZ2h0IGFmdGVyIGltcHJlc3M6aW5pdCBldmVudCwgYWxzbyBpbXByZXNzOnN0ZXBlbnRlciBpc1xuICAgICAgICAvLyB0cmlnZ2VyZWQgZm9yIHRoZSBmaXJzdCBzbGlkZSwgc28gdGhhdCdzIHdoZXJlIGNvZGUgZmxvdyBjb250aW51ZXMuXG4gICAgfSwgZmFsc2UgKTtcblxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoIFwiaW1wcmVzczphdXRvcGxheTpwYXVzZVwiLCBmdW5jdGlvbiggZXZlbnQgKSB7XG4gICAgICAgIHN0YXR1cyA9IFwicGF1c2VkXCI7XG4gICAgICAgIHJlbG9hZFRpbWVvdXQoIGV2ZW50ICk7XG4gICAgfSwgZmFsc2UgKTtcblxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoIFwiaW1wcmVzczphdXRvcGxheTpwbGF5XCIsIGZ1bmN0aW9uKCBldmVudCApIHtcbiAgICAgICAgc3RhdHVzID0gXCJwbGF5aW5nXCI7XG4gICAgICAgIHJlbG9hZFRpbWVvdXQoIGV2ZW50ICk7XG4gICAgfSwgZmFsc2UgKTtcblxuICAgIC8vIElmIGRlZmF1bHQgYXV0b3BsYXkgdGltZSB3YXMgZGVmaW5lZCBpbiB0aGUgcHJlc2VudGF0aW9uIHJvb3QsIG9yXG4gICAgLy8gaW4gdGhpcyBzdGVwLCBzZXQgdGltZW91dC5cbiAgICB2YXIgcmVsb2FkVGltZW91dCA9IGZ1bmN0aW9uKCBldmVudCApIHtcbiAgICAgICAgdmFyIHN0ZXAgPSBldmVudC50YXJnZXQ7XG4gICAgICAgIGN1cnJlbnRTdGVwVGltZW91dCA9IHV0aWwudG9OdW1iZXIoIHN0ZXAuZGF0YXNldC5hdXRvcGxheSwgYXV0b3BsYXlEZWZhdWx0ICk7XG4gICAgICAgIGlmICggc3RhdHVzID09PSBcInBhdXNlZFwiICkge1xuICAgICAgICAgICAgc2V0QXV0b3BsYXlUaW1lb3V0KCAwICk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzZXRBdXRvcGxheVRpbWVvdXQoIGN1cnJlbnRTdGVwVGltZW91dCApO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoIFwiaW1wcmVzczpzdGVwZW50ZXJcIiwgZnVuY3Rpb24oIGV2ZW50ICkge1xuICAgICAgICByZWxvYWRUaW1lb3V0KCBldmVudCApO1xuICAgIH0sIGZhbHNlICk7XG5cbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCBcImltcHJlc3M6c3Vic3RlcDplbnRlclwiLCBmdW5jdGlvbiggZXZlbnQgKSB7XG4gICAgICAgIHJlbG9hZFRpbWVvdXQoIGV2ZW50ICk7XG4gICAgfSwgZmFsc2UgKTtcblxuICAgIC8qKlxuICAgICAqIFNldCB0aW1lb3V0IGFmdGVyIHdoaWNoIHdlIG1vdmUgdG8gbmV4dCgpIHN0ZXAuXG4gICAgICovXG4gICAgdmFyIHNldEF1dG9wbGF5VGltZW91dCA9IGZ1bmN0aW9uKCB0aW1lb3V0ICkge1xuICAgICAgICBpZiAoIHRpbWVvdXRIYW5kbGUgKSB7XG4gICAgICAgICAgICBjbGVhclRpbWVvdXQoIHRpbWVvdXRIYW5kbGUgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICggdGltZW91dCA+IDAgKSB7XG4gICAgICAgICAgICB0aW1lb3V0SGFuZGxlID0gc2V0VGltZW91dCggZnVuY3Rpb24oKSB7IGFwaS5uZXh0KCk7IH0sIHRpbWVvdXQgKiAxMDAwICk7XG4gICAgICAgIH1cbiAgICAgICAgc2V0QnV0dG9uVGV4dCgpO1xuICAgIH07XG5cbiAgICAvKioqIFRvb2xiYXIgcGx1Z2luIGludGVncmF0aW9uICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG4gICAgdmFyIHN0YXR1cyA9IFwibm90IGNsaWNrZWRcIjtcbiAgICB2YXIgdG9vbGJhckJ1dHRvbiA9IG51bGw7XG5cbiAgICB2YXIgbWFrZURvbUVsZW1lbnQgPSBmdW5jdGlvbiggaHRtbCApIHtcbiAgICAgICAgdmFyIHRlbXBEaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCBcImRpdlwiICk7XG4gICAgICAgIHRlbXBEaXYuaW5uZXJIVE1MID0gaHRtbDtcbiAgICAgICAgcmV0dXJuIHRlbXBEaXYuZmlyc3RDaGlsZDtcbiAgICB9O1xuXG4gICAgdmFyIHRvZ2dsZVN0YXR1cyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoIGN1cnJlbnRTdGVwVGltZW91dCA+IDAgJiYgc3RhdHVzICE9PSBcInBhdXNlZFwiICkge1xuICAgICAgICAgICAgc3RhdHVzID0gXCJwYXVzZWRcIjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHN0YXR1cyA9IFwicGxheWluZ1wiO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHZhciBnZXRCdXR0b25UZXh0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICggY3VycmVudFN0ZXBUaW1lb3V0ID4gMCAmJiBzdGF0dXMgIT09IFwicGF1c2VkXCIgKSB7XG4gICAgICAgICAgICByZXR1cm4gXCJ8fFwiOyAvLyBQYXVzZVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIFwiJiM5NjU0O1wiOyAvLyBQbGF5XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgdmFyIHNldEJ1dHRvblRleHQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKCB0b29sYmFyQnV0dG9uICkge1xuXG4gICAgICAgICAgICAvLyBLZWVwIGJ1dHRvbiBzaXplIHRoZSBzYW1lIGV2ZW4gaWYgbGFiZWwgY29udGVudCBpcyBjaGFuZ2luZ1xuICAgICAgICAgICAgdmFyIGJ1dHRvbldpZHRoID0gdG9vbGJhckJ1dHRvbi5vZmZzZXRXaWR0aDtcbiAgICAgICAgICAgIHZhciBidXR0b25IZWlnaHQgPSB0b29sYmFyQnV0dG9uLm9mZnNldEhlaWdodDtcbiAgICAgICAgICAgIHRvb2xiYXJCdXR0b24uaW5uZXJIVE1MID0gZ2V0QnV0dG9uVGV4dCgpO1xuICAgICAgICAgICAgaWYgKCAhdG9vbGJhckJ1dHRvbi5zdHlsZS53aWR0aCApIHtcbiAgICAgICAgICAgICAgICB0b29sYmFyQnV0dG9uLnN0eWxlLndpZHRoID0gYnV0dG9uV2lkdGggKyBcInB4XCI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoICF0b29sYmFyQnV0dG9uLnN0eWxlLmhlaWdodCApIHtcbiAgICAgICAgICAgICAgICB0b29sYmFyQnV0dG9uLnN0eWxlLmhlaWdodCA9IGJ1dHRvbkhlaWdodCArIFwicHhcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG5cbiAgICB2YXIgYWRkVG9vbGJhckJ1dHRvbiA9IGZ1bmN0aW9uKCB0b29sYmFyICkge1xuICAgICAgICB2YXIgaHRtbCA9ICc8YnV0dG9uIGlkPVwiaW1wcmVzcy1hdXRvcGxheS1wbGF5cGF1c2VcIiAnICsgLy8ganNoaW50IGlnbm9yZTpsaW5lXG4gICAgICAgICAgICAgICAgICAgJ3RpdGxlPVwiQXV0b3BsYXlcIiBjbGFzcz1cImltcHJlc3MtYXV0b3BsYXlcIj4nICsgLy8ganNoaW50IGlnbm9yZTpsaW5lXG4gICAgICAgICAgICAgICAgICAgZ2V0QnV0dG9uVGV4dCgpICsgXCI8L2J1dHRvbj5cIjsgLy8ganNoaW50IGlnbm9yZTpsaW5lXG4gICAgICAgIHRvb2xiYXJCdXR0b24gPSBtYWtlRG9tRWxlbWVudCggaHRtbCApO1xuICAgICAgICB0b29sYmFyQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoIFwiY2xpY2tcIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0b2dnbGVTdGF0dXMoKTtcbiAgICAgICAgICAgIGlmICggc3RhdHVzID09PSBcInBsYXlpbmdcIiApIHtcbiAgICAgICAgICAgICAgICBpZiAoIGF1dG9wbGF5RGVmYXVsdCA9PT0gMCApIHtcbiAgICAgICAgICAgICAgICAgICAgYXV0b3BsYXlEZWZhdWx0ID0gNztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKCBjdXJyZW50U3RlcFRpbWVvdXQgPT09IDAgKSB7XG4gICAgICAgICAgICAgICAgICAgIGN1cnJlbnRTdGVwVGltZW91dCA9IGF1dG9wbGF5RGVmYXVsdDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgc2V0QXV0b3BsYXlUaW1lb3V0KCBjdXJyZW50U3RlcFRpbWVvdXQgKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoIHN0YXR1cyA9PT0gXCJwYXVzZWRcIiApIHtcbiAgICAgICAgICAgICAgICBzZXRBdXRvcGxheVRpbWVvdXQoIDAgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSApO1xuXG4gICAgICAgIHV0aWwudHJpZ2dlckV2ZW50KCB0b29sYmFyLCBcImltcHJlc3M6dG9vbGJhcjphcHBlbmRDaGlsZFwiLFxuICAgICAgICAgICAgICAgICAgICAgIHsgZ3JvdXA6IDEwLCBlbGVtZW50OiB0b29sYmFyQnV0dG9uIH0gKTtcbiAgICB9O1xuXG59ICkoIGRvY3VtZW50ICk7XG5cbi8qKlxuICogQmxhY2tvdXQgcGx1Z2luXG4gKlxuICogUHJlc3MgYiBvciAuIHRvIGhpZGUgYWxsIHNsaWRlcywgYW5kIGIgb3IgLiBhZ2FpbiB0byBzaG93IHRoZW0uXG4gKiBBbHNvIG5hdmlnYXRpbmcgdG8gYSBkaWZmZXJlbnQgc2xpZGUgd2lsbCBzaG93IHRoZW0gYWdhaW4gKGltcHJlc3M6c3RlcGxlYXZlKS5cbiAqXG4gKiBDb3B5cmlnaHQgMjAxNCBAU3RyaWtlc2tpZHNcbiAqIFJlbGVhc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZS5cbiAqL1xuLyogZ2xvYmFsIGRvY3VtZW50ICovXG5cbiggZnVuY3Rpb24oIGRvY3VtZW50ICkge1xuICAgIFwidXNlIHN0cmljdFwiO1xuXG4gICAgdmFyIGNhbnZhcyA9IG51bGw7XG4gICAgdmFyIGJsYWNrZWRPdXQgPSBmYWxzZTtcbiAgICB2YXIgdXRpbCA9IG51bGw7XG4gICAgdmFyIHJvb3QgPSBudWxsO1xuICAgIHZhciBhcGkgPSBudWxsO1xuXG4gICAgLy8gV2hpbGUgd2FpdGluZyBmb3IgYSBzaGFyZWQgbGlicmFyeSBvZiB1dGlsaXRpZXMsIGNvcHlpbmcgdGhlc2UgMiBmcm9tIG1haW4gaW1wcmVzcy5qc1xuICAgIHZhciBjc3MgPSBmdW5jdGlvbiggZWwsIHByb3BzICkge1xuICAgICAgICB2YXIga2V5LCBwa2V5O1xuICAgICAgICBmb3IgKCBrZXkgaW4gcHJvcHMgKSB7XG4gICAgICAgICAgICBpZiAoIHByb3BzLmhhc093blByb3BlcnR5KCBrZXkgKSApIHtcbiAgICAgICAgICAgICAgICBwa2V5ID0gcGZ4KCBrZXkgKTtcbiAgICAgICAgICAgICAgICBpZiAoIHBrZXkgIT09IG51bGwgKSB7XG4gICAgICAgICAgICAgICAgICAgIGVsLnN0eWxlWyBwa2V5IF0gPSBwcm9wc1sga2V5IF07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBlbDtcbiAgICB9O1xuXG4gICAgdmFyIHBmeCA9ICggZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIHN0eWxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggXCJkdW1teVwiICkuc3R5bGUsXG4gICAgICAgICAgICBwcmVmaXhlcyA9IFwiV2Via2l0IE1veiBPIG1zIEtodG1sXCIuc3BsaXQoIFwiIFwiICksXG4gICAgICAgICAgICBtZW1vcnkgPSB7fTtcblxuICAgICAgICByZXR1cm4gZnVuY3Rpb24oIHByb3AgKSB7XG4gICAgICAgICAgICBpZiAoIHR5cGVvZiBtZW1vcnlbIHByb3AgXSA9PT0gXCJ1bmRlZmluZWRcIiApIHtcblxuICAgICAgICAgICAgICAgIHZhciB1Y1Byb3AgID0gcHJvcC5jaGFyQXQoIDAgKS50b1VwcGVyQ2FzZSgpICsgcHJvcC5zdWJzdHIoIDEgKSxcbiAgICAgICAgICAgICAgICAgICAgcHJvcHMgICA9ICggcHJvcCArIFwiIFwiICsgcHJlZml4ZXMuam9pbiggdWNQcm9wICsgXCIgXCIgKSArIHVjUHJvcCApLnNwbGl0KCBcIiBcIiApO1xuXG4gICAgICAgICAgICAgICAgbWVtb3J5WyBwcm9wIF0gPSBudWxsO1xuICAgICAgICAgICAgICAgIGZvciAoIHZhciBpIGluIHByb3BzICkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIHN0eWxlWyBwcm9wc1sgaSBdIF0gIT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lbW9yeVsgcHJvcCBdID0gcHJvcHNbIGkgXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBtZW1vcnlbIHByb3AgXTtcbiAgICAgICAgfTtcblxuICAgIH0gKSgpO1xuXG4gICAgdmFyIHJlbW92ZUJsYWNrb3V0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICggYmxhY2tlZE91dCApIHtcbiAgICAgICAgICAgIGNzcyggY2FudmFzLCB7XG4gICAgICAgICAgICAgICAgZGlzcGxheTogXCJibG9ja1wiXG4gICAgICAgICAgICB9ICk7XG4gICAgICAgICAgICBibGFja2VkT3V0ID0gZmFsc2U7XG4gICAgICAgICAgICB1dGlsLnRyaWdnZXJFdmVudCggcm9vdCwgXCJpbXByZXNzOmF1dG9wbGF5OnBsYXlcIiwge30gKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICB2YXIgYmxhY2tvdXQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKCBibGFja2VkT3V0ICkge1xuICAgICAgICAgICAgcmVtb3ZlQmxhY2tvdXQoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNzcyggY2FudmFzLCB7XG4gICAgICAgICAgICAgICAgZGlzcGxheTogKCBibGFja2VkT3V0ID0gIWJsYWNrZWRPdXQgKSA/IFwibm9uZVwiIDogXCJibG9ja1wiXG4gICAgICAgICAgICB9ICk7XG4gICAgICAgICAgICBibGFja2VkT3V0ID0gdHJ1ZTtcbiAgICAgICAgICAgIHV0aWwudHJpZ2dlckV2ZW50KCByb290LCBcImltcHJlc3M6YXV0b3BsYXk6cGF1c2VcIiwge30gKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvLyBXYWl0IGZvciBpbXByZXNzLmpzIHRvIGJlIGluaXRpYWxpemVkXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggXCJpbXByZXNzOmluaXRcIiwgZnVuY3Rpb24oIGV2ZW50ICkge1xuICAgICAgICBhcGkgPSBldmVudC5kZXRhaWwuYXBpO1xuICAgICAgICB1dGlsID0gYXBpLmxpYi51dGlsO1xuICAgICAgICByb290ID0gZXZlbnQudGFyZ2V0O1xuICAgICAgICBjYW52YXMgPSByb290LmZpcnN0RWxlbWVudENoaWxkO1xuICAgICAgICB2YXIgZ2MgPSBhcGkubGliLmdjO1xuICAgICAgICB2YXIgdXRpbCA9IGFwaS5saWIudXRpbDtcblxuICAgICAgICBnYy5hZGRFdmVudExpc3RlbmVyKCBkb2N1bWVudCwgXCJrZXlkb3duXCIsIGZ1bmN0aW9uKCBldmVudCApIHtcblxuICAgICAgICAgICAgLy8gQWNjZXB0IGIgb3IgLiAtPiAuIGlzIHNlbnQgYnkgcHJlc2VudGF0aW9uIHJlbW90ZSBjb250cm9sbGVyc1xuICAgICAgICAgICAgaWYgKCBldmVudC5rZXlDb2RlID09PSA2NiB8fCBldmVudC5rZXlDb2RlID09PSAxOTAgKSB7XG4gICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICBpZiAoICFibGFja2VkT3V0ICkge1xuICAgICAgICAgICAgICAgICAgICBibGFja291dCgpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJlbW92ZUJsYWNrb3V0KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LCBmYWxzZSApO1xuXG4gICAgICAgIGdjLmFkZEV2ZW50TGlzdGVuZXIoIGRvY3VtZW50LCBcImtleXVwXCIsIGZ1bmN0aW9uKCBldmVudCApIHtcblxuICAgICAgICAgICAgLy8gQWNjZXB0IGIgb3IgLiAtPiAuIGlzIHNlbnQgYnkgcHJlc2VudGF0aW9uIHJlbW90ZSBjb250cm9sbGVyc1xuICAgICAgICAgICAgaWYgKCBldmVudC5rZXlDb2RlID09PSA2NiB8fCBldmVudC5rZXlDb2RlID09PSAxOTAgKSB7XG4gICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgZmFsc2UgKTtcblxuICAgIH0sIGZhbHNlICk7XG5cbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCBcImltcHJlc3M6c3RlcGxlYXZlXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICByZW1vdmVCbGFja291dCgpO1xuICAgIH0sIGZhbHNlICk7XG5cbn0gKSggZG9jdW1lbnQgKTtcblxuXG4vKipcbiAqIEV4dHJhcyBQbHVnaW5cbiAqXG4gKiBUaGlzIHBsdWdpbiBwZXJmb3JtcyBpbml0aWFsaXphdGlvbiAobGlrZSBjYWxsaW5nIG1lcm1haWQuaW5pdGlhbGl6ZSgpKVxuICogZm9yIHRoZSBleHRyYXMvIHBsdWdpbnMgaWYgdGhleSBhcmUgbG9hZGVkIGludG8gYSBwcmVzZW50YXRpb24uXG4gKlxuICogU2VlIFJFQURNRS5tZCBmb3IgZGV0YWlscy5cbiAqXG4gKiBDb3B5cmlnaHQgMjAxNiBIZW5yaWsgSW5nbyAoQGhlbnJpa2luZ28pXG4gKiBSZWxlYXNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2UuXG4gKi9cbi8qIGdsb2JhbCBtYXJrZG93biwgaGxqcywgbWVybWFpZCwgaW1wcmVzcywgZG9jdW1lbnQsIHdpbmRvdyAqL1xuXG4oIGZ1bmN0aW9uKCBkb2N1bWVudCwgd2luZG93ICkge1xuICAgIFwidXNlIHN0cmljdFwiO1xuXG4gICAgdmFyIHByZUluaXQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKCB3aW5kb3cubWFya2Rvd24gKSB7XG5cbiAgICAgICAgICAgIC8vIFVubGlrZSB0aGUgb3RoZXIgZXh0cmFzLCBNYXJrZG93bi5qcyBkb2Vzbid0IGJ5IGRlZmF1bHQgZG8gYW55dGhpbmcgaW5cbiAgICAgICAgICAgIC8vIHBhcnRpY3VsYXIuIFdlIGRvIGl0IG91cnNlbHZlcyBoZXJlLlxuICAgICAgICAgICAgLy8gSW4gYWRkaXRpb24sIHdlIHVzZSBcIi0tLS0tXCIgYXMgYSBkZWxpbWl0ZXIgZm9yIG5ldyBzbGlkZS5cblxuICAgICAgICAgICAgLy8gUXVlcnkgYWxsIC5tYXJrZG93biBlbGVtZW50cyBhbmQgdHJhbnNsYXRlIHRvIEhUTUxcbiAgICAgICAgICAgIHZhciBtYXJrZG93bkRpdnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCBcIi5tYXJrZG93blwiICk7XG4gICAgICAgICAgICBmb3IgKCB2YXIgaWR4ID0gMDsgaWR4IDwgbWFya2Rvd25EaXZzLmxlbmd0aDsgaWR4KysgKSB7XG4gICAgICAgICAgICAgIHZhciBlbGVtZW50ID0gbWFya2Rvd25EaXZzWyBpZHggXTtcbiAgICAgICAgICAgICAgdmFyIGRpYWxlY3QgPSBlbGVtZW50LmRhdGFzZXQubWFya2Rvd25EaWFsZWN0O1xuXG4gICAgICAgICAgICAgIHZhciBzbGlkZXMgPSBlbGVtZW50LnRleHRDb250ZW50LnNwbGl0KCAvXi0tLS0tJC9tICk7XG4gICAgICAgICAgICAgIHZhciBpID0gc2xpZGVzLmxlbmd0aCAtIDE7XG4gICAgICAgICAgICAgIGVsZW1lbnQuaW5uZXJIVE1MID0gbWFya2Rvd24udG9IVE1MKCBzbGlkZXNbIGkgXSwgZGlhbGVjdCApO1xuXG4gICAgICAgICAgICAgIC8vIElmIHRoZXJlJ3MgYW4gaWQsIHVuc2V0IGl0IGZvciBsYXN0LCBhbmQgYWxsIG90aGVyLCBlbGVtZW50cyxcbiAgICAgICAgICAgICAgLy8gYW5kIHRoZW4gc2V0IGl0IGZvciB0aGUgZmlyc3QuXG4gICAgICAgICAgICAgIHZhciBpZCA9IG51bGw7XG4gICAgICAgICAgICAgIGlmICggZWxlbWVudC5pZCApIHtcbiAgICAgICAgICAgICAgICBpZCA9IGVsZW1lbnQuaWQ7XG4gICAgICAgICAgICAgICAgZWxlbWVudC5pZCA9IFwiXCI7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgaS0tO1xuICAgICAgICAgICAgICB3aGlsZSAoIGkgPj0gMCApIHtcbiAgICAgICAgICAgICAgICB2YXIgbmV3RWxlbWVudCA9IGVsZW1lbnQuY2xvbmVOb2RlKCBmYWxzZSApO1xuICAgICAgICAgICAgICAgIG5ld0VsZW1lbnQuaW5uZXJIVE1MID0gbWFya2Rvd24udG9IVE1MKCBzbGlkZXNbIGkgXSApO1xuICAgICAgICAgICAgICAgIGVsZW1lbnQucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUoIG5ld0VsZW1lbnQsIGVsZW1lbnQgKTtcbiAgICAgICAgICAgICAgICBlbGVtZW50ID0gbmV3RWxlbWVudDtcbiAgICAgICAgICAgICAgICBpLS07XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgaWYgKCBpZCAhPT0gbnVsbCApIHtcbiAgICAgICAgICAgICAgICBlbGVtZW50LmlkID0gaWQ7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSAvLyBNYXJrZG93blxuXG4gICAgICAgIGlmICggd2luZG93LmhsanMgKSB7XG4gICAgICAgICAgICBobGpzLmluaXRIaWdobGlnaHRpbmdPbkxvYWQoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICggd2luZG93Lm1lcm1haWQgKSB7XG4gICAgICAgICAgICBtZXJtYWlkLmluaXRpYWxpemUoIHsgc3RhcnRPbkxvYWQ6dHJ1ZSB9ICk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLy8gUmVnaXN0ZXIgdGhlIHBsdWdpbiB0byBiZSBjYWxsZWQgaW4gcHJlLWluaXQgcGhhc2VcbiAgICAvLyBOb3RlOiBNYXJrZG93bi5qcyBzaG91bGQgcnVuIGVhcmx5L2ZpcnN0LCBiZWNhdXNlIGl0IGNyZWF0ZXMgbmV3IGRpdiBlbGVtZW50cy5cbiAgICAvLyBTbyBhZGQgdGhpcyB3aXRoIGEgbG93ZXItdGhhbi1kZWZhdWx0IHdlaWdodC5cbiAgICBpbXByZXNzLmFkZFByZUluaXRQbHVnaW4oIHByZUluaXQsIDEgKTtcblxufSApKCBkb2N1bWVudCwgd2luZG93ICk7XG5cblxuLyoqXG4gKiBGb3JtIHN1cHBvcnRcbiAqXG4gKiBGdW5jdGlvbmFsaXR5IHRvIGJldHRlciBzdXBwb3J0IHVzZSBvZiBpbnB1dCwgdGV4dGFyZWEsIGJ1dHRvbi4uLiBlbGVtZW50cyBpbiBhIHByZXNlbnRhdGlvbi5cbiAqXG4gKiBUaGlzIHBsdWdpbiBkb2VzIHR3byB0aGluZ3M6XG4gKlxuICogU2V0IHN0b3BQcm9wYWdhdGlvbiBvbiBhbnkgZWxlbWVudCB0aGF0IG1pZ2h0IHRha2UgdGV4dCBpbnB1dC4gVGhpcyBhbGxvd3MgdXNlcnMgdG8gdHlwZSwgZm9yXG4gKiBleGFtcGxlLCB0aGUgbGV0dGVyICdQJyBpbnRvIGEgZm9ybSBmaWVsZCwgd2l0aG91dCBjYXVzaW5nIHRoZSBwcmVzZW50ZXIgY29uc29sZSB0byBzcHJpbmcgdXAuXG4gKlxuICogT24gaW1wcmVzczpzdGVwbGVhdmUsIGRlLWZvY3VzIGFueSBwb3RlbnRpYWxseSBhY3RpdmVcbiAqIGVsZW1lbnQuIFRoaXMgaXMgdG8gcHJldmVudCB0aGUgZm9jdXMgZnJvbSBiZWluZyBsZWZ0IGluIGEgZm9ybSBlbGVtZW50IHRoYXQgaXMgbm8gbG9uZ2VyIHZpc2libGVcbiAqIGluIHRoZSB3aW5kb3csIGFuZCB1c2VyIHRoZXJlZm9yZSB0eXBpbmcgZ2FyYmFnZSBpbnRvIHRoZSBmb3JtLlxuICpcbiAqIFRPRE86IEN1cnJlbnRseSBpdCBpcyBub3QgcG9zc2libGUgdG8gdXNlIFRBQiB0byBuYXZpZ2F0ZSBiZXR3ZWVuIGZvcm0gZWxlbWVudHMuIEltcHJlc3MuanMsIGFuZFxuICogaW4gcGFydGljdWxhciB0aGUgbmF2aWdhdGlvbiBwbHVnaW4sIHVuZm9ydHVuYXRlbHkgbXVzdCBmdWxseSB0YWtlIGNvbnRyb2wgb2YgdGhlIHRhYiBrZXksXG4gKiBvdGhlcndpc2UgYSB1c2VyIGNvdWxkIGNhdXNlIHRoZSBicm93c2VyIHRvIHNjcm9sbCB0byBhIGxpbmsgb3IgYnV0dG9uIHRoYXQncyBub3Qgb24gdGhlIGN1cnJlbnRcbiAqIHN0ZXAuIEhvd2V2ZXIsIGl0IGNvdWxkIGJlIHBvc3NpYmxlIHRvIGFsbG93IHRhYiBuYXZpZ2F0aW9uIGJldHdlZW4gZm9ybSBlbGVtZW50cywgYXMgbG9uZyBhc1xuICogdGhleSBhcmUgb24gdGhlIGFjdGl2ZSBzdGVwLiBUaGlzIGlzIGEgdG9waWMgZm9yIGZ1cnRoZXIgc3R1ZHkuXG4gKlxuICogQ29weXJpZ2h0IDIwMTYgSGVucmlrIEluZ29cbiAqIE1JVCBMaWNlbnNlXG4gKi9cbi8qIGdsb2JhbCBkb2N1bWVudCAqL1xuKCBmdW5jdGlvbiggZG9jdW1lbnQgKSB7XG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG4gICAgdmFyIHJvb3Q7XG4gICAgdmFyIGFwaTtcblxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoIFwiaW1wcmVzczppbml0XCIsIGZ1bmN0aW9uKCBldmVudCApIHtcbiAgICAgICAgcm9vdCA9IGV2ZW50LnRhcmdldDtcbiAgICAgICAgYXBpID0gZXZlbnQuZGV0YWlsLmFwaTtcbiAgICAgICAgdmFyIGdjID0gYXBpLmxpYi5nYztcblxuICAgICAgICB2YXIgc2VsZWN0b3JzID0gWyBcImlucHV0XCIsIFwidGV4dGFyZWFcIiwgXCJzZWxlY3RcIiwgXCJbY29udGVudGVkaXRhYmxlPXRydWVdXCIgXTtcbiAgICAgICAgZm9yICggdmFyIHNlbGVjdG9yIG9mIHNlbGVjdG9ycyApIHtcbiAgICAgICAgICAgIHZhciBlbGVtZW50cyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoIHNlbGVjdG9yICk7XG4gICAgICAgICAgICBpZiAoICFlbGVtZW50cyApIHtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZm9yICggdmFyIGkgPSAwOyBpIDwgZWxlbWVudHMubGVuZ3RoOyBpKysgKSB7XG4gICAgICAgICAgICAgICAgdmFyIGUgPSBlbGVtZW50c1sgaSBdO1xuICAgICAgICAgICAgICAgIGdjLmFkZEV2ZW50TGlzdGVuZXIoIGUsIFwia2V5ZG93blwiLCBmdW5jdGlvbiggZXZlbnQgKSB7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICAgICAgICBnYy5hZGRFdmVudExpc3RlbmVyKCBlLCBcImtleXVwXCIsIGZ1bmN0aW9uKCBldmVudCApIHtcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSwgZmFsc2UgKTtcblxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoIFwiaW1wcmVzczpzdGVwbGVhdmVcIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgIGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQuYmx1cigpO1xuICAgIH0sIGZhbHNlICk7XG5cbn0gKSggZG9jdW1lbnQgKTtcblxuXG4vKipcbiAqIEZ1bGxzY3JlZW4gcGx1Z2luXG4gKlxuICogUHJlc3MgRjUgdG8gZW50ZXIgZnVsbHNjcmVlbiBhbmQgRVNDIHRvIGV4aXQgZnVsbHNjcmVlbiBtb2RlLlxuICpcbiAqIENvcHlyaWdodCAyMDE5IEBnaWZsd1xuICogUmVsZWFzZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlLlxuICovXG4vKiBnbG9iYWwgZG9jdW1lbnQgKi9cblxuKCBmdW5jdGlvbiggZG9jdW1lbnQgKSB7XG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgICBmdW5jdGlvbiBlbnRlckZ1bGxzY3JlZW4oKSB7XG4gICAgICAgIHZhciBlbGVtID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50O1xuICAgICAgICBpZiAoICFkb2N1bWVudC5mdWxsc2NyZWVuRWxlbWVudCApIHtcbiAgICAgICAgICAgIGVsZW0ucmVxdWVzdEZ1bGxzY3JlZW4oKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGV4aXRGdWxsc2NyZWVuKCkge1xuICAgICAgICBpZiAoIGRvY3VtZW50LmZ1bGxzY3JlZW5FbGVtZW50ICkge1xuICAgICAgICAgICAgZG9jdW1lbnQuZXhpdEZ1bGxzY3JlZW4oKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIFdhaXQgZm9yIGltcHJlc3MuanMgdG8gYmUgaW5pdGlhbGl6ZWRcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCBcImltcHJlc3M6aW5pdFwiLCBmdW5jdGlvbiggZXZlbnQgKSB7XG4gICAgICAgIHZhciBhcGkgPSBldmVudC5kZXRhaWwuYXBpO1xuICAgICAgICB2YXIgcm9vdCA9IGV2ZW50LnRhcmdldDtcbiAgICAgICAgdmFyIGdjID0gYXBpLmxpYi5nYztcbiAgICAgICAgdmFyIHV0aWwgPSBhcGkubGliLnV0aWw7XG5cbiAgICAgICAgZ2MuYWRkRXZlbnRMaXN0ZW5lciggZG9jdW1lbnQsIFwia2V5ZG93blwiLCBmdW5jdGlvbiggZXZlbnQgKSB7XG5cbiAgICAgICAgICAgIC8vIDExNiAoRjUpIGlzIHNlbnQgYnkgcHJlc2VudGF0aW9uIHJlbW90ZSBjb250cm9sbGVyc1xuICAgICAgICAgICAgaWYgKCBldmVudC5jb2RlID09PSBcIkY1XCIgKSB7XG4gICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICBlbnRlckZ1bGxzY3JlZW4oKTtcbiAgICAgICAgICAgICAgICB1dGlsLnRyaWdnZXJFdmVudCggcm9vdC5xdWVyeVNlbGVjdG9yKCBcIi5hY3RpdmVcIiApLCBcImltcHJlc3M6c3RlcHJlZnJlc2hcIiApO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyAyNyAoRXNjYXBlKSBpcyBzZW50IGJ5IHByZXNlbnRhdGlvbiByZW1vdGUgY29udHJvbGxlcnNcbiAgICAgICAgICAgIGlmICggZXZlbnQua2V5ID09PSBcIkVzY2FwZVwiIHx8IGV2ZW50LmtleSA9PT0gXCJGNVwiICkge1xuICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgZXhpdEZ1bGxzY3JlZW4oKTtcbiAgICAgICAgICAgICAgICB1dGlsLnRyaWdnZXJFdmVudCggcm9vdC5xdWVyeVNlbGVjdG9yKCBcIi5hY3RpdmVcIiApLCBcImltcHJlc3M6c3RlcHJlZnJlc2hcIiApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LCBmYWxzZSApO1xuXG4gICAgICAgIHV0aWwudHJpZ2dlckV2ZW50KCBkb2N1bWVudCwgXCJpbXByZXNzOmhlbHA6YWRkXCIsXG4gICAgICAgICAgICB7IGNvbW1hbmQ6IFwiRjUgLyBFU0NcIiwgdGV4dDogXCJGdWxsc2NyZWVuOiBFbnRlciAvIEV4aXRcIiwgcm93OiAyMDAgfSApO1xuXG4gICAgfSwgZmFsc2UgKTtcblxufSApKCBkb2N1bWVudCApO1xuXG5cbi8qKlxuICogR290byBQbHVnaW5cbiAqXG4gKiBUaGUgZ290byBwbHVnaW4gaXMgYSBwcmUtc3RlcGxlYXZlIHBsdWdpbi4gSXQgaXMgZXhlY3V0ZWQgYmVmb3JlIGltcHJlc3M6c3RlcGxlYXZlLFxuICogYW5kIHdpbGwgYWx0ZXIgdGhlIGRlc3RpbmF0aW9uIHdoZXJlIHRvIHRyYW5zaXRpb24gbmV4dC5cbiAqXG4gKiBFeGFtcGxlOlxuICpcbiAqICAgICAgICAgPCEtLSBXaGVuIGxlYXZpbmcgdGhpcyBzdGVwLCBnbyBkaXJlY3RseSB0byBcInN0ZXAtNVwiIC0tPlxuICogICAgICAgICA8ZGl2IGNsYXNzPVwic3RlcFwiIGRhdGEtZ290bz1cInN0ZXAtNVwiPlxuICpcbiAqICAgICAgICAgPCEtLSBXaGVuIGxlYXZpbmcgdGhpcyBzdGVwIHdpdGggbmV4dCgpLCBnbyBkaXJlY3RseSB0byBcInN0ZXAtNVwiLCBpbnN0ZWFkIG9mIG5leHQgc3RlcC5cbiAqICAgICAgICAgICAgICBJZiBtb3ZpbmcgYmFja3dhcmRzIHRvIHByZXZpb3VzIHN0ZXAgLSBlLmcuIHByZXYoKSBpbnN0ZWFkIG9mIG5leHQoKSAtXG4gKiAgICAgICAgICAgICAgdGhlbiBnbyB0byBcInN0ZXAtMVwiLiAtLT5cbiAqICAgICAgICAgPGRpdiBjbGFzcz1cInN0ZXBcIiBkYXRhLWdvdG8tbmV4dD1cInN0ZXAtNVwiIGRhdGEtZ290by1wcmV2PVwic3RlcC0xXCI+XG4gKlxuICogICAgICAgIDwhLS0gZGF0YS1nb3RvLWtleS1saXN0IGFuZCBkYXRhLWdvdG8tbmV4dC1saXN0IGFsbG93IHlvdSB0byBidWlsZCBhZHZhbmNlZCBub24tbGluZWFyXG4gKiAgICAgICAgICAgICBuYXZpZ2F0aW9uLiAtLT5cbiAqICAgICAgICA8ZGl2IGNsYXNzPVwic3RlcFwiXG4gKiAgICAgICAgICAgICBkYXRhLWdvdG8ta2V5LWxpc3Q9XCJBcnJvd1VwIEFycm93RG93biBBcnJvd1JpZ2h0IEFycm93TGVmdFwiXG4gKiAgICAgICAgICAgICBkYXRhLWdvdG8tbmV4dC1saXN0PVwic3RlcC00IHN0ZXAtMyBzdGVwLTIgc3RlcC01XCI+XG4gKlxuICogU2VlIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9LZXlib2FyZEV2ZW50L2tleS9LZXlfVmFsdWVzIGZvciBhIHRhYmxlXG4gKiBvZiB3aGF0IHN0cmluZ3MgdG8gdXNlIGZvciBlYWNoIGtleS5cbiAqXG4gKiBDb3B5cmlnaHQgMjAxNi0yMDE3IEhlbnJpayBJbmdvIChAaGVucmlraW5nbylcbiAqIFJlbGVhc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZS5cbiAqL1xuLyogZ2xvYmFsIHdpbmRvdywgZG9jdW1lbnQsIGltcHJlc3MgKi9cblxuKCBmdW5jdGlvbiggZG9jdW1lbnQsIHdpbmRvdyApIHtcbiAgICBcInVzZSBzdHJpY3RcIjtcbiAgICB2YXIgbGliO1xuXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggXCJpbXByZXNzOmluaXRcIiwgZnVuY3Rpb24oIGV2ZW50ICkge1xuICAgICAgICBsaWIgPSBldmVudC5kZXRhaWwuYXBpLmxpYjtcbiAgICB9LCBmYWxzZSApO1xuXG4gICAgdmFyIGlzTnVtYmVyID0gZnVuY3Rpb24oIG51bWVyaWMgKSB7XG4gICAgICAgIHJldHVybiAhaXNOYU4oIG51bWVyaWMgKTtcbiAgICB9O1xuXG4gICAgdmFyIGdvdG8gPSBmdW5jdGlvbiggZXZlbnQgKSB7XG4gICAgICAgIGlmICggKCAhZXZlbnQgKSB8fCAoICFldmVudC50YXJnZXQgKSApIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBkYXRhID0gZXZlbnQudGFyZ2V0LmRhdGFzZXQ7XG4gICAgICAgIHZhciBzdGVwcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoIFwiLnN0ZXBcIiApO1xuXG4gICAgICAgIC8vIERhdGEtZ290by1rZXktbGlzdD1cIlwiICYgZGF0YS1nb3RvLW5leHQtbGlzdD1cIlwiIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuICAgICAgICBpZiAoIGRhdGEuZ290b0tleUxpc3QgIT09IHVuZGVmaW5lZCAmJlxuICAgICAgICAgICAgIGRhdGEuZ290b05leHRMaXN0ICE9PSB1bmRlZmluZWQgJiZcbiAgICAgICAgICAgICBldmVudC5vcmlnRXZlbnQgIT09IHVuZGVmaW5lZCAmJlxuICAgICAgICAgICAgIGV2ZW50Lm9yaWdFdmVudC5rZXkgIT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgICAgIHZhciBrZXlsaXN0ID0gZGF0YS5nb3RvS2V5TGlzdC5zcGxpdCggXCIgXCIgKTtcbiAgICAgICAgICAgIHZhciBuZXh0bGlzdCA9IGRhdGEuZ290b05leHRMaXN0LnNwbGl0KCBcIiBcIiApO1xuXG4gICAgICAgICAgICBpZiAoIGtleWxpc3QubGVuZ3RoICE9PSBuZXh0bGlzdC5sZW5ndGggKSB7XG4gICAgICAgICAgICAgICAgd2luZG93LmNvbnNvbGUubG9nKFxuICAgICAgICAgICAgICAgICAgICBcImltcHJlc3MgZ290byBwbHVnaW46IGRhdGEtZ290by1rZXktbGlzdCBhbmQgZGF0YS1nb3RvLW5leHQtbGlzdCBkb24ndCBtYXRjaDpcIlxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgd2luZG93LmNvbnNvbGUubG9nKCBrZXlsaXN0ICk7XG4gICAgICAgICAgICAgICAgd2luZG93LmNvbnNvbGUubG9nKCBuZXh0bGlzdCApO1xuXG4gICAgICAgICAgICAgICAgLy8gRG9uJ3QgcmV0dXJuLCBhbGxvdyB0aGUgb3RoZXIgY2F0ZWdvcmllcyB0byB3b3JrIGRlc3BpdGUgdGhpcyBlcnJvclxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB2YXIgaW5kZXggPSBrZXlsaXN0LmluZGV4T2YoIGV2ZW50Lm9yaWdFdmVudC5rZXkgKTtcbiAgICAgICAgICAgICAgICBpZiAoIGluZGV4ID49IDAgKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBuZXh0ID0gbmV4dGxpc3RbIGluZGV4IF07XG4gICAgICAgICAgICAgICAgICAgIGlmICggaXNOdW1iZXIoIG5leHQgKSApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50LmRldGFpbC5uZXh0ID0gc3RlcHNbIG5leHQgXTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gSWYgdGhlIG5ldyBuZXh0IGVsZW1lbnQgaGFzIGl0cyBvd24gdHJhbnNpdGlvbkR1cmF0aW9uLCB3ZSdyZSByZXNwb25zaWJsZVxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gZm9yIHNldHRpbmcgdGhhdCBvbiB0aGUgZXZlbnQgYXMgd2VsbFxuICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnQuZGV0YWlsLnRyYW5zaXRpb25EdXJhdGlvbiA9IGxpYi51dGlsLnRvTnVtYmVyKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50LmRldGFpbC5uZXh0LmRhdGFzZXQudHJhbnNpdGlvbkR1cmF0aW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50LmRldGFpbC50cmFuc2l0aW9uRHVyYXRpb25cbiAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgbmV3VGFyZ2V0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoIG5leHQgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICggbmV3VGFyZ2V0ICYmIG5ld1RhcmdldC5jbGFzc0xpc3QuY29udGFpbnMoIFwic3RlcFwiICkgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnQuZGV0YWlsLm5leHQgPSBuZXdUYXJnZXQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnQuZGV0YWlsLnRyYW5zaXRpb25EdXJhdGlvbiA9IGxpYi51dGlsLnRvTnVtYmVyKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBldmVudC5kZXRhaWwubmV4dC5kYXRhc2V0LnRyYW5zaXRpb25EdXJhdGlvbixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnQuZGV0YWlsLnRyYW5zaXRpb25EdXJhdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cuY29uc29sZS5sb2coIFwiaW1wcmVzcyBnb3RvIHBsdWdpbjogXCIgKyBuZXh0ICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiIGlzIG5vdCBhIHN0ZXAgaW4gdGhpcyBpbXByZXNzIHByZXNlbnRhdGlvbi5cIiApO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gRGF0YS1nb3RvLW5leHQ9XCJcIiAmIGRhdGEtZ290by1wcmV2PVwiXCIgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbiAgICAgICAgLy8gSGFuZGxlIGV2ZW50LnRhcmdldCBkYXRhLWdvdG8tbmV4dCBhdHRyaWJ1dGVcbiAgICAgICAgaWYgKCBpc051bWJlciggZGF0YS5nb3RvTmV4dCApICYmIGV2ZW50LmRldGFpbC5yZWFzb24gPT09IFwibmV4dFwiICkge1xuICAgICAgICAgICAgZXZlbnQuZGV0YWlsLm5leHQgPSBzdGVwc1sgZGF0YS5nb3RvTmV4dCBdO1xuXG4gICAgICAgICAgICAvLyBJZiB0aGUgbmV3IG5leHQgZWxlbWVudCBoYXMgaXRzIG93biB0cmFuc2l0aW9uRHVyYXRpb24sIHdlJ3JlIHJlc3BvbnNpYmxlIGZvciBzZXR0aW5nXG4gICAgICAgICAgICAvLyB0aGF0IG9uIHRoZSBldmVudCBhcyB3ZWxsXG4gICAgICAgICAgICBldmVudC5kZXRhaWwudHJhbnNpdGlvbkR1cmF0aW9uID0gbGliLnV0aWwudG9OdW1iZXIoXG4gICAgICAgICAgICAgICAgZXZlbnQuZGV0YWlsLm5leHQuZGF0YXNldC50cmFuc2l0aW9uRHVyYXRpb24sIGV2ZW50LmRldGFpbC50cmFuc2l0aW9uRHVyYXRpb25cbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCBkYXRhLmdvdG9OZXh0ICYmIGV2ZW50LmRldGFpbC5yZWFzb24gPT09IFwibmV4dFwiICkge1xuICAgICAgICAgICAgdmFyIG5ld1RhcmdldCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCBkYXRhLmdvdG9OZXh0ICk7IC8vIGpzaGludCBpZ25vcmU6bGluZVxuICAgICAgICAgICAgaWYgKCBuZXdUYXJnZXQgJiYgbmV3VGFyZ2V0LmNsYXNzTGlzdC5jb250YWlucyggXCJzdGVwXCIgKSApIHtcbiAgICAgICAgICAgICAgICBldmVudC5kZXRhaWwubmV4dCA9IG5ld1RhcmdldDtcbiAgICAgICAgICAgICAgICBldmVudC5kZXRhaWwudHJhbnNpdGlvbkR1cmF0aW9uID0gbGliLnV0aWwudG9OdW1iZXIoXG4gICAgICAgICAgICAgICAgICAgIGV2ZW50LmRldGFpbC5uZXh0LmRhdGFzZXQudHJhbnNpdGlvbkR1cmF0aW9uLFxuICAgICAgICAgICAgICAgICAgICBldmVudC5kZXRhaWwudHJhbnNpdGlvbkR1cmF0aW9uXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHdpbmRvdy5jb25zb2xlLmxvZyggXCJpbXByZXNzIGdvdG8gcGx1Z2luOiBcIiArIGRhdGEuZ290b05leHQgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCIgaXMgbm90IGEgc3RlcCBpbiB0aGlzIGltcHJlc3MgcHJlc2VudGF0aW9uLlwiICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBIYW5kbGUgZXZlbnQudGFyZ2V0IGRhdGEtZ290by1wcmV2IGF0dHJpYnV0ZVxuICAgICAgICBpZiAoIGlzTnVtYmVyKCBkYXRhLmdvdG9QcmV2ICkgJiYgZXZlbnQuZGV0YWlsLnJlYXNvbiA9PT0gXCJwcmV2XCIgKSB7XG4gICAgICAgICAgICBldmVudC5kZXRhaWwubmV4dCA9IHN0ZXBzWyBkYXRhLmdvdG9QcmV2IF07XG4gICAgICAgICAgICBldmVudC5kZXRhaWwudHJhbnNpdGlvbkR1cmF0aW9uID0gbGliLnV0aWwudG9OdW1iZXIoXG4gICAgICAgICAgICAgICAgZXZlbnQuZGV0YWlsLm5leHQuZGF0YXNldC50cmFuc2l0aW9uRHVyYXRpb24sIGV2ZW50LmRldGFpbC50cmFuc2l0aW9uRHVyYXRpb25cbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCBkYXRhLmdvdG9QcmV2ICYmIGV2ZW50LmRldGFpbC5yZWFzb24gPT09IFwicHJldlwiICkge1xuICAgICAgICAgICAgdmFyIG5ld1RhcmdldCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCBkYXRhLmdvdG9QcmV2ICk7IC8vIGpzaGludCBpZ25vcmU6bGluZVxuICAgICAgICAgICAgaWYgKCBuZXdUYXJnZXQgJiYgbmV3VGFyZ2V0LmNsYXNzTGlzdC5jb250YWlucyggXCJzdGVwXCIgKSApIHtcbiAgICAgICAgICAgICAgICBldmVudC5kZXRhaWwubmV4dCA9IG5ld1RhcmdldDtcbiAgICAgICAgICAgICAgICBldmVudC5kZXRhaWwudHJhbnNpdGlvbkR1cmF0aW9uID0gbGliLnV0aWwudG9OdW1iZXIoXG4gICAgICAgICAgICAgICAgICAgIGV2ZW50LmRldGFpbC5uZXh0LmRhdGFzZXQudHJhbnNpdGlvbkR1cmF0aW9uLCBldmVudC5kZXRhaWwudHJhbnNpdGlvbkR1cmF0aW9uXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHdpbmRvdy5jb25zb2xlLmxvZyggXCJpbXByZXNzIGdvdG8gcGx1Z2luOiBcIiArIGRhdGEuZ290b1ByZXYgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCIgaXMgbm90IGEgc3RlcCBpbiB0aGlzIGltcHJlc3MgcHJlc2VudGF0aW9uLlwiICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBEYXRhLWdvdG89XCJcIiAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuICAgICAgICAvLyBIYW5kbGUgZXZlbnQudGFyZ2V0IGRhdGEtZ290byBhdHRyaWJ1dGVcbiAgICAgICAgaWYgKCBpc051bWJlciggZGF0YS5nb3RvICkgKSB7XG4gICAgICAgICAgICBldmVudC5kZXRhaWwubmV4dCA9IHN0ZXBzWyBkYXRhLmdvdG8gXTtcbiAgICAgICAgICAgIGV2ZW50LmRldGFpbC50cmFuc2l0aW9uRHVyYXRpb24gPSBsaWIudXRpbC50b051bWJlcihcbiAgICAgICAgICAgICAgICBldmVudC5kZXRhaWwubmV4dC5kYXRhc2V0LnRyYW5zaXRpb25EdXJhdGlvbiwgZXZlbnQuZGV0YWlsLnRyYW5zaXRpb25EdXJhdGlvblxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIGRhdGEuZ290byApIHtcbiAgICAgICAgICAgIHZhciBuZXdUYXJnZXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCggZGF0YS5nb3RvICk7IC8vIGpzaGludCBpZ25vcmU6bGluZVxuICAgICAgICAgICAgaWYgKCBuZXdUYXJnZXQgJiYgbmV3VGFyZ2V0LmNsYXNzTGlzdC5jb250YWlucyggXCJzdGVwXCIgKSApIHtcbiAgICAgICAgICAgICAgICBldmVudC5kZXRhaWwubmV4dCA9IG5ld1RhcmdldDtcbiAgICAgICAgICAgICAgICBldmVudC5kZXRhaWwudHJhbnNpdGlvbkR1cmF0aW9uID0gbGliLnV0aWwudG9OdW1iZXIoXG4gICAgICAgICAgICAgICAgICAgIGV2ZW50LmRldGFpbC5uZXh0LmRhdGFzZXQudHJhbnNpdGlvbkR1cmF0aW9uLCBldmVudC5kZXRhaWwudHJhbnNpdGlvbkR1cmF0aW9uXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHdpbmRvdy5jb25zb2xlLmxvZyggXCJpbXByZXNzIGdvdG8gcGx1Z2luOiBcIiArIGRhdGEuZ290byArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIiBpcyBub3QgYSBzdGVwIGluIHRoaXMgaW1wcmVzcyBwcmVzZW50YXRpb24uXCIgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvLyBSZWdpc3RlciB0aGUgcGx1Z2luIHRvIGJlIGNhbGxlZCBpbiBwcmUtc3RlcGxlYXZlIHBoYXNlXG4gICAgaW1wcmVzcy5hZGRQcmVTdGVwTGVhdmVQbHVnaW4oIGdvdG8gKTtcblxufSApKCBkb2N1bWVudCwgd2luZG93ICk7XG5cblxuLyoqXG4gKiBIZWxwIHBvcHVwIHBsdWdpblxuICpcbiAqIEV4YW1wbGU6XG4gKlxuICogICAgIDwhLS0gU2hvdyBhIGhlbHAgcG9wdXAgYXQgc3RhcnQsIG9yIGlmIHVzZXIgcHJlc3NlcyBcIkhcIiAtLT5cbiAqICAgICA8ZGl2IGlkPVwiaW1wcmVzcy1oZWxwXCI+PC9kaXY+XG4gKlxuICogRm9yIGRldmVsb3BlcnM6XG4gKlxuICogVHlwaWNhbCB1c2UgZm9yIHRoaXMgcGx1Z2luLCBpcyBmb3IgcGx1Z2lucyB0aGF0IHN1cHBvcnQgc29tZSBrZXlwcmVzcywgdG8gYWRkIGEgbGluZVxuICogdG8gdGhlIGhlbHAgcG9wdXAgcHJvZHVjZWQgYnkgdGhpcyBwbHVnaW4uIEZvciBleGFtcGxlIFwiUDogUHJlc2VudGVyIGNvbnNvbGVcIi5cbiAqXG4gKiBDb3B5cmlnaHQgMjAxNiBIZW5yaWsgSW5nbyAoQGhlbnJpa2luZ28pXG4gKiBSZWxlYXNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2UuXG4gKi9cbi8qIGdsb2JhbCB3aW5kb3csIGRvY3VtZW50ICovXG5cbiggZnVuY3Rpb24oIGRvY3VtZW50LCB3aW5kb3cgKSB7XG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG4gICAgdmFyIHJvd3MgPSBbXTtcbiAgICB2YXIgdGltZW91dEhhbmRsZTtcblxuICAgIHZhciB0cmlnZ2VyRXZlbnQgPSBmdW5jdGlvbiggZWwsIGV2ZW50TmFtZSwgZGV0YWlsICkge1xuICAgICAgICB2YXIgZXZlbnQgPSBkb2N1bWVudC5jcmVhdGVFdmVudCggXCJDdXN0b21FdmVudFwiICk7XG4gICAgICAgIGV2ZW50LmluaXRDdXN0b21FdmVudCggZXZlbnROYW1lLCB0cnVlLCB0cnVlLCBkZXRhaWwgKTtcbiAgICAgICAgZWwuZGlzcGF0Y2hFdmVudCggZXZlbnQgKTtcbiAgICB9O1xuXG4gICAgdmFyIHJlbmRlckhlbHBEaXYgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGhlbHBEaXYgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCggXCJpbXByZXNzLWhlbHBcIiApO1xuICAgICAgICBpZiAoIGhlbHBEaXYgKSB7XG4gICAgICAgICAgICB2YXIgaHRtbCA9IFtdO1xuICAgICAgICAgICAgZm9yICggdmFyIHJvdyBpbiByb3dzICkge1xuICAgICAgICAgICAgICAgIGZvciAoIHZhciBhcnJheUl0ZW0gaW4gcm93ICkge1xuICAgICAgICAgICAgICAgICAgICBodG1sLnB1c2goIHJvd3NbIHJvdyBdWyBhcnJheUl0ZW0gXSApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICggaHRtbCApIHtcbiAgICAgICAgICAgICAgICBoZWxwRGl2LmlubmVySFRNTCA9IFwiPHRhYmxlPlxcblwiICsgaHRtbC5qb2luKCBcIlxcblwiICkgKyBcIjwvdGFibGU+XFxuXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgdmFyIHRvZ2dsZUhlbHAgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGhlbHBEaXYgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCggXCJpbXByZXNzLWhlbHBcIiApO1xuICAgICAgICBpZiAoICFoZWxwRGl2ICkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCBoZWxwRGl2LnN0eWxlLmRpc3BsYXkgPT09IFwiYmxvY2tcIiApIHtcbiAgICAgICAgICAgIGhlbHBEaXYuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaGVscERpdi5zdHlsZS5kaXNwbGF5ID0gXCJibG9ja1wiO1xuICAgICAgICAgICAgd2luZG93LmNsZWFyVGltZW91dCggdGltZW91dEhhbmRsZSApO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoIFwia2V5dXBcIiwgZnVuY3Rpb24oIGV2ZW50ICkge1xuXG4gICAgICAgIGlmICggZXZlbnQua2V5Q29kZSA9PT0gNzIgfHwgZXZlbnQua2V5Q29kZSA9PT0gMTkxICkgeyAvLyBcImhcIiB8fCBcIj9cIlxuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIHRvZ2dsZUhlbHAoKTtcbiAgICAgICAgfVxuICAgIH0sIGZhbHNlICk7XG5cbiAgICAvLyBBUElcbiAgICAvLyBPdGhlciBwbHVnaW5zIGNhbiBhZGQgaGVscCB0ZXh0cywgdHlwaWNhbGx5IGlmIHRoZXkgc3VwcG9ydCBhbiBhY3Rpb24gb24gYSBrZXlwcmVzcy5cbiAgICAvKipcbiAgICAgKiBBZGQgYSBoZWxwIHRleHQgdG8gdGhlIGhlbHAgcG9wdXAuXG4gICAgICpcbiAgICAgKiA6cGFyYW06IGUuZGV0YWlsLmNvbW1hbmQgIEV4YW1wbGU6IFwiSFwiXG4gICAgICogOnBhcmFtOiBlLmRldGFpbC50ZXh0ICAgICBFeGFtcGxlOiBcIlNob3cgdGhpcyBoZWxwLlwiXG4gICAgICogOnBhcmFtOiBlLmRldGFpbC5yb3cgICAgICBSb3cgaW5kZXggZnJvbSAwIHRvIDkgd2hlcmUgdG8gcGxhY2UgdGhpcyBoZWxwIHRleHQuIEV4YW1wbGU6IDBcbiAgICAgKi9cbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCBcImltcHJlc3M6aGVscDphZGRcIiwgZnVuY3Rpb24oIGUgKSB7XG5cbiAgICAgICAgLy8gVGhlIGlkZWEgaXMgZm9yIHRoZSBzZW5kZXIgb2YgdGhlIGV2ZW50IHRvIHN1cHBseSBhIHVuaXF1ZSByb3cgaW5kZXgsIHVzZWQgZm9yIHNvcnRpbmcuXG4gICAgICAgIC8vIEJ1dCBqdXN0IGluIGNhc2UgdHdvIHBsdWdpbnMgd291bGQgZXZlciB1c2UgdGhlIHNhbWUgcm93IGluZGV4LCB3ZSB3cmFwIGVhY2ggcm93IGludG9cbiAgICAgICAgLy8gaXRzIG93biBhcnJheS4gSWYgdGhlcmUgYXJlIG1vcmUgdGhhbiBvbmUgZW50cnkgZm9yIHRoZSBzYW1lIGluZGV4LCB0aGV5IGFyZSBzaG93biBpblxuICAgICAgICAvLyBmaXJzdCBjb21lLCBmaXJzdCBzZXJ2ZSBvcmRlcmluZy5cbiAgICAgICAgdmFyIHJvd0luZGV4ID0gZS5kZXRhaWwucm93O1xuICAgICAgICBpZiAoIHR5cGVvZiByb3dzWyByb3dJbmRleCBdICE9PSBcIm9iamVjdFwiIHx8ICFyb3dzWyByb3dJbmRleCBdLmlzQXJyYXkgKSB7XG4gICAgICAgICAgICByb3dzWyByb3dJbmRleCBdID0gW107XG4gICAgICAgIH1cbiAgICAgICAgcm93c1sgZS5kZXRhaWwucm93IF0ucHVzaCggXCI8dHI+PHRkPjxzdHJvbmc+XCIgKyBlLmRldGFpbC5jb21tYW5kICsgXCI8L3N0cm9uZz48L3RkPjx0ZD5cIiArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGUuZGV0YWlsLnRleHQgKyBcIjwvdGQ+PC90cj5cIiApO1xuICAgICAgICByZW5kZXJIZWxwRGl2KCk7XG4gICAgfSApO1xuXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggXCJpbXByZXNzOmluaXRcIiwgZnVuY3Rpb24oIGUgKSB7XG4gICAgICAgIHJlbmRlckhlbHBEaXYoKTtcblxuICAgICAgICAvLyBBdCBzdGFydCwgc2hvdyB0aGUgaGVscCBmb3IgNyBzZWNvbmRzLlxuICAgICAgICB2YXIgaGVscERpdiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCBcImltcHJlc3MtaGVscFwiICk7XG4gICAgICAgIGlmICggaGVscERpdiApIHtcbiAgICAgICAgICAgIGhlbHBEaXYuc3R5bGUuZGlzcGxheSA9IFwiYmxvY2tcIjtcbiAgICAgICAgICAgIHRpbWVvdXRIYW5kbGUgPSB3aW5kb3cuc2V0VGltZW91dCggZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgdmFyIGhlbHBEaXYgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCggXCJpbXByZXNzLWhlbHBcIiApO1xuICAgICAgICAgICAgICAgIGhlbHBEaXYuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xuICAgICAgICAgICAgfSwgNzAwMCApO1xuXG4gICAgICAgICAgICAvLyBSZWdzdGVyIGNhbGxiYWNrIHRvIGVtcHR5IHRoZSBoZWxwIGRpdiBvbiB0ZWFyZG93blxuICAgICAgICAgICAgdmFyIGFwaSA9IGUuZGV0YWlsLmFwaTtcbiAgICAgICAgICAgIGFwaS5saWIuZ2MucHVzaENhbGxiYWNrKCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICB3aW5kb3cuY2xlYXJUaW1lb3V0KCB0aW1lb3V0SGFuZGxlICk7XG4gICAgICAgICAgICAgICAgaGVscERpdi5zdHlsZS5kaXNwbGF5ID0gXCJcIjtcbiAgICAgICAgICAgICAgICBoZWxwRGl2LmlubmVySFRNTCA9IFwiXCI7XG4gICAgICAgICAgICAgICAgcm93cyA9IFtdO1xuICAgICAgICAgICAgfSApO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gVXNlIG91ciBvd24gQVBJIHRvIHJlZ2lzdGVyIHRoZSBoZWxwIHRleHQgZm9yIFwiaFwiXG4gICAgICAgIHRyaWdnZXJFdmVudCggZG9jdW1lbnQsIFwiaW1wcmVzczpoZWxwOmFkZFwiLFxuICAgICAgICAgICAgICAgICAgICAgIHsgY29tbWFuZDogXCJIXCIsIHRleHQ6IFwiU2hvdyB0aGlzIGhlbHBcIiwgcm93OiAwIH0gKTtcbiAgICB9ICk7XG5cbn0gKSggZG9jdW1lbnQsIHdpbmRvdyApO1xuXG5cbi8qKlxuICogQWRkcyBhIHByZXNlbnRlciBjb25zb2xlIHRvIGltcHJlc3MuanNcbiAqXG4gKiBNSVQgTGljZW5zZWQsIHNlZSBsaWNlbnNlLnR4dC5cbiAqXG4gKiBDb3B5cmlnaHQgMjAxMiwgMjAxMywgMjAxNSBpbXByZXNzLWNvbnNvbGUgY29udHJpYnV0b3JzIChzZWUgUkVBRE1FLnR4dClcbiAqXG4gKiB2ZXJzaW9uOiAxLjMtZGV2XG4gKlxuICovXG5cbi8vIFRoaXMgZmlsZSBjb250YWlucyBzbyBtdWNoIEhUTUwsIHRoYXQgd2Ugd2lsbCBqdXN0IHJlc3BlY3RmdWxseSBkaXNhZ3JlZSBhYm91dCBqc1xuLyoganNoaW50IHF1b3RtYXJrOnNpbmdsZSAqL1xuLyogZ2xvYmFsIG5hdmlnYXRvciwgdG9wLCBzZXRJbnRlcnZhbCwgY2xlYXJJbnRlcnZhbCwgZG9jdW1lbnQsIHdpbmRvdyAqL1xuXG4oIGZ1bmN0aW9uKCBkb2N1bWVudCwgd2luZG93ICkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIC8vIFRPRE86IE1vdmUgdGhpcyB0byBzcmMvbGliL3V0aWwuanNcbiAgICB2YXIgdHJpZ2dlckV2ZW50ID0gZnVuY3Rpb24oIGVsLCBldmVudE5hbWUsIGRldGFpbCApIHtcbiAgICAgICAgdmFyIGV2ZW50ID0gZG9jdW1lbnQuY3JlYXRlRXZlbnQoICdDdXN0b21FdmVudCcgKTtcbiAgICAgICAgZXZlbnQuaW5pdEN1c3RvbUV2ZW50KCBldmVudE5hbWUsIHRydWUsIHRydWUsIGRldGFpbCApO1xuICAgICAgICBlbC5kaXNwYXRjaEV2ZW50KCBldmVudCApO1xuICAgIH07XG5cbiAgICAvLyBDcmVhdGUgTGFuZ3VhZ2Ugb2JqZWN0IGRlcGVuZGluZyBvbiBicm93c2VycyBsYW5ndWFnZSBzZXR0aW5nXG4gICAgdmFyIGxhbmc7XG4gICAgc3dpdGNoICggbmF2aWdhdG9yLmxhbmd1YWdlICkge1xuICAgIGNhc2UgJ2RlJzpcbiAgICAgICAgbGFuZyA9IHtcbiAgICAgICAgICAgICdub05vdGVzJzogJzxkaXYgY2xhc3M9XCJub05vdGVzXCI+S2VpbmUgTm90aXplbiBoaWVyenU8L2Rpdj4nLFxuICAgICAgICAgICAgJ3Jlc3RhcnQnOiAnTmV1c3RhcnQnLFxuICAgICAgICAgICAgJ2NsaWNrVG9PcGVuJzogJ0tsaWNrZW4gdW0gU3ByZWNoZXJrb25zb2xlIHp1IMO2ZmZuZW4nLFxuICAgICAgICAgICAgJ3ByZXYnOiAnenVyw7xjaycsXG4gICAgICAgICAgICAnbmV4dCc6ICd3ZWl0ZXInLFxuICAgICAgICAgICAgJ2xvYWRpbmcnOiAnaW5pdGFsaXNpZXJlJyxcbiAgICAgICAgICAgICdyZWFkeSc6ICdCZXJlaXQnLFxuICAgICAgICAgICAgJ21vdmluZyc6ICdpbiBCZXdlZ3VuZycsXG4gICAgICAgICAgICAndXNlQU1QTSc6IGZhbHNlXG4gICAgICAgIH07XG4gICAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2VuJzogLy8ganNoaW50IGlnbm9yZTpsaW5lXG4gICAgZGVmYXVsdCA6IC8vIGpzaGludCBpZ25vcmU6bGluZVxuICAgICAgICBsYW5nID0ge1xuICAgICAgICAgICAgJ25vTm90ZXMnOiAnPGRpdiBjbGFzcz1cIm5vTm90ZXNcIj5ObyBub3RlcyBmb3IgdGhpcyBzdGVwPC9kaXY+JyxcbiAgICAgICAgICAgICdyZXN0YXJ0JzogJ1Jlc3RhcnQnLFxuICAgICAgICAgICAgJ2NsaWNrVG9PcGVuJzogJ0NsaWNrIHRvIG9wZW4gc3BlYWtlciBjb25zb2xlJyxcbiAgICAgICAgICAgICdwcmV2JzogJ1ByZXYnLFxuICAgICAgICAgICAgJ25leHQnOiAnTmV4dCcsXG4gICAgICAgICAgICAnbG9hZGluZyc6ICdMb2FkaW5nJyxcbiAgICAgICAgICAgICdyZWFkeSc6ICdSZWFkeScsXG4gICAgICAgICAgICAnbW92aW5nJzogJ01vdmluZycsXG4gICAgICAgICAgICAndXNlQU1QTSc6IGZhbHNlXG4gICAgICAgIH07XG4gICAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIC8vIFNldHRpbmdzIHRvIHNldCBpZnJhbWUgaW4gc3BlYWtlciBjb25zb2xlXG4gICAgY29uc3QgcHJlVmlld0RlZmF1bHRGYWN0b3IgPSAwLjc7XG4gICAgY29uc3QgcHJlVmlld01pbmltdW1GYWN0b3IgPSAwLjU7XG4gICAgY29uc3QgcHJlVmlld0dhcCAgICA9IDQ7XG5cbiAgICAvLyBUaGlzIGlzIHRoZSBkZWZhdWx0IHRlbXBsYXRlIGZvciB0aGUgc3BlYWtlciBjb25zb2xlIHdpbmRvd1xuICAgIGNvbnN0IGNvbnNvbGVUZW1wbGF0ZSA9ICc8IURPQ1RZUEUgaHRtbD4nICtcbiAgICAgICAgJzxodG1sIGlkPVwiaW1wcmVzc2NvbnNvbGVcIj48aGVhZD4nICtcblxuICAgICAgICAgIC8vIE9yZGVyIGlzIGltcG9ydGFudDogSWYgdXNlciBwcm92aWRlcyBhIGNzc0ZpbGUsIHRob3NlIHdpbGwgd2luLCBiZWNhdXNlIHRoZXkncmUgbGF0ZXJcbiAgICAgICAgICAne3tjc3NTdHlsZX19JyArXG4gICAgICAgICAgJ3t7Y3NzTGlua319JyArXG4gICAgICAgICc8L2hlYWQ+PGJvZHk+JyArXG4gICAgICAgICc8ZGl2IGlkPVwiY29uc29sZVwiPicgK1xuICAgICAgICAgICc8ZGl2IGlkPVwidmlld3NcIj4nICtcbiAgICAgICAgICAgICc8aWZyYW1lIGlkPVwic2xpZGVWaWV3XCIgc2Nyb2xsaW5nPVwibm9cIj48L2lmcmFtZT4nICtcbiAgICAgICAgICAgICc8aWZyYW1lIGlkPVwicHJlVmlld1wiIHNjcm9sbGluZz1cIm5vXCI+PC9pZnJhbWU+JyArXG4gICAgICAgICAgICAnPGRpdiBpZD1cImJsb2NrZXJcIj48L2Rpdj4nICtcbiAgICAgICAgICAnPC9kaXY+JyArXG4gICAgICAgICAgJzxkaXYgaWQ9XCJub3Rlc1wiPjwvZGl2PicgK1xuICAgICAgICAnPC9kaXY+JyArXG4gICAgICAgICc8ZGl2IGlkPVwiY29udHJvbHNcIj4gJyArXG4gICAgICAgICAgJzxkaXYgaWQ9XCJwcmV2XCI+PGEgIGhyZWY9XCIjXCIgb25jbGljaz1cImltcHJlc3MoKS5wcmV2KCk7IHJldHVybiBmYWxzZTtcIiAvPicgK1xuICAgICAgICAgICAgJ3t7cHJldn19PC9hPjwvZGl2PicgK1xuICAgICAgICAgICc8ZGl2IGlkPVwibmV4dFwiPjxhICBocmVmPVwiI1wiIG9uY2xpY2s9XCJpbXByZXNzKCkubmV4dCgpOyByZXR1cm4gZmFsc2U7XCIgLz4nICtcbiAgICAgICAgICAgICd7e25leHR9fTwvYT48L2Rpdj4nICtcbiAgICAgICAgICAnPGRpdiBpZD1cImNsb2NrXCI+LS06LS08L2Rpdj4nICtcbiAgICAgICAgICAnPGRpdiBpZD1cInRpbWVyXCIgb25jbGljaz1cInRpbWVyUmVzZXQoKVwiPjAwbSAwMHM8L2Rpdj4nICtcbiAgICAgICAgICAnPGRpdiBpZD1cInN0YXR1c1wiPnt7bG9hZGluZ319PC9kaXY+JyArXG4gICAgICAgICc8L2Rpdj4nICtcbiAgICAgICAgJzwvYm9keT48L2h0bWw+JztcblxuICAgIC8vIERlZmF1bHQgY3NzIGxvY2F0aW9uXG4gICAgdmFyIGNzc0ZpbGVPbGREZWZhdWx0ID0gJ2Nzcy9pbXByZXNzQ29uc29sZS5jc3MnO1xuICAgIHZhciBjc3NGaWxlID0gdW5kZWZpbmVkOyAvLyBqc2hpbnQgaWdub3JlOmxpbmVcblxuICAgIC8vIENzcyBmb3Igc3R5bGluZyBpZnJhbXMgb24gdGhlIGNvbnNvbGVcbiAgICB2YXIgY3NzRmlsZUlmcmFtZU9sZERlZmF1bHQgPSAnY3NzL2lmcmFtZS5jc3MnO1xuICAgIHZhciBjc3NGaWxlSWZyYW1lID0gdW5kZWZpbmVkOyAvLyBqc2hpbnQgaWdub3JlOmxpbmVcblxuICAgIC8vIEFsbCBjb25zb2xlIHdpbmRvd3MsIHNvIHRoYXQgeW91IGNhbiBjYWxsIGltcHJlc3NDb25zb2xlKCkgcmVwZWF0ZWRseS5cbiAgICB2YXIgYWxsQ29uc29sZXMgPSB7fTtcblxuICAgIC8vIFplcm8gcGFkZGluZyBoZWxwZXIgZnVuY3Rpb246XG4gICAgdmFyIHplcm9QYWQgPSBmdW5jdGlvbiggaSApIHtcbiAgICAgICAgcmV0dXJuICggaSA8IDEwID8gJzAnIDogJycgKSArIGk7XG4gICAgfTtcblxuICAgIC8vIFRoZSBjb25zb2xlIG9iamVjdFxuICAgIHZhciBpbXByZXNzQ29uc29sZSA9IHdpbmRvdy5pbXByZXNzQ29uc29sZSA9IGZ1bmN0aW9uKCByb290SWQgKSB7XG5cbiAgICAgICAgcm9vdElkID0gcm9vdElkIHx8ICdpbXByZXNzJztcblxuICAgICAgICBpZiAoIGFsbENvbnNvbGVzWyByb290SWQgXSApIHtcbiAgICAgICAgICAgIHJldHVybiBhbGxDb25zb2xlc1sgcm9vdElkIF07XG4gICAgICAgIH1cblxuICAgICAgICAvLyBSb290IHByZXNlbnRhdGlvbiBlbGVtZW50c1xuICAgICAgICB2YXIgcm9vdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCByb290SWQgKTtcblxuICAgICAgICB2YXIgY29uc29sZVdpbmRvdyA9IG51bGw7XG5cbiAgICAgICAgdmFyIG5leHRTdGVwID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgY2xhc3NlcyA9ICcnO1xuICAgICAgICAgICAgdmFyIG5leHRFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvciggJy5hY3RpdmUnICk7XG5cbiAgICAgICAgICAgIC8vIFJldHVybiB0byBwYXJlbnRzIGFzIGxvbmcgYXMgdGhlcmUgaXMgbm8gbmV4dCBzaWJsaW5nXG4gICAgICAgICAgICB3aGlsZSAoICFuZXh0RWxlbWVudC5uZXh0RWxlbWVudFNpYmxpbmcgJiYgbmV4dEVsZW1lbnQucGFyZW50Tm9kZSApIHtcbiAgICAgICAgICAgICAgICBuZXh0RWxlbWVudCA9IG5leHRFbGVtZW50LnBhcmVudE5vZGU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBuZXh0RWxlbWVudCA9IG5leHRFbGVtZW50Lm5leHRFbGVtZW50U2libGluZztcbiAgICAgICAgICAgIHdoaWxlICggbmV4dEVsZW1lbnQgKSB7XG4gICAgICAgICAgICAgICAgY2xhc3NlcyA9IG5leHRFbGVtZW50LmF0dHJpYnV0ZXNbICdjbGFzcycgXTtcbiAgICAgICAgICAgICAgICBpZiAoIGNsYXNzZXMgJiYgY2xhc3Nlcy52YWx1ZS5pbmRleE9mKCAnc3RlcCcgKSAhPT0gLTEgKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGVXaW5kb3cuZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoICdibG9ja2VyJyApLmlubmVySFRNTCA9IGxhbmcubmV4dDtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5leHRFbGVtZW50O1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmICggbmV4dEVsZW1lbnQuZmlyc3RFbGVtZW50Q2hpbGQgKSB7IC8vIEZpcnN0IGdvIGludG8gZGVlcFxuICAgICAgICAgICAgICAgICAgICBuZXh0RWxlbWVudCA9IG5leHRFbGVtZW50LmZpcnN0RWxlbWVudENoaWxkO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gR28gdG8gbmV4dCBzaWJsaW5nIG9yIHRocm91Z2ggcGFyZW50cyB1bnRpbCB0aGVyZSBpcyBhIG5leHQgc2libGluZ1xuICAgICAgICAgICAgICAgICAgICB3aGlsZSAoICFuZXh0RWxlbWVudC5uZXh0RWxlbWVudFNpYmxpbmcgJiYgbmV4dEVsZW1lbnQucGFyZW50Tm9kZSApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5leHRFbGVtZW50ID0gbmV4dEVsZW1lbnQucGFyZW50Tm9kZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBuZXh0RWxlbWVudCA9IG5leHRFbGVtZW50Lm5leHRFbGVtZW50U2libGluZztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIE5vIG5leHQgZWxlbWVudC4gUGljayB0aGUgZmlyc3RcbiAgICAgICAgICAgIGNvbnNvbGVXaW5kb3cuZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoICdibG9ja2VyJyApLmlubmVySFRNTCA9IGxhbmcucmVzdGFydDtcbiAgICAgICAgICAgIHJldHVybiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCAnLnN0ZXAnICk7XG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gU3luYyB0aGUgbm90ZXMgdG8gdGhlIHN0ZXBcbiAgICAgICAgdmFyIG9uU3RlcExlYXZlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZiAoIGNvbnNvbGVXaW5kb3cgKSB7XG5cbiAgICAgICAgICAgICAgICAvLyBTZXQgbm90ZXMgdG8gbmV4dCBzdGVwcyBub3Rlcy5cbiAgICAgICAgICAgICAgICB2YXIgbmV3Tm90ZXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCAnLmFjdGl2ZScgKS5xdWVyeVNlbGVjdG9yKCAnLm5vdGVzJyApO1xuICAgICAgICAgICAgICAgIGlmICggbmV3Tm90ZXMgKSB7XG4gICAgICAgICAgICAgICAgICAgIG5ld05vdGVzID0gbmV3Tm90ZXMuaW5uZXJIVE1MO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIG5ld05vdGVzID0gbGFuZy5ub05vdGVzO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb25zb2xlV2luZG93LmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCAnbm90ZXMnICkuaW5uZXJIVE1MID0gbmV3Tm90ZXM7XG5cbiAgICAgICAgICAgICAgICAvLyBTZXQgdGhlIHZpZXdzXG4gICAgICAgICAgICAgICAgdmFyIGJhc2VVUkwgPSBkb2N1bWVudC5VUkwuc3Vic3RyaW5nKCAwLCBkb2N1bWVudC5VUkwuc2VhcmNoKCAnIy8nICkgKTtcbiAgICAgICAgICAgICAgICB2YXIgc2xpZGVTcmMgPSBiYXNlVVJMICsgJyMnICsgZG9jdW1lbnQucXVlcnlTZWxlY3RvciggJy5hY3RpdmUnICkuaWQ7XG4gICAgICAgICAgICAgICAgdmFyIHByZVNyYyA9IGJhc2VVUkwgKyAnIycgKyBuZXh0U3RlcCgpLmlkO1xuICAgICAgICAgICAgICAgIHZhciBzbGlkZVZpZXcgPSBjb25zb2xlV2luZG93LmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCAnc2xpZGVWaWV3JyApO1xuXG4gICAgICAgICAgICAgICAgLy8gU2V0dGluZyB0aGVtIHdoZW4gdGhleSBhcmUgYWxyZWFkeSBzZXQgY2F1c2VzIGdsaXRoZXMgaW4gRmlyZWZveCwgc28gY2hlY2sgZmlyc3Q6XG4gICAgICAgICAgICAgICAgaWYgKCBzbGlkZVZpZXcuc3JjICE9PSBzbGlkZVNyYyApIHtcbiAgICAgICAgICAgICAgICAgICAgc2xpZGVWaWV3LnNyYyA9IHNsaWRlU3JjO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB2YXIgcHJlVmlldyA9IGNvbnNvbGVXaW5kb3cuZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoICdwcmVWaWV3JyApO1xuICAgICAgICAgICAgICAgIGlmICggcHJlVmlldy5zcmMgIT09IHByZVNyYyApIHtcbiAgICAgICAgICAgICAgICAgICAgcHJlVmlldy5zcmMgPSBwcmVTcmM7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgY29uc29sZVdpbmRvdy5kb2N1bWVudC5nZXRFbGVtZW50QnlJZCggJ3N0YXR1cycgKS5pbm5lckhUTUwgPVxuICAgICAgICAgICAgICAgICAgICAnPHNwYW4gY2xhc3M9XCJtb3ZpbmdcIj4nICsgbGFuZy5tb3ZpbmcgKyAnPC9zcGFuPic7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gU3luYyB0aGUgcHJldmlld3MgdG8gdGhlIHN0ZXBcbiAgICAgICAgdmFyIG9uU3RlcEVudGVyID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZiAoIGNvbnNvbGVXaW5kb3cgKSB7XG5cbiAgICAgICAgICAgICAgICAvLyBXZSBkbyBldmVyeXRoaW5nIGhlcmUgYWdhaW4sIGJlY2F1c2UgaWYgeW91IHN0b3BwZWQgdGhlIHByZXZpb3Mgc3RlcCB0b1xuICAgICAgICAgICAgICAgIC8vIGVhcmx5LCB0aGUgb25zdGVwbGVhdmUgdHJpZ2dlciBpcyBub3QgY2FsbGVkIGZvciB0aGF0IHN0ZXAsIHNvXG4gICAgICAgICAgICAgICAgLy8gd2UgbmVlZCB0aGlzIHRvIHN5bmMgdGhpbmdzLlxuICAgICAgICAgICAgICAgIHZhciBuZXdOb3RlcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoICcuYWN0aXZlJyApLnF1ZXJ5U2VsZWN0b3IoICcubm90ZXMnICk7XG4gICAgICAgICAgICAgICAgaWYgKCBuZXdOb3RlcyApIHtcbiAgICAgICAgICAgICAgICAgICAgbmV3Tm90ZXMgPSBuZXdOb3Rlcy5pbm5lckhUTUw7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgbmV3Tm90ZXMgPSBsYW5nLm5vTm90ZXM7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHZhciBub3RlcyA9IGNvbnNvbGVXaW5kb3cuZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoICdub3RlcycgKTtcbiAgICAgICAgICAgICAgICBub3Rlcy5pbm5lckhUTUwgPSBuZXdOb3RlcztcbiAgICAgICAgICAgICAgICBub3Rlcy5zY3JvbGxUb3AgPSAwO1xuXG4gICAgICAgICAgICAgICAgLy8gU2V0IHRoZSB2aWV3c1xuICAgICAgICAgICAgICAgIHZhciBiYXNlVVJMID0gZG9jdW1lbnQuVVJMLnN1YnN0cmluZyggMCwgZG9jdW1lbnQuVVJMLnNlYXJjaCggJyMvJyApICk7XG4gICAgICAgICAgICAgICAgdmFyIHNsaWRlU3JjID0gYmFzZVVSTCArICcjJyArIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoICcuYWN0aXZlJyApLmlkO1xuICAgICAgICAgICAgICAgIHZhciBwcmVTcmMgPSBiYXNlVVJMICsgJyMnICsgbmV4dFN0ZXAoKS5pZDtcbiAgICAgICAgICAgICAgICB2YXIgc2xpZGVWaWV3ID0gY29uc29sZVdpbmRvdy5kb2N1bWVudC5nZXRFbGVtZW50QnlJZCggJ3NsaWRlVmlldycgKTtcblxuICAgICAgICAgICAgICAgIC8vIFNldHRpbmcgdGhlbSB3aGVuIHRoZXkgYXJlIGFscmVhZHkgc2V0IGNhdXNlcyBnbGl0aGVzIGluIEZpcmVmb3gsIHNvIGNoZWNrIGZpcnN0OlxuICAgICAgICAgICAgICAgIGlmICggc2xpZGVWaWV3LnNyYyAhPT0gc2xpZGVTcmMgKSB7XG4gICAgICAgICAgICAgICAgICAgIHNsaWRlVmlldy5zcmMgPSBzbGlkZVNyYztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdmFyIHByZVZpZXcgPSBjb25zb2xlV2luZG93LmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCAncHJlVmlldycgKTtcbiAgICAgICAgICAgICAgICBpZiAoIHByZVZpZXcuc3JjICE9PSBwcmVTcmMgKSB7XG4gICAgICAgICAgICAgICAgICAgIHByZVZpZXcuc3JjID0gcHJlU3JjO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGNvbnNvbGVXaW5kb3cuZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoICdzdGF0dXMnICkuaW5uZXJIVE1MID1cbiAgICAgICAgICAgICAgICAgICAgJzxzcGFuICBjbGFzcz1cInJlYWR5XCI+JyArIGxhbmcucmVhZHkgKyAnPC9zcGFuPic7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gU3luYyBzdWJzdGVwc1xuICAgICAgICB2YXIgb25TdWJzdGVwID0gZnVuY3Rpb24oIGV2ZW50ICkge1xuICAgICAgICAgICAgaWYgKCBjb25zb2xlV2luZG93ICkge1xuICAgICAgICAgICAgICAgIGlmICggZXZlbnQuZGV0YWlsLnJlYXNvbiA9PT0gJ25leHQnICkge1xuICAgICAgICAgICAgICAgICAgICBvblN1YnN0ZXBTaG93KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICggZXZlbnQuZGV0YWlsLnJlYXNvbiA9PT0gJ3ByZXYnICkge1xuICAgICAgICAgICAgICAgICAgICBvblN1YnN0ZXBIaWRlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIHZhciBvblN1YnN0ZXBTaG93ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgc2xpZGVWaWV3ID0gY29uc29sZVdpbmRvdy5kb2N1bWVudC5nZXRFbGVtZW50QnlJZCggJ3NsaWRlVmlldycgKTtcbiAgICAgICAgICAgIHRyaWdnZXJFdmVudEluVmlldyggc2xpZGVWaWV3LCAnaW1wcmVzczpzdWJzdGVwOnNob3cnICk7XG4gICAgICAgIH07XG5cbiAgICAgICAgdmFyIG9uU3Vic3RlcEhpZGUgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBzbGlkZVZpZXcgPSBjb25zb2xlV2luZG93LmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCAnc2xpZGVWaWV3JyApO1xuICAgICAgICAgICAgdHJpZ2dlckV2ZW50SW5WaWV3KCBzbGlkZVZpZXcsICdpbXByZXNzOnN1YnN0ZXA6aGlkZScgKTtcbiAgICAgICAgfTtcblxuICAgICAgICB2YXIgdHJpZ2dlckV2ZW50SW5WaWV3ID0gZnVuY3Rpb24oIGZyYW1lLCBldmVudE5hbWUsIGRldGFpbCApIHtcblxuICAgICAgICAgICAgLy8gTm90ZTogVW5mb3J0dW5hdGVseSBDaHJvbWUgZG9lcyBub3QgYWxsb3cgY3JlYXRlRXZlbnQgb24gZmlsZTovLyBVUkxzLCBzbyB0aGlzIHdvbid0XG4gICAgICAgICAgICAvLyB3b3JrLiBUaGlzIGRvZXMgd29yayBvbiBGaXJlZm94LCBhbmQgc2hvdWxkIHdvcmsgaWYgdmlld2luZyB0aGUgcHJlc2VudGF0aW9uIG9uIGFcbiAgICAgICAgICAgIC8vIGh0dHA6Ly8gVVJMIG9uIENocm9tZS5cbiAgICAgICAgICAgIHZhciBldmVudCA9IGZyYW1lLmNvbnRlbnREb2N1bWVudC5jcmVhdGVFdmVudCggJ0N1c3RvbUV2ZW50JyApO1xuICAgICAgICAgICAgZXZlbnQuaW5pdEN1c3RvbUV2ZW50KCBldmVudE5hbWUsIHRydWUsIHRydWUsIGRldGFpbCApO1xuICAgICAgICAgICAgZnJhbWUuY29udGVudERvY3VtZW50LmRpc3BhdGNoRXZlbnQoIGV2ZW50ICk7XG4gICAgICAgIH07XG5cbiAgICAgICAgdmFyIHNwYWNlSGFuZGxlciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIG5vdGVzID0gY29uc29sZVdpbmRvdy5kb2N1bWVudC5nZXRFbGVtZW50QnlJZCggJ25vdGVzJyApO1xuICAgICAgICAgICAgaWYgKCBub3Rlcy5zY3JvbGxUb3BNYXggLSBub3Rlcy5zY3JvbGxUb3AgPiAyMCApIHtcbiAgICAgICAgICAgICAgIG5vdGVzLnNjcm9sbFRvcCA9IG5vdGVzLnNjcm9sbFRvcCArIG5vdGVzLmNsaWVudEhlaWdodCAqIDAuODtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICB3aW5kb3cuaW1wcmVzcygpLm5leHQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICB2YXIgdGltZXJSZXNldCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgY29uc29sZVdpbmRvdy50aW1lclN0YXJ0ID0gbmV3IERhdGUoKTtcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBTaG93IGEgY2xvY2tcbiAgICAgICAgdmFyIGNsb2NrVGljayA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIG5vdyA9IG5ldyBEYXRlKCk7XG4gICAgICAgICAgICB2YXIgaG91cnMgPSBub3cuZ2V0SG91cnMoKTtcbiAgICAgICAgICAgIHZhciBtaW51dGVzID0gbm93LmdldE1pbnV0ZXMoKTtcbiAgICAgICAgICAgIHZhciBzZWNvbmRzID0gbm93LmdldFNlY29uZHMoKTtcbiAgICAgICAgICAgIHZhciBhbXBtID0gJyc7XG5cbiAgICAgICAgICAgIGlmICggbGFuZy51c2VBTVBNICkge1xuICAgICAgICAgICAgICAgIGFtcG0gPSAoIGhvdXJzIDwgMTIgKSA/ICdBTScgOiAnUE0nO1xuICAgICAgICAgICAgICAgIGhvdXJzID0gKCBob3VycyA+IDEyICkgPyBob3VycyAtIDEyIDogaG91cnM7XG4gICAgICAgICAgICAgICAgaG91cnMgPSAoIGhvdXJzID09PSAwICkgPyAxMiA6IGhvdXJzO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBDbG9ja1xuICAgICAgICAgICAgdmFyIGNsb2NrU3RyID0gemVyb1BhZCggaG91cnMgKSArICc6JyArIHplcm9QYWQoIG1pbnV0ZXMgKSArICc6JyArIHplcm9QYWQoIHNlY29uZHMgKSArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAnICcgKyBhbXBtO1xuICAgICAgICAgICAgY29uc29sZVdpbmRvdy5kb2N1bWVudC5nZXRFbGVtZW50QnlJZCggJ2Nsb2NrJyApLmZpcnN0Q2hpbGQubm9kZVZhbHVlID0gY2xvY2tTdHI7XG5cbiAgICAgICAgICAgIC8vIFRpbWVyXG4gICAgICAgICAgICBzZWNvbmRzID0gTWF0aC5mbG9vciggKCBub3cgLSBjb25zb2xlV2luZG93LnRpbWVyU3RhcnQgKSAvIDEwMDAgKTtcbiAgICAgICAgICAgIG1pbnV0ZXMgPSBNYXRoLmZsb29yKCBzZWNvbmRzIC8gNjAgKTtcbiAgICAgICAgICAgIHNlY29uZHMgPSBNYXRoLmZsb29yKCBzZWNvbmRzICUgNjAgKTtcbiAgICAgICAgICAgIGNvbnNvbGVXaW5kb3cuZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoICd0aW1lcicgKS5maXJzdENoaWxkLm5vZGVWYWx1ZSA9XG4gICAgICAgICAgICAgICAgemVyb1BhZCggbWludXRlcyApICsgJ20gJyArIHplcm9QYWQoIHNlY29uZHMgKSArICdzJztcblxuICAgICAgICAgICAgaWYgKCAhY29uc29sZVdpbmRvdy5pbml0aWFsaXplZCApIHtcblxuICAgICAgICAgICAgICAgIC8vIE51ZGdlIHRoZSBzbGlkZSB3aW5kb3dzIGFmdGVyIGxvYWQsIG9yIHRoZXkgd2lsbCBzY3JvbGxlZCB3cm9uZyBvbiBGaXJlZm94LlxuICAgICAgICAgICAgICAgIGNvbnNvbGVXaW5kb3cuZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoICdzbGlkZVZpZXcnICkuY29udGVudFdpbmRvdy5zY3JvbGxUbyggMCwgMCApO1xuICAgICAgICAgICAgICAgIGNvbnNvbGVXaW5kb3cuZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoICdwcmVWaWV3JyApLmNvbnRlbnRXaW5kb3cuc2Nyb2xsVG8oIDAsIDAgKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlV2luZG93LmluaXRpYWxpemVkID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICB2YXIgcmVnaXN0ZXJLZXlFdmVudCA9IGZ1bmN0aW9uKCBrZXlDb2RlcywgaGFuZGxlciwgd2luZG93ICkge1xuICAgICAgICAgICAgaWYgKCB3aW5kb3cgPT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgICAgICAgICB3aW5kb3cgPSBjb25zb2xlV2luZG93O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBQcmV2ZW50IGRlZmF1bHQga2V5ZG93biBhY3Rpb24gd2hlbiBvbmUgb2Ygc3VwcG9ydGVkIGtleSBpcyBwcmVzc2VkXG4gICAgICAgICAgICB3aW5kb3cuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggJ2tleWRvd24nLCBmdW5jdGlvbiggZXZlbnQgKSB7XG4gICAgICAgICAgICAgICAgaWYgKCAhZXZlbnQuY3RybEtleSAmJiAhZXZlbnQuYWx0S2V5ICYmICFldmVudC5zaGlmdEtleSAmJiAhZXZlbnQubWV0YUtleSAmJlxuICAgICAgICAgICAgICAgICAgICAga2V5Q29kZXMuaW5kZXhPZiggZXZlbnQua2V5Q29kZSApICE9PSAtMSApIHtcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LCBmYWxzZSApO1xuXG4gICAgICAgICAgICAvLyBUcmlnZ2VyIGltcHJlc3MgYWN0aW9uIG9uIGtleXVwXG4gICAgICAgICAgICB3aW5kb3cuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggJ2tleXVwJywgZnVuY3Rpb24oIGV2ZW50ICkge1xuICAgICAgICAgICAgICAgIGlmICggIWV2ZW50LmN0cmxLZXkgJiYgIWV2ZW50LmFsdEtleSAmJiAhZXZlbnQuc2hpZnRLZXkgJiYgIWV2ZW50Lm1ldGFLZXkgJiZcbiAgICAgICAgICAgICAgICAgICAgIGtleUNvZGVzLmluZGV4T2YoIGV2ZW50LmtleUNvZGUgKSAhPT0gLTEgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBoYW5kbGVyKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sIGZhbHNlICk7XG4gICAgICAgIH07XG5cbiAgICAgICAgdmFyIGNvbnNvbGVPbkxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICB2YXIgc2xpZGVWaWV3ID0gY29uc29sZVdpbmRvdy5kb2N1bWVudC5nZXRFbGVtZW50QnlJZCggJ3NsaWRlVmlldycgKTtcbiAgICAgICAgICAgICAgICB2YXIgcHJlVmlldyA9IGNvbnNvbGVXaW5kb3cuZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoICdwcmVWaWV3JyApO1xuXG4gICAgICAgICAgICAgICAgLy8gRmlyZWZveDpcbiAgICAgICAgICAgICAgICBzbGlkZVZpZXcuY29udGVudERvY3VtZW50LmJvZHkuY2xhc3NMaXN0LmFkZCggJ2ltcHJlc3MtY29uc29sZScgKTtcbiAgICAgICAgICAgICAgICBwcmVWaWV3LmNvbnRlbnREb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5hZGQoICdpbXByZXNzLWNvbnNvbGUnICk7XG4gICAgICAgICAgICAgICAgaWYgKCBjc3NGaWxlSWZyYW1lICE9PSB1bmRlZmluZWQgKSB7XG4gICAgICAgICAgICAgICAgICAgIHNsaWRlVmlldy5jb250ZW50RG9jdW1lbnQuaGVhZC5pbnNlcnRBZGphY2VudEhUTUwoXG4gICAgICAgICAgICAgICAgICAgICAgICAnYmVmb3JlZW5kJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICc8bGluayByZWw9XCJzdHlsZXNoZWV0XCIgdHlwZT1cInRleHQvY3NzXCIgaHJlZj1cIicgKyBjc3NGaWxlSWZyYW1lICsgJ1wiPidcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgcHJlVmlldy5jb250ZW50RG9jdW1lbnQuaGVhZC5pbnNlcnRBZGphY2VudEhUTUwoXG4gICAgICAgICAgICAgICAgICAgICAgICAnYmVmb3JlZW5kJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICc8bGluayByZWw9XCJzdHlsZXNoZWV0XCIgdHlwZT1cInRleHQvY3NzXCIgaHJlZj1cIicgKyBjc3NGaWxlSWZyYW1lICsgJ1wiPidcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBDaHJvbWU6XG4gICAgICAgICAgICAgICAgc2xpZGVWaWV3LmFkZEV2ZW50TGlzdGVuZXIoICdsb2FkJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzbGlkZVZpZXcuY29udGVudERvY3VtZW50LmJvZHkuY2xhc3NMaXN0LmFkZCggJ2ltcHJlc3MtY29uc29sZScgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICggY3NzRmlsZUlmcmFtZSAhPT0gdW5kZWZpbmVkICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNsaWRlVmlldy5jb250ZW50RG9jdW1lbnQuaGVhZC5pbnNlcnRBZGphY2VudEhUTUwoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdiZWZvcmVlbmQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnPGxpbmsgcmVsPVwic3R5bGVzaGVldFwiIHR5cGU9XCJ0ZXh0L2Nzc1wiIGhyZWY9XCInICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNzc0ZpbGVJZnJhbWUgKyAnXCI+J1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgICAgIHByZVZpZXcuYWRkRXZlbnRMaXN0ZW5lciggJ2xvYWQnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByZVZpZXcuY29udGVudERvY3VtZW50LmJvZHkuY2xhc3NMaXN0LmFkZCggJ2ltcHJlc3MtY29uc29sZScgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICggY3NzRmlsZUlmcmFtZSAhPT0gdW5kZWZpbmVkICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByZVZpZXcuY29udGVudERvY3VtZW50LmhlYWQuaW5zZXJ0QWRqYWNlbnRIVE1MKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnYmVmb3JlZW5kJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJzxsaW5rIHJlbD1cInN0eWxlc2hlZXRcIiB0eXBlPVwidGV4dC9jc3NcIiBocmVmPVwiJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjc3NGaWxlSWZyYW1lICsgJ1wiPicgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9ICk7XG4gICAgICAgIH07XG5cbiAgICAgICAgdmFyIG9wZW4gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmICggdG9wLmlzY29uc29sZVdpbmRvdyApIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICggY29uc29sZVdpbmRvdyAmJiAhY29uc29sZVdpbmRvdy5jbG9zZWQgKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZVdpbmRvdy5mb2N1cygpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlV2luZG93ID0gd2luZG93Lm9wZW4oICcnLCAnaW1wcmVzc0NvbnNvbGUnICk7XG5cbiAgICAgICAgICAgICAgICAvLyBJZiBvcGVuaW5nIGZhaWxlcyB0aGlzIG1heSBiZSBiZWNhdXNlIHRoZSBicm93c2VyIHByZXZlbnRzIHRoaXMgZnJvbVxuICAgICAgICAgICAgICAgIC8vIG5vdCAob3IgbGVzcykgaW50ZXJhY3RpdmUgSmF2YVNjcmlwdC4uLlxuICAgICAgICAgICAgICAgIGlmICggY29uc29sZVdpbmRvdyA9PSBudWxsICkge1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIC4uLiBzbyBJIGFkZCBhIGJ1dHRvbiB0byBrbGljay5cbiAgICAgICAgICAgICAgICAgICAgLy8gd29ya2Fyb3VuZCBvbiBmaXJlZm94XG4gICAgICAgICAgICAgICAgICAgIHZhciBtZXNzYWdlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2RpdicgKTtcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZS5pZCA9ICdpbXByZXNzLWNvbnNvbGUtYnV0dG9uJztcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZS5zdHlsZS5wb3NpdGlvbiA9ICdmaXhlZCc7XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2Uuc3R5bGUubGVmdCA9IDA7XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2Uuc3R5bGUudG9wID0gMDtcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZS5zdHlsZS5yaWdodCA9IDA7XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2Uuc3R5bGUuYm90dG9tID0gMDtcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZS5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSAncmdiYSgyNTUsIDI1NSwgMjU1LCAwLjkpJztcbiAgICAgICAgICAgICAgICAgICAgdmFyIGNsaWNrU3RyID0gJ3ZhciB4ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXFwnaW1wcmVzcy1jb25zb2xlLWJ1dHRvblxcJyk7JyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3gucGFyZW50Tm9kZS5yZW1vdmVDaGlsZCh4KTsnICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAndmFyIHIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcXCcnICsgcm9vdElkICsgJ1xcJyk7JyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2ltcHJlc3MoXFwnJyArIHJvb3RJZCArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ1xcJykubGliLnV0aWwudHJpZ2dlckV2ZW50KHIsIFxcJ2ltcHJlc3M6Y29uc29sZTpvcGVuXFwnLCB7fSknO1xuICAgICAgICAgICAgICAgICAgICB2YXIgc3R5bGVTdHIgPSAnbWFyZ2luOiAyNXZoIDI1dnc7d2lkdGg6NTB2dztoZWlnaHQ6NTB2aDsnO1xuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlLmlubmVySFRNTCA9ICc8YnV0dG9uIHN0eWxlPVwiJyArIHN0eWxlU3RyICsgJ1wiICcgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdvbmNsaWNrPVwiJyArIGNsaWNrU3RyICsgJ1wiPicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhbmcuY2xpY2tUb09wZW4gK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICc8L2J1dHRvbj4nO1xuICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKCBtZXNzYWdlICk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB2YXIgY3NzTGluayA9ICcnO1xuICAgICAgICAgICAgICAgIGlmICggY3NzRmlsZSAhPT0gdW5kZWZpbmVkICkge1xuICAgICAgICAgICAgICAgICAgICBjc3NMaW5rID0gJzxsaW5rIHJlbD1cInN0eWxlc2hlZXRcIiB0eXBlPVwidGV4dC9jc3NcIiBtZWRpYT1cInNjcmVlblwiIGhyZWY9XCInICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNzc0ZpbGUgKyAnXCI+JztcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBUaGlzIHNldHMgdGhlIHdpbmRvdyBsb2NhdGlvbiB0byB0aGUgbWFpbiB3aW5kb3cgbG9jYXRpb24sIHNvIGNzcyBjYW4gYmUgbG9hZGVkOlxuICAgICAgICAgICAgICAgIGNvbnNvbGVXaW5kb3cuZG9jdW1lbnQub3BlbigpO1xuXG4gICAgICAgICAgICAgICAgLy8gV3JpdGUgdGhlIHRlbXBsYXRlOlxuICAgICAgICAgICAgICAgIGNvbnNvbGVXaW5kb3cuZG9jdW1lbnQud3JpdGUoXG5cbiAgICAgICAgICAgICAgICAgICAgLy8gQ3NzU3R5bGVTdHIgaXMgbG90cyBvZiBpbmxpbmUgPHN0eWxlPjwvc3R5bGU+IGRlZmluZWQgYXQgdGhlIGVuZCBvZiB0aGlzIGZpbGVcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZVRlbXBsYXRlLnJlcGxhY2UoICd7e2Nzc1N0eWxlfX0nLCBjc3NTdHlsZVN0cigpIClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoICd7e2Nzc0xpbmt9fScsIGNzc0xpbmsgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSggL3t7Lio/fX0vZ2ksIGZ1bmN0aW9uKCB4ICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGxhbmdbIHguc3Vic3RyaW5nKCAyLCB4Lmxlbmd0aCAtIDIgKSBdOyB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIGNvbnNvbGVXaW5kb3cuZG9jdW1lbnQudGl0bGUgPSAnU3BlYWtlciBDb25zb2xlICgnICsgZG9jdW1lbnQudGl0bGUgKyAnKSc7XG4gICAgICAgICAgICAgICAgY29uc29sZVdpbmRvdy5pbXByZXNzID0gd2luZG93LmltcHJlc3M7XG5cbiAgICAgICAgICAgICAgICAvLyBXZSBzZXQgdGhpcyBmbGFnIHNvIHdlIGNhbiBkZXRlY3QgaXQgbGF0ZXIsIHRvIHByZXZlbnQgaW5maW5pdGUgcG9wdXBzLlxuICAgICAgICAgICAgICAgIGNvbnNvbGVXaW5kb3cuaXNjb25zb2xlV2luZG93ID0gdHJ1ZTtcblxuICAgICAgICAgICAgICAgIC8vIFNldCB0aGUgb25sb2FkIGZ1bmN0aW9uOlxuICAgICAgICAgICAgICAgIGNvbnNvbGVXaW5kb3cub25sb2FkID0gY29uc29sZU9uTG9hZDtcblxuICAgICAgICAgICAgICAgIC8vIEFkZCBjbG9jayB0aWNrXG4gICAgICAgICAgICAgICAgY29uc29sZVdpbmRvdy50aW1lclN0YXJ0ID0gbmV3IERhdGUoKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlV2luZG93LnRpbWVyUmVzZXQgPSB0aW1lclJlc2V0O1xuICAgICAgICAgICAgICAgIGNvbnNvbGVXaW5kb3cuY2xvY2tJbnRlcnZhbCA9IHNldEludGVydmFsKCBhbGxDb25zb2xlc1sgcm9vdElkIF0uY2xvY2tUaWNrLCAxMDAwICk7XG5cbiAgICAgICAgICAgICAgICAvLyBLZXlib2FyZCBuYXZpZ2F0aW9uIGhhbmRsZXJzXG4gICAgICAgICAgICAgICAgLy8gMzM6IHBnIHVwLCAzNzogbGVmdCwgMzg6IHVwXG4gICAgICAgICAgICAgICAgcmVnaXN0ZXJLZXlFdmVudCggWyAzMywgMzcsIDM4IF0sIHdpbmRvdy5pbXByZXNzKCkucHJldiApO1xuXG4gICAgICAgICAgICAgICAgLy8gMzQ6IHBnIGRvd24sIDM5OiByaWdodCwgNDA6IGRvd25cbiAgICAgICAgICAgICAgICByZWdpc3RlcktleUV2ZW50KCBbIDM0LCAzOSwgNDAgXSwgd2luZG93LmltcHJlc3MoKS5uZXh0ICk7XG5cbiAgICAgICAgICAgICAgICAvLyAzMjogc3BhY2VcbiAgICAgICAgICAgICAgICByZWdpc3RlcktleUV2ZW50KCBbIDMyIF0sIHNwYWNlSGFuZGxlciApO1xuXG4gICAgICAgICAgICAgICAgLy8gODI6IFJcbiAgICAgICAgICAgICAgICByZWdpc3RlcktleUV2ZW50KCBbIDgyIF0sIHRpbWVyUmVzZXQgKTtcblxuICAgICAgICAgICAgICAgIC8vIENsZWFudXBcbiAgICAgICAgICAgICAgICBjb25zb2xlV2luZG93Lm9uYmVmb3JldW5sb2FkID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gSSBkb24ndCBrbm93IHdoeSBvbnVubG9hZCBkb2Vzbid0IHdvcmsgaGVyZS5cbiAgICAgICAgICAgICAgICAgICAgY2xlYXJJbnRlcnZhbCggY29uc29sZVdpbmRvdy5jbG9ja0ludGVydmFsICk7XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIC8vIEl0IHdpbGwgbmVlZCBhIGxpdHRsZSBudWRnZSBvbiBGaXJlZm94LCBidXQgb25seSBhZnRlciBsb2FkaW5nOlxuICAgICAgICAgICAgICAgIG9uU3RlcEVudGVyKCk7XG4gICAgICAgICAgICAgICAgY29uc29sZVdpbmRvdy5pbml0aWFsaXplZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGNvbnNvbGVXaW5kb3cuZG9jdW1lbnQuY2xvc2UoKTtcblxuICAgICAgICAgICAgICAgIC8vQ2F0Y2ggYW55IHdpbmRvdyByZXNpemUgdG8gcGFzcyBzaXplIG9uXG4gICAgICAgICAgICAgICAgd2luZG93Lm9ucmVzaXplID0gcmVzaXplO1xuICAgICAgICAgICAgICAgIGNvbnNvbGVXaW5kb3cub25yZXNpemUgPSByZXNpemU7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gY29uc29sZVdpbmRvdztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICB2YXIgcmVzaXplID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgc2xpZGVWaWV3ID0gY29uc29sZVdpbmRvdy5kb2N1bWVudC5nZXRFbGVtZW50QnlJZCggJ3NsaWRlVmlldycgKTtcbiAgICAgICAgICAgIHZhciBwcmVWaWV3ID0gY29uc29sZVdpbmRvdy5kb2N1bWVudC5nZXRFbGVtZW50QnlJZCggJ3ByZVZpZXcnICk7XG5cbiAgICAgICAgICAgIC8vIEdldCByYXRpbyBvZiBwcmVzZW50YXRpb25cbiAgICAgICAgICAgIHZhciByYXRpbyA9IHdpbmRvdy5pbm5lckhlaWdodCAvIHdpbmRvdy5pbm5lcldpZHRoO1xuXG4gICAgICAgICAgICAvLyBHZXQgc2l6ZSBhdmFpbGFibGUgZm9yIHZpZXdzXG4gICAgICAgICAgICB2YXIgdmlld3MgPSBjb25zb2xlV2luZG93LmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCAndmlld3MnICk7XG5cbiAgICAgICAgICAgIC8vIFNsaWRlVmlldyBtYXkgaGF2ZSBhIGJvcmRlciBvciBzb21lIHBhZGRpbmc6XG4gICAgICAgICAgICAvLyBhc3VtaW5nIHNhbWUgYm9yZGVyIHdpZHRoIG9uIGJvdGggZGlyZWt0aW9uc1xuICAgICAgICAgICAgdmFyIGRlbHRhID0gc2xpZGVWaWV3Lm9mZnNldFdpZHRoIC0gc2xpZGVWaWV3LmNsaWVudFdpZHRoO1xuXG4gICAgICAgICAgICAvLyBTZXQgdmlld3NcbiAgICAgICAgICAgIHZhciBzbGlkZVZpZXdXaWR0aCA9ICggdmlld3MuY2xpZW50V2lkdGggLSBkZWx0YSApO1xuICAgICAgICAgICAgdmFyIHNsaWRlVmlld0hlaWdodCA9IE1hdGguZmxvb3IoIHNsaWRlVmlld1dpZHRoICogcmF0aW8gKTtcblxuICAgICAgICAgICAgdmFyIHByZVZpZXdUb3AgPSBzbGlkZVZpZXdIZWlnaHQgKyBwcmVWaWV3R2FwO1xuXG4gICAgICAgICAgICB2YXIgcHJlVmlld1dpZHRoID0gTWF0aC5mbG9vciggc2xpZGVWaWV3V2lkdGggKiBwcmVWaWV3RGVmYXVsdEZhY3RvciApO1xuICAgICAgICAgICAgdmFyIHByZVZpZXdIZWlnaHQgPSBNYXRoLmZsb29yKCBzbGlkZVZpZXdIZWlnaHQgKiBwcmVWaWV3RGVmYXVsdEZhY3RvciApO1xuXG4gICAgICAgICAgICAvLyBTaHJpbmsgcHJldmlldyB0byBmaXQgaW50byBzcGFjZSBhdmFpbGFibGVcbiAgICAgICAgICAgIGlmICggdmlld3MuY2xpZW50SGVpZ2h0IC0gZGVsdGEgPCBwcmVWaWV3VG9wICsgcHJlVmlld0hlaWdodCApIHtcbiAgICAgICAgICAgICAgICBwcmVWaWV3SGVpZ2h0ID0gdmlld3MuY2xpZW50SGVpZ2h0IC0gZGVsdGEgLSBwcmVWaWV3VG9wO1xuICAgICAgICAgICAgICAgIHByZVZpZXdXaWR0aCA9IE1hdGguZmxvb3IoIHByZVZpZXdIZWlnaHQgLyByYXRpbyApO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBJZiBwcmV2aWV3IGlzIG5vdCBoaWdoIGVub3VnaCBmb3JnZXQgcmF0aW9zIVxuICAgICAgICAgICAgaWYgKCBwcmVWaWV3V2lkdGggPD0gTWF0aC5mbG9vciggc2xpZGVWaWV3V2lkdGggKiBwcmVWaWV3TWluaW11bUZhY3RvciApICkge1xuICAgICAgICAgICAgICAgIHNsaWRlVmlld1dpZHRoID0gKCB2aWV3cy5jbGllbnRXaWR0aCAtIGRlbHRhICk7XG4gICAgICAgICAgICAgICAgc2xpZGVWaWV3SGVpZ2h0ID0gTWF0aC5mbG9vciggKCB2aWV3cy5jbGllbnRIZWlnaHQgLSBkZWx0YSAtIHByZVZpZXdHYXAgKSAvXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoIDEgKyBwcmVWaWV3TWluaW11bUZhY3RvciApICk7XG5cbiAgICAgICAgICAgICAgICBwcmVWaWV3VG9wID0gc2xpZGVWaWV3SGVpZ2h0ICsgcHJlVmlld0dhcDtcblxuICAgICAgICAgICAgICAgIHByZVZpZXdXaWR0aCA9IE1hdGguZmxvb3IoIHNsaWRlVmlld1dpZHRoICogcHJlVmlld01pbmltdW1GYWN0b3IgKTtcbiAgICAgICAgICAgICAgICBwcmVWaWV3SGVpZ2h0ID0gdmlld3MuY2xpZW50SGVpZ2h0IC0gZGVsdGEgLSBwcmVWaWV3VG9wO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBTZXQgdGhlIGNhbGN1bGF0ZWQgaW50byBzdHlsZXNcbiAgICAgICAgICAgIHNsaWRlVmlldy5zdHlsZS53aWR0aCA9IHNsaWRlVmlld1dpZHRoICsgJ3B4JztcbiAgICAgICAgICAgIHNsaWRlVmlldy5zdHlsZS5oZWlnaHQgPSBzbGlkZVZpZXdIZWlnaHQgKyAncHgnO1xuXG4gICAgICAgICAgICBwcmVWaWV3LnN0eWxlLnRvcCA9IHByZVZpZXdUb3AgKyAncHgnO1xuXG4gICAgICAgICAgICBwcmVWaWV3LnN0eWxlLndpZHRoID0gcHJlVmlld1dpZHRoICsgJ3B4JztcbiAgICAgICAgICAgIHByZVZpZXcuc3R5bGUuaGVpZ2h0ID0gcHJlVmlld0hlaWdodCArICdweCc7XG4gICAgICAgIH07XG5cbiAgICAgICAgdmFyIF9pbml0ID0gZnVuY3Rpb24oIGNzc0NvbnNvbGUsIGNzc0lmcmFtZSApIHtcbiAgICAgICAgICAgIGlmICggY3NzQ29uc29sZSAhPT0gdW5kZWZpbmVkICkge1xuICAgICAgICAgICAgICAgIGNzc0ZpbGUgPSBjc3NDb25zb2xlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBZb3UgY2FuIGFsc28gc3BlY2lmeSB0aGUgY3NzIGluIHRoZSBwcmVzZW50YXRpb24gcm9vdCBkaXY6XG4gICAgICAgICAgICAvLyA8ZGl2IGlkPVwiaW1wcmVzc1wiIGRhdGEtY29uc29sZS1jc3M9Li4uXCIgZGF0YS1jb25zb2xlLWNzcy1pZnJhbWU9XCIuLi5cIj5cbiAgICAgICAgICAgIGVsc2UgaWYgKCByb290LmRhdGFzZXQuY29uc29sZUNzcyAhPT0gdW5kZWZpbmVkICkge1xuICAgICAgICAgICAgICAgIGNzc0ZpbGUgPSByb290LmRhdGFzZXQuY29uc29sZUNzcztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKCBjc3NJZnJhbWUgIT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgICAgICAgICBjc3NGaWxlSWZyYW1lID0gY3NzSWZyYW1lO1xuICAgICAgICAgICAgfSBlbHNlIGlmICggcm9vdC5kYXRhc2V0LmNvbnNvbGVDc3NJZnJhbWUgIT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgICAgICAgICBjc3NGaWxlSWZyYW1lID0gcm9vdC5kYXRhc2V0LmNvbnNvbGVDc3NJZnJhbWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIFJlZ2lzdGVyIHRoZSBldmVudFxuICAgICAgICAgICAgcm9vdC5hZGRFdmVudExpc3RlbmVyKCAnaW1wcmVzczpzdGVwbGVhdmUnLCBvblN0ZXBMZWF2ZSApO1xuICAgICAgICAgICAgcm9vdC5hZGRFdmVudExpc3RlbmVyKCAnaW1wcmVzczpzdGVwZW50ZXInLCBvblN0ZXBFbnRlciApO1xuICAgICAgICAgICAgcm9vdC5hZGRFdmVudExpc3RlbmVyKCAnaW1wcmVzczpzdWJzdGVwOnN0ZXBsZWF2ZWFib3J0ZWQnLCBvblN1YnN0ZXAgKTtcbiAgICAgICAgICAgIHJvb3QuYWRkRXZlbnRMaXN0ZW5lciggJ2ltcHJlc3M6c3Vic3RlcDpzaG93Jywgb25TdWJzdGVwU2hvdyApO1xuICAgICAgICAgICAgcm9vdC5hZGRFdmVudExpc3RlbmVyKCAnaW1wcmVzczpzdWJzdGVwOmhpZGUnLCBvblN1YnN0ZXBIaWRlICk7XG5cbiAgICAgICAgICAgIC8vV2hlbiB0aGUgd2luZG93IGNsb3NlcywgY2xlYW4gdXAgYWZ0ZXIgb3Vyc2VsdmVzLlxuICAgICAgICAgICAgd2luZG93Lm9udW5sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgaWYgKCBjb25zb2xlV2luZG93ICYmICFjb25zb2xlV2luZG93LmNsb3NlZCApIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZVdpbmRvdy5jbG9zZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIC8vT3BlbiBzcGVha2VyIGNvbnNvbGUgd2hlbiB0aGV5IHByZXNzICdwJ1xuICAgICAgICAgICAgcmVnaXN0ZXJLZXlFdmVudCggWyA4MCBdLCBvcGVuLCB3aW5kb3cgKTtcblxuICAgICAgICAgICAgLy9CdHcsIHlvdSBjYW4gYWxzbyBsYXVuY2ggY29uc29sZSBhdXRvbWF0aWNhbGx5OlxuICAgICAgICAgICAgLy88ZGl2IGlkPVwiaW1wcmVzc1wiIGRhdGEtY29uc29sZS1hdXRvbGF1bmNoPVwidHJ1ZVwiPlxuICAgICAgICAgICAgaWYgKCByb290LmRhdGFzZXQuY29uc29sZUF1dG9sYXVuY2ggPT09ICd0cnVlJyApIHtcbiAgICAgICAgICAgICAgICBvcGVuKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgdmFyIGluaXQgPSBmdW5jdGlvbiggY3NzQ29uc29sZSwgY3NzSWZyYW1lICkge1xuICAgICAgICAgICAgaWYgKCAoIGNzc0NvbnNvbGUgPT09IHVuZGVmaW5lZCB8fCBjc3NDb25zb2xlID09PSBjc3NGaWxlT2xkRGVmYXVsdCApICYmXG4gICAgICAgICAgICAgICAgICggY3NzSWZyYW1lID09PSB1bmRlZmluZWQgIHx8IGNzc0lmcmFtZSA9PT0gY3NzRmlsZUlmcmFtZU9sZERlZmF1bHQgKSApIHtcbiAgICAgICAgICAgICAgICB3aW5kb3cuY29uc29sZS5sb2coICdpbXByZXNzQ29uc29sZSgpLmluaXQoKSBpcyBkZXByZWNhdGVkLiAnICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2ltcHJlc3NDb25zb2xlIGlzIG5vdyBpbml0aWFsaXplZCBhdXRvbWF0aWNhbGx5IHdoZW4geW91ICcgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnY2FsbCBpbXByZXNzKCkuaW5pdCgpLicgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIF9pbml0KCBjc3NDb25zb2xlLCBjc3NJZnJhbWUgKTtcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBOZXcgQVBJIGZvciBpbXByZXNzLmpzIHBsdWdpbnMgaXMgYmFzZWQgb24gdXNpbmcgZXZlbnRzXG4gICAgICAgIHJvb3QuYWRkRXZlbnRMaXN0ZW5lciggJ2ltcHJlc3M6Y29uc29sZTpvcGVuJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBvcGVuKCk7XG4gICAgICAgIH0gKTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogUmVnaXN0ZXIgYSBrZXkgY29kZSB0byBhbiBldmVudCBoYW5kbGVyXG4gICAgICAgICAqXG4gICAgICAgICAqIDpwYXJhbTogZXZlbnQuZGV0YWlsLmtleUNvZGVzICAgIExpc3Qgb2Yga2V5IGNvZGVzXG4gICAgICAgICAqIDpwYXJhbTogZXZlbnQuZGV0YWlsLmhhbmRsZXIgICAgIEEgZnVuY3Rpb24gcmVnaXN0ZXJlZCBhcyB0aGUgZXZlbnQgaGFuZGxlclxuICAgICAgICAgKiA6cGFyYW06IGV2ZW50LmRldGFpbC53aW5kb3cgICAgICBUaGUgY29uc29sZSB3aW5kb3cgdG8gcmVnaXN0ZXIgdGhlIGtleWNvZGUgaW5cbiAgICAgICAgICovXG4gICAgICAgIHJvb3QuYWRkRXZlbnRMaXN0ZW5lciggJ2ltcHJlc3M6Y29uc29sZTpyZWdpc3RlcktleUV2ZW50JywgZnVuY3Rpb24oIGV2ZW50ICkge1xuICAgICAgICAgICAgcmVnaXN0ZXJLZXlFdmVudCggZXZlbnQuZGV0YWlsLmtleUNvZGVzLCBldmVudC5kZXRhaWwuaGFuZGxlciwgZXZlbnQuZGV0YWlsLndpbmRvdyApO1xuICAgICAgICB9ICk7XG5cbiAgICAgICAgLy8gUmV0dXJuIHRoZSBvYmplY3RcbiAgICAgICAgYWxsQ29uc29sZXNbIHJvb3RJZCBdID0geyBpbml0OiBpbml0LCBvcGVuOiBvcGVuLCBjbG9ja1RpY2s6IGNsb2NrVGljayxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWdpc3RlcktleUV2ZW50OiByZWdpc3RlcktleUV2ZW50LCBfaW5pdDogX2luaXQgfTtcbiAgICAgICAgcmV0dXJuIGFsbENvbnNvbGVzWyByb290SWQgXTtcblxuICAgIH07XG5cbiAgICAvLyBUaGlzIGluaXRpYWxpemVzIGltcHJlc3NDb25zb2xlIGF1dG9tYXRpY2FsbHkgd2hlbiBpbml0aWFsaXppbmcgaW1wcmVzcyBpdHNlbGZcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCAnaW1wcmVzczppbml0JywgZnVuY3Rpb24oIGV2ZW50ICkge1xuXG4gICAgICAgIC8vIE5vdGU6IGltcHJlc3NDb25zb2xlIHdhbnRzIHRoZSBpZCBzdHJpbmcsIG5vdCB0aGUgRE9NIGVsZW1lbnQgZGlyZWN0bHlcbiAgICAgICAgaW1wcmVzc0NvbnNvbGUoIGV2ZW50LnRhcmdldC5pZCApLl9pbml0KCk7XG5cbiAgICAgICAgLy8gQWRkICdQJyB0byB0aGUgaGVscCBwb3B1cFxuICAgICAgICB0cmlnZ2VyRXZlbnQoIGRvY3VtZW50LCAnaW1wcmVzczpoZWxwOmFkZCcsXG4gICAgICAgICAgICAgICAgICAgICAgICB7IGNvbW1hbmQ6ICdQJywgdGV4dDogJ1ByZXNlbnRlciBjb25zb2xlJywgcm93OiAxMCB9ICk7XG4gICAgfSApO1xuXG4gICAgLy8gUmV0dXJucyBhIHN0cmluZyB0byBiZSB1c2VkIGlubGluZSBhcyBhIGNzcyA8c3R5bGU+IGVsZW1lbnQgaW4gdGhlIGNvbnNvbGUgd2luZG93LlxuICAgIC8vIEFwb2xvZ2llcyBmb3IgbGVuZ3RoLCBidXQgaGlkaW5nIGl0IGhlcmUgYXQgdGhlIGVuZCB0byBrZWVwIGl0IGF3YXkgZnJvbSByZXN0IG9mIHRoZSBjb2RlLlxuICAgIHZhciBjc3NTdHlsZVN0ciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gYDxzdHlsZT5cbiAgICAgICAgICAgICNpbXByZXNzY29uc29sZSBib2R5IHtcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2IoMjU1LCAyNTUsIDI1NSk7XG4gICAgICAgICAgICAgICAgcGFkZGluZzogMDtcbiAgICAgICAgICAgICAgICBtYXJnaW46IDA7XG4gICAgICAgICAgICAgICAgZm9udC1mYW1pbHk6IHZlcmRhbmEsIGFyaWFsLCBzYW5zLXNlcmlmO1xuICAgICAgICAgICAgICAgIGZvbnQtc2l6ZTogMnZ3O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAjaW1wcmVzc2NvbnNvbGUgZGl2I2NvbnNvbGUge1xuICAgICAgICAgICAgICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgICAgICAgICAgICAgICB0b3A6IDAuNXZ3O1xuICAgICAgICAgICAgICAgIGxlZnQ6IDAuNXZ3O1xuICAgICAgICAgICAgICAgIHJpZ2h0OiAwLjV2dztcbiAgICAgICAgICAgICAgICBib3R0b206IDN2dztcbiAgICAgICAgICAgICAgICBtYXJnaW46IDA7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICNpbXByZXNzY29uc29sZSBkaXYjdmlld3MsICNpbXByZXNzY29uc29sZSBkaXYjbm90ZXMge1xuICAgICAgICAgICAgICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgICAgICAgICAgICAgICB0b3A6IDA7XG4gICAgICAgICAgICAgICAgYm90dG9tOiAwO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAjaW1wcmVzc2NvbnNvbGUgZGl2I3ZpZXdzIHtcbiAgICAgICAgICAgICAgICBsZWZ0OiAwO1xuICAgICAgICAgICAgICAgIHJpZ2h0OiA1MHZ3O1xuICAgICAgICAgICAgICAgIG92ZXJmbG93OiBoaWRkZW47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICNpbXByZXNzY29uc29sZSBkaXYjYmxvY2tlciB7XG4gICAgICAgICAgICAgICAgcG9zaXRpb246IGFic29sdXRlO1xuICAgICAgICAgICAgICAgIHJpZ2h0OiAwO1xuICAgICAgICAgICAgICAgIGJvdHRvbTogMDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgI2ltcHJlc3Njb25zb2xlIGRpdiNub3RlcyB7XG4gICAgICAgICAgICAgICAgbGVmdDogNTB2dztcbiAgICAgICAgICAgICAgICByaWdodDogMDtcbiAgICAgICAgICAgICAgICBvdmVyZmxvdy14OiBoaWRkZW47XG4gICAgICAgICAgICAgICAgb3ZlcmZsb3cteTogYXV0bztcbiAgICAgICAgICAgICAgICBwYWRkaW5nOiAwLjNleDtcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2IoMjU1LCAyNTUsIDI1NSk7XG4gICAgICAgICAgICAgICAgYm9yZGVyOiBzb2xpZCAxcHggcmdiKDEyMCwgMTIwLCAxMjApO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAjaW1wcmVzc2NvbnNvbGUgZGl2I25vdGVzIC5ub05vdGVzIHtcbiAgICAgICAgICAgICAgICBjb2xvcjogcmdiKDIwMCwgMjAwLCAyMDApO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAjaW1wcmVzc2NvbnNvbGUgZGl2I25vdGVzIHAge1xuICAgICAgICAgICAgICAgIG1hcmdpbi10b3A6IDA7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICNpbXByZXNzY29uc29sZSBpZnJhbWUge1xuICAgICAgICAgICAgICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgICAgICAgICAgICAgICBtYXJnaW46IDA7XG4gICAgICAgICAgICAgICAgcGFkZGluZzogMDtcbiAgICAgICAgICAgICAgICBsZWZ0OiAwO1xuICAgICAgICAgICAgICAgIGJvcmRlcjogc29saWQgMXB4IHJnYigxMjAsIDEyMCwgMTIwKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgI2ltcHJlc3Njb25zb2xlIGlmcmFtZSNzbGlkZVZpZXcge1xuICAgICAgICAgICAgICAgIHRvcDogMDtcbiAgICAgICAgICAgICAgICB3aWR0aDogNDl2dztcbiAgICAgICAgICAgICAgICBoZWlnaHQ6IDQ5dmg7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICNpbXByZXNzY29uc29sZSBpZnJhbWUjcHJlVmlldyB7XG4gICAgICAgICAgICAgICAgb3BhY2l0eTogMC43O1xuICAgICAgICAgICAgICAgIHRvcDogNTB2aDtcbiAgICAgICAgICAgICAgICB3aWR0aDogMzB2dztcbiAgICAgICAgICAgICAgICBoZWlnaHQ6IDMwdmg7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICNpbXByZXNzY29uc29sZSBkaXYjY29udHJvbHMge1xuICAgICAgICAgICAgICAgIG1hcmdpbjogMDtcbiAgICAgICAgICAgICAgICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gICAgICAgICAgICAgICAgYm90dG9tOiAwLjI1dnc7XG4gICAgICAgICAgICAgICAgbGVmdDogMC41dnc7XG4gICAgICAgICAgICAgICAgcmlnaHQ6IDAuNXZ3O1xuICAgICAgICAgICAgICAgIGhlaWdodDogMi41dnc7XG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogcmdiKDI1NSwgMjU1LCAyNTUpO1xuICAgICAgICAgICAgICAgIGJhY2tncm91bmQtY29sb3I6IHJnYmEoMjU1LCAyNTUsIDI1NSwgMC42KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgI2ltcHJlc3Njb25zb2xlIGRpdiNwcmV2LCBkaXYjbmV4dCB7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICNpbXByZXNzY29uc29sZSBkaXYjcHJldiBhLCAjaW1wcmVzc2NvbnNvbGUgZGl2I25leHQgYSB7XG4gICAgICAgICAgICAgICAgZGlzcGxheTogYmxvY2s7XG4gICAgICAgICAgICAgICAgYm9yZGVyOiBzb2xpZCAxcHggcmdiKDcwLCA3MCwgNzApO1xuICAgICAgICAgICAgICAgIGJvcmRlci1yYWRpdXM6IDAuNXZ3O1xuICAgICAgICAgICAgICAgIGZvbnQtc2l6ZTogMS41dnc7XG4gICAgICAgICAgICAgICAgcGFkZGluZzogMC4yNXZ3O1xuICAgICAgICAgICAgICAgIHRleHQtZGVjb3JhdGlvbjogbm9uZTtcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2IoMjIwLCAyMjAsIDIyMCk7XG4gICAgICAgICAgICAgICAgY29sb3I6IHJnYigwLCAwLCAwKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgI2ltcHJlc3Njb25zb2xlIGRpdiNwcmV2IGE6aG92ZXIsICNpbXByZXNzY29uc29sZSBkaXYjbmV4dCBhOmhvdmVyIHtcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2IoMjQ1LCAyNDUsIDI0NSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICNpbXByZXNzY29uc29sZSBkaXYjcHJldiB7XG4gICAgICAgICAgICAgICAgZmxvYXQ6IGxlZnQ7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICNpbXByZXNzY29uc29sZSBkaXYjbmV4dCB7XG4gICAgICAgICAgICAgICAgZmxvYXQ6IHJpZ2h0O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAjaW1wcmVzc2NvbnNvbGUgZGl2I3N0YXR1cyB7XG4gICAgICAgICAgICAgICAgbWFyZ2luLWxlZnQ6IDJlbTtcbiAgICAgICAgICAgICAgICBtYXJnaW4tcmlnaHQ6IDJlbTtcbiAgICAgICAgICAgICAgICB0ZXh0LWFsaWduOiBjZW50ZXI7XG4gICAgICAgICAgICAgICAgZmxvYXQ6IHJpZ2h0O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAjaW1wcmVzc2NvbnNvbGUgZGl2I2Nsb2NrIHtcbiAgICAgICAgICAgICAgICBtYXJnaW4tbGVmdDogMmVtO1xuICAgICAgICAgICAgICAgIG1hcmdpbi1yaWdodDogMmVtO1xuICAgICAgICAgICAgICAgIHRleHQtYWxpZ246IGNlbnRlcjtcbiAgICAgICAgICAgICAgICBmbG9hdDogbGVmdDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgI2ltcHJlc3Njb25zb2xlIGRpdiN0aW1lciB7XG4gICAgICAgICAgICAgICAgbWFyZ2luLWxlZnQ6IDJlbTtcbiAgICAgICAgICAgICAgICBtYXJnaW4tcmlnaHQ6IDJlbTtcbiAgICAgICAgICAgICAgICB0ZXh0LWFsaWduOiBjZW50ZXI7XG4gICAgICAgICAgICAgICAgZmxvYXQ6IGxlZnQ7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICNpbXByZXNzY29uc29sZSBzcGFuLm1vdmluZyB7XG4gICAgICAgICAgICAgICAgY29sb3I6IHJnYigyNTUsIDAsIDApO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAjaW1wcmVzc2NvbnNvbGUgc3Bhbi5yZWFkeSB7XG4gICAgICAgICAgICAgICAgY29sb3I6IHJnYigwLCAxMjgsIDApO1xuICAgICAgICAgICAgfVxuICAgICAgICA8L3N0eWxlPmA7XG4gICAgfTtcblxufSApKCBkb2N1bWVudCwgd2luZG93ICk7XG5cbi8qKlxuICogTWVkaWEgUGx1Z2luXG4gKlxuICogVGhpcyBwbHVnaW4gd2lsbCBkbyB0aGUgZm9sbG93aW5nIHRoaW5nczpcbiAqXG4gKiAgLSBBZGQgYSBzcGVjaWFsIGNsYXNzIHdoZW4gcGxheWluZyAoYm9keS5pbXByZXNzLW1lZGlhLXZpZGVvLXBsYXlpbmdcbiAqICAgIGFuZCBib2R5LmltcHJlc3MtbWVkaWEtdmlkZW8tcGxheWluZykgYW5kIHBhdXNpbmcgbWVkaWEgKGJvZHkuaW1wcmVzcy1tZWRpYS12aWRlby1wYXVzZWRcbiAqICAgIGFuZCBib2R5LmltcHJlc3MtbWVkaWEtYXVkaW8tcGF1c2VkKSAocmVtb3ZpbmcgdGhlbSB3aGVuIGVuZGluZykuXG4gKiAgICBUaGlzIGNhbiBiZSB1c2VmdWwgZm9yIGV4YW1wbGUgZm9yIGRhcmtlbmluZyB0aGUgYmFja2dyb3VuZCBvciBmYWRpbmcgb3V0IG90aGVyIGVsZW1lbnRzXG4gKiAgICB3aGlsZSBhIHZpZGVvIGlzIHBsYXlpbmcuXG4gKiAgICBPbmx5IG1lZGlhIGF0IHRoZSBjdXJyZW50IHN0ZXAgYXJlIHRha2VuIGludG8gYWNjb3VudC4gQWxsIGNsYXNzZXMgYXJlIHJlbW92ZWQgd2hlbiBsZWF2aW5nXG4gKiAgICBhIHN0ZXAuXG4gKlxuICogIC0gSW50cm9kdWNlIHRoZSBmb2xsb3dpbmcgbmV3IGRhdGEgYXR0cmlidXRlczpcbiAqXG4gKiAgICAtIGRhdGEtbWVkaWEtYXV0b3BsYXk9XCJ0cnVlXCI6IEF1dG9zdGFydCBtZWRpYSB3aGVuIGVudGVyaW5nIGl0cyBzdGVwLlxuICogICAgLSBkYXRhLW1lZGlhLWF1dG9zdG9wPVwidHJ1ZVwiOiBTdG9wIG1lZGlhICg9IHBhdXNlIGFuZCByZXNldCB0byBzdGFydCksIHdoZW4gbGVhdmluZyBpdHNcbiAqICAgICAgc3RlcC5cbiAqICAgIC0gZGF0YS1tZWRpYS1hdXRvcGF1c2U9XCJ0cnVlXCI6IFBhdXNlIG1lZGlhIGJ1dCBrZWVwIGN1cnJlbnQgdGltZSB3aGVuIGxlYXZpbmcgaXRzIHN0ZXAuXG4gKlxuICogICAgV2hlbiB0aGVzZSBhdHRyaWJ1dGVzIGFyZSBhZGRlZCB0byBhIHN0ZXAgdGhleSBhcmUgaW5oZXJpdGVkIGJ5IGFsbCBtZWRpYSBvbiB0aGlzIHN0ZXAuXG4gKiAgICBPZiBjb3Vyc2UgdGhpcyBzZXR0aW5nIGNhbiBiZSBvdmVyd3JpdHRlbiBieSBhZGRpbmcgZGlmZmVyZW50IGF0dHJpYnV0ZXMgdG8gaW5pZHZpZHVhbFxuICogICAgbWVkaWEuXG4gKlxuICogICAgVGhlIHNhbWUgcnVsZSBhcHBsaWVzIHdoZW4gdGhpcyBhdHRyaWJ1dGVzIGlzIGFkZGVkIHRvIHRoZSByb290IGVsZW1lbnQuIFNldHRpbmdzIGNhbiBiZVxuICogICAgb3ZlcndyaXR0ZW4gZm9yIGluZGl2aWR1YWwgc3RlcHMgYW5kIG1lZGlhLlxuICpcbiAqICAgIEV4YW1wbGVzOlxuICogICAgLSBkYXRhLW1lZGlhLWF1dG9wbGF5PVwidHJ1ZVwiIGRhdGEtbWVkaWEtYXV0b3N0b3A9XCJ0cnVlXCI6IHN0YXJ0IG1lZGlhIG9uIGVudGVyLCBzdG9wIG9uXG4gKiAgICAgIGxlYXZlLCByZXN0YXJ0IGZyb20gYmVnaW5uaW5nIHdoZW4gcmUtZW50ZXJpbmcgdGhlIHN0ZXAuXG4gKlxuICogICAgLSBkYXRhLW1lZGlhLWF1dG9wbGF5PVwidHJ1ZVwiIGRhdGEtbWVkaWEtYXV0b3BhdXNlPVwidHJ1ZVwiOiBzdGFydCBtZWRpYSBvbiBlbnRlciwgcGF1c2Ugb25cbiAqICAgICAgbGVhdmUsIHJlc3VtZSBvbiByZS1lbnRlclxuICpcbiAqICAgIC0gZGF0YS1tZWRpYS1hdXRvcGxheT1cInRydWVcIiBkYXRhLW1lZGlhLWF1dG9zdG9wPVwidHJ1ZVwiIGRhdGEtbWVkaWEtYXV0b3BhdXNlPVwidHJ1ZVwiOiBzdGFydFxuICogICAgICBtZWRpYSBvbiBlbnRlciwgc3RvcCBvbiBsZWF2ZSAoc3RvcCBvdmVyd3JpdGVzIHBhdXNlKS5cbiAqXG4gKiAgICAtIGRhdGEtbWVkaWEtYXV0b3BsYXk9XCJ0cnVlXCIgZGF0YS1tZWRpYS1hdXRvcGF1c2U9XCJmYWxzZVwiOiBsZXQgbWVkaWEgc3RhcnQgYXV0b21hdGljYWxseVxuICogICAgICB3aGVuIGVudGVyaW5nIGEgc3RlcCBhbmQgbGV0IGl0IHBsYXkgd2hlbiBsZWF2aW5nIHRoZSBzdGVwLlxuICpcbiAqICAgIC0gPGRpdiBpZD1cImltcHJlc3NcIiBkYXRhLW1lZGlhLWF1dG9wbGF5PVwidHJ1ZVwiPiAuLi4gPGRpdiBjbGFzcz1cInN0ZXBcIlxuICogICAgICBkYXRhLW1lZGlhLWF1dG9wbGF5PVwiZmFsc2VcIj5cbiAqICAgICAgQWxsIG1lZGlhIGlzIHN0YXJ0ZXQgYXV0b21hdGljYWxseSBvbiBhbGwgc3RlcHMgZXhjZXB0IHRoZSBvbmUgdGhhdCBoYXMgdGhlXG4gKiAgICAgIGRhdGEtbWVkaWEtYXV0b3BsYXk9XCJmYWxzZVwiIGF0dHJpYnV0ZS5cbiAqXG4gKiAgLSBQcm8gdGlwOiBVc2UgPGF1ZGlvIG9uZW5kZWQ9XCJpbXByZXNzKCkubmV4dCgpXCI+IG9yIDx2aWRlbyBvbmVuZGVkPVwiaW1wcmVzcygpLm5leHQoKVwiPiB0b1xuICogICAgcHJvY2VlZCB0byB0aGUgbmV4dCBzdGVwIGF1dG9tYXRpY2FsbHksIHdoZW4gdGhlIGVuZCBvZiB0aGUgbWVkaWEgaXMgcmVhY2hlZC5cbiAqXG4gKlxuICogQ29weXJpZ2h0IDIwMTggSG9sZ2VyIFRlaWNoZXJ0IChAY29tcGxhbmFyKVxuICogUmVsZWFzZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlLlxuICovXG4vKiBnbG9iYWwgd2luZG93LCBkb2N1bWVudCAqL1xuXG4oIGZ1bmN0aW9uKCBkb2N1bWVudCwgd2luZG93ICkge1xuICAgIFwidXNlIHN0cmljdFwiO1xuICAgIHZhciByb290LCBhcGksIGdjLCBhdHRyaWJ1dGVUcmFja2VyO1xuXG4gICAgYXR0cmlidXRlVHJhY2tlciA9IFtdO1xuXG4gICAgLy8gRnVuY3Rpb24gbmFtZXNcbiAgICB2YXIgZW5oYW5jZU1lZGlhTm9kZXMsXG4gICAgICAgIGVuaGFuY2VNZWRpYSxcbiAgICAgICAgcmVtb3ZlTWVkaWFDbGFzc2VzLFxuICAgICAgICBvblN0ZXBlbnRlckRldGVjdEltcHJlc3NDb25zb2xlLFxuICAgICAgICBvblN0ZXBlbnRlcixcbiAgICAgICAgb25TdGVwbGVhdmUsXG4gICAgICAgIG9uUGxheSxcbiAgICAgICAgb25QYXVzZSxcbiAgICAgICAgb25FbmRlZCxcbiAgICAgICAgZ2V0TWVkaWFBdHRyaWJ1dGUsXG4gICAgICAgIHRlYXJkb3duO1xuXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggXCJpbXByZXNzOmluaXRcIiwgZnVuY3Rpb24oIGV2ZW50ICkge1xuICAgICAgICByb290ID0gZXZlbnQudGFyZ2V0O1xuICAgICAgICBhcGkgPSBldmVudC5kZXRhaWwuYXBpO1xuICAgICAgICBnYyA9IGFwaS5saWIuZ2M7XG5cbiAgICAgICAgZW5oYW5jZU1lZGlhKCk7XG5cbiAgICAgICAgZ2MucHVzaENhbGxiYWNrKCB0ZWFyZG93biApO1xuICAgIH0sIGZhbHNlICk7XG5cbiAgICB0ZWFyZG93biA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgZWwsIGk7XG4gICAgICAgIHJlbW92ZU1lZGlhQ2xhc3NlcygpO1xuICAgICAgICBmb3IgKCBpID0gMDsgaSA8IGF0dHJpYnV0ZVRyYWNrZXIubGVuZ3RoOyBpICs9IDEgKSB7XG4gICAgICAgICAgICBlbCA9IGF0dHJpYnV0ZVRyYWNrZXJbIGkgXTtcbiAgICAgICAgICAgIGVsLm5vZGUucmVtb3ZlQXR0cmlidXRlKCBlbC5hdHRyICk7XG4gICAgICAgIH1cbiAgICAgICAgYXR0cmlidXRlVHJhY2tlciA9IFtdO1xuICAgIH07XG5cbiAgICBnZXRNZWRpYUF0dHJpYnV0ZSA9IGZ1bmN0aW9uKCBhdHRyaWJ1dGVOYW1lLCBub2RlcyApIHtcbiAgICAgICAgdmFyIGF0dHJOYW1lLCBhdHRyVmFsdWUsIGksIG5vZGU7XG4gICAgICAgIGF0dHJOYW1lID0gXCJkYXRhLW1lZGlhLVwiICsgYXR0cmlidXRlTmFtZTtcblxuICAgICAgICAvLyBMb29rIGZvciBhdHRyaWJ1dGVzIGluIGFsbCBub2Rlc1xuICAgICAgICBmb3IgKCBpID0gMDsgaSA8IG5vZGVzLmxlbmd0aDsgaSArPSAxICkge1xuICAgICAgICAgICAgbm9kZSA9IG5vZGVzWyBpIF07XG5cbiAgICAgICAgICAgIC8vIEZpcnN0IHRlc3QsIGlmIHRoZSBhdHRyaWJ1dGUgZXhpc3RzLCBiZWNhdXNlIHNvbWUgYnJvd3NlcnMgbWF5IHJldHVyblxuICAgICAgICAgICAgLy8gYW4gZW1wdHkgc3RyaW5nIGZvciBub24tZXhpc3RpbmcgYXR0cmlidXRlcyAtIHNwZWNzIGFyZSBub3QgY2xlYXIgYXQgdGhhdCBwb2ludFxuICAgICAgICAgICAgaWYgKCBub2RlLmhhc0F0dHJpYnV0ZSggYXR0ck5hbWUgKSApIHtcblxuICAgICAgICAgICAgICAgIC8vIEF0dHJpYnV0ZSBmb3VuZCwgcmV0dXJuIHRoZWlyIHBhcnNlZCBib29sZWFuIHZhbHVlLCBlbXB0eSBzdHJpbmdzIGNvdW50IGFzIHRydWVcbiAgICAgICAgICAgICAgICAvLyB0byBlbmFibGUgZW1wdHkgdmFsdWUgYm9vbGVhbnMgKGNvbW1vbiBpbiBodG1sNSBidXQgbm90IGFsbG93ZWQgaW4gd2VsbCBmb3JtZWRcbiAgICAgICAgICAgICAgICAvLyB4bWwpLlxuICAgICAgICAgICAgICAgIGF0dHJWYWx1ZSA9IG5vZGUuZ2V0QXR0cmlidXRlKCBhdHRyTmFtZSApO1xuICAgICAgICAgICAgICAgIGlmICggYXR0clZhbHVlID09PSBcIlwiIHx8IGF0dHJWYWx1ZSA9PT0gXCJ0cnVlXCIgKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIE5vIGF0dHJpYnV0ZSBmb3VuZCBhdCBjdXJyZW50IG5vZGUsIHByb2NlZWQgd2l0aCBuZXh0IHJvdW5kXG4gICAgICAgIH1cblxuICAgICAgICAvLyBMYXN0IHJlc29ydDogbm8gYXR0cmlidXRlIGZvdW5kIC0gcmV0dXJuIHVuZGVmaW5lZCB0byBkaXN0aWd1aXNoIGZyb20gZmFsc2VcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9O1xuXG4gICAgb25QbGF5ID0gZnVuY3Rpb24oIGV2ZW50ICkge1xuICAgICAgICB2YXIgdHlwZSA9IGV2ZW50LnRhcmdldC5ub2RlTmFtZS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5hZGQoIFwiaW1wcmVzcy1tZWRpYS1cIiArIHR5cGUgKyBcIi1wbGF5aW5nXCIgKTtcbiAgICAgICAgZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QucmVtb3ZlKCBcImltcHJlc3MtbWVkaWEtXCIgKyB0eXBlICsgXCItcGF1c2VkXCIgKTtcbiAgICB9O1xuXG4gICAgb25QYXVzZSA9IGZ1bmN0aW9uKCBldmVudCApIHtcbiAgICAgICAgdmFyIHR5cGUgPSBldmVudC50YXJnZXQubm9kZU5hbWUudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QuYWRkKCBcImltcHJlc3MtbWVkaWEtXCIgKyB0eXBlICsgXCItcGF1c2VkXCIgKTtcbiAgICAgICAgZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QucmVtb3ZlKCBcImltcHJlc3MtbWVkaWEtXCIgKyB0eXBlICsgXCItcGxheWluZ1wiICk7XG4gICAgfTtcblxuICAgIG9uRW5kZWQgPSBmdW5jdGlvbiggZXZlbnQgKSB7XG4gICAgICAgIHZhciB0eXBlID0gZXZlbnQudGFyZ2V0Lm5vZGVOYW1lLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnJlbW92ZSggXCJpbXByZXNzLW1lZGlhLVwiICsgdHlwZSArIFwiLXBsYXlpbmdcIiApO1xuICAgICAgICBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5yZW1vdmUoIFwiaW1wcmVzcy1tZWRpYS1cIiArIHR5cGUgKyBcIi1wYXVzZWRcIiApO1xuICAgIH07XG5cbiAgICByZW1vdmVNZWRpYUNsYXNzZXMgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHR5cGUsIHR5cGVzO1xuICAgICAgICB0eXBlcyA9IFsgXCJ2aWRlb1wiLCBcImF1ZGlvXCIgXTtcbiAgICAgICAgZm9yICggdHlwZSBpbiB0eXBlcyApIHtcbiAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnJlbW92ZSggXCJpbXByZXNzLW1lZGlhLVwiICsgdHlwZXNbIHR5cGUgXSArIFwiLXBsYXlpbmdcIiApO1xuICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QucmVtb3ZlKCBcImltcHJlc3MtbWVkaWEtXCIgKyB0eXBlc1sgdHlwZSBdICsgXCItcGF1c2VkXCIgKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBlbmhhbmNlTWVkaWFOb2RlcyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgaSwgaWQsIG1lZGlhLCBtZWRpYUVsZW1lbnQsIHR5cGU7XG5cbiAgICAgICAgbWVkaWEgPSByb290LnF1ZXJ5U2VsZWN0b3JBbGwoIFwiYXVkaW8sIHZpZGVvXCIgKTtcbiAgICAgICAgZm9yICggaSA9IDA7IGkgPCBtZWRpYS5sZW5ndGg7IGkgKz0gMSApIHtcbiAgICAgICAgICAgIHR5cGUgPSBtZWRpYVsgaSBdLm5vZGVOYW1lLnRvTG93ZXJDYXNlKCk7XG5cbiAgICAgICAgICAgIC8vIFNldCBhbiBpZCB0byBpZGVudGlmeSBlYWNoIG1lZGlhIG5vZGUgLSB1c2VkIGUuZy4gZm9yIGNyb3NzIHJlZmVyZW5jZXMgYnlcbiAgICAgICAgICAgIC8vIHRoZSBjb25zb2xlTWVkaWEgcGx1Z2luXG4gICAgICAgICAgICBtZWRpYUVsZW1lbnQgPSBtZWRpYVsgaSBdO1xuICAgICAgICAgICAgaWQgPSBtZWRpYUVsZW1lbnQuZ2V0QXR0cmlidXRlKCBcImlkXCIgKTtcbiAgICAgICAgICAgIGlmICggaWQgPT09IHVuZGVmaW5lZCB8fCBpZCA9PT0gbnVsbCApIHtcbiAgICAgICAgICAgICAgICBtZWRpYUVsZW1lbnQuc2V0QXR0cmlidXRlKCBcImlkXCIsIFwibWVkaWEtXCIgKyB0eXBlICsgXCItXCIgKyBpICk7XG4gICAgICAgICAgICAgICAgYXR0cmlidXRlVHJhY2tlci5wdXNoKCB7IFwibm9kZVwiOiBtZWRpYUVsZW1lbnQsIFwiYXR0clwiOiBcImlkXCIgfSApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZ2MuYWRkRXZlbnRMaXN0ZW5lciggbWVkaWFFbGVtZW50LCBcInBsYXlcIiwgb25QbGF5ICk7XG4gICAgICAgICAgICBnYy5hZGRFdmVudExpc3RlbmVyKCBtZWRpYUVsZW1lbnQsIFwicGxheWluZ1wiLCBvblBsYXkgKTtcbiAgICAgICAgICAgIGdjLmFkZEV2ZW50TGlzdGVuZXIoIG1lZGlhRWxlbWVudCwgXCJwYXVzZVwiLCBvblBhdXNlICk7XG4gICAgICAgICAgICBnYy5hZGRFdmVudExpc3RlbmVyKCBtZWRpYUVsZW1lbnQsIFwiZW5kZWRcIiwgb25FbmRlZCApO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIGVuaGFuY2VNZWRpYSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgc3RlcHMsIHN0ZXBFbGVtZW50LCBpO1xuICAgICAgICBlbmhhbmNlTWVkaWFOb2RlcygpO1xuICAgICAgICBzdGVwcyA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoIFwic3RlcFwiICk7XG4gICAgICAgIGZvciAoIGkgPSAwOyBpIDwgc3RlcHMubGVuZ3RoOyBpICs9IDEgKSB7XG4gICAgICAgICAgICBzdGVwRWxlbWVudCA9IHN0ZXBzWyBpIF07XG5cbiAgICAgICAgICAgIGdjLmFkZEV2ZW50TGlzdGVuZXIoIHN0ZXBFbGVtZW50LCBcImltcHJlc3M6c3RlcGVudGVyXCIsIG9uU3RlcGVudGVyICk7XG4gICAgICAgICAgICBnYy5hZGRFdmVudExpc3RlbmVyKCBzdGVwRWxlbWVudCwgXCJpbXByZXNzOnN0ZXBsZWF2ZVwiLCBvblN0ZXBsZWF2ZSApO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIG9uU3RlcGVudGVyRGV0ZWN0SW1wcmVzc0NvbnNvbGUgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIFwicHJldmlld1wiOiAoIHdpbmRvdy5mcmFtZUVsZW1lbnQgIT09IG51bGwgJiYgd2luZG93LmZyYW1lRWxlbWVudC5pZCA9PT0gXCJwcmVWaWV3XCIgKSxcbiAgICAgICAgICAgIFwic2xpZGVWaWV3XCI6ICggd2luZG93LmZyYW1lRWxlbWVudCAhPT0gbnVsbCAmJiB3aW5kb3cuZnJhbWVFbGVtZW50LmlkID09PSBcInNsaWRlVmlld1wiIClcbiAgICAgICAgfTtcbiAgICB9O1xuXG4gICAgb25TdGVwZW50ZXIgPSBmdW5jdGlvbiggZXZlbnQgKSB7XG4gICAgICAgIHZhciBzdGVwRWxlbWVudCwgbWVkaWEsIG1lZGlhRWxlbWVudCwgaSwgb25Db25zb2xlLCBhdXRvcGxheTtcbiAgICAgICAgaWYgKCAoICFldmVudCApIHx8ICggIWV2ZW50LnRhcmdldCApICkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgc3RlcEVsZW1lbnQgPSBldmVudC50YXJnZXQ7XG4gICAgICAgIHJlbW92ZU1lZGlhQ2xhc3NlcygpO1xuXG4gICAgICAgIG1lZGlhID0gc3RlcEVsZW1lbnQucXVlcnlTZWxlY3RvckFsbCggXCJhdWRpbywgdmlkZW9cIiApO1xuICAgICAgICBmb3IgKCBpID0gMDsgaSA8IG1lZGlhLmxlbmd0aDsgaSArPSAxICkge1xuICAgICAgICAgICAgbWVkaWFFbGVtZW50ID0gbWVkaWFbIGkgXTtcblxuICAgICAgICAgICAgLy8gQXV0b3BsYXkgd2hlbiAobWF5YmUgaW5oZXJpdGVkKSBhdXRvcGxheSBzZXR0aW5nIGlzIHRydWUsXG4gICAgICAgICAgICAvLyBidXQgb25seSBpZiBub3Qgb24gcHJldmlldyBvZiB0aGUgbmV4dCBzdGVwIGluIGltcHJlc3NDb25zb2xlXG4gICAgICAgICAgICBvbkNvbnNvbGUgPSBvblN0ZXBlbnRlckRldGVjdEltcHJlc3NDb25zb2xlKCk7XG4gICAgICAgICAgICBhdXRvcGxheSA9IGdldE1lZGlhQXR0cmlidXRlKCBcImF1dG9wbGF5XCIsIFsgbWVkaWFFbGVtZW50LCBzdGVwRWxlbWVudCwgcm9vdCBdICk7XG4gICAgICAgICAgICBpZiAoIGF1dG9wbGF5ICYmICFvbkNvbnNvbGUucHJldmlldyApIHtcbiAgICAgICAgICAgICAgICBpZiAoIG9uQ29uc29sZS5zbGlkZVZpZXcgKSB7XG4gICAgICAgICAgICAgICAgICAgIG1lZGlhRWxlbWVudC5tdXRlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIG1lZGlhRWxlbWVudC5wbGF5KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgb25TdGVwbGVhdmUgPSBmdW5jdGlvbiggZXZlbnQgKSB7XG4gICAgICAgIHZhciBzdGVwRWxlbWVudCwgbWVkaWEsIGksIG1lZGlhRWxlbWVudCwgYXV0b3BsYXksIGF1dG9wYXVzZSwgYXV0b3N0b3A7XG4gICAgICAgIGlmICggKCAhZXZlbnQgfHwgIWV2ZW50LnRhcmdldCApICkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgc3RlcEVsZW1lbnQgPSBldmVudC50YXJnZXQ7XG4gICAgICAgIG1lZGlhID0gZXZlbnQudGFyZ2V0LnF1ZXJ5U2VsZWN0b3JBbGwoIFwiYXVkaW8sIHZpZGVvXCIgKTtcbiAgICAgICAgZm9yICggaSA9IDA7IGkgPCBtZWRpYS5sZW5ndGg7IGkgKz0gMSApIHtcbiAgICAgICAgICAgIG1lZGlhRWxlbWVudCA9IG1lZGlhWyBpIF07XG5cbiAgICAgICAgICAgIGF1dG9wbGF5ID0gZ2V0TWVkaWFBdHRyaWJ1dGUoIFwiYXV0b3BsYXlcIiwgWyBtZWRpYUVsZW1lbnQsIHN0ZXBFbGVtZW50LCByb290IF0gKTtcbiAgICAgICAgICAgIGF1dG9wYXVzZSA9IGdldE1lZGlhQXR0cmlidXRlKCBcImF1dG9wYXVzZVwiLCBbIG1lZGlhRWxlbWVudCwgc3RlcEVsZW1lbnQsIHJvb3QgXSApO1xuICAgICAgICAgICAgYXV0b3N0b3AgPSBnZXRNZWRpYUF0dHJpYnV0ZSggXCJhdXRvc3RvcFwiLCAgWyBtZWRpYUVsZW1lbnQsIHN0ZXBFbGVtZW50LCByb290IF0gKTtcblxuICAgICAgICAgICAgLy8gSWYgYm90aCBhdXRvc3RvcCBhbmQgYXV0b3BhdXNlIGFyZSB1bmRlZmluZWQsIHNldCBpdCB0byB0aGUgdmFsdWUgb2YgYXV0b3BsYXlcbiAgICAgICAgICAgIGlmICggYXV0b3N0b3AgPT09IHVuZGVmaW5lZCAmJiBhdXRvcGF1c2UgPT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgICAgICAgICBhdXRvc3RvcCA9IGF1dG9wbGF5O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoIGF1dG9wYXVzZSB8fCBhdXRvc3RvcCApIHtcbiAgICAgICAgICAgICAgICBtZWRpYUVsZW1lbnQucGF1c2UoKTtcbiAgICAgICAgICAgICAgICBpZiAoIGF1dG9zdG9wICkge1xuICAgICAgICAgICAgICAgICAgICBtZWRpYUVsZW1lbnQuY3VycmVudFRpbWUgPSAwO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZW1vdmVNZWRpYUNsYXNzZXMoKTtcbiAgICB9O1xuXG59ICkoIGRvY3VtZW50LCB3aW5kb3cgKTtcblxuLyoqXG4gKiBNb2JpbGUgZGV2aWNlcyBzdXBwb3J0XG4gKlxuICogQWxsb3cgcHJlc2VudGF0aW9uIGNyZWF0b3JzIHRvIGhpZGUgYWxsIGJ1dCAzIHNsaWRlcywgdG8gc2F2ZSByZXNvdXJjZXMsIHBhcnRpY3VsYXJseSBvbiBtb2JpbGVcbiAqIGRldmljZXMsIHVzaW5nIGNsYXNzZXMgYm9keS5pbXByZXNzLW1vYmlsZSwgLnN0ZXAucHJldiwgLnN0ZXAuYWN0aXZlIGFuZCAuc3RlcC5uZXh0LlxuICpcbiAqIE5vdGU6IFRoaXMgcGx1Z2luIGRvZXMgbm90IHRha2UgaW50byBhY2NvdW50IHBvc3NpYmxlIHJlZGlyZWN0aW9ucyBkb25lIHdpdGggc2tpcCwgZ290byBldGNcbiAqIHBsdWdpbnMuIEJhc2ljYWxseSBpdCB3b3VsZG4ndCB3b3JrIGFzIGludGVuZGVkIGluIHN1Y2ggY2FzZXMsIGJ1dCB0aGUgYWN0aXZlIHN0ZXAgd2lsbCBhdCBsZWFzdFxuICogYmUgY29ycmVjdC5cbiAqXG4gKiBBZGFwdGVkIHRvIGEgcGx1Z2luIGZyb20gYSBzdWJtaXNzaW9uIGJ5IEBLemVuaTpcbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9pbXByZXNzL2ltcHJlc3MuanMvaXNzdWVzLzMzM1xuICovXG4vKiBnbG9iYWwgZG9jdW1lbnQsIG5hdmlnYXRvciAqL1xuKCBmdW5jdGlvbiggZG9jdW1lbnQgKSB7XG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgICB2YXIgZ2V0TmV4dFN0ZXAgPSBmdW5jdGlvbiggZWwgKSB7XG4gICAgICAgIHZhciBzdGVwcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoIFwiLnN0ZXBcIiApO1xuICAgICAgICBmb3IgKCB2YXIgaSA9IDA7IGkgPCBzdGVwcy5sZW5ndGg7IGkrKyApIHtcbiAgICAgICAgICAgIGlmICggc3RlcHNbIGkgXSA9PT0gZWwgKSB7XG4gICAgICAgICAgICAgICAgaWYgKCBpICsgMSA8IHN0ZXBzLmxlbmd0aCApIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHN0ZXBzWyBpICsgMSBdO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBzdGVwc1sgMCBdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG4gICAgdmFyIGdldFByZXZTdGVwID0gZnVuY3Rpb24oIGVsICkge1xuICAgICAgICB2YXIgc3RlcHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCBcIi5zdGVwXCIgKTtcbiAgICAgICAgZm9yICggdmFyIGkgPSBzdGVwcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSApIHtcbiAgICAgICAgICAgIGlmICggc3RlcHNbIGkgXSA9PT0gZWwgKSB7XG4gICAgICAgICAgICAgICAgaWYgKCBpIC0gMSA+PSAwICkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc3RlcHNbIGkgLSAxIF07XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHN0ZXBzWyBzdGVwcy5sZW5ndGggLSAxIF07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8vIERldGVjdCBtb2JpbGUgYnJvd3NlcnMgJiBhZGQgQ1NTIGNsYXNzIGFzIGFwcHJvcHJpYXRlLlxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoIFwiaW1wcmVzczppbml0XCIsIGZ1bmN0aW9uKCBldmVudCApIHtcbiAgICAgICAgdmFyIGJvZHkgPSBkb2N1bWVudC5ib2R5O1xuICAgICAgICBpZiAoIC9BbmRyb2lkfHdlYk9TfGlQaG9uZXxpUGFkfGlQb2R8QmxhY2tCZXJyeXxJRU1vYmlsZXxPcGVyYSBNaW5pL2kudGVzdChcbiAgICAgICAgICAgICAgICAgbmF2aWdhdG9yLnVzZXJBZ2VudFxuICAgICAgICAgICAgICkgKSB7XG4gICAgICAgICAgICBib2R5LmNsYXNzTGlzdC5hZGQoIFwiaW1wcmVzcy1tb2JpbGVcIiApO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gVW5zZXQgYWxsIHRoaXMgb24gdGVhcmRvd25cbiAgICAgICAgdmFyIGFwaSA9IGV2ZW50LmRldGFpbC5hcGk7XG4gICAgICAgIGFwaS5saWIuZ2MucHVzaENhbGxiYWNrKCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnJlbW92ZSggXCJpbXByZXNzLW1vYmlsZVwiICk7XG4gICAgICAgICAgICB2YXIgcHJldiA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoIFwicHJldlwiIClbIDAgXTtcbiAgICAgICAgICAgIHZhciBuZXh0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSggXCJuZXh0XCIgKVsgMCBdO1xuICAgICAgICAgICAgaWYgKCB0eXBlb2YgcHJldiAhPT0gXCJ1bmRlZmluZWRcIiApIHtcbiAgICAgICAgICAgICAgICBwcmV2LmNsYXNzTGlzdC5yZW1vdmUoIFwicHJldlwiICk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIHR5cGVvZiBuZXh0ICE9PSBcInVuZGVmaW5lZFwiICkge1xuICAgICAgICAgICAgICAgIG5leHQuY2xhc3NMaXN0LnJlbW92ZSggXCJuZXh0XCIgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSApO1xuICAgIH0gKTtcblxuICAgIC8vIEFkZCBwcmV2IGFuZCBuZXh0IGNsYXNzZXMgdG8gdGhlIHNpYmxpbmdzIG9mIHRoZSBuZXdseSBlbnRlcmVkIGFjdGl2ZSBzdGVwIGVsZW1lbnRcbiAgICAvLyBSZW1vdmUgcHJldiBhbmQgbmV4dCBjbGFzc2VzIGZyb20gdGhlaXIgY3VycmVudCBzdGVwIGVsZW1lbnRzXG4gICAgLy8gTm90ZTogQXMgYW4gZXhjZXB0aW9uIHdlIGJyZWFrIG5hbWVzcGFjaW5nIHJ1bGVzLCBhcyB0aGVzZSBhcmUgdXNlZnVsIGdlbmVyYWwgcHVycG9zZVxuICAgIC8vIGNsYXNzZXMuIChOYW1pbmcgcnVsZXMgd291bGQgcmVxdWlyZSB1cyB0byB1c2UgY3NzIGNsYXNzZXMgbW9iaWxlLW5leHQgYW5kIG1vYmlsZS1wcmV2LFxuICAgIC8vIGJhc2VkIG9uIHBsdWdpbiBuYW1lLilcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCBcImltcHJlc3M6c3RlcGVudGVyXCIsIGZ1bmN0aW9uKCBldmVudCApIHtcblx0ICAgICAgdmFyIG9sZHByZXYgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCBcInByZXZcIiApWyAwIF07XG5cdCAgICAgIHZhciBvbGRuZXh0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSggXCJuZXh0XCIgKVsgMCBdO1xuXG5cdCAgICAgIHZhciBwcmV2ID0gZ2V0UHJldlN0ZXAoIGV2ZW50LnRhcmdldCApO1xuXHQgICAgICBwcmV2LmNsYXNzTGlzdC5hZGQoIFwicHJldlwiICk7XG5cdCAgICAgIHZhciBuZXh0ID0gZ2V0TmV4dFN0ZXAoIGV2ZW50LnRhcmdldCApO1xuXHQgICAgICBuZXh0LmNsYXNzTGlzdC5hZGQoIFwibmV4dFwiICk7XG5cblx0ICAgICAgaWYgKCB0eXBlb2Ygb2xkcHJldiAhPT0gXCJ1bmRlZmluZWRcIiApIHtcblx0XHQgICAgICBvbGRwcmV2LmNsYXNzTGlzdC5yZW1vdmUoIFwicHJldlwiICk7XG4gICAgICAgICAgICAgIH1cblx0ICAgICAgaWYgKCB0eXBlb2Ygb2xkbmV4dCAhPT0gXCJ1bmRlZmluZWRcIiApIHtcblx0XHQgICAgICBvbGRuZXh0LmNsYXNzTGlzdC5yZW1vdmUoIFwibmV4dFwiICk7XG4gICAgICAgICAgICAgIH1cbiAgICB9ICk7XG59ICkoIGRvY3VtZW50ICk7XG5cblxuLyoqXG4gKiBNb3VzZSB0aW1lb3V0IHBsdWdpblxuICpcbiAqIEFmdGVyIDMgc2Vjb25kcyBvZiBtb3VzZSBpbmFjdGl2aXR5LCBhZGQgdGhlIGNzcyBjbGFzc1xuICogYGJvZHkuaW1wcmVzcy1tb3VzZS10aW1lb3V0YC4gT24gYG1vdXNlbW92ZWAsIGBjbGlja2Agb3IgYHRvdWNoYCwgcmVtb3ZlIHRoZVxuICogY2xhc3MuXG4gKlxuICogVGhlIHVzZSBjYXNlIGZvciB0aGlzIHBsdWdpbiBpcyB0byB1c2UgQ1NTIHRvIGhpZGUgZWxlbWVudHMgZnJvbSB0aGUgc2NyZWVuXG4gKiBhbmQgb25seSBtYWtlIHRoZW0gdmlzaWJsZSB3aGVuIHRoZSBtb3VzZSBpcyBtb3ZlZC4gRXhhbXBsZXMgd2hlcmUgdGhpc1xuICogbWlnaHQgYmUgdXNlZCBhcmU6IHRoZSB0b29sYmFyIGZyb20gdGhlIHRvb2xiYXIgcGx1Z2luLCBhbmQgdGhlIG1vdXNlIGN1cnNvclxuICogaXRzZWxmLlxuICpcbiAqIEV4YW1wbGUgQ1NTOlxuICpcbiAqICAgICBib2R5LmltcHJlc3MtbW91c2UtdGltZW91dCB7XG4gKiAgICAgICAgIGN1cnNvcjogbm9uZTtcbiAqICAgICB9XG4gKiAgICAgYm9keS5pbXByZXNzLW1vdXNlLXRpbWVvdXQgZGl2I2ltcHJlc3MtdG9vbGJhciB7XG4gKiAgICAgICAgIGRpc3BsYXk6IG5vbmU7XG4gKiAgICAgfVxuICpcbiAqXG4gKiBDb3B5cmlnaHQgMjAxNiBIZW5yaWsgSW5nbyAoQGhlbnJpa2luZ28pXG4gKiBSZWxlYXNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2UuXG4gKi9cbi8qIGdsb2JhbCB3aW5kb3csIGRvY3VtZW50ICovXG4oIGZ1bmN0aW9uKCBkb2N1bWVudCwgd2luZG93ICkge1xuICAgIFwidXNlIHN0cmljdFwiO1xuICAgIHZhciB0aW1lb3V0ID0gMztcbiAgICB2YXIgdGltZW91dEhhbmRsZTtcblxuICAgIHZhciBoaWRlID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgLy8gTW91c2UgaXMgbm93IGluYWN0aXZlXG4gICAgICAgIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LmFkZCggXCJpbXByZXNzLW1vdXNlLXRpbWVvdXRcIiApO1xuICAgIH07XG5cbiAgICB2YXIgc2hvdyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoIHRpbWVvdXRIYW5kbGUgKSB7XG4gICAgICAgICAgICB3aW5kb3cuY2xlYXJUaW1lb3V0KCB0aW1lb3V0SGFuZGxlICk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBNb3VzZSBpcyBub3cgYWN0aXZlXG4gICAgICAgIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnJlbW92ZSggXCJpbXByZXNzLW1vdXNlLXRpbWVvdXRcIiApO1xuXG4gICAgICAgIC8vIFRoZW4gc2V0IG5ldyB0aW1lb3V0IGFmdGVyIHdoaWNoIGl0IGlzIGNvbnNpZGVyZWQgaW5hY3RpdmUgYWdhaW5cbiAgICAgICAgdGltZW91dEhhbmRsZSA9IHdpbmRvdy5zZXRUaW1lb3V0KCBoaWRlLCB0aW1lb3V0ICogMTAwMCApO1xuICAgIH07XG5cbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCBcImltcHJlc3M6aW5pdFwiLCBmdW5jdGlvbiggZXZlbnQgKSB7XG4gICAgICAgIHZhciBhcGkgPSBldmVudC5kZXRhaWwuYXBpO1xuICAgICAgICB2YXIgZ2MgPSBhcGkubGliLmdjO1xuICAgICAgICBnYy5hZGRFdmVudExpc3RlbmVyKCBkb2N1bWVudCwgXCJtb3VzZW1vdmVcIiwgc2hvdyApO1xuICAgICAgICBnYy5hZGRFdmVudExpc3RlbmVyKCBkb2N1bWVudCwgXCJjbGlja1wiLCBzaG93ICk7XG4gICAgICAgIGdjLmFkZEV2ZW50TGlzdGVuZXIoIGRvY3VtZW50LCBcInRvdWNoXCIsIHNob3cgKTtcblxuICAgICAgICAvLyBTZXQgZmlyc3QgdGltZW91dFxuICAgICAgICBzaG93KCk7XG5cbiAgICAgICAgLy8gVW5zZXQgYWxsIHRoaXMgb24gdGVhcmRvd25cbiAgICAgICAgZ2MucHVzaENhbGxiYWNrKCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHdpbmRvdy5jbGVhclRpbWVvdXQoIHRpbWVvdXRIYW5kbGUgKTtcbiAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnJlbW92ZSggXCJpbXByZXNzLW1vdXNlLXRpbWVvdXRcIiApO1xuICAgICAgICB9ICk7XG4gICAgfSwgZmFsc2UgKTtcblxufSApKCBkb2N1bWVudCwgd2luZG93ICk7XG5cbi8qKlxuICogTmF2aWdhdGlvbiBldmVudHMgcGx1Z2luXG4gKlxuICogQXMgeW91IGNhbiBzZWUgdGhpcyBwYXJ0IGlzIHNlcGFyYXRlIGZyb20gdGhlIGltcHJlc3MuanMgY29yZSBjb2RlLlxuICogSXQncyBiZWNhdXNlIHRoZXNlIG5hdmlnYXRpb24gYWN0aW9ucyBvbmx5IG5lZWQgd2hhdCBpbXByZXNzLmpzIHByb3ZpZGVzIHdpdGhcbiAqIGl0cyBzaW1wbGUgQVBJLlxuICpcbiAqIFRoaXMgcGx1Z2luIGlzIHdoYXQgd2UgY2FsbCBhbiBfaW5pdCBwbHVnaW5fLiBJdCdzIGEgc2ltcGxlIGtpbmQgb2ZcbiAqIGltcHJlc3MuanMgcGx1Z2luLiBXaGVuIGxvYWRlZCwgaXQgc3RhcnRzIGxpc3RlbmluZyB0byB0aGUgYGltcHJlc3M6aW5pdGBcbiAqIGV2ZW50LiBUaGF0IGV2ZW50IGxpc3RlbmVyIGluaXRpYWxpemVzIHRoZSBwbHVnaW4gZnVuY3Rpb25hbGl0eSAtIGluIHRoaXNcbiAqIGNhc2Ugd2UgbGlzdGVuIHRvIHNvbWUga2V5cHJlc3MgYW5kIG1vdXNlIGV2ZW50cy4gVGhlIG9ubHkgZGVwZW5kZW5jaWVzIG9uXG4gKiBjb3JlIGltcHJlc3MuanMgZnVuY3Rpb25hbGl0eSBpcyB0aGUgYGltcHJlc3M6aW5pdGAgbWV0aG9kLCBhcyB3ZWxsIGFzIHVzaW5nXG4gKiB0aGUgcHVibGljIGFwaSBgbmV4dCgpLCBwcmV2KCksYCBldGMgd2hlbiBrZXlzIGFyZSBwcmVzc2VkLlxuICpcbiAqIENvcHlyaWdodCAyMDExLTIwMTIgQmFydGVrIFN6b3BrYSAoQGJhcnRheilcbiAqIFJlbGVhc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZS5cbiAqIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICogIGF1dGhvcjogIEJhcnRlayBTem9wa2FcbiAqICB2ZXJzaW9uOiAwLjUuM1xuICogIHVybDogICAgIGh0dHA6Ly9iYXJ0YXouZ2l0aHViLmNvbS9pbXByZXNzLmpzL1xuICogIHNvdXJjZTogIGh0dHA6Ly9naXRodWIuY29tL2JhcnRhei9pbXByZXNzLmpzL1xuICpcbiAqL1xuLyogZ2xvYmFsIGRvY3VtZW50ICovXG4oIGZ1bmN0aW9uKCBkb2N1bWVudCApIHtcbiAgICBcInVzZSBzdHJpY3RcIjtcblxuICAgIC8vIFdhaXQgZm9yIGltcHJlc3MuanMgdG8gYmUgaW5pdGlhbGl6ZWRcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCBcImltcHJlc3M6aW5pdFwiLCBmdW5jdGlvbiggZXZlbnQgKSB7XG5cbiAgICAgICAgLy8gR2V0dGluZyBBUEkgZnJvbSBldmVudCBkYXRhLlxuICAgICAgICAvLyBTbyB5b3UgZG9uJ3QgZXZlbnQgbmVlZCB0byBrbm93IHdoYXQgaXMgdGhlIGlkIG9mIHRoZSByb290IGVsZW1lbnRcbiAgICAgICAgLy8gb3IgYW55dGhpbmcuIGBpbXByZXNzOmluaXRgIGV2ZW50IGRhdGEgZ2l2ZXMgeW91IGV2ZXJ5dGhpbmcgeW91XG4gICAgICAgIC8vIG5lZWQgdG8gY29udHJvbCB0aGUgcHJlc2VudGF0aW9uIHRoYXQgd2FzIGp1c3QgaW5pdGlhbGl6ZWQuXG4gICAgICAgIHZhciBhcGkgPSBldmVudC5kZXRhaWwuYXBpO1xuICAgICAgICB2YXIgZ2MgPSBhcGkubGliLmdjO1xuICAgICAgICB2YXIgdXRpbCA9IGFwaS5saWIudXRpbDtcblxuICAgICAgICAvLyBTdXBwb3J0ZWQga2V5cyBhcmU6XG4gICAgICAgIC8vIFtzcGFjZV0gLSBxdWl0ZSBjb21tb24gaW4gcHJlc2VudGF0aW9uIHNvZnR3YXJlIHRvIG1vdmUgZm9yd2FyZFxuICAgICAgICAvLyBbdXBdIFtyaWdodF0gLyBbZG93bl0gW2xlZnRdIC0gYWdhaW4gY29tbW9uIGFuZCBuYXR1cmFsIGFkZGl0aW9uLFxuICAgICAgICAvLyBbcGdkb3duXSAvIFtwZ3VwXSAtIG9mdGVuIHRyaWdnZXJlZCBieSByZW1vdGUgY29udHJvbGxlcnMsXG4gICAgICAgIC8vIFt0YWJdIC0gdGhpcyBvbmUgaXMgcXVpdGUgY29udHJvdmVyc2lhbCwgYnV0IHRoZSByZWFzb24gaXQgZW5kZWQgdXAgb25cbiAgICAgICAgLy8gICB0aGlzIGxpc3QgaXMgcXVpdGUgYW4gaW50ZXJlc3Rpbmcgc3RvcnkuLi4gUmVtZW1iZXIgdGhhdCBzdHJhbmdlIHBhcnRcbiAgICAgICAgLy8gICBpbiB0aGUgaW1wcmVzcy5qcyBjb2RlIHdoZXJlIHdpbmRvdyBpcyBzY3JvbGxlZCB0byAwLDAgb24gZXZlcnkgcHJlc2VudGF0aW9uXG4gICAgICAgIC8vICAgc3RlcCwgYmVjYXVzZSBzb21ldGltZXMgYnJvd3NlciBzY3JvbGxzIHZpZXdwb3J0IGJlY2F1c2Ugb2YgdGhlIGZvY3VzZWQgZWxlbWVudD9cbiAgICAgICAgLy8gICBXZWxsLCB0aGUgW3RhYl0ga2V5IGJ5IGRlZmF1bHQgbmF2aWdhdGVzIGFyb3VuZCBmb2N1c2FibGUgZWxlbWVudHMsIHNvIGNsaWNraW5nXG4gICAgICAgIC8vICAgaXQgdmVyeSBvZnRlbiBjYXVzZWQgc2Nyb2xsaW5nIHRvIGZvY3VzZWQgZWxlbWVudCBhbmQgYnJlYWtpbmcgaW1wcmVzcy5qc1xuICAgICAgICAvLyAgIHBvc2l0aW9uaW5nLiBJIGRpZG4ndCB3YW50IHRvIGp1c3QgcHJldmVudCB0aGlzIGRlZmF1bHQgYWN0aW9uLCBzbyBJIHVzZWQgW3RhYl1cbiAgICAgICAgLy8gICBhcyBhbm90aGVyIHdheSB0byBtb3ZpbmcgdG8gbmV4dCBzdGVwLi4uIEFuZCB5ZXMsIEkga25vdyB0aGF0IGZvciB0aGUgc2FrZSBvZlxuICAgICAgICAvLyAgIGNvbnNpc3RlbmN5IEkgc2hvdWxkIGFkZCBbc2hpZnQrdGFiXSBhcyBvcHBvc2l0ZSBhY3Rpb24uLi5cbiAgICAgICAgdmFyIGlzTmF2aWdhdGlvbkV2ZW50ID0gZnVuY3Rpb24oIGV2ZW50ICkge1xuXG4gICAgICAgICAgICAvLyBEb24ndCB0cmlnZ2VyIG5hdmlnYXRpb24gZm9yIGV4YW1wbGUgd2hlbiB1c2VyIHJldHVybnMgdG8gYnJvd3NlciB3aW5kb3cgd2l0aCBBTFQrVEFCXG4gICAgICAgICAgICBpZiAoIGV2ZW50LmFsdEtleSB8fCBldmVudC5jdHJsS2V5IHx8IGV2ZW50Lm1ldGFLZXkgKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBJbiB0aGUgY2FzZSBvZiBUQUIsIHdlIGZvcmNlIHN0ZXAgbmF2aWdhdGlvbiBhbHdheXMsIG92ZXJyaWRpbmcgdGhlIGJyb3dzZXJcbiAgICAgICAgICAgIC8vIG5hdmlnYXRpb24gYmV0d2VlbiBpbnB1dCBlbGVtZW50cywgYnV0dG9ucyBhbmQgbGlua3MuXG4gICAgICAgICAgICBpZiAoIGV2ZW50LmtleUNvZGUgPT09IDkgKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIFdpdGggdGhlIHNvbGUgZXhjZXB0aW9uIG9mIFRBQiwgd2UgYWxzbyBpZ25vcmUga2V5cyBwcmVzc2VkIGlmIHNoaWZ0IGlzIGRvd24uXG4gICAgICAgICAgICBpZiAoIGV2ZW50LnNoaWZ0S2V5ICkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKCAoIGV2ZW50LmtleUNvZGUgPj0gMzIgJiYgZXZlbnQua2V5Q29kZSA8PSAzNCApIHx8XG4gICAgICAgICAgICAgICAgICggZXZlbnQua2V5Q29kZSA+PSAzNyAmJiBldmVudC5rZXlDb2RlIDw9IDQwICkgKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gS0VZQk9BUkQgTkFWSUdBVElPTiBIQU5ETEVSU1xuXG4gICAgICAgIC8vIFByZXZlbnQgZGVmYXVsdCBrZXlkb3duIGFjdGlvbiB3aGVuIG9uZSBvZiBzdXBwb3J0ZWQga2V5IGlzIHByZXNzZWQuXG4gICAgICAgIGdjLmFkZEV2ZW50TGlzdGVuZXIoIGRvY3VtZW50LCBcImtleWRvd25cIiwgZnVuY3Rpb24oIGV2ZW50ICkge1xuICAgICAgICAgICAgaWYgKCBpc05hdmlnYXRpb25FdmVudCggZXZlbnQgKSApIHtcbiAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LCBmYWxzZSApO1xuXG4gICAgICAgIC8vIFRyaWdnZXIgaW1wcmVzcyBhY3Rpb24gKG5leHQgb3IgcHJldikgb24ga2V5dXAuXG4gICAgICAgIGdjLmFkZEV2ZW50TGlzdGVuZXIoIGRvY3VtZW50LCBcImtleXVwXCIsIGZ1bmN0aW9uKCBldmVudCApIHtcbiAgICAgICAgICAgIGlmICggaXNOYXZpZ2F0aW9uRXZlbnQoIGV2ZW50ICkgKSB7XG4gICAgICAgICAgICAgICAgaWYgKCBldmVudC5zaGlmdEtleSApIHtcbiAgICAgICAgICAgICAgICAgICAgc3dpdGNoICggZXZlbnQua2V5Q29kZSApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgOTogLy8gU2hpZnQrdGFiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBpLnByZXYoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHN3aXRjaCAoIGV2ZW50LmtleUNvZGUgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDMzOiAvLyBQZyB1cFxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAzNzogLy8gTGVmdFxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAzODogLy8gVXBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwaS5wcmV2KCBldmVudCApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDk6ICAvLyBUYWJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgMzI6IC8vIFNwYWNlXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDM0OiAvLyBQZyBkb3duXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDM5OiAvLyBSaWdodFxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSA0MDogLy8gRG93blxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBpLm5leHQoIGV2ZW50ICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LCBmYWxzZSApO1xuXG4gICAgICAgIC8vIERlbGVnYXRlZCBoYW5kbGVyIGZvciBjbGlja2luZyBvbiB0aGUgbGlua3MgdG8gcHJlc2VudGF0aW9uIHN0ZXBzXG4gICAgICAgIGdjLmFkZEV2ZW50TGlzdGVuZXIoIGRvY3VtZW50LCBcImNsaWNrXCIsIGZ1bmN0aW9uKCBldmVudCApIHtcblxuICAgICAgICAgICAgLy8gRXZlbnQgZGVsZWdhdGlvbiB3aXRoIFwiYnViYmxpbmdcIlxuICAgICAgICAgICAgLy8gY2hlY2sgaWYgZXZlbnQgdGFyZ2V0IChvciBhbnkgb2YgaXRzIHBhcmVudHMgaXMgYSBsaW5rKVxuICAgICAgICAgICAgdmFyIHRhcmdldCA9IGV2ZW50LnRhcmdldDtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgd2hpbGUgKCAoIHRhcmdldC50YWdOYW1lICE9PSBcIkFcIiApICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAoIHRhcmdldCAhPT0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50ICkgKSB7XG4gICAgICAgICAgICAgICAgICAgIHRhcmdldCA9IHRhcmdldC5wYXJlbnROb2RlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmICggdGFyZ2V0LnRhZ05hbWUgPT09IFwiQVwiICkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgaHJlZiA9IHRhcmdldC5nZXRBdHRyaWJ1dGUoIFwiaHJlZlwiICk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gSWYgaXQncyBhIGxpbmsgdG8gcHJlc2VudGF0aW9uIHN0ZXAsIHRhcmdldCB0aGlzIHN0ZXBcbiAgICAgICAgICAgICAgICAgICAgaWYgKCBocmVmICYmIGhyZWZbIDAgXSA9PT0gXCIjXCIgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCggaHJlZi5zbGljZSggMSApICk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoIGFwaS5nb3RvKCB0YXJnZXQgKSApIHtcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKCBlcnIgKSB7XG5cbiAgICAgICAgICAgICAgICAvLyBGb3IgZXhhbXBsZSwgd2hlbiBjbGlja2luZyBvbiB0aGUgYnV0dG9uIHRvIGxhdW5jaCBzcGVha2VyIGNvbnNvbGUsIHRoZSBidXR0b25cbiAgICAgICAgICAgICAgICAvLyBpcyBpbW1lZGlhdGVseSBkZWxldGVkIGZyb20gdGhlIERPTS4gSW4gdGhpcyBjYXNlIHRhcmdldCBpcyBhIERPTSBlbGVtZW50IHdoZW5cbiAgICAgICAgICAgICAgICAvLyB3ZSBnZXQgaXQsIGJ1dCB0dXJucyBvdXQgdG8gYmUgbnVsbCBpZiB5b3UgdHJ5IHRvIGFjdHVhbGx5IGRvIGFueXRoaW5nIHdpdGggaXQuXG4gICAgICAgICAgICAgICAgaWYgKCBlcnIgaW5zdGFuY2VvZiBUeXBlRXJyb3IgJiZcbiAgICAgICAgICAgICAgICAgICAgIGVyci5tZXNzYWdlID09PSBcInRhcmdldCBpcyBudWxsXCIgKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LCBmYWxzZSApO1xuXG4gICAgICAgIC8vIERlbGVnYXRlZCBoYW5kbGVyIGZvciBjbGlja2luZyBvbiBzdGVwIGVsZW1lbnRzXG4gICAgICAgIGdjLmFkZEV2ZW50TGlzdGVuZXIoIGRvY3VtZW50LCBcImNsaWNrXCIsIGZ1bmN0aW9uKCBldmVudCApIHtcbiAgICAgICAgICAgIHZhciB0YXJnZXQgPSBldmVudC50YXJnZXQ7XG4gICAgICAgICAgICB0cnkge1xuXG4gICAgICAgICAgICAgICAgLy8gRmluZCBjbG9zZXN0IHN0ZXAgZWxlbWVudCB0aGF0IGlzIG5vdCBhY3RpdmVcbiAgICAgICAgICAgICAgICB3aGlsZSAoICEoIHRhcmdldC5jbGFzc0xpc3QuY29udGFpbnMoIFwic3RlcFwiICkgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICF0YXJnZXQuY2xhc3NMaXN0LmNvbnRhaW5zKCBcImFjdGl2ZVwiICkgKSAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgKCB0YXJnZXQgIT09IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCApICkge1xuICAgICAgICAgICAgICAgICAgICB0YXJnZXQgPSB0YXJnZXQucGFyZW50Tm9kZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoIGFwaS5nb3RvKCB0YXJnZXQgKSApIHtcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoIGVyciApIHtcblxuICAgICAgICAgICAgICAgIC8vIEZvciBleGFtcGxlLCB3aGVuIGNsaWNraW5nIG9uIHRoZSBidXR0b24gdG8gbGF1bmNoIHNwZWFrZXIgY29uc29sZSwgdGhlIGJ1dHRvblxuICAgICAgICAgICAgICAgIC8vIGlzIGltbWVkaWF0ZWx5IGRlbGV0ZWQgZnJvbSB0aGUgRE9NLiBJbiB0aGlzIGNhc2UgdGFyZ2V0IGlzIGEgRE9NIGVsZW1lbnQgd2hlblxuICAgICAgICAgICAgICAgIC8vIHdlIGdldCBpdCwgYnV0IHR1cm5zIG91dCB0byBiZSBudWxsIGlmIHlvdSB0cnkgdG8gYWN0dWFsbHkgZG8gYW55dGhpbmcgd2l0aCBpdC5cbiAgICAgICAgICAgICAgICBpZiAoIGVyciBpbnN0YW5jZW9mIFR5cGVFcnJvciAmJlxuICAgICAgICAgICAgICAgICAgICAgZXJyLm1lc3NhZ2UgPT09IFwidGFyZ2V0IGlzIG51bGxcIiApIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aHJvdyBlcnI7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIGZhbHNlICk7XG5cbiAgICAgICAgLy8gQWRkIGEgbGluZSB0byB0aGUgaGVscCBwb3B1cFxuICAgICAgICB1dGlsLnRyaWdnZXJFdmVudCggZG9jdW1lbnQsIFwiaW1wcmVzczpoZWxwOmFkZFwiLCB7IGNvbW1hbmQ6IFwiTGVmdCAmYW1wOyBSaWdodFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXh0OiBcIlByZXZpb3VzICZhbXA7IE5leHQgc3RlcFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByb3c6IDEgfSApO1xuXG4gICAgfSwgZmFsc2UgKTtcblxufSApKCBkb2N1bWVudCApO1xuXG5cbi8qKlxuICogTmF2aWdhdGlvbiBVSSBwbHVnaW5cbiAqXG4gKiBUaGlzIHBsdWdpbiBwcm92aWRlcyBVSSBlbGVtZW50cyBcImJhY2tcIiwgXCJmb3J3YXJkXCIgYW5kIGEgbGlzdCB0byBzZWxlY3RcbiAqIGEgc3BlY2lmaWMgc2xpZGUgbnVtYmVyLlxuICpcbiAqIFRoZSBuYXZpZ2F0aW9uIGNvbnRyb2xzIGFyZSBhZGRlZCB0byB0aGUgdG9vbGJhciBwbHVnaW4gdmlhIERPTSBldmVudHMuIFVzZXIgbXVzdCBlbmFibGUgdGhlXG4gKiB0b29sYmFyIGluIGEgcHJlc2VudGF0aW9uIHRvIGhhdmUgdGhlbSB2aXNpYmxlLlxuICpcbiAqIENvcHlyaWdodCAyMDE2IEhlbnJpayBJbmdvIChAaGVucmlraW5nbylcbiAqIFJlbGVhc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZS5cbiAqL1xuXG4vLyBUaGlzIGZpbGUgY29udGFpbnMgc28gbXVjaCBIVE1MLCB0aGF0IHdlIHdpbGwganVzdCByZXNwZWN0ZnVsbHkgZGlzYWdyZWUgYWJvdXQganNcbi8qIGpzaGludCBxdW90bWFyazpzaW5nbGUgKi9cbi8qIGdsb2JhbCBkb2N1bWVudCAqL1xuXG4oIGZ1bmN0aW9uKCBkb2N1bWVudCApIHtcbiAgICAndXNlIHN0cmljdCc7XG4gICAgdmFyIHRvb2xiYXI7XG4gICAgdmFyIGFwaTtcbiAgICB2YXIgcm9vdDtcbiAgICB2YXIgc3RlcHM7XG4gICAgdmFyIGhpZGVTdGVwcyA9IFtdO1xuICAgIHZhciBwcmV2O1xuICAgIHZhciBzZWxlY3Q7XG4gICAgdmFyIG5leHQ7XG5cbiAgICB2YXIgdHJpZ2dlckV2ZW50ID0gZnVuY3Rpb24oIGVsLCBldmVudE5hbWUsIGRldGFpbCApIHtcbiAgICAgICAgdmFyIGV2ZW50ID0gZG9jdW1lbnQuY3JlYXRlRXZlbnQoICdDdXN0b21FdmVudCcgKTtcbiAgICAgICAgZXZlbnQuaW5pdEN1c3RvbUV2ZW50KCBldmVudE5hbWUsIHRydWUsIHRydWUsIGRldGFpbCApO1xuICAgICAgICBlbC5kaXNwYXRjaEV2ZW50KCBldmVudCApO1xuICAgIH07XG5cbiAgICB2YXIgbWFrZURvbUVsZW1lbnQgPSBmdW5jdGlvbiggaHRtbCApIHtcbiAgICAgICAgdmFyIHRlbXBEaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnZGl2JyApO1xuICAgICAgICB0ZW1wRGl2LmlubmVySFRNTCA9IGh0bWw7XG4gICAgICAgIHJldHVybiB0ZW1wRGl2LmZpcnN0Q2hpbGQ7XG4gICAgfTtcblxuICAgIHZhciBzZWxlY3RPcHRpb25zSHRtbCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgb3B0aW9ucyA9ICcnO1xuICAgICAgICBmb3IgKCB2YXIgaSA9IDA7IGkgPCBzdGVwcy5sZW5ndGg7IGkrKyApIHtcblxuICAgICAgICAgICAgLy8gT21pdCBzdGVwcyB0aGF0IGFyZSBsaXN0ZWQgYXMgaGlkZGVuIGZyb20gc2VsZWN0IHdpZGdldFxuICAgICAgICAgICAgaWYgKCBoaWRlU3RlcHMuaW5kZXhPZiggc3RlcHNbIGkgXSApIDwgMCApIHtcbiAgICAgICAgICAgICAgICBvcHRpb25zID0gb3B0aW9ucyArICc8b3B0aW9uIHZhbHVlPVwiJyArIHN0ZXBzWyBpIF0uaWQgKyAnXCI+JyArIC8vIGpzaGludCBpZ25vcmU6bGluZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RlcHNbIGkgXS5pZCArICc8L29wdGlvbj4nICsgJ1xcbic7IC8vIGpzaGludCBpZ25vcmU6bGluZVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBvcHRpb25zO1xuICAgIH07XG5cbiAgICB2YXIgYWRkTmF2aWdhdGlvbkNvbnRyb2xzID0gZnVuY3Rpb24oIGV2ZW50ICkge1xuICAgICAgICBhcGkgPSBldmVudC5kZXRhaWwuYXBpO1xuICAgICAgICB2YXIgZ2MgPSBhcGkubGliLmdjO1xuICAgICAgICByb290ID0gZXZlbnQudGFyZ2V0O1xuICAgICAgICBzdGVwcyA9IHJvb3QucXVlcnlTZWxlY3RvckFsbCggJy5zdGVwJyApO1xuXG4gICAgICAgIHZhciBwcmV2SHRtbCAgID0gJzxidXR0b24gaWQ9XCJpbXByZXNzLW5hdmlnYXRpb24tdWktcHJldlwiIHRpdGxlPVwiUHJldmlvdXNcIiAnICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAnY2xhc3M9XCJpbXByZXNzLW5hdmlnYXRpb24tdWlcIj4mbHQ7PC9idXR0b24+JztcbiAgICAgICAgdmFyIHNlbGVjdEh0bWwgPSAnPHNlbGVjdCBpZD1cImltcHJlc3MtbmF2aWdhdGlvbi11aS1zZWxlY3RcIiB0aXRsZT1cIkdvIHRvXCIgJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgJ2NsYXNzPVwiaW1wcmVzcy1uYXZpZ2F0aW9uLXVpXCI+JyArICdcXG4nICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGVjdE9wdGlvbnNIdG1sKCkgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgJzwvc2VsZWN0Pic7XG4gICAgICAgIHZhciBuZXh0SHRtbCAgID0gJzxidXR0b24gaWQ9XCJpbXByZXNzLW5hdmlnYXRpb24tdWktbmV4dFwiIHRpdGxlPVwiTmV4dFwiICcgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICdjbGFzcz1cImltcHJlc3MtbmF2aWdhdGlvbi11aVwiPiZndDs8L2J1dHRvbj4nO1xuXG4gICAgICAgIHByZXYgPSBtYWtlRG9tRWxlbWVudCggcHJldkh0bWwgKTtcbiAgICAgICAgcHJldi5hZGRFdmVudExpc3RlbmVyKCAnY2xpY2snLFxuICAgICAgICAgICAgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgYXBpLnByZXYoKTtcbiAgICAgICAgfSApO1xuICAgICAgICBzZWxlY3QgPSBtYWtlRG9tRWxlbWVudCggc2VsZWN0SHRtbCApO1xuICAgICAgICBzZWxlY3QuYWRkRXZlbnRMaXN0ZW5lciggJ2NoYW5nZScsXG4gICAgICAgICAgICBmdW5jdGlvbiggZXZlbnQgKSB7XG4gICAgICAgICAgICAgICAgYXBpLmdvdG8oIGV2ZW50LnRhcmdldC52YWx1ZSApO1xuICAgICAgICB9ICk7XG4gICAgICAgIGdjLmFkZEV2ZW50TGlzdGVuZXIoIHJvb3QsICdpbXByZXNzOnN0ZXByZWZyZXNoJywgZnVuY3Rpb24oIGV2ZW50ICkge1xuXG4gICAgICAgICAgICAvLyBBcyBpbXByZXNzLmpzIGNvcmUgbm93IGFsbG93cyB0byBkeW5hbWljYWxseSBlZGl0IHRoZSBzdGVwcywgaW5jbHVkaW5nIGFkZGluZyxcbiAgICAgICAgICAgIC8vIHJlbW92aW5nLCBhbmQgcmVvcmRlcmluZyBzdGVwcywgd2UgbmVlZCB0byByZXF1ZXJ5IGFuZCByZWRyYXcgdGhlIHNlbGVjdCBsaXN0IG9uXG4gICAgICAgICAgICAvLyBldmVyeSBzdGVwZW50ZXIgZXZlbnQuXG4gICAgICAgICAgICBzdGVwcyA9IHJvb3QucXVlcnlTZWxlY3RvckFsbCggJy5zdGVwJyApO1xuICAgICAgICAgICAgc2VsZWN0LmlubmVySFRNTCA9ICdcXG4nICsgc2VsZWN0T3B0aW9uc0h0bWwoKTtcblxuICAgICAgICAgICAgLy8gTWFrZSBzdXJlIHRoZSBsaXN0IGFsd2F5cyBzaG93cyB0aGUgc3RlcCB3ZSdyZSBhY3R1YWxseSBvbiwgZXZlbiBpZiBpdCB3YXNuJ3RcbiAgICAgICAgICAgIC8vIHNlbGVjdGVkIGZyb20gdGhlIGxpc3RcbiAgICAgICAgICAgIHNlbGVjdC52YWx1ZSA9IGV2ZW50LnRhcmdldC5pZDtcbiAgICAgICAgfSApO1xuICAgICAgICBuZXh0ID0gbWFrZURvbUVsZW1lbnQoIG5leHRIdG1sICk7XG4gICAgICAgIG5leHQuYWRkRXZlbnRMaXN0ZW5lciggJ2NsaWNrJyxcbiAgICAgICAgICAgIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIGFwaS5uZXh0KCk7XG4gICAgICAgIH0gKTtcblxuICAgICAgICB0cmlnZ2VyRXZlbnQoIHRvb2xiYXIsICdpbXByZXNzOnRvb2xiYXI6YXBwZW5kQ2hpbGQnLCB7IGdyb3VwOiAwLCBlbGVtZW50OiBwcmV2IH0gKTtcbiAgICAgICAgdHJpZ2dlckV2ZW50KCB0b29sYmFyLCAnaW1wcmVzczp0b29sYmFyOmFwcGVuZENoaWxkJywgeyBncm91cDogMCwgZWxlbWVudDogc2VsZWN0IH0gKTtcbiAgICAgICAgdHJpZ2dlckV2ZW50KCB0b29sYmFyLCAnaW1wcmVzczp0b29sYmFyOmFwcGVuZENoaWxkJywgeyBncm91cDogMCwgZWxlbWVudDogbmV4dCB9ICk7XG5cbiAgICB9O1xuXG4gICAgLy8gQVBJIGZvciBub3QgbGlzdGluZyBnaXZlbiBzdGVwIGluIHRoZSBzZWxlY3Qgd2lkZ2V0LlxuICAgIC8vIEZvciBleGFtcGxlLCBpZiB5b3Ugc2V0IGNsYXNzPVwic2tpcFwiIG9uIHNvbWUgZWxlbWVudCwgeW91IG1heSBub3Qgd2FudCBpdCB0byBzaG93IHVwIGluIHRoZVxuICAgIC8vIGxpc3QgZWl0aGVyLiBPdG9oIHdlIGNhbm5vdCBhc3N1bWUgdGhhdCwgb3IgYW55dGhpbmcgZWxzZSwgc28gc3RlcHMgdGhhdCB1c2VyIHdhbnRzIG9taXR0ZWRcbiAgICAvLyBtdXN0IGJlIHNwZWNpZmljYWxseSBhZGRlZCB3aXRoIHRoaXMgQVBJIGNhbGwuXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggJ2ltcHJlc3M6bmF2aWdhdGlvbi11aTpoaWRlU3RlcCcsIGZ1bmN0aW9uKCBldmVudCApIHtcbiAgICAgICAgaGlkZVN0ZXBzLnB1c2goIGV2ZW50LnRhcmdldCApO1xuICAgICAgICBpZiAoIHNlbGVjdCApIHtcbiAgICAgICAgICAgIHNlbGVjdC5pbm5lckhUTUwgPSBzZWxlY3RPcHRpb25zSHRtbCgpO1xuICAgICAgICB9XG4gICAgfSwgZmFsc2UgKTtcblxuICAgIC8vIFdhaXQgZm9yIGltcHJlc3MuanMgdG8gYmUgaW5pdGlhbGl6ZWRcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCAnaW1wcmVzczppbml0JywgZnVuY3Rpb24oIGV2ZW50ICkge1xuICAgICAgICB0b29sYmFyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvciggJyNpbXByZXNzLXRvb2xiYXInICk7XG4gICAgICAgIGlmICggdG9vbGJhciApIHtcbiAgICAgICAgICAgIGFkZE5hdmlnYXRpb25Db250cm9scyggZXZlbnQgKTtcbiAgICAgICAgfVxuICAgIH0sIGZhbHNlICk7XG5cbn0gKSggZG9jdW1lbnQgKTtcblxuXG4vKiBnbG9iYWwgZG9jdW1lbnQgKi9cbiggZnVuY3Rpb24oIGRvY3VtZW50ICkge1xuICAgIFwidXNlIHN0cmljdFwiO1xuICAgIHZhciByb290O1xuICAgIHZhciBzdGVwaWRzID0gW107XG5cbiAgICAvLyBHZXQgc3RlcGlkcyBmcm9tIHRoZSBzdGVwcyB1bmRlciBpbXByZXNzIHJvb3RcbiAgICB2YXIgZ2V0U3RlcHMgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgc3RlcGlkcyA9IFtdO1xuICAgICAgICB2YXIgc3RlcHMgPSByb290LnF1ZXJ5U2VsZWN0b3JBbGwoIFwiLnN0ZXBcIiApO1xuICAgICAgICBmb3IgKCB2YXIgaSA9IDA7IGkgPCBzdGVwcy5sZW5ndGg7IGkrKyApXG4gICAgICAgIHtcbiAgICAgICAgICBzdGVwaWRzWyBpICsgMSBdID0gc3RlcHNbIGkgXS5pZDtcbiAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgLy8gV2FpdCBmb3IgaW1wcmVzcy5qcyB0byBiZSBpbml0aWFsaXplZFxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoIFwiaW1wcmVzczppbml0XCIsIGZ1bmN0aW9uKCBldmVudCApIHtcbiAgICAgICAgICAgIHJvb3QgPSBldmVudC50YXJnZXQ7XG4gICAgICAgIGdldFN0ZXBzKCk7XG4gICAgICAgIHZhciBnYyA9IGV2ZW50LmRldGFpbC5hcGkubGliLmdjO1xuICAgICAgICBnYy5wdXNoQ2FsbGJhY2soIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgc3RlcGlkcyA9IFtdO1xuICAgICAgICAgICAgaWYgKCBwcm9ncmVzc2JhciApIHtcbiAgICAgICAgICAgICAgICBwcm9ncmVzc2Jhci5zdHlsZS53aWR0aCA9IFwiXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIHByb2dyZXNzICkge1xuICAgICAgICAgICAgICAgIHByb2dyZXNzLmlubmVySFRNTCA9IFwiXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgIH0gKTtcbiAgICB9ICk7XG5cbiAgICB2YXIgcHJvZ3Jlc3NiYXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCBcImRpdi5pbXByZXNzLXByb2dyZXNzYmFyIGRpdlwiICk7XG4gICAgdmFyIHByb2dyZXNzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvciggXCJkaXYuaW1wcmVzcy1wcm9ncmVzc1wiICk7XG5cbiAgICBpZiAoIG51bGwgIT09IHByb2dyZXNzYmFyIHx8IG51bGwgIT09IHByb2dyZXNzICkge1xuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCBcImltcHJlc3M6c3RlcGxlYXZlXCIsIGZ1bmN0aW9uKCBldmVudCApIHtcbiAgICAgICAgICAgIHVwZGF0ZVByb2dyZXNzYmFyKCBldmVudC5kZXRhaWwubmV4dC5pZCApO1xuICAgICAgICB9ICk7XG5cbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggXCJpbXByZXNzOnN0ZXByZWZyZXNoXCIsIGZ1bmN0aW9uKCBldmVudCApIHtcbiAgICAgICAgICAgIGdldFN0ZXBzKCk7XG4gICAgICAgICAgICB1cGRhdGVQcm9ncmVzc2JhciggZXZlbnQudGFyZ2V0LmlkICk7XG4gICAgICAgIH0gKTtcblxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHVwZGF0ZVByb2dyZXNzYmFyKCBzbGlkZUlkICkge1xuICAgICAgICB2YXIgc2xpZGVOdW1iZXIgPSBzdGVwaWRzLmluZGV4T2YoIHNsaWRlSWQgKTtcbiAgICAgICAgaWYgKCBudWxsICE9PSBwcm9ncmVzc2JhciApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciB3aWR0aCA9IDEwMCAvICggc3RlcGlkcy5sZW5ndGggLSAxICkgKiAoIHNsaWRlTnVtYmVyICk7XG4gICAgICAgICAgICBwcm9ncmVzc2Jhci5zdHlsZS53aWR0aCA9IHdpZHRoLnRvRml4ZWQoIDIgKSArIFwiJVwiO1xuICAgICAgICB9XG4gICAgICAgIGlmICggbnVsbCAhPT0gcHJvZ3Jlc3MgKSB7XG4gICAgICAgICAgICBwcm9ncmVzcy5pbm5lckhUTUwgPSBzbGlkZU51bWJlciArIFwiL1wiICsgKCBzdGVwaWRzLmxlbmd0aCAtIDEgKTtcbiAgICAgICAgfVxuICAgIH1cbn0gKSggZG9jdW1lbnQgKTtcblxuLyoqXG4gKiBSZWxhdGl2ZSBQb3NpdGlvbmluZyBQbHVnaW5cbiAqXG4gKiBUaGlzIHBsdWdpbiBwcm92aWRlcyBzdXBwb3J0IGZvciBkZWZpbmluZyB0aGUgY29vcmRpbmF0ZXMgb2YgYSBzdGVwIHJlbGF0aXZlXG4gKiB0byB0aGUgcHJldmlvdXMgc3RlcC4gVGhpcyBpcyBvZnRlbiBtb3JlIGNvbnZlbmllbnQgd2hlbiBjcmVhdGluZyBwcmVzZW50YXRpb25zLFxuICogc2luY2UgYXMgeW91IGFkZCwgcmVtb3ZlIG9yIG1vdmUgc3RlcHMsIHlvdSBtYXkgbm90IG5lZWQgdG8gZWRpdCB0aGUgcG9zaXRpb25zXG4gKiBhcyBtdWNoIGFzIGlzIHRoZSBjYXNlIHdpdGggdGhlIGFic29sdXRlIGNvb3JkaW5hdGVzIHN1cHBvcnRlZCBieSBpbXByZXNzLmpzXG4gKiBjb3JlLlxuICpcbiAqIEV4YW1wbGU6XG4gKlxuICogICAgICAgICA8IS0tIFBvc2l0aW9uIHN0ZXAgMTAwMCBweCB0byB0aGUgcmlnaHQgYW5kIDUwMCBweCB1cCBmcm9tIHRoZSBwcmV2aW91cyBzdGVwLiAtLT5cbiAqICAgICAgICAgPGRpdiBjbGFzcz1cInN0ZXBcIiBkYXRhLXJlbC14PVwiMTAwMFwiIGRhdGEtcmVsLXk9XCI1MDBcIj5cbiAqXG4gKiBGb2xsb3dpbmcgaHRtbCBhdHRyaWJ1dGVzIGFyZSBzdXBwb3J0ZWQgZm9yIHN0ZXAgZWxlbWVudHM6XG4gKlxuICogICAgIGRhdGEtcmVsLXhcbiAqICAgICBkYXRhLXJlbC15XG4gKiAgICAgZGF0YS1yZWwtelxuICpcbiAqIFRoZXNlIHZhbHVlcyBhcmUgYWxzbyBpbmhlcml0ZWQgZnJvbSB0aGUgcHJldmlvdXMgc3RlcC4gVGhpcyBtYWtlcyBpdCBlYXN5IHRvXG4gKiBjcmVhdGUgYSBib3JpbmcgcHJlc2VudGF0aW9uIHdoZXJlIGVhY2ggc2xpZGUgc2hpZnRzIGZvciBleGFtcGxlIDEwMDBweCBkb3duXG4gKiBmcm9tIHRoZSBwcmV2aW91cy5cbiAqXG4gKiBJbiBhZGRpdGlvbiB0byBwbGFpbiBudW1iZXJzLCB3aGljaCBhcmUgcGl4ZWwgdmFsdWVzLCBpdCBpcyBhbHNvIHBvc3NpYmxlIHRvXG4gKiBkZWZpbmUgcmVsYXRpdmUgcG9zaXRpb25zIGFzIGEgbXVsdGlwbGUgb2Ygc2NyZWVuIGhlaWdodCBhbmQgd2lkdGgsIHVzaW5nXG4gKiBhIHVuaXQgb2YgXCJoXCIgYW5kIFwid1wiLCByZXNwZWN0aXZlbHksIGFwcGVuZGVkIHRvIHRoZSBudW1iZXIuXG4gKlxuICogRXhhbXBsZTpcbiAqXG4gKiAgICAgICAgPGRpdiBjbGFzcz1cInN0ZXBcIiBkYXRhLXJlbC14PVwiMS41d1wiIGRhdGEtcmVsLXk9XCIxLjVoXCI+XG4gKlxuICogVGhpcyBwbHVnaW4gaXMgYSAqcHJlLWluaXQgcGx1Z2luKi4gSXQgaXMgY2FsbGVkIHN5bmNocm9ub3VzbHkgZnJvbSBpbXByZXNzLmpzXG4gKiBjb3JlIGF0IHRoZSBiZWdpbm5pbmcgb2YgYGltcHJlc3MoKS5pbml0KClgLiBUaGlzIGFsbG93cyBpdCB0byBwcm9jZXNzIGl0cyBvd25cbiAqIGRhdGEgYXR0cmlidXRlcyBmaXJzdCwgYW5kIHBvc3NpYmx5IGFsdGVyIHRoZSBkYXRhLXgsIGRhdGEteSBhbmQgZGF0YS16IGF0dHJpYnV0ZXNcbiAqIHRoYXQgd2lsbCB0aGVuIGJlIHByb2Nlc3NlZCBieSBgaW1wcmVzcygpLmluaXQoKWAuXG4gKlxuICogKEFub3RoZXIgbmFtZSBmb3IgdGhpcyBraW5kIG9mIHBsdWdpbiBtaWdodCBiZSBjYWxsZWQgYSAqZmlsdGVyIHBsdWdpbiosIGJ1dFxuICogKnByZS1pbml0IHBsdWdpbiogaXMgbW9yZSBnZW5lcmljLCBhcyBhIHBsdWdpbiBtaWdodCBkbyB3aGF0ZXZlciBpdCB3YW50cyBpblxuICogdGhlIHByZS1pbml0IHN0YWdlLilcbiAqXG4gKiBDb3B5cmlnaHQgMjAxNiBIZW5yaWsgSW5nbyAoQGhlbnJpa2luZ28pXG4gKiBSZWxlYXNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2UuXG4gKi9cblxuLyogZ2xvYmFsIGRvY3VtZW50LCB3aW5kb3cgKi9cblxuKCBmdW5jdGlvbiggZG9jdW1lbnQsIHdpbmRvdyApIHtcbiAgICBcInVzZSBzdHJpY3RcIjtcblxuICAgIHZhciBzdGFydGluZ1N0YXRlID0ge307XG5cbiAgICAvKipcbiAgICAgKiBDb3BpZWQgZnJvbSBjb3JlIGltcHJlc3MuanMuIFdlIGN1cnJlbnRseSBsYWNrIGEgbGlicmFyeSBtZWNoYW5pc20gdG9cbiAgICAgKiB0byBzaGFyZSB1dGlsaXR5IGZ1bmN0aW9ucyBsaWtlIHRoaXMuXG4gICAgICovXG4gICAgdmFyIHRvTnVtYmVyID0gZnVuY3Rpb24oIG51bWVyaWMsIGZhbGxiYWNrICkge1xuICAgICAgICByZXR1cm4gaXNOYU4oIG51bWVyaWMgKSA/ICggZmFsbGJhY2sgfHwgMCApIDogTnVtYmVyKCBudW1lcmljICk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIEV4dGVuZHMgdG9OdW1iZXIoKSB0byBjb3JyZWN0bHkgY29tcHV0ZSBhbHNvIHJlbGF0aXZlLXRvLXNjcmVlbi1zaXplIHZhbHVlcyA1dyBhbmQgNWguXG4gICAgICpcbiAgICAgKiBSZXR1cm5zIHRoZSBjb21wdXRlZCB2YWx1ZSBpbiBwaXhlbHMgd2l0aCB3L2ggcG9zdGZpeCByZW1vdmVkLlxuICAgICAqL1xuICAgIHZhciB0b051bWJlckFkdmFuY2VkID0gZnVuY3Rpb24oIG51bWVyaWMsIGZhbGxiYWNrICkge1xuICAgICAgICBpZiAoIHR5cGVvZiBudW1lcmljICE9PSBcInN0cmluZ1wiICkge1xuICAgICAgICAgICAgcmV0dXJuIHRvTnVtYmVyKCBudW1lcmljLCBmYWxsYmFjayApO1xuICAgICAgICB9XG4gICAgICAgIHZhciByYXRpbyA9IG51bWVyaWMubWF0Y2goIC9eKFsrLV0qW1xcZFxcLl0rKShbd2hdKSQvICk7XG4gICAgICAgIGlmICggcmF0aW8gPT0gbnVsbCApIHtcbiAgICAgICAgICAgIHJldHVybiB0b051bWJlciggbnVtZXJpYywgZmFsbGJhY2sgKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHZhciB2YWx1ZSA9IHBhcnNlRmxvYXQoIHJhdGlvWyAxIF0gKTtcbiAgICAgICAgICAgIHZhciBtdWx0aXBsaWVyID0gcmF0aW9bIDIgXSA9PT0gXCJ3XCIgPyB3aW5kb3cuaW5uZXJXaWR0aCA6IHdpbmRvdy5pbm5lckhlaWdodDtcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZSAqIG11bHRpcGxpZXI7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgdmFyIGNvbXB1dGVSZWxhdGl2ZVBvc2l0aW9ucyA9IGZ1bmN0aW9uKCBlbCwgcHJldiApIHtcbiAgICAgICAgdmFyIGRhdGEgPSBlbC5kYXRhc2V0O1xuXG4gICAgICAgIGlmICggIXByZXYgKSB7XG5cbiAgICAgICAgICAgIC8vIEZvciB0aGUgZmlyc3Qgc3RlcCwgaW5oZXJpdCB0aGVzZSBkZWZhdWx0c1xuICAgICAgICAgICAgcHJldiA9IHsgeDowLCB5OjAsIHo6MCwgcmVsYXRpdmU6IHsgeDowLCB5OjAsIHo6MCB9IH07XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIGRhdGEucmVsVG8gKSB7XG5cbiAgICAgICAgICAgIHZhciByZWYgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCggZGF0YS5yZWxUbyApO1xuICAgICAgICAgICAgaWYgKCByZWYgKSB7XG5cbiAgICAgICAgICAgICAgICAvLyBUZXN0LCBpZiBpdCBpcyBhIHByZXZpb3VzIHN0ZXAgdGhhdCBhbHJlYWR5IGhhcyBzb21lIGFzc2lnbmVkIHBvc2l0aW9uIGRhdGFcbiAgICAgICAgICAgICAgICBpZiAoIGVsLmNvbXBhcmVEb2N1bWVudFBvc2l0aW9uKCByZWYgKSAmIE5vZGUuRE9DVU1FTlRfUE9TSVRJT05fUFJFQ0VESU5HICkge1xuICAgICAgICAgICAgICAgICAgICBwcmV2LnggPSB0b051bWJlciggcmVmLmdldEF0dHJpYnV0ZSggXCJkYXRhLXhcIiApICk7XG4gICAgICAgICAgICAgICAgICAgIHByZXYueSA9IHRvTnVtYmVyKCByZWYuZ2V0QXR0cmlidXRlKCBcImRhdGEteVwiICkgKTtcbiAgICAgICAgICAgICAgICAgICAgcHJldi56ID0gdG9OdW1iZXIoIHJlZi5nZXRBdHRyaWJ1dGUoIFwiZGF0YS16XCIgKSApO1xuICAgICAgICAgICAgICAgICAgICBwcmV2LnJlbGF0aXZlID0ge307XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgd2luZG93LmNvbnNvbGUuZXJyb3IoXG4gICAgICAgICAgICAgICAgICAgICAgICBcImltcHJlc3MuanMgcmVsIHBsdWdpbjogU3RlcCBcXFwiXCIgKyBkYXRhLnJlbFRvICsgXCJcXFwiIGlzIG5vdCBkZWZpbmVkIFwiICtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiKmJlZm9yZSogdGhlIGN1cnJlbnQgc3RlcC4gUmVmZXJlbmNpbmcgaXMgbGltaXRlZCB0byBwcmV2aW91c2x5IGRlZmluZWQgXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJzdGVwcy4gUGxlYXNlIGNoZWNrIHlvdXIgbWFya3VwLiBJZ25vcmluZyBkYXRhLXJlbC10byBhdHRyaWJ1dGUgb2YgXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJ0aGlzIHN0ZXAuIEhhdmUgYSBsb29rIGF0IHRoZSBkb2N1bWVudGF0aW9uIGZvciBob3cgdG8gY3JlYXRlIHJlbGF0aXZlIFwiICtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwicG9zaXRpb25pbmcgdG8gbGF0ZXIgc2hvd24gc3RlcHMgd2l0aCB0aGUgaGVscCBvZiB0aGUgZ290byBwbHVnaW4uXCJcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICAgICAgLy8gU3RlcCBub3QgZm91bmRcbiAgICAgICAgICAgICAgICB3aW5kb3cuY29uc29sZS53YXJuKFxuICAgICAgICAgICAgICAgICAgICBcImltcHJlc3MuanMgcmVsIHBsdWdpbjogXFxcIlwiICsgZGF0YS5yZWxUbyArIFwiXFxcIiBpcyBub3QgYSB2YWxpZCBzdGVwIGluIHRoaXMgXCIgK1xuICAgICAgICAgICAgICAgICAgICBcImltcHJlc3MuanMgcHJlc2VudGF0aW9uLiBQbGVhc2UgY2hlY2sgeW91ciBtYXJrdXAuIElnbm9yaW5nIGRhdGEtcmVsLXRvIFwiICtcbiAgICAgICAgICAgICAgICAgICAgXCJhdHRyaWJ1dGUgb2YgdGhpcyBzdGVwLlwiXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBzdGVwID0ge1xuICAgICAgICAgICAgICAgIHg6IHRvTnVtYmVyKCBkYXRhLngsIHByZXYueCApLFxuICAgICAgICAgICAgICAgIHk6IHRvTnVtYmVyKCBkYXRhLnksIHByZXYueSApLFxuICAgICAgICAgICAgICAgIHo6IHRvTnVtYmVyKCBkYXRhLnosIHByZXYueiApLFxuICAgICAgICAgICAgICAgIHJlbGF0aXZlOiB7XG4gICAgICAgICAgICAgICAgICAgIHg6IHRvTnVtYmVyQWR2YW5jZWQoIGRhdGEucmVsWCwgcHJldi5yZWxhdGl2ZS54ICksXG4gICAgICAgICAgICAgICAgICAgIHk6IHRvTnVtYmVyQWR2YW5jZWQoIGRhdGEucmVsWSwgcHJldi5yZWxhdGl2ZS55ICksXG4gICAgICAgICAgICAgICAgICAgIHo6IHRvTnVtYmVyQWR2YW5jZWQoIGRhdGEucmVsWiwgcHJldi5yZWxhdGl2ZS56IClcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgIC8vIFJlbGF0aXZlIHBvc2l0aW9uIGlzIGlnbm9yZWQvemVybyBpZiBhYnNvbHV0ZSBpcyBnaXZlbi5cbiAgICAgICAgLy8gTm90ZSB0aGF0IHRoaXMgYWxzbyBoYXMgdGhlIGVmZmVjdCBvZiByZXNldHRpbmcgYW55IGluaGVyaXRlZCByZWxhdGl2ZSB2YWx1ZXMuXG4gICAgICAgIGlmICggZGF0YS54ICE9PSB1bmRlZmluZWQgKSB7XG4gICAgICAgICAgICBzdGVwLnJlbGF0aXZlLnggPSAwO1xuICAgICAgICB9XG4gICAgICAgIGlmICggZGF0YS55ICE9PSB1bmRlZmluZWQgKSB7XG4gICAgICAgICAgICBzdGVwLnJlbGF0aXZlLnkgPSAwO1xuICAgICAgICB9XG4gICAgICAgIGlmICggZGF0YS56ICE9PSB1bmRlZmluZWQgKSB7XG4gICAgICAgICAgICBzdGVwLnJlbGF0aXZlLnogPSAwO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQXBwbHkgcmVsYXRpdmUgcG9zaXRpb24gdG8gYWJzb2x1dGUgcG9zaXRpb24sIGlmIG5vbi16ZXJvXG4gICAgICAgIC8vIE5vdGUgdGhhdCBhdCB0aGlzIHBvaW50LCB0aGUgcmVsYXRpdmUgdmFsdWVzIGNvbnRhaW4gYSBudW1iZXIgdmFsdWUgb2YgcGl4ZWxzLlxuICAgICAgICBzdGVwLnggPSBzdGVwLnggKyBzdGVwLnJlbGF0aXZlLng7XG4gICAgICAgIHN0ZXAueSA9IHN0ZXAueSArIHN0ZXAucmVsYXRpdmUueTtcbiAgICAgICAgc3RlcC56ID0gc3RlcC56ICsgc3RlcC5yZWxhdGl2ZS56O1xuXG4gICAgICAgIHJldHVybiBzdGVwO1xuICAgIH07XG5cbiAgICB2YXIgcmVsID0gZnVuY3Rpb24oIHJvb3QgKSB7XG4gICAgICAgIHZhciBzdGVwcyA9IHJvb3QucXVlcnlTZWxlY3RvckFsbCggXCIuc3RlcFwiICk7XG4gICAgICAgIHZhciBwcmV2O1xuICAgICAgICBzdGFydGluZ1N0YXRlWyByb290LmlkIF0gPSBbXTtcbiAgICAgICAgZm9yICggdmFyIGkgPSAwOyBpIDwgc3RlcHMubGVuZ3RoOyBpKysgKSB7XG4gICAgICAgICAgICB2YXIgZWwgPSBzdGVwc1sgaSBdO1xuICAgICAgICAgICAgc3RhcnRpbmdTdGF0ZVsgcm9vdC5pZCBdLnB1c2goIHtcbiAgICAgICAgICAgICAgICBlbDogZWwsXG4gICAgICAgICAgICAgICAgeDogZWwuZ2V0QXR0cmlidXRlKCBcImRhdGEteFwiICksXG4gICAgICAgICAgICAgICAgeTogZWwuZ2V0QXR0cmlidXRlKCBcImRhdGEteVwiICksXG4gICAgICAgICAgICAgICAgejogZWwuZ2V0QXR0cmlidXRlKCBcImRhdGEtelwiICksXG4gICAgICAgICAgICAgICAgcmVsWDogZWwuZ2V0QXR0cmlidXRlKCBcImRhdGEtcmVsLXhcIiApLFxuICAgICAgICAgICAgICAgIHJlbFk6IGVsLmdldEF0dHJpYnV0ZSggXCJkYXRhLXJlbC15XCIgKSxcbiAgICAgICAgICAgICAgICByZWxaOiBlbC5nZXRBdHRyaWJ1dGUoIFwiZGF0YS1yZWwtelwiIClcbiAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICAgIHZhciBzdGVwID0gY29tcHV0ZVJlbGF0aXZlUG9zaXRpb25zKCBlbCwgcHJldiApO1xuXG4gICAgICAgICAgICAvLyBBcHBseSByZWxhdGl2ZSBwb3NpdGlvbiAoaWYgbm9uLXplcm8pXG4gICAgICAgICAgICBlbC5zZXRBdHRyaWJ1dGUoIFwiZGF0YS14XCIsIHN0ZXAueCApO1xuICAgICAgICAgICAgZWwuc2V0QXR0cmlidXRlKCBcImRhdGEteVwiLCBzdGVwLnkgKTtcbiAgICAgICAgICAgIGVsLnNldEF0dHJpYnV0ZSggXCJkYXRhLXpcIiwgc3RlcC56ICk7XG4gICAgICAgICAgICBwcmV2ID0gc3RlcDtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvLyBSZWdpc3RlciB0aGUgcGx1Z2luIHRvIGJlIGNhbGxlZCBpbiBwcmUtaW5pdCBwaGFzZVxuICAgIHdpbmRvdy5pbXByZXNzLmFkZFByZUluaXRQbHVnaW4oIHJlbCApO1xuXG4gICAgLy8gUmVnaXN0ZXIgdGVhcmRvd24gY2FsbGJhY2sgdG8gcmVzZXQgdGhlIGRhdGEueCwgLnksIC56IHZhbHVlcy5cbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCBcImltcHJlc3M6aW5pdFwiLCBmdW5jdGlvbiggZXZlbnQgKSB7XG4gICAgICAgIHZhciByb290ID0gZXZlbnQudGFyZ2V0O1xuICAgICAgICBldmVudC5kZXRhaWwuYXBpLmxpYi5nYy5wdXNoQ2FsbGJhY2soIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIHN0ZXBzID0gc3RhcnRpbmdTdGF0ZVsgcm9vdC5pZCBdO1xuICAgICAgICAgICAgdmFyIHN0ZXA7XG4gICAgICAgICAgICB3aGlsZSAoIHN0ZXAgPSBzdGVwcy5wb3AoKSApIHtcblxuICAgICAgICAgICAgICAgIC8vIFJlc2V0IHgveS96IGluIGNhc2VzIHdoZXJlIHRoaXMgcGx1Z2luIGhhcyBjaGFuZ2VkIGl0LlxuICAgICAgICAgICAgICAgIGlmICggc3RlcC5yZWxYICE9PSBudWxsICkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIHN0ZXAueCA9PT0gbnVsbCApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0ZXAuZWwucmVtb3ZlQXR0cmlidXRlKCBcImRhdGEteFwiICk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdGVwLmVsLnNldEF0dHJpYnV0ZSggXCJkYXRhLXhcIiwgc3RlcC54ICk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKCBzdGVwLnJlbFkgIT09IG51bGwgKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICggc3RlcC55ID09PSBudWxsICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3RlcC5lbC5yZW1vdmVBdHRyaWJ1dGUoIFwiZGF0YS15XCIgKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0ZXAuZWwuc2V0QXR0cmlidXRlKCBcImRhdGEteVwiLCBzdGVwLnkgKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoIHN0ZXAucmVsWiAhPT0gbnVsbCApIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCBzdGVwLnogPT09IG51bGwgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdGVwLmVsLnJlbW92ZUF0dHJpYnV0ZSggXCJkYXRhLXpcIiApO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3RlcC5lbC5zZXRBdHRyaWJ1dGUoIFwiZGF0YS16XCIsIHN0ZXAueiApO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZGVsZXRlIHN0YXJ0aW5nU3RhdGVbIHJvb3QuaWQgXTtcbiAgICAgICAgfSApO1xuICAgIH0sIGZhbHNlICk7XG59ICkoIGRvY3VtZW50LCB3aW5kb3cgKTtcblxuXG4vKipcbiAqIFJlc2l6ZSBwbHVnaW5cbiAqXG4gKiBSZXNjYWxlIHRoZSBwcmVzZW50YXRpb24gYWZ0ZXIgYSB3aW5kb3cgcmVzaXplLlxuICpcbiAqIENvcHlyaWdodCAyMDExLTIwMTIgQmFydGVrIFN6b3BrYSAoQGJhcnRheilcbiAqIFJlbGVhc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZS5cbiAqIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICogIGF1dGhvcjogIEJhcnRlayBTem9wa2FcbiAqICB2ZXJzaW9uOiAwLjUuM1xuICogIHVybDogICAgIGh0dHA6Ly9iYXJ0YXouZ2l0aHViLmNvbS9pbXByZXNzLmpzL1xuICogIHNvdXJjZTogIGh0dHA6Ly9naXRodWIuY29tL2JhcnRhei9pbXByZXNzLmpzL1xuICpcbiAqL1xuXG4vKiBnbG9iYWwgZG9jdW1lbnQsIHdpbmRvdyAqL1xuXG4oIGZ1bmN0aW9uKCBkb2N1bWVudCwgd2luZG93ICkge1xuICAgIFwidXNlIHN0cmljdFwiO1xuXG4gICAgLy8gV2FpdCBmb3IgaW1wcmVzcy5qcyB0byBiZSBpbml0aWFsaXplZFxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoIFwiaW1wcmVzczppbml0XCIsIGZ1bmN0aW9uKCBldmVudCApIHtcbiAgICAgICAgdmFyIGFwaSA9IGV2ZW50LmRldGFpbC5hcGk7XG5cbiAgICAgICAgLy8gUmVzY2FsZSBwcmVzZW50YXRpb24gd2hlbiB3aW5kb3cgaXMgcmVzaXplZFxuICAgICAgICBhcGkubGliLmdjLmFkZEV2ZW50TGlzdGVuZXIoIHdpbmRvdywgXCJyZXNpemVcIiwgYXBpLmxpYi51dGlsLnRocm90dGxlKCBmdW5jdGlvbigpIHtcblxuICAgICAgICAgICAgLy8gRm9yY2UgZ29pbmcgdG8gYWN0aXZlIHN0ZXAgYWdhaW4sIHRvIHRyaWdnZXIgcmVzY2FsaW5nXG4gICAgICAgICAgICBhcGkuZ290byggZG9jdW1lbnQucXVlcnlTZWxlY3RvciggXCIuc3RlcC5hY3RpdmVcIiApLCA1MDAgKTtcbiAgICAgICAgfSwgMjUwICksIGZhbHNlICk7XG4gICAgfSwgZmFsc2UgKTtcblxufSApKCBkb2N1bWVudCwgd2luZG93ICk7XG5cblxuLyoqXG4gKiBTa2lwIFBsdWdpblxuICpcbiAqIEV4YW1wbGU6XG4gKlxuICogICAgPCEtLSBUaGlzIHNsaWRlIGlzIGRpc2FibGVkIGluIHByZXNlbnRhdGlvbnMsIHdoZW4gbW92aW5nIHdpdGggbmV4dCgpXG4gKiAgICAgICAgIGFuZCBwcmV2KCkgY29tbWFuZHMsIGJ1dCB5b3UgY2FuIHN0aWxsIG1vdmUgZGlyZWN0bHkgdG8gaXQsIGZvclxuICogICAgICAgICBleGFtcGxlIHdpdGggYSB1cmwgKGFueXRoaW5nIHVzaW5nIGdvdG8oKSkuIC0tPlxuICogICAgICAgICA8ZGl2IGNsYXNzPVwic3RlcCBza2lwXCI+XG4gKlxuICogQ29weXJpZ2h0IDIwMTYgSGVucmlrIEluZ28gKEBoZW5yaWtpbmdvKVxuICogUmVsZWFzZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlLlxuICovXG5cbi8qIGdsb2JhbCBkb2N1bWVudCwgd2luZG93ICovXG5cbiggZnVuY3Rpb24oIGRvY3VtZW50LCB3aW5kb3cgKSB7XG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG4gICAgdmFyIHV0aWw7XG5cbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCBcImltcHJlc3M6aW5pdFwiLCBmdW5jdGlvbiggZXZlbnQgKSB7XG4gICAgICAgIHV0aWwgPSBldmVudC5kZXRhaWwuYXBpLmxpYi51dGlsO1xuICAgIH0sIGZhbHNlICk7XG5cbiAgICB2YXIgZ2V0TmV4dFN0ZXAgPSBmdW5jdGlvbiggZWwgKSB7XG4gICAgICAgIHZhciBzdGVwcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoIFwiLnN0ZXBcIiApO1xuICAgICAgICBmb3IgKCB2YXIgaSA9IDA7IGkgPCBzdGVwcy5sZW5ndGg7IGkrKyApIHtcbiAgICAgICAgICAgIGlmICggc3RlcHNbIGkgXSA9PT0gZWwgKSB7XG4gICAgICAgICAgICAgICAgaWYgKCBpICsgMSA8IHN0ZXBzLmxlbmd0aCApIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHN0ZXBzWyBpICsgMSBdO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBzdGVwc1sgMCBdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG4gICAgdmFyIGdldFByZXZTdGVwID0gZnVuY3Rpb24oIGVsICkge1xuICAgICAgICB2YXIgc3RlcHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCBcIi5zdGVwXCIgKTtcbiAgICAgICAgZm9yICggdmFyIGkgPSBzdGVwcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSApIHtcbiAgICAgICAgICAgIGlmICggc3RlcHNbIGkgXSA9PT0gZWwgKSB7XG4gICAgICAgICAgICAgICAgaWYgKCBpIC0gMSA+PSAwICkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc3RlcHNbIGkgLSAxIF07XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHN0ZXBzWyBzdGVwcy5sZW5ndGggLSAxIF07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcblxuICAgIHZhciBza2lwID0gZnVuY3Rpb24oIGV2ZW50ICkge1xuICAgICAgICBpZiAoICggIWV2ZW50ICkgfHwgKCAhZXZlbnQudGFyZ2V0ICkgKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIGV2ZW50LmRldGFpbC5uZXh0LmNsYXNzTGlzdC5jb250YWlucyggXCJza2lwXCIgKSApIHtcbiAgICAgICAgICAgIGlmICggZXZlbnQuZGV0YWlsLnJlYXNvbiA9PT0gXCJuZXh0XCIgKSB7XG5cbiAgICAgICAgICAgICAgICAvLyBHbyB0byB0aGUgbmV4dCBuZXh0IHN0ZXAgaW5zdGVhZFxuICAgICAgICAgICAgICAgIGV2ZW50LmRldGFpbC5uZXh0ID0gZ2V0TmV4dFN0ZXAoIGV2ZW50LmRldGFpbC5uZXh0ICk7XG5cbiAgICAgICAgICAgICAgICAvLyBSZWN1cnNpdmVseSBjYWxsIHRoaXMgcGx1Z2luIGFnYWluLCB1bnRpbCB0aGVyZSdzIGEgc3RlcCBub3QgdG8gc2tpcFxuICAgICAgICAgICAgICAgIHNraXAoIGV2ZW50ICk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKCBldmVudC5kZXRhaWwucmVhc29uID09PSBcInByZXZcIiApIHtcblxuICAgICAgICAgICAgICAgIC8vIEdvIHRvIHRoZSBwcmV2aW91cyBwcmV2aW91cyBzdGVwIGluc3RlYWRcbiAgICAgICAgICAgICAgICBldmVudC5kZXRhaWwubmV4dCA9IGdldFByZXZTdGVwKCBldmVudC5kZXRhaWwubmV4dCApO1xuICAgICAgICAgICAgICAgIHNraXAoIGV2ZW50ICk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIElmIHRoZSBuZXcgbmV4dCBlbGVtZW50IGhhcyBpdHMgb3duIHRyYW5zaXRpb25EdXJhdGlvbiwgd2UncmUgcmVzcG9uc2libGUgZm9yIHNldHRpbmdcbiAgICAgICAgICAgIC8vIHRoYXQgb24gdGhlIGV2ZW50IGFzIHdlbGxcbiAgICAgICAgICAgIGV2ZW50LmRldGFpbC50cmFuc2l0aW9uRHVyYXRpb24gPSB1dGlsLnRvTnVtYmVyKFxuICAgICAgICAgICAgICAgIGV2ZW50LmRldGFpbC5uZXh0LmRhdGFzZXQudHJhbnNpdGlvbkR1cmF0aW9uLCBldmVudC5kZXRhaWwudHJhbnNpdGlvbkR1cmF0aW9uXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8vIFJlZ2lzdGVyIHRoZSBwbHVnaW4gdG8gYmUgY2FsbGVkIGluIHByZS1zdGVwbGVhdmUgcGhhc2VcbiAgICAvLyBUaGUgd2VpZ2h0IG1ha2VzIHRoaXMgcGx1Z2luIHJ1biBlYXJseS4gVGhpcyBpcyBhIGdvb2QgdGhpbmcsIGJlY2F1c2UgdGhpcyBwbHVnaW4gY2FsbHNcbiAgICAvLyBpdHNlbGYgcmVjdXJzaXZlbHkuXG4gICAgd2luZG93LmltcHJlc3MuYWRkUHJlU3RlcExlYXZlUGx1Z2luKCBza2lwLCAxICk7XG5cbn0gKSggZG9jdW1lbnQsIHdpbmRvdyApO1xuXG5cbi8qKlxuICogU3RvcCBQbHVnaW5cbiAqXG4gKiBFeGFtcGxlOlxuICpcbiAqICAgICAgICA8IS0tIFN0b3AgYXQgdGhpcyBzbGlkZS5cbiAqICAgICAgICAgICAgIChGb3IgZXhhbXBsZSwgd2hlbiB1c2VkIG9uIHRoZSBsYXN0IHNsaWRlLCB0aGlzIHByZXZlbnRzIHRoZVxuICogICAgICAgICAgICAgcHJlc2VudGF0aW9uIGZyb20gd3JhcHBpbmcgYmFjayB0byB0aGUgYmVnaW5uaW5nLikgLS0+XG4gKiAgICAgICAgPGRpdiBjbGFzcz1cInN0ZXAgc3RvcFwiPlxuICpcbiAqIENvcHlyaWdodCAyMDE2IEhlbnJpayBJbmdvIChAaGVucmlraW5nbylcbiAqIFJlbGVhc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZS5cbiAqL1xuLyogZ2xvYmFsIGRvY3VtZW50LCB3aW5kb3cgKi9cbiggZnVuY3Rpb24oIGRvY3VtZW50LCB3aW5kb3cgKSB7XG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgICB2YXIgc3RvcCA9IGZ1bmN0aW9uKCBldmVudCApIHtcbiAgICAgICAgaWYgKCAoICFldmVudCApIHx8ICggIWV2ZW50LnRhcmdldCApICkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCBldmVudC50YXJnZXQuY2xhc3NMaXN0LmNvbnRhaW5zKCBcInN0b3BcIiApICkge1xuICAgICAgICAgICAgaWYgKCBldmVudC5kZXRhaWwucmVhc29uID09PSBcIm5leHRcIiApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLy8gUmVnaXN0ZXIgdGhlIHBsdWdpbiB0byBiZSBjYWxsZWQgaW4gcHJlLXN0ZXBsZWF2ZSBwaGFzZVxuICAgIC8vIFRoZSB3ZWlnaHQgbWFrZXMgdGhpcyBwbHVnaW4gcnVuIGZhaXJseSBlYXJseS5cbiAgICB3aW5kb3cuaW1wcmVzcy5hZGRQcmVTdGVwTGVhdmVQbHVnaW4oIHN0b3AsIDIgKTtcblxufSApKCBkb2N1bWVudCwgd2luZG93ICk7XG5cblxuLyoqXG4gKiBTdWJzdGVwIFBsdWdpblxuICpcbiAqIENvcHlyaWdodCAyMDE3IEhlbnJpayBJbmdvIChAaGVucmlraW5nbylcbiAqIFJlbGVhc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZS5cbiAqL1xuXG4vKiBnbG9iYWwgZG9jdW1lbnQsIHdpbmRvdyAqL1xuXG4oIGZ1bmN0aW9uKCBkb2N1bWVudCwgd2luZG93ICkge1xuICAgIFwidXNlIHN0cmljdFwiO1xuXG4gICAgLy8gQ29waWVkIGZyb20gY29yZSBpbXByZXNzLmpzLiBHb29kIGNhbmRpZGF0ZSBmb3IgbW92aW5nIHRvIHNyYy9saWIvdXRpbC5qcy5cbiAgICB2YXIgdHJpZ2dlckV2ZW50ID0gZnVuY3Rpb24oIGVsLCBldmVudE5hbWUsIGRldGFpbCApIHtcbiAgICAgICAgdmFyIGV2ZW50ID0gZG9jdW1lbnQuY3JlYXRlRXZlbnQoIFwiQ3VzdG9tRXZlbnRcIiApO1xuICAgICAgICBldmVudC5pbml0Q3VzdG9tRXZlbnQoIGV2ZW50TmFtZSwgdHJ1ZSwgdHJ1ZSwgZGV0YWlsICk7XG4gICAgICAgIGVsLmRpc3BhdGNoRXZlbnQoIGV2ZW50ICk7XG4gICAgfTtcblxuICAgIHZhciBhY3RpdmVTdGVwID0gbnVsbDtcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCBcImltcHJlc3M6c3RlcGVudGVyXCIsIGZ1bmN0aW9uKCBldmVudCApIHtcbiAgICAgICAgYWN0aXZlU3RlcCA9IGV2ZW50LnRhcmdldDtcbiAgICB9LCBmYWxzZSApO1xuXG4gICAgdmFyIHN1YnN0ZXAgPSBmdW5jdGlvbiggZXZlbnQgKSB7XG4gICAgICAgIGlmICggKCAhZXZlbnQgKSB8fCAoICFldmVudC50YXJnZXQgKSApIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBzdGVwID0gZXZlbnQudGFyZ2V0O1xuICAgICAgICB2YXIgZWw7IC8vIE5lZWRlZCBieSBqc2hpbnRcbiAgICAgICAgaWYgKCBldmVudC5kZXRhaWwucmVhc29uID09PSBcIm5leHRcIiApIHtcbiAgICAgICAgICAgIGVsID0gc2hvd1N1YnN0ZXBJZkFueSggc3RlcCApO1xuICAgICAgICAgICAgaWYgKCBlbCApIHtcblxuICAgICAgICAgICAgICAgIC8vIFNlbmQgYSBtZXNzYWdlIHRvIG90aGVycywgdGhhdCB3ZSBhYm9ydGVkIGEgc3RlcGxlYXZlIGV2ZW50LlxuICAgICAgICAgICAgICAgIHRyaWdnZXJFdmVudCggc3RlcCwgXCJpbXByZXNzOnN1YnN0ZXA6c3RlcGxlYXZlYWJvcnRlZFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeyByZWFzb246IFwibmV4dFwiLCBzdWJzdGVwOiBlbCB9ICk7XG5cbiAgICAgICAgICAgICAgICAvLyBBdXRvcGxheSB1c2VzIHRoaXMgZm9yIHJlbG9hZGluZyBpdHNlbGZcbiAgICAgICAgICAgICAgICB0cmlnZ2VyRXZlbnQoIHN0ZXAsIFwiaW1wcmVzczpzdWJzdGVwOmVudGVyXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IHJlYXNvbjogXCJuZXh0XCIsIHN1YnN0ZXA6IGVsIH0gKTtcblxuICAgICAgICAgICAgICAgIC8vIFJldHVybmluZyBmYWxzZSBhYm9ydHMgdGhlIHN0ZXBsZWF2ZSBldmVudFxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoIGV2ZW50LmRldGFpbC5yZWFzb24gPT09IFwicHJldlwiICkge1xuICAgICAgICAgICAgZWwgPSBoaWRlU3Vic3RlcElmQW55KCBzdGVwICk7XG4gICAgICAgICAgICBpZiAoIGVsICkge1xuICAgICAgICAgICAgICAgIHRyaWdnZXJFdmVudCggc3RlcCwgXCJpbXByZXNzOnN1YnN0ZXA6c3RlcGxlYXZlYWJvcnRlZFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeyByZWFzb246IFwicHJldlwiLCBzdWJzdGVwOiBlbCB9ICk7XG5cbiAgICAgICAgICAgICAgICB0cmlnZ2VyRXZlbnQoIHN0ZXAsIFwiaW1wcmVzczpzdWJzdGVwOmxlYXZlXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IHJlYXNvbjogXCJwcmV2XCIsIHN1YnN0ZXA6IGVsIH0gKTtcblxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG5cbiAgICB2YXIgc2hvd1N1YnN0ZXBJZkFueSA9IGZ1bmN0aW9uKCBzdGVwICkge1xuICAgICAgICB2YXIgc3Vic3RlcHMgPSBzdGVwLnF1ZXJ5U2VsZWN0b3JBbGwoIFwiLnN1YnN0ZXBcIiApO1xuICAgICAgICB2YXIgdmlzaWJsZSA9IHN0ZXAucXVlcnlTZWxlY3RvckFsbCggXCIuc3Vic3RlcC12aXNpYmxlXCIgKTtcbiAgICAgICAgaWYgKCBzdWJzdGVwcy5sZW5ndGggPiAwICkge1xuICAgICAgICAgICAgcmV0dXJuIHNob3dTdWJzdGVwKCBzdWJzdGVwcywgdmlzaWJsZSApO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHZhciBzaG93U3Vic3RlcCA9IGZ1bmN0aW9uKCBzdWJzdGVwcywgdmlzaWJsZSApIHtcbiAgICAgICAgaWYgKCB2aXNpYmxlLmxlbmd0aCA8IHN1YnN0ZXBzLmxlbmd0aCApIHtcbiAgICAgICAgICAgIGZvciAoIHZhciBpID0gMDsgaSA8IHN1YnN0ZXBzLmxlbmd0aDsgaSsrICkge1xuICAgICAgICAgICAgICAgIHN1YnN0ZXBzWyBpIF0uY2xhc3NMaXN0LnJlbW92ZSggXCJzdWJzdGVwLWFjdGl2ZVwiICk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgZWwgPSBzdWJzdGVwc1sgdmlzaWJsZS5sZW5ndGggXTtcbiAgICAgICAgICAgIGVsLmNsYXNzTGlzdC5hZGQoIFwic3Vic3RlcC12aXNpYmxlXCIgKTtcbiAgICAgICAgICAgIGVsLmNsYXNzTGlzdC5hZGQoIFwic3Vic3RlcC1hY3RpdmVcIiApO1xuICAgICAgICAgICAgcmV0dXJuIGVsO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHZhciBoaWRlU3Vic3RlcElmQW55ID0gZnVuY3Rpb24oIHN0ZXAgKSB7XG4gICAgICAgIHZhciBzdWJzdGVwcyA9IHN0ZXAucXVlcnlTZWxlY3RvckFsbCggXCIuc3Vic3RlcFwiICk7XG4gICAgICAgIHZhciB2aXNpYmxlID0gc3RlcC5xdWVyeVNlbGVjdG9yQWxsKCBcIi5zdWJzdGVwLXZpc2libGVcIiApO1xuICAgICAgICBpZiAoIHN1YnN0ZXBzLmxlbmd0aCA+IDAgKSB7XG4gICAgICAgICAgICByZXR1cm4gaGlkZVN1YnN0ZXAoIHZpc2libGUgKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICB2YXIgaGlkZVN1YnN0ZXAgPSBmdW5jdGlvbiggdmlzaWJsZSApIHtcbiAgICAgICAgaWYgKCB2aXNpYmxlLmxlbmd0aCA+IDAgKSB7XG4gICAgICAgICAgICB2YXIgY3VycmVudCA9IC0xO1xuICAgICAgICAgICAgZm9yICggdmFyIGkgPSAwOyBpIDwgdmlzaWJsZS5sZW5ndGg7IGkrKyApIHtcbiAgICAgICAgICAgICAgICBpZiAoIHZpc2libGVbIGkgXS5jbGFzc0xpc3QuY29udGFpbnMoIFwic3Vic3RlcC1hY3RpdmVcIiApICkge1xuICAgICAgICAgICAgICAgICAgICBjdXJyZW50ID0gaTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdmlzaWJsZVsgaSBdLmNsYXNzTGlzdC5yZW1vdmUoIFwic3Vic3RlcC1hY3RpdmVcIiApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCBjdXJyZW50ID4gMCApIHtcbiAgICAgICAgICAgICAgICB2aXNpYmxlWyBjdXJyZW50IC0gMSBdLmNsYXNzTGlzdC5hZGQoIFwic3Vic3RlcC1hY3RpdmVcIiApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIGVsID0gdmlzaWJsZVsgdmlzaWJsZS5sZW5ndGggLSAxIF07XG4gICAgICAgICAgICBlbC5jbGFzc0xpc3QucmVtb3ZlKCBcInN1YnN0ZXAtdmlzaWJsZVwiICk7XG4gICAgICAgICAgICByZXR1cm4gZWw7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLy8gUmVnaXN0ZXIgdGhlIHBsdWdpbiB0byBiZSBjYWxsZWQgaW4gcHJlLXN0ZXBsZWF2ZSBwaGFzZS5cbiAgICAvLyBUaGUgd2VpZ2h0IG1ha2VzIHRoaXMgcGx1Z2luIHJ1biBiZWZvcmUgb3RoZXIgcHJlU3RlcExlYXZlIHBsdWdpbnMuXG4gICAgd2luZG93LmltcHJlc3MuYWRkUHJlU3RlcExlYXZlUGx1Z2luKCBzdWJzdGVwLCAxICk7XG5cbiAgICAvLyBXaGVuIGVudGVyaW5nIGEgc3RlcCwgaW4gcGFydGljdWxhciB3aGVuIHJlLWVudGVyaW5nLCBtYWtlIHN1cmUgdGhhdCBhbGwgc3Vic3RlcHMgYXJlIGhpZGRlblxuICAgIC8vIGF0IGZpcnN0XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggXCJpbXByZXNzOnN0ZXBlbnRlclwiLCBmdW5jdGlvbiggZXZlbnQgKSB7XG4gICAgICAgIHZhciBzdGVwID0gZXZlbnQudGFyZ2V0O1xuICAgICAgICB2YXIgdmlzaWJsZSA9IHN0ZXAucXVlcnlTZWxlY3RvckFsbCggXCIuc3Vic3RlcC12aXNpYmxlXCIgKTtcbiAgICAgICAgZm9yICggdmFyIGkgPSAwOyBpIDwgdmlzaWJsZS5sZW5ndGg7IGkrKyApIHtcbiAgICAgICAgICAgIHZpc2libGVbIGkgXS5jbGFzc0xpc3QucmVtb3ZlKCBcInN1YnN0ZXAtdmlzaWJsZVwiICk7XG4gICAgICAgIH1cbiAgICB9LCBmYWxzZSApO1xuXG4gICAgLy8gQVBJIGZvciBvdGhlcnMgdG8gcmV2ZWFsL2hpZGUgbmV4dCBzdWJzdGVwIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoIFwiaW1wcmVzczpzdWJzdGVwOnNob3dcIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgIHNob3dTdWJzdGVwSWZBbnkoIGFjdGl2ZVN0ZXAgKTtcbiAgICB9LCBmYWxzZSApO1xuXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggXCJpbXByZXNzOnN1YnN0ZXA6aGlkZVwiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgaGlkZVN1YnN0ZXBJZkFueSggYWN0aXZlU3RlcCApO1xuICAgIH0sIGZhbHNlICk7XG5cbn0gKSggZG9jdW1lbnQsIHdpbmRvdyApO1xuXG4vKipcbiAqIFN1cHBvcnQgZm9yIHN3aXBlIGFuZCB0YXAgb24gdG91Y2ggZGV2aWNlc1xuICpcbiAqIFRoaXMgcGx1Z2luIGltcGxlbWVudHMgbmF2aWdhdGlvbiBmb3IgcGx1Z2luIGRldmljZXMsIHZpYSBzd2lwaW5nIGxlZnQvcmlnaHQsXG4gKiBvciB0YXBwaW5nIG9uIHRoZSBsZWZ0L3JpZ2h0IGVkZ2VzIG9mIHRoZSBzY3JlZW4uXG4gKlxuICpcbiAqXG4gKiBDb3B5cmlnaHQgMjAxNTogQW5kcmV3IER1bmFpIChAYW5kM3Jzb24pXG4gKiBNb2RpZmllZCB0byBhIHBsdWdpbiwgMjAxNjogSGVucmlrIEluZ28gKEBoZW5yaWtpbmdvKVxuICpcbiAqIE1JVCBMaWNlbnNlXG4gKi9cbi8qIGdsb2JhbCBkb2N1bWVudCwgd2luZG93ICovXG4oIGZ1bmN0aW9uKCBkb2N1bWVudCwgd2luZG93ICkge1xuICAgIFwidXNlIHN0cmljdFwiO1xuXG4gICAgLy8gVG91Y2ggaGFuZGxlciB0byBkZXRlY3Qgc3dpcGluZyBsZWZ0IGFuZCByaWdodCBiYXNlZCBvbiB3aW5kb3cgc2l6ZS5cbiAgICAvLyBJZiB0aGUgZGlmZmVyZW5jZSBpbiBYIGNoYW5nZSBpcyBiaWdnZXIgdGhhbiAxLzIwIG9mIHRoZSBzY3JlZW4gd2lkdGgsXG4gICAgLy8gd2Ugc2ltcGx5IGNhbGwgYW4gYXBwcm9wcmlhdGUgQVBJIGZ1bmN0aW9uIHRvIGNvbXBsZXRlIHRoZSB0cmFuc2l0aW9uLlxuICAgIHZhciBzdGFydFggPSAwO1xuICAgIHZhciBsYXN0WCA9IDA7XG4gICAgdmFyIGxhc3REWCA9IDA7XG4gICAgdmFyIHRocmVzaG9sZCA9IHdpbmRvdy5pbm5lcldpZHRoIC8gMjA7XG5cbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCBcInRvdWNoc3RhcnRcIiwgZnVuY3Rpb24oIGV2ZW50ICkge1xuICAgICAgICBsYXN0WCA9IHN0YXJ0WCA9IGV2ZW50LnRvdWNoZXNbIDAgXS5jbGllbnRYO1xuICAgIH0gKTtcblxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoIFwidG91Y2htb3ZlXCIsIGZ1bmN0aW9uKCBldmVudCApIHtcbiAgICAgICAgIHZhciB4ID0gZXZlbnQudG91Y2hlc1sgMCBdLmNsaWVudFg7XG4gICAgICAgICB2YXIgZGlmZiA9IHggLSBzdGFydFg7XG5cbiAgICAgICAgIC8vIFRvIGJlIHVzZWQgaW4gdG91Y2hlbmRcbiAgICAgICAgIGxhc3REWCA9IGxhc3RYIC0geDtcbiAgICAgICAgIGxhc3RYID0geDtcblxuICAgICAgICAgd2luZG93LmltcHJlc3MoKS5zd2lwZSggZGlmZiAvIHdpbmRvdy5pbm5lcldpZHRoICk7XG4gICAgIH0gKTtcblxuICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCBcInRvdWNoZW5kXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgdmFyIHRvdGFsRGlmZiA9IGxhc3RYIC0gc3RhcnRYO1xuICAgICAgICAgaWYgKCBNYXRoLmFicyggdG90YWxEaWZmICkgPiB3aW5kb3cuaW5uZXJXaWR0aCAvIDUgJiYgKCB0b3RhbERpZmYgKiBsYXN0RFggKSA8PSAwICkge1xuICAgICAgICAgICAgIGlmICggdG90YWxEaWZmID4gd2luZG93LmlubmVyV2lkdGggLyA1ICYmIGxhc3REWCA8PSAwICkge1xuICAgICAgICAgICAgICAgICB3aW5kb3cuaW1wcmVzcygpLnByZXYoKTtcbiAgICAgICAgICAgICB9IGVsc2UgaWYgKCB0b3RhbERpZmYgPCAtd2luZG93LmlubmVyV2lkdGggLyA1ICYmIGxhc3REWCA+PSAwICkge1xuICAgICAgICAgICAgICAgICB3aW5kb3cuaW1wcmVzcygpLm5leHQoKTtcbiAgICAgICAgICAgICB9XG4gICAgICAgICB9IGVsc2UgaWYgKCBNYXRoLmFicyggbGFzdERYICkgPiB0aHJlc2hvbGQgKSB7XG4gICAgICAgICAgICAgaWYgKCBsYXN0RFggPCAtdGhyZXNob2xkICkge1xuICAgICAgICAgICAgICAgICB3aW5kb3cuaW1wcmVzcygpLnByZXYoKTtcbiAgICAgICAgICAgICB9IGVsc2UgaWYgKCBsYXN0RFggPiB0aHJlc2hvbGQgKSB7XG4gICAgICAgICAgICAgICAgIHdpbmRvdy5pbXByZXNzKCkubmV4dCgpO1xuICAgICAgICAgICAgIH1cbiAgICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgICAvLyBObyBtb3ZlbWVudCAtIG1vdmUgKGJhY2spIHRvIHRoZSBjdXJyZW50IHNsaWRlXG4gICAgICAgICAgICAgd2luZG93LmltcHJlc3MoKS5nb3RvKCBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCBcIiNpbXByZXNzIC5zdGVwLmFjdGl2ZVwiICkgKTtcbiAgICAgICAgIH1cbiAgICAgfSApO1xuXG4gICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoIFwidG91Y2hjYW5jZWxcIiwgZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAgICAvLyBNb3ZlIChiYWNrKSB0byB0aGUgY3VycmVudCBzbGlkZVxuICAgICAgICAgICAgIHdpbmRvdy5pbXByZXNzKCkuZ290byggZG9jdW1lbnQucXVlcnlTZWxlY3RvciggXCIjaW1wcmVzcyAuc3RlcC5hY3RpdmVcIiApICk7XG4gICAgIH0gKTtcblxufSApKCBkb2N1bWVudCwgd2luZG93ICk7XG5cbi8qKlxuICogVG9vbGJhciBwbHVnaW5cbiAqXG4gKiBUaGlzIHBsdWdpbiBwcm92aWRlcyBhIGdlbmVyaWMgZ3JhcGhpY2FsIHRvb2xiYXIuIE90aGVyIHBsdWdpbnMgdGhhdFxuICogd2FudCB0byBleHBvc2UgYSBidXR0b24gb3Igb3RoZXIgd2lkZ2V0LCBjYW4gYWRkIHRob3NlIHRvIHRoaXMgdG9vbGJhci5cbiAqXG4gKiBVc2luZyBhIHNpbmdsZSBjb25zb2xpZGF0ZWQgdG9vbGJhciBmb3IgYWxsIEdVSSB3aWRnZXRzIG1ha2VzIGl0IGVhc2llclxuICogdG8gcG9zaXRpb24gYW5kIHN0eWxlIHRoZSB0b29sYmFyIHJhdGhlciB0aGFuIGhhdmluZyB0byBkbyB0aGF0IGZvciBsb3RzXG4gKiBvZiBkaWZmZXJlbnQgZGl2cy5cbiAqXG4gKlxuICogKioqIEZvciBwcmVzZW50YXRpb24gYXV0aG9yczogKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAqXG4gKiBUbyBhZGQvYWN0aXZhdGUgdGhlIHRvb2xiYXIgaW4geW91ciBwcmVzZW50YXRpb24sIGFkZCB0aGlzIGRpdjpcbiAqXG4gKiAgICAgPGRpdiBpZD1cImltcHJlc3MtdG9vbGJhclwiPjwvZGl2PlxuICpcbiAqIFN0eWxpbmcgdGhlIHRvb2xiYXIgaXMgbGVmdCB0byBwcmVzZW50YXRpb24gYXV0aG9yLiBIZXJlJ3MgYW4gZXhhbXBsZSBDU1M6XG4gKlxuICogICAgLmltcHJlc3MtZW5hYmxlZCBkaXYjaW1wcmVzcy10b29sYmFyIHtcbiAqICAgICAgICBwb3NpdGlvbjogZml4ZWQ7XG4gKiAgICAgICAgcmlnaHQ6IDFweDtcbiAqICAgICAgICBib3R0b206IDFweDtcbiAqICAgICAgICBvcGFjaXR5OiAwLjY7XG4gKiAgICB9XG4gKiAgICAuaW1wcmVzcy1lbmFibGVkIGRpdiNpbXByZXNzLXRvb2xiYXIgPiBzcGFuIHtcbiAqICAgICAgICBtYXJnaW4tcmlnaHQ6IDEwcHg7XG4gKiAgICB9XG4gKlxuICogVGhlIFttb3VzZS10aW1lb3V0XSguLi9tb3VzZS10aW1lb3V0L1JFQURNRS5tZCkgcGx1Z2luIGNhbiBiZSBsZXZlcmFnZWQgdG8gaGlkZVxuICogdGhlIHRvb2xiYXIgZnJvbSBzaWdodCwgYW5kIG9ubHkgbWFrZSBpdCB2aXNpYmxlIHdoZW4gbW91c2UgaXMgbW92ZWQuXG4gKlxuICogICAgYm9keS5pbXByZXNzLW1vdXNlLXRpbWVvdXQgZGl2I2ltcHJlc3MtdG9vbGJhciB7XG4gKiAgICAgICAgZGlzcGxheTogbm9uZTtcbiAqICAgIH1cbiAqXG4gKlxuICogKioqIEZvciBwbHVnaW4gYXV0aG9ycyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gKlxuICogVG8gYWRkIGEgYnV0dG9uIHRvIHRoZSB0b29sYmFyLCB0cmlnZ2VyIHRoZSBgaW1wcmVzczp0b29sYmFyOmFwcGVuZENoaWxkYFxuICogb3IgYGltcHJlc3M6dG9vbGJhcjppbnNlcnRCZWZvcmVgIGV2ZW50cyBhcyBhcHByb3ByaWF0ZS4gVGhlIGRldGFpbCBvYmplY3RcbiAqIHNob3VsZCBjb250YWluIGZvbGxvd2luZyBwYXJhbWV0ZXJzOlxuICpcbiAqICAgIHsgZ3JvdXAgOiAxLCAgICAgICAgICAgICAgICAgICAgICAgLy8gaW50ZWdlci4gV2lkZ2V0cyB3aXRoIHRoZSBzYW1lIGdyb3VwIGFyZSBncm91cGVkIGluc2lkZVxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyB0aGUgc2FtZSA8c3Bhbj4gZWxlbWVudC5cbiAqICAgICAgaHRtbCA6IFwiPGJ1dHRvbj5DbGljazwvYnV0dG9uPlwiLCAvLyBUaGUgaHRtbCB0byBhZGQuXG4gKiAgICAgIGNhbGxiYWNrIDogXCJteWNhbGxiYWNrXCIsICAgICAgICAgLy8gVG9vbGJhciBwbHVnaW4gd2lsbCB0cmlnZ2VyIGV2ZW50XG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGBpbXByZXNzOnRvb2xiYXI6YWRkZWQ6bXljYWxsYmFja2Agd2hlbiBkb25lLlxuICogICAgICBiZWZvcmU6IGVsZW1lbnQgfSAgICAgICAgICAgICAgICAvLyBUaGUgcmVmZXJlbmNlIGVsZW1lbnQgZm9yIGFuIGluc2VydEJlZm9yZSgpIGNhbGwuXG4gKlxuICogWW91IHNob3VsZCBhbHNvIGxpc3RlbiB0byB0aGUgYGltcHJlc3M6dG9vbGJhcjphZGRlZDpteWNhbGxiYWNrYCBldmVudC4gQXRcbiAqIHRoaXMgcG9pbnQgeW91IGNhbiBmaW5kIHRoZSBuZXcgd2lkZ2V0IGluIHRoZSBET00sIGFuZCBmb3IgZXhhbXBsZSBhZGQgYW5cbiAqIGV2ZW50IGxpc3RlbmVyIHRvIGl0LlxuICpcbiAqIFlvdSBhcmUgZnJlZSB0byB1c2UgYW55IGludGVnZXIgZm9yIHRoZSBncm91cC4gSXQncyBvayB0byBsZWF2ZSBnYXBzLiBJdCdzXG4gKiBvayB0byBjby1sb2NhdGUgd2l0aCB3aWRnZXRzIGZvciBhbm90aGVyIHBsdWdpbiwgaWYgeW91IHRoaW5rIHRoZXkgYmVsb25nXG4gKiB0b2dldGhlci5cbiAqXG4gKiBTZWUgbmF2aWdhdGlvbi11aSBmb3IgYW4gZXhhbXBsZS5cbiAqXG4gKiBDb3B5cmlnaHQgMjAxNiBIZW5yaWsgSW5nbyAoQGhlbnJpa2luZ28pXG4gKiBSZWxlYXNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2UuXG4gKi9cblxuLyogZ2xvYmFsIGRvY3VtZW50ICovXG5cbiggZnVuY3Rpb24oIGRvY3VtZW50ICkge1xuICAgIFwidXNlIHN0cmljdFwiO1xuICAgIHZhciB0b29sYmFyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoIFwiaW1wcmVzcy10b29sYmFyXCIgKTtcbiAgICB2YXIgZ3JvdXBzID0gW107XG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIHNwYW4gZWxlbWVudCB0aGF0IGlzIGEgY2hpbGQgb2YgdG9vbGJhciwgaWRlbnRpZmllZCBieSBpbmRleC5cbiAgICAgKlxuICAgICAqIElmIHNwYW4gZWxlbWVudCBkb2Vzbid0IGV4aXN0IHlldCwgaXQgaXMgY3JlYXRlZC5cbiAgICAgKlxuICAgICAqIE5vdGU6IEJlY2F1c2Ugb2YgUnVuLXRvLWNvbXBsZXRpb24sIHRoaXMgaXMgbm90IGEgcmFjZSBjb25kaXRpb24uXG4gICAgICogaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4vZG9jcy9XZWIvSmF2YVNjcmlwdC9FdmVudExvb3AjUnVuLXRvLWNvbXBsZXRpb25cbiAgICAgKlxuICAgICAqIDpwYXJhbTogaW5kZXggICBNZXRob2Qgd2lsbCByZXR1cm4gdGhlIGVsZW1lbnQgPHNwYW4gaWQ9XCJpbXByZXNzLXRvb2xiYXItZ3JvdXAte2luZGV4fVwiPlxuICAgICAqL1xuICAgIHZhciBnZXRHcm91cEVsZW1lbnQgPSBmdW5jdGlvbiggaW5kZXggKSB7XG4gICAgICAgIHZhciBpZCA9IFwiaW1wcmVzcy10b29sYmFyLWdyb3VwLVwiICsgaW5kZXg7XG4gICAgICAgIGlmICggIWdyb3Vwc1sgaW5kZXggXSApIHtcbiAgICAgICAgICAgIGdyb3Vwc1sgaW5kZXggXSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoIFwic3BhblwiICk7XG4gICAgICAgICAgICBncm91cHNbIGluZGV4IF0uaWQgPSBpZDtcbiAgICAgICAgICAgIHZhciBuZXh0SW5kZXggPSBnZXROZXh0R3JvdXBJbmRleCggaW5kZXggKTtcbiAgICAgICAgICAgIGlmICggbmV4dEluZGV4ID09PSB1bmRlZmluZWQgKSB7XG4gICAgICAgICAgICAgICAgdG9vbGJhci5hcHBlbmRDaGlsZCggZ3JvdXBzWyBpbmRleCBdICk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRvb2xiYXIuaW5zZXJ0QmVmb3JlKCBncm91cHNbIGluZGV4IF0sIGdyb3Vwc1sgbmV4dEluZGV4IF0gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZ3JvdXBzWyBpbmRleCBdO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIHNwYW4gZWxlbWVudCBmcm9tIGdyb3Vwc1tdIHRoYXQgaXMgaW1tZWRpYXRlbHkgYWZ0ZXIgZ2l2ZW4gaW5kZXguXG4gICAgICpcbiAgICAgKiBUaGlzIGNhbiBiZSB1c2VkIHRvIGZpbmQgdGhlIHJlZmVyZW5jZSBub2RlIGZvciBhbiBpbnNlcnRCZWZvcmUoKSBjYWxsLlxuICAgICAqIElmIG5vIGVsZW1lbnQgZXhpc3RzIGF0IGEgbGFyZ2VyIGluZGV4LCByZXR1cm5zIHVuZGVmaW5lZC4gKEluIHRoaXMgY2FzZSxcbiAgICAgKiB5b3UnZCB1c2UgYXBwZW5kQ2hpbGQoKSBpbnN0ZWFkLilcbiAgICAgKlxuICAgICAqIE5vdGUgdGhhdCBpbmRleCBuZWVkbid0IGl0c2VsZiBleGlzdCBpbiBncm91cHNbXS5cbiAgICAgKi9cbiAgICB2YXIgZ2V0TmV4dEdyb3VwSW5kZXggPSBmdW5jdGlvbiggaW5kZXggKSB7XG4gICAgICAgIHZhciBpID0gaW5kZXggKyAxO1xuICAgICAgICB3aGlsZSAoICFncm91cHNbIGkgXSAmJiBpIDwgZ3JvdXBzLmxlbmd0aCApIHtcbiAgICAgICAgICAgIGkrKztcbiAgICAgICAgfVxuICAgICAgICBpZiAoIGkgPCBncm91cHMubGVuZ3RoICkge1xuICAgICAgICAgICAgcmV0dXJuIGk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLy8gQVBJXG4gICAgLy8gT3RoZXIgcGx1Z2lucyBjYW4gYWRkIGFuZCByZW1vdmUgYnV0dG9ucyBieSBzZW5kaW5nIHRoZW0gYXMgZXZlbnRzLlxuICAgIC8vIEluIHJldHVybiwgdG9vbGJhciBwbHVnaW4gd2lsbCB0cmlnZ2VyIGV2ZW50cyB3aGVuIGJ1dHRvbiB3YXMgYWRkZWQuXG4gICAgaWYgKCB0b29sYmFyICkge1xuICAgICAgICAvKipcbiAgICAgICAgICogQXBwZW5kIGEgd2lkZ2V0IGluc2lkZSB0b29sYmFyIHNwYW4gZWxlbWVudCBpZGVudGlmaWVkIGJ5IGdpdmVuIGdyb3VwIGluZGV4LlxuICAgICAgICAgKlxuICAgICAgICAgKiA6cGFyYW06IGUuZGV0YWlsLmdyb3VwICAgIGludGVnZXIgc3BlY2lmeWluZyB0aGUgc3BhbiBlbGVtZW50IHdoZXJlIHdpZGdldCB3aWxsIGJlIHBsYWNlZFxuICAgICAgICAgKiA6cGFyYW06IGUuZGV0YWlsLmVsZW1lbnQgIGEgZG9tIGVsZW1lbnQgdG8gYWRkIHRvIHRoZSB0b29sYmFyXG4gICAgICAgICAqL1xuICAgICAgICB0b29sYmFyLmFkZEV2ZW50TGlzdGVuZXIoIFwiaW1wcmVzczp0b29sYmFyOmFwcGVuZENoaWxkXCIsIGZ1bmN0aW9uKCBlICkge1xuICAgICAgICAgICAgdmFyIGdyb3VwID0gZ2V0R3JvdXBFbGVtZW50KCBlLmRldGFpbC5ncm91cCApO1xuICAgICAgICAgICAgZ3JvdXAuYXBwZW5kQ2hpbGQoIGUuZGV0YWlsLmVsZW1lbnQgKTtcbiAgICAgICAgfSApO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBBZGQgYSB3aWRnZXQgdG8gdG9vbGJhciB1c2luZyBpbnNlcnRCZWZvcmUoKSBET00gbWV0aG9kLlxuICAgICAgICAgKlxuICAgICAgICAgKiA6cGFyYW06IGUuZGV0YWlsLmJlZm9yZSAgIHRoZSByZWZlcmVuY2UgZG9tIGVsZW1lbnQsIGJlZm9yZSB3aGljaCBuZXcgZWxlbWVudCBpcyBhZGRlZFxuICAgICAgICAgKiA6cGFyYW06IGUuZGV0YWlsLmVsZW1lbnQgIGEgZG9tIGVsZW1lbnQgdG8gYWRkIHRvIHRoZSB0b29sYmFyXG4gICAgICAgICAqL1xuICAgICAgICB0b29sYmFyLmFkZEV2ZW50TGlzdGVuZXIoIFwiaW1wcmVzczp0b29sYmFyOmluc2VydEJlZm9yZVwiLCBmdW5jdGlvbiggZSApIHtcbiAgICAgICAgICAgIHRvb2xiYXIuaW5zZXJ0QmVmb3JlKCBlLmRldGFpbC5lbGVtZW50LCBlLmRldGFpbC5iZWZvcmUgKTtcbiAgICAgICAgfSApO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBSZW1vdmUgdGhlIHdpZGdldCBpbiBlLmRldGFpbC5yZW1vdmUuXG4gICAgICAgICAqL1xuICAgICAgICB0b29sYmFyLmFkZEV2ZW50TGlzdGVuZXIoIFwiaW1wcmVzczp0b29sYmFyOnJlbW92ZVdpZGdldFwiLCBmdW5jdGlvbiggZSApIHtcbiAgICAgICAgICAgIHRvb2xiYXIucmVtb3ZlQ2hpbGQoIGUuZGV0YWlsLnJlbW92ZSApO1xuICAgICAgICB9ICk7XG5cbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggXCJpbXByZXNzOmluaXRcIiwgZnVuY3Rpb24oIGV2ZW50ICkge1xuICAgICAgICAgICAgdmFyIGFwaSA9IGV2ZW50LmRldGFpbC5hcGk7XG4gICAgICAgICAgICBhcGkubGliLmdjLnB1c2hDYWxsYmFjayggZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgdG9vbGJhci5pbm5lckhUTUwgPSBcIlwiO1xuICAgICAgICAgICAgICAgIGdyb3VwcyA9IFtdO1xuICAgICAgICAgICAgfSApO1xuICAgICAgICB9ICk7XG4gICAgfSAvLyBJZiB0b29sYmFyXG5cbn0gKSggZG9jdW1lbnQgKTtcbiJdLCJzb3VyY2VSb290IjoiIn0=