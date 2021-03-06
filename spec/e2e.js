
// some warnings can be quite irritating during tests, so we can suppress them here
window.freeStyla.suppressWarnings = true;

var createEl = window.testUtils.createEl
  , createWg = window.testUtils.createWg
  , cleanupElement = window.testUtils.cleanupElement
  , getCompProp = window.testUtils.getCompProp
  , getCssPath = window.testUtils.getCssPath
  , addFreeStylaEl = window.testUtils.addFreeStylaEl
  , createNewInstance = window.freeStyla.testable.createNewInstance
  , getUID = window.testUtils.getUID
  , clsLoading = window.freeStyla.vars.clsLoading
  , $doc = $(document)

beforeEach(function() {
	window.testUtils.reset();
});

var noop = function(){};

describe("callConfigCBs", function() {

	var fun = window.freeStyla.testable.callConfigCBs

	function setup(returnInst) {
		var inst = createNewInstance(true);
		inst.notYetVisibleWgList = [];

		if(returnInst) return inst;
		return inst.uid;
	}

	it("should successfully call multiple callbacks in a widget config", function (done) {
		
		var uid = setup()
		  , wgName = "SiteHeader"
		  , count = 0

		var callDone = function() {
			count++;
			if(count>=2) done();
		}

		var cb1 = function(_wgName) {
			expect(_wgName).toBe(wgName);
			callDone();
		}, cb2 = function(_wgName) {
			expect(_wgName).toBe(wgName);
			callDone();
		}

		var cnf = {
			wgName: wgName // case shouldn't matter
			, $el: null
			, loaded: false
			, cb:[cb1, cb2]
		}

		var isSuccess = fun(uid, cnf, false);

		expect(isSuccess).toBe(true);

		if(!isSuccess) done();
	})

	it("should reject if widget is already loaded and 'allowAll' is false", function () {
		
		var uid = setup()

		var cnf = {
			wgName: "SiteHeader" // case shouldn't matter
			, $el: null
			, loaded: true
			, cb:[]
		}

		var isSuccess = fun(uid, cnf, false);

		expect(isSuccess).toBe(false);
	})

	it("should accept if widget is already loaded, but 'allowAll' is true", function () {
		
		var uid = setup()

		var cnf = {
			wgName: "SiteHeader" // case shouldn't matter
			, $el: null
			, loaded: true
			, cb:[]
		}

		var isSuccess = fun(uid, cnf, true);

		expect(isSuccess).toBe(true);
	})

	it("should reject and add the widget to the 'notYetVisibleWgList' array because a parent isn't loaded yet", function() {

		var parentEl = createEl()
		  , child = createEl(null, null, null, null, parentEl)

		// set the parent state to still loading
		parentEl.classList.add(clsLoading)

		var inst = setup(true)

		var cnf = {
			wgName: "SiteHeader" // case shouldn't matter
			, $el: $(child)
			, loaded: false
			, cb:[]
		}

		var isSuccess = fun(inst.uid, cnf, false);

		expect(isSuccess).toBe(false); // checks it was rejected
		expect(inst.notYetVisibleWgList.indexOf(cnf)).toEqual(0) // checks it was added to the list of not yet visible widgets

		cleanupElement(parentEl);
		cleanupElement(child);
	})
})


describe("callNotVisibleList", function() {
	
	var fun = window.freeStyla.testable.callNotVisibleList

	it("should check that 'notYetVisibleWgList' has item removed when 'callConfigCBs' returns true", function() {

		var inst = createNewInstance(true);

		var cnf = {
			wgName: "SiteHeader" // case shouldn't matter
			, loaded: false
			, cb:[]
		}

		inst.notYetVisibleWgList = [
			cnf
			, {
				wgName: "otherWidget1"
				, loaded: true
				, cb:[]
			}
			, {
				wgName: "otherWidget2"
				, loaded: true
				, cb:[]
			}
		];

		fun(inst.uid)

		// 'otherWidget#' configs should remain in the array because they are already loaded 
		expect(inst.notYetVisibleWgList.length).toEqual(2)

		// checks the remaining widgets are as intended
		expect(inst.notYetVisibleWgList[0].wgName).toBe('otherWidget1')
		expect(inst.notYetVisibleWgList[1].wgName).toBe('otherWidget2')

		// checks that the config marked as NOT loaded, is now loaded
		expect(cnf.loaded).toBe(true)
	})

	it("should check that 'notYetVisibleWgList' does NOT have item removed when 'callConfigCBs' returns false", function() {

		var inst = createNewInstance(true);

		var cnf = {
			wgName: "SiteHeader" // case shouldn't matter
			, loaded: true // set to be already loaded
			, cb:[]
		}

		inst.notYetVisibleWgList = [cnf];

		fun(inst.uid)

		// expect not to be removed because already loaded
		expect(inst.notYetVisibleWgList.length).toEqual(1)
	})

	it("should check that callbacks get called when 'callConfigCBs' returns true", function(done) {
		var inst = createNewInstance(true);

		var cnf = {
			wgName: "SiteHeader" // case shouldn't matter
			, loaded: false
			, cb:[done]
		}

		inst.notYetVisibleWgList = [ cnf ];

		fun(inst.uid)
	})
})

describe("triggerUnloadedCBs", function() {
	var fun = window.freeStyla.testable.triggerUnloadedCBs

	it("should expect true result when '*' is used for widget name and loaded is set to true, as it means 'callConfigCBs' has returned true", function() {
		var inst = createNewInstance(true);

		var cnf = {
			wgName: "*"
			, loaded: true
		}

		var isSuccess = fun(inst.uid, "SiteHeader", cnf)
		expect(isSuccess).toBe(true)
	})

	it("should expect true result when '*' is used for widget name and loaded is set to false, as it means 'callConfigCBs' has returned true", function() {
		var inst = createNewInstance(true);

		var cnf = {
			wgName: "*"
			, loaded: false
		}

		var isSuccess = fun(inst.uid, "SiteHeader", cnf)
		expect(isSuccess).toBe(true)
	})

	it("should expect false result when proper widget name is used and loaded is set to true, which means it has been ignored completely", function() {
		var inst = createNewInstance(true);

		var cnf = {
			wgName: "SiteHeader"
			, loaded: true
		}

		var isSuccess = fun(inst.uid, "SiteHeader", cnf)
		expect(isSuccess).toBe(false)
	})

	it("should expect true result when proper widget name is used and loaded is set to false, as it means 'callConfigCBs' has returned true", function() {
		var inst = createNewInstance(true);

		var cnf = {
			wgName: "SiteHeader"
			, loaded: false
		}

		var isSuccess = fun(inst.uid, "SiteHeader", cnf)
		expect(isSuccess).toBe(true)
	})
})


describe("triggerRegisteredCallbacks", function() {

	var fun = window.freeStyla.testable.triggerRegisteredCallbacks

	it("Registers a config, marks it as loaded and triggers callbacks on it", function(done) {
		
		var wgName = "SiteHeader";

		var cnf = {
            wgName: wgName
            , loaded: false
            , cb: [function(_wgName) {

            	// checks the callback returns the name of the widget
            	expect(_wgName).toBe(wgName)

            	// needs a timeout to check the loaded state has been changed, because it happens after the callback is triggered
            	setTimeout(function() {
					expect(cnf.loaded).toBe(true)
	            	done();
            	}, 0)
            }]
        }

        // Registers the widget
        window.freeStyla.prepare([cnf]);

		fun(createNewInstance(), wgName)
	})

	it("Creates a config, but doesn't register it, then after function has been called, checks it has been registered and marked as loaded", function() {
		var wgName = "SiteHeader";

		fun(createNewInstance(), wgName)

		// expects it to have been added so future late registrations trigger callbacks immediately.

		expect(window.freeStyla.glb.registeredWidgets.length).toEqual(1);

		var firstCnf = window.freeStyla.glb.registeredWidgets[0]
		expect(firstCnf.wgName).toBe(wgName);
		expect(firstCnf.loaded).toBe(true);
	})

	it("Creates a config with an $el that has a parent not yet loaded and expects it to have been added to the 'notYetVisibleWgList' on the instance", function() {
		var inst = createNewInstance(true);

		var parentEl = createEl()
		  , child = createEl(null, null, null, null, parentEl)

		// set the parent state to still loading
		parentEl.classList.add(clsLoading)

		var wgName = "SiteHeader"

		var cnf = {
			wgName: wgName
			, loaded: false
			, $el: $(child)
			, cb:[]
		}

		// Registers the widget
        window.freeStyla.prepare([cnf]);

        fun(inst.uid, wgName)

        expect(inst.notYetVisibleWgList).toBeDefined();
        expect(inst.notYetVisibleWgList.length).toEqual(1);
        expect(inst.notYetVisibleWgList[0].wgName).toBe(wgName);

        cleanupElement(parentEl)
        cleanupElement(child)
	})
})


describe("ensureStylesLoaded", function() {

	var fun = window.freeStyla.testable.ensureStylesLoaded

	it("should add element with ID of 'freestyla', if it does not already exist", function() {
		var id = window.freeStyla.vars.MAIN_ID;

		// clear it first, in case already exists
        document.body.removeChild(document.getElementById(id));

        var wg = createWg(null, "siteheader")
        fun($(wg), getCssPath("siteheader.css"), noop)

        expect(document.getElementById(id)).toBeDefined()
	})

	it("should load a css file that allows a widget to be visible and trigger a callback", function(done) {

		var wg = createWg(null, "siteheader")

		// make sure the visibility is hidden before loading the CSS file
		expect(getCompProp(wg, "visibility")).toBe("hidden");

		fun($(wg), getCssPath("siteheader.css"), function(isSuccess) {
			expect(isSuccess).toBe(true);
			expect(getCompProp(wg, "visibility")).toBe("visible");
			done()
		})
	})

	it("should fail to load a css file with an incorrect path, but still trigger the callback", function(done) {
		var wg = createWg(null, "siteheader")

		fun($(wg), "/a-css-file-with-wrong-path.css", function(isSuccess) {
			expect(isSuccess).toBe(false);
			expect(getCompProp(wg, "visibility")).toBe("hidden");
			done()
		})
	})
})

describe("startCSSLoading", function() {
	var fun = window.freeStyla.testable.startCSSLoading

	function setup(isLoaded) {
		var wgName = "siteheader"
		
		var $wg = $(createWg(null, wgName))

		// mark the widget as registered and loaded
		var cnf = {
			wgName: wgName
			, loaded: isLoaded
			, $el: $wg
			, cb:[]
		}

		// Registers the widget
        window.freeStyla.prepare([cnf], getCssPath());

        var inst = createNewInstance(true)
		return {
			wgName:wgName
			, $wg: $wg
			, inst: inst
			, uid: inst.uid
		}
	}

	it("should trigger a 'freestyla-css-loaded' event with 'isSuccess = true' if CSS file is already registered and loaded, returning true", function(done) {

		var obj = setup(true)
		$doc.on(window.freeStyla.vars.CSS_LOADED_EVT, function(evt, data) {
			expect(data.wgName).toBe(obj.wgName);
			expect(data.isSuccess).toBe(true);
			done()
		});

		var isAlreadyLoaded = fun(obj.uid, obj.wgName, obj.$wg)

		 // this tells us that the file will not be loaded again because it is already registered and loaded
		 expect(isAlreadyLoaded).toBe(true)
	})



	it("should load a widget CSS file and mark the registered widget as loaded", function(done) {

		var obj = setup(false)

		var isAlreadyLoaded = fun(obj.uid, obj.wgName, obj.$wg, false, function(wgName, isSuccess, cssFile) {

		  	// just checks args are correct
		  	expect(wgName).toBe(obj.wgName);
			expect(isSuccess).toBe(true);
			
			// then checks only 1 item in registered widget list and that it is loaded
			var regWg = window.freeStyla.glb.registeredWidgets
			expect(regWg.length).toEqual(1)
			expect(regWg[0].wgName).toBe(obj.wgName)
			expect(regWg[0].loaded).toBe(true)
			done()
		  })

		 // this tells us that the file will not be loaded again because it is already registered and loaded
		 expect(isAlreadyLoaded).toBe(false)
	})

	it("should load a widget css file and remove the loading state/class name from all elements that have it", function(done) {

		var obj = setup(false)
		var $wgs = $("."+obj.wgName)

	  	expect($wgs.length).toBe(1)
		expect($wgs.hasClass(clsLoading)).toBe(true)

		var isAlreadyLoaded = fun(obj.uid, obj.wgName, obj.$wg, false, function(wgName, isSuccess, cssFile) {
		  	expect($wgs.hasClass(clsLoading)).toBe(false)
			done()
		  })

		 // this tells us that the file will not be loaded again because it is already registered and loaded
		 expect(isAlreadyLoaded).toBe(false)
	})

	it("should load a temporary widget CSS file", function(done) {

		var obj = setup(false)
		  , useTempWg = true

		var isAlreadyLoaded = fun(obj.uid, obj.wgName, obj.$wg, useTempWg, function(wgName, isSuccess, cssFile) {
		  	// just checks args are correct
		  	expect(wgName).toBe(obj.wgName);
			expect(isSuccess).toBe(true);
			expect(cssFile).toBe(window.freeStyla.glb.buildDirCSS + "TEMP_"+obj.wgName+".css")
			done()
		})
		
		expect(isAlreadyLoaded).toBe(false)
	})
})


describe("removeCriticalCssLoad", function() {

	var fun = window.freeStyla.testable.removeCriticalCssLoad
	
	it("should mark a widget as loaded, then call this function to have the loading state removed on multiple instances of the widget", function() {
		var wgName = "siteheader"
		
		var wg1 = createWg(null, wgName)
		  , wg2 = createWg(null, wgName)

		// mark the widget as registered and loaded
		var cnf = {
			wgName: wgName
			, loaded: true
			, $el: null
			, cb:[]
		}

		// Registers the widget
        window.freeStyla.prepare([cnf]);

        var uid = createNewInstance()

        expect(wg1.classList).toContain(clsLoading)
        expect(wg2.classList).toContain(clsLoading)
        expect(fun(uid)).toBe(true)
        expect(wg1.classList).not.toContain(clsLoading)
        expect(wg2.classList).not.toContain(clsLoading)
	})
})

describe("checkLoadCssAttr", function() {

	var fun = window.freeStyla.testable.checkLoadCssAttr

	it("should return a jQuery element with 'data-load-wg' attribute containing a single matching widget name event with uppercase characters in it", function() {
		
		var id = getUID()
		  , wgName = "siteHeader"// deliberate uppercase

		// element does not have to be a widget
		var el = createEl(id)
		el.setAttribute("data-load-wg", wgName)

		// jQuery element should be returned
		var $el = fun(wgName)
		expect( $el ).toBeDefined();
		expect( $el.length ).toEqual(1)
		expect( $el.attr("id") ).toBe(id)
	})

	it("should return a jQuery element with 'data-load-wg' attribute containing a single matching widget when multiple exist in attribute", function() {
		
		var id = getUID()
		  , wgName = "siteHeader"// deliberate uppercase

		// element does not have to be a widget
		var el = createEl(id)
		el.setAttribute("data-load-wg", "sitefooter " + wgName )

		// jQuery element should be returned
		var $el = fun(wgName)
		expect( $el ).toBeDefined()
		expect( $el.length ).toEqual(1)
		expect( $el.attr("id") ).toBe(id)
	})

	it("should falsy if no attributes match", function() {
		var $el = fun("siteheader")
		expect( $el ).toBeFalsy()
	})
})


describe("validateJQueryEl", function() {
	var fun = window.freeStyla.testable.validateJQueryEl

	it("should pass if a valid jQuery element is supplied", function() {
		expect(fun($(createEl()))).toBe(true)
	})

	it("should fail if a normal HTML element is supplied", function() {
		expect(fun(createEl())).toBe(false)
	})

	it("should fail if a jQuery element is supplied that has a length of zero", function() {
		var $invalidEl = $(".something-that-doesnt-exist")
		expect(fun($invalidEl)).toBe(false)
	})
})
