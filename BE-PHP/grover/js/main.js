$(".fullwidthbanner-container ul").css("opacity", "1");
$(".fullwidthbanner-container ul").css("height", "100%");

// TOP EXPAND CONTENT
$(document).ready(function() {
	$(".topbar-btn").click(function() {
		$(".topbar").slideToggle("500");
		$(this).toggleClass("active");
	});
});
$('.ftop a').click(function() {
	$('html, body').animate({
		scrollTop: 0
	}, 800);
	return false;
});
$('.ftop1 a').click(function() {
	$('html, body').animate({
		scrollTop: 0
	}, 800);
	return false;
});

// TOPBAR SELECT CUSTOM

$(document).ready(function() {
	$('.select-currency').fancySelect();
	$(".datepicker").datepicker({ dateFormat: "dd-mm-yy", minDate: 2, });
});

$(document).ready(function() {
	$('.select-lang').fancySelect();
});

$(document).ready(function() {
	$('#select-lang li:nth-child(1)').click(function(){
	    $('#select-lang .trigger').css('background', 'url(images/icon/flags/gb.png) no-repeat left center');
	});
});

$(document).ready(function() {
	$('#select-lang li:nth-child(2)').click(function(){
	    $('#select-lang .trigger').css('background', 'url(images/icon/flags/it.png) no-repeat left center');
	});
});

$(document).ready(function() {
	$('#select-lang li:nth-child(3)').click(function(){
	    $('#select-lang .trigger').css('background', 'url(images/icon/flags/es.png) no-repeat left center');
	});
});

$(document).ready(function() {
	$('#select-lang li:nth-child(4)').click(function(){
	    $('#select-lang .trigger').css('background', 'url(images/icon/flags/fr.png) no-repeat left center');
	});
});

$(document).ready(function() {
	$('#select-lang li:nth-child(5)').click(function(){
	    $('#select-lang .trigger').css('background', 'url(images/icon/flags/de.png) no-repeat left center');
	});
});

// OWL CAROUSEL
$(document).ready(function() {
	$("#m-slider").owlCarousel({
		navigation: true, // Show next and prev buttons
		slideSpeed: 300,
		pagination: false,
		paginationSpeed: 400,
		singleItem: true
			// "singleItem:true" is a shortcut for:
			// items : 1,
			// itemsDesktop : false,
			// itemsDesktopSmall : false,
			// itemsTablet: false,
			// itemsMobile : false
	});
});

$(document).ready(function() {
	$("#m-slider2").owlCarousel({
		navigation: false, // Show next and prev buttons
		slideSpeed: 300,
		pagination: true,
		paginationSpeed: 400,
		singleItem: true
			// "singleItem:true" is a shortcut for:
			// items : 1,
			// itemsDesktop : false,
			// itemsDesktopSmall : false,
			// itemsTablet: false,
			// itemsMobile : false
	});
});

$(document).ready(function() {
	var owl = $("#p-slider");
	owl.owlCarousel({
		itemsCustom: [
			[0, 1],
			[450, 2],
			[600, 3],
			[700, 3],
			[1000, 3],
			[1200, 4],
			[1400, 4],
			[1600, 4]
		],
		pagination: false,
		navigation: true
	});
});

$(document).ready(function() {
	var owl = $("#p-slider1");
	owl.owlCarousel({
		itemsCustom: [
			[0, 1],
			[450, 2],
			[600, 3],
			[700, 3],
			[1000, 3],
			[1200, 4],
			[1400, 4],
			[1600, 4]
		],
		pagination: false,
		navigation: true
	});
});

$(document).ready(function() {
	var owl = $("#owl-fblog");
	owl.owlCarousel({
		itemsCustom: [
			[0, 1],
			[450, 1],
			[450, 1],
			[600, 1],
			[700, 1],
			[1000, 2],
			[1200, 2],
			[1400, 2],
			[1600, 2]
		],
		pagination: false,
		navigation: true
	});
});

$(document).ready(function() {
	var owl = $("#owl-fblog1");
	owl.owlCarousel({
		itemsCustom: [
			[0, 1],
			[450, 2],
			[600, 2],
			[700, 2],
			[1000, 2],
			[1200, 2],
			[1400, 2],
			[1600, 2]
		],
		pagination: false,
		navigation: true
	});
});

$(document).ready(function() {
	$("#owl-testimonial").owlCarousel({
		navigation: false, // Show next and prev buttons
		slideSpeed: 300,
		pagination: false,
		paginationSpeed: 400,
		navigation: true,
		singleItem: true
			// "singleItem:true" is a shortcut for:
			// items : 1,
			// itemsDesktop : false,
			// itemsDesktopSmall : false,
			// itemsTablet: false,
			// itemsMobile : false
	});
});

$(document).ready(function() {
	$("#slider-style3").owlCarousel({
		navigation: true, // Show next and prev buttons
		slideSpeed: 300,
		pagination: false,
		paginationSpeed: 400,
		singleItem: true
			// "singleItem:true" is a shortcut for:
			// items : 1,
			// itemsDesktop : false,
			// itemsDesktopSmall : false,
			// itemsTablet: false,
			// itemsMobile : false
	});
});

$(document).ready(function() {
	$("#quote-slider").owlCarousel({
		navigation: true, // Show next and prev buttons
		slideSpeed: 300,
		pagination: false,
		paginationSpeed: 400,
		singleItem: true
			// "singleItem:true" is a shortcut for:
			// items : 1,
			// itemsDesktop : false,
			// itemsDesktopSmall : false,
			// itemsTablet: false,
			// itemsMobile : false
	});
});

$(document).ready(function() {
	var owl = $("#related-projects");
	owl.owlCarousel({
		itemsCustom: [
			[0, 1],
			[450, 2],
			[600, 3],
			[700, 3],
			[940, 4],
			[1200, 4],
			[1400, 4],
			[1600, 4]
		],
		pagination: false,
		navigation: true
	});
});

$(document).ready(function() {
	var owl = $("#related-posts");
	owl.owlCarousel({
		itemsCustom: [
			[0, 1],
			[450, 2],
			[600, 2],
			[700, 2],
			[1000, 3],
			[1200, 3],
			[1400, 3],
			[1600, 3]
		],
		pagination: false,
		navigation: true
	});
});

$(document).ready(function() {
	$("#t-slider").owlCarousel({
		navigation: true, // Show next and prev buttons
		slideSpeed: 300,
		pagination: false,
		paginationSpeed: 400,
		singleItem: true
			// "singleItem:true" is a shortcut for:
			// items : 1,
			// itemsDesktop : false,
			// itemsDesktopSmall : false,
			// itemsTablet: false,
			// itemsMobile : false
	});
});

$(document).ready(function() {
	var owl = $("#owl-fproducts");
	owl.owlCarousel({
		itemsCustom: [
			[0, 1],
			[450, 1],
			[600, 1],
			[700, 1],
			[1000, 2],
			[1200, 2],
			[1400, 2],
			[1600, 2]
		],
		pagination: false,
		navigation: true
	});
});

$(document).ready(function() {
	$("#slider-style1").owlCarousel({
		navigation: true, // Show next and prev buttons
		slideSpeed: 300,
		pagination: false,
		paginationSpeed: 400,
		singleItem: true
			// "singleItem:true" is a shortcut for:
			// items : 1,
			// itemsDesktop : false,
			// itemsDesktopSmall : false,
			// itemsTablet: false,
			// itemsMobile : false
	});
});

$(document).ready(function() {
	$("#slider-style2").owlCarousel({
		navigation: true, // Show next and prev buttons
		slideSpeed: 300,
		pagination: false,
		paginationSpeed: 400,
		singleItem: true
			// "singleItem:true" is a shortcut for:
			// items : 1,
			// itemsDesktop : false,
			// itemsDesktopSmall : false,
			// itemsTablet: false,
			// itemsMobile : false
	});
});

$(document).ready(function() {
	$("#blog-slider").owlCarousel({
		navigation: true, // Show next and prev buttons
		slideSpeed: 300,
		pagination: false,
		paginationSpeed: 400,
		singleItem: true
			// "singleItem:true" is a shortcut for:
			// items : 1,
			// itemsDesktop : false,
			// itemsDesktopSmall : false,
			// itemsTablet: false,
			// itemsMobile : false
	});
});

$(document).ready(function() {
	$("#cat-sslider").owlCarousel({
		navigation : true, // Show next and prev buttons
		slideSpeed : 300,
		pagination : false,
		singleItem:true
	});
});

$(document).ready(function() {
    var owl = $("#owl-clients");
    owl.owlCarousel({
    itemsCustom : [
    [0, 3],
    [450, 4],
    [600, 4],
    [700, 4],
    [1000, 5],
    [1200, 6],
    [1400, 6],
    [1600, 6]
    ],
    navigation : true,
    pagination : false
    });
});


// JQUERY TABS
$(document).ready(function() {
	$('#tabs .tab-content').fadeOut(500);
	$('#tabs .tab-content:first').fadeIn(500);
	$('#tabs .tabs-head li:first').addClass('active');
	$('#tabs .tabs-head li a').click(function() {
		$('#tabs .tabs-head li').removeClass('active');
		$(this).parent().addClass('active');
		var currentTab = $(this).attr('href');
		$('#tabs .tab-content').fadeOut(500);
		$(currentTab).fadeIn(500);
		return false;
	});
});

(function() {
	$(".close").one('click', function(e) {
		e.preventDefault();
		$(this).parent().hide();
	});
})(jQuery);

// CONTENT ALIGN JQUERY
$(function() {
	$('.valignmiddle').each(function() {
		$(this).parent().css('position', 'relative');
		$(this).css('position', 'absolute');
		$(this).css('top', '50%');
		$(this).css('left', '0px');
		$(this).css('width', '100%');
	});
	$(window).resize(function() {
		clearTimeout(this.id);
		this.id = setTimeout(mobileSize, 500);
	});

	function mobileSize() {
		sizes();
	}
	$(window).load(function() {
		sizes();
	});

	function sizes() {
		var width = $(window).width();
		if (width < 640) {
			var thisheight = Math.round(parseInt($('.valignmiddle').outerHeight()) / 2);
			$('.valignmiddle').css('margin-top', '-' + thisheight + 'px');
			if (parseInt($('.valignmiddle').outerHeight()) > parseInt($('.valignmiddle').parent().outerHeight())) {
				$('.valignmiddle').parent().outerHeight($('.valignmiddle').outerHeight());
			}
		} else if (width > 640 && width < 966) {
			var thisheight = Math.round(parseInt($('.valignmiddle').outerHeight()) / 2);
			$('.valignmiddle').css('margin-top', '-' + thisheight + 'px');
			if (parseInt($('.valignmiddle').outerHeight()) > parseInt($('.valignmiddle').parent().outerHeight())) {
				$('.valignmiddle').parent().outerHeight($('.valignmiddle').outerHeight());
			}
		} else if (width > 966) {
			var thisheight = Math.round(parseInt($('.valignmiddle').outerHeight()) / 2);
			$('.valignmiddle').css('margin-top', '-' + thisheight + 'px');
			if (parseInt($('.valignmiddle').outerHeight()) > parseInt($('.valignmiddle').parent().outerHeight())) {
				$('.valignmiddle').parent().outerHeight($('.valignmiddle').outerHeight());
			}
		}
	}
});

// SKILLS
jQuery(document).ready(function($) {
	"use strict";
	$('.skills-wrap').appear(function() {
		$('.skill1').css('width', '85%')
		$('.skill2').css('width', '73%')
		$('.skill3').css('width', '92%')
		$('.skill4').css('width', '69%')
		$('.skill5').css('width', '87%')
	}, {
		accX: 0,
		accY: -200
	});
});

// JQUERY TOGGLE
jQuery(document).ready(function($) {
	$('.toggle1').each(function() {
		$(this).find('.toggle-content1').show();
	});
	$('.toggle1 a.toggle-trigger1').click(function() {
		var el = $(this),
			parent = el.closest('.toggle1');
		if (el.hasClass('active')) {
			parent.find('.toggle-content1').slideToggle();
			el.removeClass('active');
		} else {
			parent.find('.toggle-content1').slideToggle();
			el.addClass('active');
		}
		return false;
	});
});

jQuery(document).ready(function($) {
	$('.toggle').each(function() {
		$(this).find('.toggle-content').hide();
	});
	$('.toggle a.toggle-trigger').click(function() {
		var el = $(this),
			parent = el.closest('.toggle');
		if (el.hasClass('active')) {
			parent.find('.toggle-content').slideToggle();
			el.removeClass('active');
		} else {
			parent.find('.toggle-content').slideToggle();
			el.addClass('active');
		}
		return false;
	});
});

jQuery(document).ready(function($) {
	$('.toggle2').each(function() {
		$(this).find('.toggle-content2').show();
	});
	$('.toggle2 a.toggle-trigger2').click(function() {
		var el = $(this),
			parent = el.closest('.toggle2');
		if (el.hasClass('active')) {
			parent.find('.toggle-content2').slideToggle();
			el.removeClass('active');
		} else {
			parent.find('.toggle-content2').slideToggle();
			el.addClass('active');
		}
		return false;
	});
});

// RANGE SLIDER
$("#sliderRange").slider({
	range: true,
	min: 0,
	max: 1000,
	step: 1,
	values: [150, 750],
	slide: function(event, ui) {
		var price1 = ui.values[0];
		var price2 = ui.values[1];
		$("#price1").val("$" + price1);
		$("#price2").val("$" + price2);
	}
});

$('#price1').bind('keyup', function() {
	var from = $(this).val();
	var to = $('#price2').val();
	$('#sliderRange').slider('option', 'values', [from,
		to
	]);
});

$('#price2').bind('keyup', function() {
	var from = $('#price1').val();
	var to = $(this).val();
	$('#sliderRange').slider('option', 'values', [from,
		to
	]);
});

// MIXITUP PORTFOLIO
jQuery(document).ready(function($) {
	$('#portfolio').mixitup({
		targetSelector: '.items',
		transitionSpeed: 450
	});
});

// GOOGLE MAP
$(function() {
	// var map = new GMaps({
	// 	el: "#map",
	// 	lat: 40.714353,
	// 	lng: -74.005973,
	// 	zoom: 15,
	// 	zoomControl: false,
	// 	zoomControlOpt: {
	// 		style: "BIG",
	// 		position: "TOP_LEFT"
	// 	},
	// 	panControl: false,
	// 	streetViewControl: false,
	// 	mapTypeControl: false,
	// 	overviewMapControl: false
	// });
	// var styles = [{
	// 	stylers: [{
	// 		hue: "#00ffe6"
	// 	}, {
	// 		saturation: -100
	// 	}]
	// }];
	// map.addStyle({
	// 	styledMapName: "Styled Map",
	// 	styles: styles,
	// 	mapTypeId: "map_style"
	// });
	// map.setStyle("map_style");
	// map.addMarker({
	// 	lat: 40.714353,
	// 	lng: -74.005973,
	// 	icon: "images/marker.png"
	// });
});

// FANCYBOX LIGHTBOX
$(".img_01").elevateZoom({
	gallery: 'gal1',
	cursor: 'pointer',
	galleryActiveClass: 'active',
	imageCrossfade: true,
	loadingIcon: 'http://www.elevateweb.co.uk/spinner.gif'
});

$(".img_01").bind("click", function(e) {
	var ez = $('.img_01').data('elevateZoom');
	$.fancybox(ez.getGalleryList());
	return false;
});

// ACCORDION
var tabs = $('#tabs-titles li'); //grab tabs
var contents = $('#tabs-contents li'); //grab contents
tabs.bind('click', function() {
	contents.hide(); //hide all contents
	tabs.removeClass('current'); //remove 'current' classes
	$(contents[$(this).index()]).show(); //show tab content that matches tab title index
	$(this).addClass('current'); //add current class on clicked tab title
});

// FLICKR
$('#flickr').jflickrfeed({
	limit: 8,
	qstrings: {
		id: '52617155@N08'
	},
	itemTemplate: '<li><a href="{{image_b}}"><img src="{{image_s}}" alt="{{title}}" /></a></li>'
});

$(document).ready(function() {
	$("#first").rlAccordion();
});

// FLEXSLIDER
$(window).load(function() {
	$('#ps-slider').flexslider({
		animation: "slide",
		manualControls: ".flex-nav ul li",
		controlnav: false,
		directionNav: false
	});
});

// FLEXSLIDER - PRODUCT
$(window).load(function() {
	$('#pi-slider').flexslider({
		animation: "slide",
		manualControls: ".pi-slider a",
		controlnav: false,
		directionNav: false,
		slideshow: false
	});
});

// TOGGLE MOBILE MENU
(function($) {
	$(document).ready(function() {
		$('#cssmenu li.has-sub>a').on('click', function(e) {
			var element = $(this).parent('li');
			if (element.children('ul').length > 0) {
				e.preventDefault();
			};
			if (element.hasClass('open')) {
				element.removeClass('open');
				element.find('li').removeClass('open');
				element.find('ul').slideUp();
			} else {
				element.addClass('open');
				element.children('ul').slideDown();
				element.siblings('li').children('ul').slideUp();
				element.siblings('li').removeClass('open');
				element.siblings('li').find('li').removeClass('open');
				element.siblings('li').find('ul').slideUp();
			}
		});
		$('#cssmenu>ul>li.has-sub>a').append('<span class="holder"></span>');
		(function getColor() {
			var r, g, b;
			var textColor = $('#cssmenu').css('color');
			textColor = textColor.slice(4);
			r = textColor.slice(0, textColor.indexOf(','));
			textColor = textColor.slice(textColor.indexOf(' ') + 1);
			g = textColor.slice(0, textColor.indexOf(','));
			textColor = textColor.slice(textColor.indexOf(' ') + 1);
			b = textColor.slice(0, textColor.indexOf(')'));
			var l = rgbToHsl(r, g, b);
			if (l > 0.7) {
				$('#cssmenu>ul>li>a').css('text-shadow', '0 1px 1px rgba(0, 0, 0, .35)');
				$('#cssmenu>ul>li>a>span').css('border-color', 'rgba(0, 0, 0, .35)');
			} else {
				$('#cssmenu>ul>li>a').css('text-shadow', '0 1px 0 rgba(255, 255, 255, .35)');
				$('#cssmenu>ul>li>a>span').css('border-color', 'rgba(255, 255, 255, .35)');
			}
		})();

		function rgbToHsl(r, g, b) {
			r /= 255, g /= 255, b /= 255;
			var max = Math.max(r, g, b),
				min = Math.min(r, g, b);
			var h, s, l = (max + min) / 2;
			if (max == min) {
				h = s = 0;
			} else {
				var d = max - min;
				s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
				switch (max) {
					case r:
						h = (g - b) / d + (g < b ? 6 : 0);
						break;
					case g:
						h = (b - r) / d + 2;
						break;
					case b:
						h = (r - g) / d + 4;
						break;
				}
				h /= 6;
			}
			return l;
		}
	});
})(jQuery);
