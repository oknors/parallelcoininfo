(window["webpackJsonp"] = window["webpackJsonp"] || []).push([[3],{

/***/ "./node_modules/impress.js/src/plugins/media/media.js":
/*!************************************************************!*\
  !*** ./node_modules/impress.js/src/plugins/media/media.js ***!
  \************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

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


/***/ })

}]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvaW1wcmVzcy5qcy9zcmMvcGx1Z2lucy9tZWRpYS9tZWRpYS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQSxLQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBLG9CQUFvQiw2QkFBNkI7QUFDakQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxvQkFBb0Isa0JBQWtCO0FBQ3RDOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBLG9CQUFvQixrQkFBa0I7QUFDdEM7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esd0NBQXdDLHFDQUFxQztBQUM3RTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG9CQUFvQixrQkFBa0I7QUFDdEM7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBLG9CQUFvQixrQkFBa0I7QUFDdEM7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLG9CQUFvQixrQkFBa0I7QUFDdEM7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxDQUFDIiwiZmlsZSI6IjNjY2Q5Y2MzOGE3ZmNkZDVlM2JmLzMuMy5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogTWVkaWEgUGx1Z2luXG4gKlxuICogVGhpcyBwbHVnaW4gd2lsbCBkbyB0aGUgZm9sbG93aW5nIHRoaW5nczpcbiAqXG4gKiAgLSBBZGQgYSBzcGVjaWFsIGNsYXNzIHdoZW4gcGxheWluZyAoYm9keS5pbXByZXNzLW1lZGlhLXZpZGVvLXBsYXlpbmdcbiAqICAgIGFuZCBib2R5LmltcHJlc3MtbWVkaWEtdmlkZW8tcGxheWluZykgYW5kIHBhdXNpbmcgbWVkaWEgKGJvZHkuaW1wcmVzcy1tZWRpYS12aWRlby1wYXVzZWRcbiAqICAgIGFuZCBib2R5LmltcHJlc3MtbWVkaWEtYXVkaW8tcGF1c2VkKSAocmVtb3ZpbmcgdGhlbSB3aGVuIGVuZGluZykuXG4gKiAgICBUaGlzIGNhbiBiZSB1c2VmdWwgZm9yIGV4YW1wbGUgZm9yIGRhcmtlbmluZyB0aGUgYmFja2dyb3VuZCBvciBmYWRpbmcgb3V0IG90aGVyIGVsZW1lbnRzXG4gKiAgICB3aGlsZSBhIHZpZGVvIGlzIHBsYXlpbmcuXG4gKiAgICBPbmx5IG1lZGlhIGF0IHRoZSBjdXJyZW50IHN0ZXAgYXJlIHRha2VuIGludG8gYWNjb3VudC4gQWxsIGNsYXNzZXMgYXJlIHJlbW92ZWQgd2hlbiBsZWF2aW5nXG4gKiAgICBhIHN0ZXAuXG4gKlxuICogIC0gSW50cm9kdWNlIHRoZSBmb2xsb3dpbmcgbmV3IGRhdGEgYXR0cmlidXRlczpcbiAqXG4gKiAgICAtIGRhdGEtbWVkaWEtYXV0b3BsYXk9XCJ0cnVlXCI6IEF1dG9zdGFydCBtZWRpYSB3aGVuIGVudGVyaW5nIGl0cyBzdGVwLlxuICogICAgLSBkYXRhLW1lZGlhLWF1dG9zdG9wPVwidHJ1ZVwiOiBTdG9wIG1lZGlhICg9IHBhdXNlIGFuZCByZXNldCB0byBzdGFydCksIHdoZW4gbGVhdmluZyBpdHNcbiAqICAgICAgc3RlcC5cbiAqICAgIC0gZGF0YS1tZWRpYS1hdXRvcGF1c2U9XCJ0cnVlXCI6IFBhdXNlIG1lZGlhIGJ1dCBrZWVwIGN1cnJlbnQgdGltZSB3aGVuIGxlYXZpbmcgaXRzIHN0ZXAuXG4gKlxuICogICAgV2hlbiB0aGVzZSBhdHRyaWJ1dGVzIGFyZSBhZGRlZCB0byBhIHN0ZXAgdGhleSBhcmUgaW5oZXJpdGVkIGJ5IGFsbCBtZWRpYSBvbiB0aGlzIHN0ZXAuXG4gKiAgICBPZiBjb3Vyc2UgdGhpcyBzZXR0aW5nIGNhbiBiZSBvdmVyd3JpdHRlbiBieSBhZGRpbmcgZGlmZmVyZW50IGF0dHJpYnV0ZXMgdG8gaW5pZHZpZHVhbFxuICogICAgbWVkaWEuXG4gKlxuICogICAgVGhlIHNhbWUgcnVsZSBhcHBsaWVzIHdoZW4gdGhpcyBhdHRyaWJ1dGVzIGlzIGFkZGVkIHRvIHRoZSByb290IGVsZW1lbnQuIFNldHRpbmdzIGNhbiBiZVxuICogICAgb3ZlcndyaXR0ZW4gZm9yIGluZGl2aWR1YWwgc3RlcHMgYW5kIG1lZGlhLlxuICpcbiAqICAgIEV4YW1wbGVzOlxuICogICAgLSBkYXRhLW1lZGlhLWF1dG9wbGF5PVwidHJ1ZVwiIGRhdGEtbWVkaWEtYXV0b3N0b3A9XCJ0cnVlXCI6IHN0YXJ0IG1lZGlhIG9uIGVudGVyLCBzdG9wIG9uXG4gKiAgICAgIGxlYXZlLCByZXN0YXJ0IGZyb20gYmVnaW5uaW5nIHdoZW4gcmUtZW50ZXJpbmcgdGhlIHN0ZXAuXG4gKlxuICogICAgLSBkYXRhLW1lZGlhLWF1dG9wbGF5PVwidHJ1ZVwiIGRhdGEtbWVkaWEtYXV0b3BhdXNlPVwidHJ1ZVwiOiBzdGFydCBtZWRpYSBvbiBlbnRlciwgcGF1c2Ugb25cbiAqICAgICAgbGVhdmUsIHJlc3VtZSBvbiByZS1lbnRlclxuICpcbiAqICAgIC0gZGF0YS1tZWRpYS1hdXRvcGxheT1cInRydWVcIiBkYXRhLW1lZGlhLWF1dG9zdG9wPVwidHJ1ZVwiIGRhdGEtbWVkaWEtYXV0b3BhdXNlPVwidHJ1ZVwiOiBzdGFydFxuICogICAgICBtZWRpYSBvbiBlbnRlciwgc3RvcCBvbiBsZWF2ZSAoc3RvcCBvdmVyd3JpdGVzIHBhdXNlKS5cbiAqXG4gKiAgICAtIGRhdGEtbWVkaWEtYXV0b3BsYXk9XCJ0cnVlXCIgZGF0YS1tZWRpYS1hdXRvcGF1c2U9XCJmYWxzZVwiOiBsZXQgbWVkaWEgc3RhcnQgYXV0b21hdGljYWxseVxuICogICAgICB3aGVuIGVudGVyaW5nIGEgc3RlcCBhbmQgbGV0IGl0IHBsYXkgd2hlbiBsZWF2aW5nIHRoZSBzdGVwLlxuICpcbiAqICAgIC0gPGRpdiBpZD1cImltcHJlc3NcIiBkYXRhLW1lZGlhLWF1dG9wbGF5PVwidHJ1ZVwiPiAuLi4gPGRpdiBjbGFzcz1cInN0ZXBcIlxuICogICAgICBkYXRhLW1lZGlhLWF1dG9wbGF5PVwiZmFsc2VcIj5cbiAqICAgICAgQWxsIG1lZGlhIGlzIHN0YXJ0ZXQgYXV0b21hdGljYWxseSBvbiBhbGwgc3RlcHMgZXhjZXB0IHRoZSBvbmUgdGhhdCBoYXMgdGhlXG4gKiAgICAgIGRhdGEtbWVkaWEtYXV0b3BsYXk9XCJmYWxzZVwiIGF0dHJpYnV0ZS5cbiAqXG4gKiAgLSBQcm8gdGlwOiBVc2UgPGF1ZGlvIG9uZW5kZWQ9XCJpbXByZXNzKCkubmV4dCgpXCI+IG9yIDx2aWRlbyBvbmVuZGVkPVwiaW1wcmVzcygpLm5leHQoKVwiPiB0b1xuICogICAgcHJvY2VlZCB0byB0aGUgbmV4dCBzdGVwIGF1dG9tYXRpY2FsbHksIHdoZW4gdGhlIGVuZCBvZiB0aGUgbWVkaWEgaXMgcmVhY2hlZC5cbiAqXG4gKlxuICogQ29weXJpZ2h0IDIwMTggSG9sZ2VyIFRlaWNoZXJ0IChAY29tcGxhbmFyKVxuICogUmVsZWFzZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlLlxuICovXG4vKiBnbG9iYWwgd2luZG93LCBkb2N1bWVudCAqL1xuXG4oIGZ1bmN0aW9uKCBkb2N1bWVudCwgd2luZG93ICkge1xuICAgIFwidXNlIHN0cmljdFwiO1xuICAgIHZhciByb290LCBhcGksIGdjLCBhdHRyaWJ1dGVUcmFja2VyO1xuXG4gICAgYXR0cmlidXRlVHJhY2tlciA9IFtdO1xuXG4gICAgLy8gRnVuY3Rpb24gbmFtZXNcbiAgICB2YXIgZW5oYW5jZU1lZGlhTm9kZXMsXG4gICAgICAgIGVuaGFuY2VNZWRpYSxcbiAgICAgICAgcmVtb3ZlTWVkaWFDbGFzc2VzLFxuICAgICAgICBvblN0ZXBlbnRlckRldGVjdEltcHJlc3NDb25zb2xlLFxuICAgICAgICBvblN0ZXBlbnRlcixcbiAgICAgICAgb25TdGVwbGVhdmUsXG4gICAgICAgIG9uUGxheSxcbiAgICAgICAgb25QYXVzZSxcbiAgICAgICAgb25FbmRlZCxcbiAgICAgICAgZ2V0TWVkaWFBdHRyaWJ1dGUsXG4gICAgICAgIHRlYXJkb3duO1xuXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggXCJpbXByZXNzOmluaXRcIiwgZnVuY3Rpb24oIGV2ZW50ICkge1xuICAgICAgICByb290ID0gZXZlbnQudGFyZ2V0O1xuICAgICAgICBhcGkgPSBldmVudC5kZXRhaWwuYXBpO1xuICAgICAgICBnYyA9IGFwaS5saWIuZ2M7XG5cbiAgICAgICAgZW5oYW5jZU1lZGlhKCk7XG5cbiAgICAgICAgZ2MucHVzaENhbGxiYWNrKCB0ZWFyZG93biApO1xuICAgIH0sIGZhbHNlICk7XG5cbiAgICB0ZWFyZG93biA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgZWwsIGk7XG4gICAgICAgIHJlbW92ZU1lZGlhQ2xhc3NlcygpO1xuICAgICAgICBmb3IgKCBpID0gMDsgaSA8IGF0dHJpYnV0ZVRyYWNrZXIubGVuZ3RoOyBpICs9IDEgKSB7XG4gICAgICAgICAgICBlbCA9IGF0dHJpYnV0ZVRyYWNrZXJbIGkgXTtcbiAgICAgICAgICAgIGVsLm5vZGUucmVtb3ZlQXR0cmlidXRlKCBlbC5hdHRyICk7XG4gICAgICAgIH1cbiAgICAgICAgYXR0cmlidXRlVHJhY2tlciA9IFtdO1xuICAgIH07XG5cbiAgICBnZXRNZWRpYUF0dHJpYnV0ZSA9IGZ1bmN0aW9uKCBhdHRyaWJ1dGVOYW1lLCBub2RlcyApIHtcbiAgICAgICAgdmFyIGF0dHJOYW1lLCBhdHRyVmFsdWUsIGksIG5vZGU7XG4gICAgICAgIGF0dHJOYW1lID0gXCJkYXRhLW1lZGlhLVwiICsgYXR0cmlidXRlTmFtZTtcblxuICAgICAgICAvLyBMb29rIGZvciBhdHRyaWJ1dGVzIGluIGFsbCBub2Rlc1xuICAgICAgICBmb3IgKCBpID0gMDsgaSA8IG5vZGVzLmxlbmd0aDsgaSArPSAxICkge1xuICAgICAgICAgICAgbm9kZSA9IG5vZGVzWyBpIF07XG5cbiAgICAgICAgICAgIC8vIEZpcnN0IHRlc3QsIGlmIHRoZSBhdHRyaWJ1dGUgZXhpc3RzLCBiZWNhdXNlIHNvbWUgYnJvd3NlcnMgbWF5IHJldHVyblxuICAgICAgICAgICAgLy8gYW4gZW1wdHkgc3RyaW5nIGZvciBub24tZXhpc3RpbmcgYXR0cmlidXRlcyAtIHNwZWNzIGFyZSBub3QgY2xlYXIgYXQgdGhhdCBwb2ludFxuICAgICAgICAgICAgaWYgKCBub2RlLmhhc0F0dHJpYnV0ZSggYXR0ck5hbWUgKSApIHtcblxuICAgICAgICAgICAgICAgIC8vIEF0dHJpYnV0ZSBmb3VuZCwgcmV0dXJuIHRoZWlyIHBhcnNlZCBib29sZWFuIHZhbHVlLCBlbXB0eSBzdHJpbmdzIGNvdW50IGFzIHRydWVcbiAgICAgICAgICAgICAgICAvLyB0byBlbmFibGUgZW1wdHkgdmFsdWUgYm9vbGVhbnMgKGNvbW1vbiBpbiBodG1sNSBidXQgbm90IGFsbG93ZWQgaW4gd2VsbCBmb3JtZWRcbiAgICAgICAgICAgICAgICAvLyB4bWwpLlxuICAgICAgICAgICAgICAgIGF0dHJWYWx1ZSA9IG5vZGUuZ2V0QXR0cmlidXRlKCBhdHRyTmFtZSApO1xuICAgICAgICAgICAgICAgIGlmICggYXR0clZhbHVlID09PSBcIlwiIHx8IGF0dHJWYWx1ZSA9PT0gXCJ0cnVlXCIgKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIE5vIGF0dHJpYnV0ZSBmb3VuZCBhdCBjdXJyZW50IG5vZGUsIHByb2NlZWQgd2l0aCBuZXh0IHJvdW5kXG4gICAgICAgIH1cblxuICAgICAgICAvLyBMYXN0IHJlc29ydDogbm8gYXR0cmlidXRlIGZvdW5kIC0gcmV0dXJuIHVuZGVmaW5lZCB0byBkaXN0aWd1aXNoIGZyb20gZmFsc2VcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9O1xuXG4gICAgb25QbGF5ID0gZnVuY3Rpb24oIGV2ZW50ICkge1xuICAgICAgICB2YXIgdHlwZSA9IGV2ZW50LnRhcmdldC5ub2RlTmFtZS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5hZGQoIFwiaW1wcmVzcy1tZWRpYS1cIiArIHR5cGUgKyBcIi1wbGF5aW5nXCIgKTtcbiAgICAgICAgZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QucmVtb3ZlKCBcImltcHJlc3MtbWVkaWEtXCIgKyB0eXBlICsgXCItcGF1c2VkXCIgKTtcbiAgICB9O1xuXG4gICAgb25QYXVzZSA9IGZ1bmN0aW9uKCBldmVudCApIHtcbiAgICAgICAgdmFyIHR5cGUgPSBldmVudC50YXJnZXQubm9kZU5hbWUudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QuYWRkKCBcImltcHJlc3MtbWVkaWEtXCIgKyB0eXBlICsgXCItcGF1c2VkXCIgKTtcbiAgICAgICAgZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QucmVtb3ZlKCBcImltcHJlc3MtbWVkaWEtXCIgKyB0eXBlICsgXCItcGxheWluZ1wiICk7XG4gICAgfTtcblxuICAgIG9uRW5kZWQgPSBmdW5jdGlvbiggZXZlbnQgKSB7XG4gICAgICAgIHZhciB0eXBlID0gZXZlbnQudGFyZ2V0Lm5vZGVOYW1lLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnJlbW92ZSggXCJpbXByZXNzLW1lZGlhLVwiICsgdHlwZSArIFwiLXBsYXlpbmdcIiApO1xuICAgICAgICBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5yZW1vdmUoIFwiaW1wcmVzcy1tZWRpYS1cIiArIHR5cGUgKyBcIi1wYXVzZWRcIiApO1xuICAgIH07XG5cbiAgICByZW1vdmVNZWRpYUNsYXNzZXMgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHR5cGUsIHR5cGVzO1xuICAgICAgICB0eXBlcyA9IFsgXCJ2aWRlb1wiLCBcImF1ZGlvXCIgXTtcbiAgICAgICAgZm9yICggdHlwZSBpbiB0eXBlcyApIHtcbiAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnJlbW92ZSggXCJpbXByZXNzLW1lZGlhLVwiICsgdHlwZXNbIHR5cGUgXSArIFwiLXBsYXlpbmdcIiApO1xuICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QucmVtb3ZlKCBcImltcHJlc3MtbWVkaWEtXCIgKyB0eXBlc1sgdHlwZSBdICsgXCItcGF1c2VkXCIgKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBlbmhhbmNlTWVkaWFOb2RlcyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgaSwgaWQsIG1lZGlhLCBtZWRpYUVsZW1lbnQsIHR5cGU7XG5cbiAgICAgICAgbWVkaWEgPSByb290LnF1ZXJ5U2VsZWN0b3JBbGwoIFwiYXVkaW8sIHZpZGVvXCIgKTtcbiAgICAgICAgZm9yICggaSA9IDA7IGkgPCBtZWRpYS5sZW5ndGg7IGkgKz0gMSApIHtcbiAgICAgICAgICAgIHR5cGUgPSBtZWRpYVsgaSBdLm5vZGVOYW1lLnRvTG93ZXJDYXNlKCk7XG5cbiAgICAgICAgICAgIC8vIFNldCBhbiBpZCB0byBpZGVudGlmeSBlYWNoIG1lZGlhIG5vZGUgLSB1c2VkIGUuZy4gZm9yIGNyb3NzIHJlZmVyZW5jZXMgYnlcbiAgICAgICAgICAgIC8vIHRoZSBjb25zb2xlTWVkaWEgcGx1Z2luXG4gICAgICAgICAgICBtZWRpYUVsZW1lbnQgPSBtZWRpYVsgaSBdO1xuICAgICAgICAgICAgaWQgPSBtZWRpYUVsZW1lbnQuZ2V0QXR0cmlidXRlKCBcImlkXCIgKTtcbiAgICAgICAgICAgIGlmICggaWQgPT09IHVuZGVmaW5lZCB8fCBpZCA9PT0gbnVsbCApIHtcbiAgICAgICAgICAgICAgICBtZWRpYUVsZW1lbnQuc2V0QXR0cmlidXRlKCBcImlkXCIsIFwibWVkaWEtXCIgKyB0eXBlICsgXCItXCIgKyBpICk7XG4gICAgICAgICAgICAgICAgYXR0cmlidXRlVHJhY2tlci5wdXNoKCB7IFwibm9kZVwiOiBtZWRpYUVsZW1lbnQsIFwiYXR0clwiOiBcImlkXCIgfSApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZ2MuYWRkRXZlbnRMaXN0ZW5lciggbWVkaWFFbGVtZW50LCBcInBsYXlcIiwgb25QbGF5ICk7XG4gICAgICAgICAgICBnYy5hZGRFdmVudExpc3RlbmVyKCBtZWRpYUVsZW1lbnQsIFwicGxheWluZ1wiLCBvblBsYXkgKTtcbiAgICAgICAgICAgIGdjLmFkZEV2ZW50TGlzdGVuZXIoIG1lZGlhRWxlbWVudCwgXCJwYXVzZVwiLCBvblBhdXNlICk7XG4gICAgICAgICAgICBnYy5hZGRFdmVudExpc3RlbmVyKCBtZWRpYUVsZW1lbnQsIFwiZW5kZWRcIiwgb25FbmRlZCApO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIGVuaGFuY2VNZWRpYSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgc3RlcHMsIHN0ZXBFbGVtZW50LCBpO1xuICAgICAgICBlbmhhbmNlTWVkaWFOb2RlcygpO1xuICAgICAgICBzdGVwcyA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoIFwic3RlcFwiICk7XG4gICAgICAgIGZvciAoIGkgPSAwOyBpIDwgc3RlcHMubGVuZ3RoOyBpICs9IDEgKSB7XG4gICAgICAgICAgICBzdGVwRWxlbWVudCA9IHN0ZXBzWyBpIF07XG5cbiAgICAgICAgICAgIGdjLmFkZEV2ZW50TGlzdGVuZXIoIHN0ZXBFbGVtZW50LCBcImltcHJlc3M6c3RlcGVudGVyXCIsIG9uU3RlcGVudGVyICk7XG4gICAgICAgICAgICBnYy5hZGRFdmVudExpc3RlbmVyKCBzdGVwRWxlbWVudCwgXCJpbXByZXNzOnN0ZXBsZWF2ZVwiLCBvblN0ZXBsZWF2ZSApO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIG9uU3RlcGVudGVyRGV0ZWN0SW1wcmVzc0NvbnNvbGUgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIFwicHJldmlld1wiOiAoIHdpbmRvdy5mcmFtZUVsZW1lbnQgIT09IG51bGwgJiYgd2luZG93LmZyYW1lRWxlbWVudC5pZCA9PT0gXCJwcmVWaWV3XCIgKSxcbiAgICAgICAgICAgIFwic2xpZGVWaWV3XCI6ICggd2luZG93LmZyYW1lRWxlbWVudCAhPT0gbnVsbCAmJiB3aW5kb3cuZnJhbWVFbGVtZW50LmlkID09PSBcInNsaWRlVmlld1wiIClcbiAgICAgICAgfTtcbiAgICB9O1xuXG4gICAgb25TdGVwZW50ZXIgPSBmdW5jdGlvbiggZXZlbnQgKSB7XG4gICAgICAgIHZhciBzdGVwRWxlbWVudCwgbWVkaWEsIG1lZGlhRWxlbWVudCwgaSwgb25Db25zb2xlLCBhdXRvcGxheTtcbiAgICAgICAgaWYgKCAoICFldmVudCApIHx8ICggIWV2ZW50LnRhcmdldCApICkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgc3RlcEVsZW1lbnQgPSBldmVudC50YXJnZXQ7XG4gICAgICAgIHJlbW92ZU1lZGlhQ2xhc3NlcygpO1xuXG4gICAgICAgIG1lZGlhID0gc3RlcEVsZW1lbnQucXVlcnlTZWxlY3RvckFsbCggXCJhdWRpbywgdmlkZW9cIiApO1xuICAgICAgICBmb3IgKCBpID0gMDsgaSA8IG1lZGlhLmxlbmd0aDsgaSArPSAxICkge1xuICAgICAgICAgICAgbWVkaWFFbGVtZW50ID0gbWVkaWFbIGkgXTtcblxuICAgICAgICAgICAgLy8gQXV0b3BsYXkgd2hlbiAobWF5YmUgaW5oZXJpdGVkKSBhdXRvcGxheSBzZXR0aW5nIGlzIHRydWUsXG4gICAgICAgICAgICAvLyBidXQgb25seSBpZiBub3Qgb24gcHJldmlldyBvZiB0aGUgbmV4dCBzdGVwIGluIGltcHJlc3NDb25zb2xlXG4gICAgICAgICAgICBvbkNvbnNvbGUgPSBvblN0ZXBlbnRlckRldGVjdEltcHJlc3NDb25zb2xlKCk7XG4gICAgICAgICAgICBhdXRvcGxheSA9IGdldE1lZGlhQXR0cmlidXRlKCBcImF1dG9wbGF5XCIsIFsgbWVkaWFFbGVtZW50LCBzdGVwRWxlbWVudCwgcm9vdCBdICk7XG4gICAgICAgICAgICBpZiAoIGF1dG9wbGF5ICYmICFvbkNvbnNvbGUucHJldmlldyApIHtcbiAgICAgICAgICAgICAgICBpZiAoIG9uQ29uc29sZS5zbGlkZVZpZXcgKSB7XG4gICAgICAgICAgICAgICAgICAgIG1lZGlhRWxlbWVudC5tdXRlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIG1lZGlhRWxlbWVudC5wbGF5KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgb25TdGVwbGVhdmUgPSBmdW5jdGlvbiggZXZlbnQgKSB7XG4gICAgICAgIHZhciBzdGVwRWxlbWVudCwgbWVkaWEsIGksIG1lZGlhRWxlbWVudCwgYXV0b3BsYXksIGF1dG9wYXVzZSwgYXV0b3N0b3A7XG4gICAgICAgIGlmICggKCAhZXZlbnQgfHwgIWV2ZW50LnRhcmdldCApICkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgc3RlcEVsZW1lbnQgPSBldmVudC50YXJnZXQ7XG4gICAgICAgIG1lZGlhID0gZXZlbnQudGFyZ2V0LnF1ZXJ5U2VsZWN0b3JBbGwoIFwiYXVkaW8sIHZpZGVvXCIgKTtcbiAgICAgICAgZm9yICggaSA9IDA7IGkgPCBtZWRpYS5sZW5ndGg7IGkgKz0gMSApIHtcbiAgICAgICAgICAgIG1lZGlhRWxlbWVudCA9IG1lZGlhWyBpIF07XG5cbiAgICAgICAgICAgIGF1dG9wbGF5ID0gZ2V0TWVkaWFBdHRyaWJ1dGUoIFwiYXV0b3BsYXlcIiwgWyBtZWRpYUVsZW1lbnQsIHN0ZXBFbGVtZW50LCByb290IF0gKTtcbiAgICAgICAgICAgIGF1dG9wYXVzZSA9IGdldE1lZGlhQXR0cmlidXRlKCBcImF1dG9wYXVzZVwiLCBbIG1lZGlhRWxlbWVudCwgc3RlcEVsZW1lbnQsIHJvb3QgXSApO1xuICAgICAgICAgICAgYXV0b3N0b3AgPSBnZXRNZWRpYUF0dHJpYnV0ZSggXCJhdXRvc3RvcFwiLCAgWyBtZWRpYUVsZW1lbnQsIHN0ZXBFbGVtZW50LCByb290IF0gKTtcblxuICAgICAgICAgICAgLy8gSWYgYm90aCBhdXRvc3RvcCBhbmQgYXV0b3BhdXNlIGFyZSB1bmRlZmluZWQsIHNldCBpdCB0byB0aGUgdmFsdWUgb2YgYXV0b3BsYXlcbiAgICAgICAgICAgIGlmICggYXV0b3N0b3AgPT09IHVuZGVmaW5lZCAmJiBhdXRvcGF1c2UgPT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgICAgICAgICBhdXRvc3RvcCA9IGF1dG9wbGF5O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoIGF1dG9wYXVzZSB8fCBhdXRvc3RvcCApIHtcbiAgICAgICAgICAgICAgICBtZWRpYUVsZW1lbnQucGF1c2UoKTtcbiAgICAgICAgICAgICAgICBpZiAoIGF1dG9zdG9wICkge1xuICAgICAgICAgICAgICAgICAgICBtZWRpYUVsZW1lbnQuY3VycmVudFRpbWUgPSAwO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZW1vdmVNZWRpYUNsYXNzZXMoKTtcbiAgICB9O1xuXG59ICkoIGRvY3VtZW50LCB3aW5kb3cgKTtcbiJdLCJzb3VyY2VSb290IjoiIn0=