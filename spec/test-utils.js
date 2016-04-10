"use strict";

// These utility functions are just intended to help with e2e and unit tests

(function () {
	var SELF, testUtils, NS = "freeStyla";

    testUtils = {
        createEl: function(id, type, cls, skipTest, container) {

            if(!id) id = SELF.getUID();
            if(!type) type = "div";

            var el = document.createElement(type);
            el.setAttribute("id", id);

            if(!container) container = document.body;

            container.appendChild(el);

            el = document.getElementById(id);

            if(cls) el.classList.add(cls);

            // just checking element was created
            if(!skipTest) expect(el.getAttribute("id")).toBe(id);

            return el;
        }

        , createWg: function(id, cls, skipTest, container) {
            var el = SELF.createEl(id, null, cls, skipTest, container)
            el.classList.add('cssload-hide');
            return el;
        }

        // el can be an ID as well as an actual DOM element
        , cleanupElement: function(el) {
            if(typeof el === "string") el = document.getElementById(el);
            el.parentElement.removeChild(el);
        }


        , getUID: function(pref) {
            var uid = (pref || "") + Math.random().toString().replace(".", "");

            // ensure starts with a letter, as CSS class names should not start with a number
            var firstChar = uid.substr(0,1);
            if( parseInt(firstChar).toString() !== "NaN" ) uid = "a-"+uid;

            return uid;
        }

        // unit tests should pass in instance of freestyla
        , reset: function(freeStyla) {
            
            if(!freeStyla) freeStyla = window.freeStyla;
            
            freeStyla.testable.clearAllInstances();
            if(freeStyla && freeStyla.glb) {
                freeStyla.glb.widgetNames = ["SiteFooter", "SiteHeader"];
            }
        }

        // el can be an ID as well as an actual DOM element
        , getCompProp: function(el, prop) {
            if(typeof el === "string") el = document.getElementById(el);
            var comp = window.getComputedStyle(el);
            return comp.getPropertyValue(prop);
        }

        , getCssPath: function(file) {
            return 'http://localhost:8081/dist/' + file;
        }

        // adds freeStyla element so style sheets have an element to reference in the DOM
        , addFreeStylaEl: function() {
            var freestylaEl = document.createElement("span");
            freestylaEl.setAttribute("id", window.freeStyla.vars.MAIN_ID);
            document.body.appendChild(freestylaEl);
        }
    }
	
    // exposes library for browser and Node-based code (such as unit tests)
    if(typeof window === "undefined")   module.exports = testUtils;
    else                                window.testUtils = testUtils
	
    SELF = testUtils;
})();

