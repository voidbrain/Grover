(function() {

	"use strict";


			// Revolution Slider Initialize
			if($(".fullwidthbanner").get(0)) {
				var rev = $(".fullwidthbanner").revolution({
					delay:5000,
					startheight:713,
					startwidth:1280,

					hideThumbs:10,

					thumbWidth:100,
					thumbHeight:50,
					thumbAmount:5,

					navigationType:"both",
					navigationArrows:"verticalcentered",

					touchenabled:"on",
					onHoverStop:"on",

					navOffsetHorizontal:0,
					navOffsetVertical:20,

					stopAtSlide:-1,
					stopAfterLoops:-1,

					shadow:0,
					fullWidth:"on"
				});

				$("#revolutionSlider .tp-caption").on("mousedown", function(e) {
					e.preventDefault();
					rev.revpause();
					return false;
				});

			}

})();


(function() {

	"use strict";


			// Revolution Slider Initialize
			if($(".fullwidthbanner1").get(0)) {
				var rev = $(".fullwidthbanner1").revolution({
					delay:5000,
					startheight:550,
					startwidth:1280,

					hideThumbs:10,

					thumbWidth:100,
					thumbHeight:50,
					thumbAmount:5,

					navigationType:"none",
					navigationArrows:"verticalcentered",

					touchenabled:"on",
					onHoverStop:"on",

					navOffsetHorizontal:0,
					navOffsetVertical:20,

					stopAtSlide:-1,
					stopAfterLoops:-1,

					shadow:0,
					fullWidth:"on"
				});

				$("#revolutionSlider .tp-caption").on("mousedown", function(e) {
					e.preventDefault();
					rev.revpause();
					return false;
				});

			}

})();


(function() {

	"use strict";


			// Revolution Slider Initialize
			if($(".fullwidthbanner2").get(0)) {
				var rev = $(".fullwidthbanner2").revolution({
					delay:9000,
					startheight:536,
					startwidth:1140,

					hideThumbs:10,

					thumbWidth:100,
					thumbHeight:50,
					thumbAmount:5,

					navigationType:"both",
					navigationArrows:"verticalcentered",

					touchenabled:"on",
					onHoverStop:"on",

					navOffsetHorizontal:0,
					navOffsetVertical:20,

					stopAtSlide:-1,
					stopAfterLoops:-1,

					shadow:0,
					fullWidth:"on"
				});

				$("#revolutionSlider .tp-caption").on("mousedown", function(e) {
					e.preventDefault();
					rev.revpause();
					return false;
				});

			}

})();



(function() {

	"use strict";


			// Revolution Slider Initialize
			if($(".fullwidthbanner3").get(0)) {
				var rev = $(".fullwidthbanner3").revolution({
					delay:15000,
					startwidth:1170,
					startheight:500,

					hideThumbs:10,

					thumbWidth:100,
					thumbHeight:50,
					thumbAmount:5,

					navigationType:"both",
					navigationArrows:"verticalcentered",

					touchenabled:"on",
					onHoverStop:"on",

					navOffsetHorizontal:0,
					navOffsetVertical:20,

					stopAtSlide:-1,
					stopAfterLoops:-1,

					shadow:0,
					fullWidth:"off",
					fullScreen:"on",
					fullScreenOffsetContainer: ""
				});

				$("#revolutionSlider .tp-caption").on("mousedown", function(e) {
					e.preventDefault();
					rev.revpause();
					return false;
				});

			}

})();



