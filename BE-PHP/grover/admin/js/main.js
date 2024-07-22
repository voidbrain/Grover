// JavaScript Document
	
var createCookie = function(name, value, days) {
    var expires;
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toGMTString();
    }
    else {
        expires = "";
    }
    document.cookie = name + "=" + value + expires + "; path=/";
}

var getCookie = function (c_name) {
    if (document.cookie.length > 0) {
        c_start = document.cookie.indexOf(c_name + "=");
        if (c_start != -1) {
            c_start = c_start + c_name.length + 1;
            c_end = document.cookie.indexOf(";", c_start);
            if (c_end == -1) {
                c_end = document.cookie.length;
            }
            return unescape(document.cookie.substring(c_start, c_end));
        }
    }
    return "";
}


//ridimensiona il facncy box
var ridi = function(){
	$.fancybox.update();
	var t = setTimeout(function() { ridi()}, 800);
}

$(function(){

	/*if($('.pop_content').length>0){
		ridi();
	}*/

	//SELEZIONA/DESELEZIONA figli di check box list
	$('ul.allseldes input[type=checkbox]').change(function(){
		if($(this).attr('checked')){
			$(this).parents('ul').each(function(){
				$(this).closest('li').children('label').children('input[type=checkbox]').attr('checked', true);
			});
		}else{
			$(this).closest('li').children('ul').find('li').each(function(){
				$(this).children('label').children('input[type=checkbox]').attr('checked', false);
			});
		}
	});

//==================================================================
//SLIDER BAR (barra per settaggio valori collegata a un campo input)


	updateBar = new $.Deferred();

	var slideBar = {
		init : function(){
			var dis = this;
			dis.cache();
			dis.createSlide();
			dis.wait = setTimeout(function(){});
			dis.itemsInput.on('keyup', function(){
				$.proxy(dis.changeInput, this)()
			});
		},
		cache : function(){
			this.itemsSlide = $(".slider-control:not(.disabled)");
			this.itemsInput = $(".slider-input");
			this.itemsSlideDis = $(".slider-control.disabled");
		},
		createSlide : function(){
			var dis = this;
			this.itemsSlide.each(function() {
				var item = $(this);
				var value = parseInt( item.text(), 10 );
				item.empty().slider({
					value: value,
					range: "min",
					animate: true,
					min: item.data('min'),
					max: item.data('max'),
					orientation: "horizontal",
					change: function(){ dis.updateInput(item) },
					slide: function(){ dis.updateInput(item) },
				});
			});
			this.itemsSlideDis.each(function() {
				var item = $(this);
				var value = parseInt( item.text(), 10 );
				item.empty().slider({
					value: value,
					range: "min",
					min: item.data('min'),
					max: item.data('max'),
					orientation: "horizontal"
				});
				//Jquery Ui si droga. Nuova riga nuova speranza
				item.slider({disabled: true});
			});
		},
		updateInput : function(item){

			clearTimeout(this.wait);

			this.wait = setTimeout(function(){
				var s_value = item.slider( "option", "value" );
				var iddi = item.attr('data-id');

				$('#'+iddi).val(s_value);
				updateBar.notify($('#'+iddi));
			},10);

		},
		changeInput : function(){
			var dis = $(this);
			var control = $(".slider-control[data-id=" + dis.attr('id') + ']');

			if(dis.val()>=control.data('max')){
				var dis_value = control.data('max');
			}else if (dis.val()<=control.data('min') && dis.val() != ""){
				var dis_value = control.data('min');
			}else{
				var dis_value = dis.val();
			}

			control.slider({ 
				animate: true,
				value: dis_value
			});

			dis.val(dis_value);
			updateBar.notify(dis);
		}
	};

slideBar.init();


/*	//SLIDER BAR (barra per settaggio valori collegata a un campo input)
	$(".slider-control").each(function() {
		var dis = $(this);
		// read initial values from markup and remove that
		var value = parseInt( dis.text(), 10 );
		dis.empty().slider({
			value: value,
			range: "min",
			animate: true,
			min: dis.data('min'),
			max: dis.data('max'),
			orientation: "horizontal",
			change: function(event, ui){
				var s_value = dis.slider( "option", "value" );
				var iddi = dis.attr('data-id');
				$('#'+iddi).val(s_value);
			},
			slide: function(event, ui){
				var s_value = dis.slider( "option", "value" );
				var iddi = dis.attr('data-id');
				$('#'+iddi).val(s_value);
			}
		});
	});

	$(".slider-input").keyup(function(){
		var dis = $(this);
		var control = $(".slider-control[data-id=" + dis.attr('id') + ']');

		if(dis.val()>=control.data('max')){
			var dis_value = control.data('max');
		}else if (dis.val()<=control.data('min') && dis.val() != ""){
			var dis_value = control.data('min');
		}else{
			var dis_value = dis.val();
		}
		
		control.slider({ 
			animate: true,
			value: dis_value
		});
		dis.val(dis_value);
	});*/
	
//VARI FANCYBOX CON DIMENSIONI PRE IMPOSTATE
	$("a.fancynormal").fancybox({
		'speedIn': 50,
		'speedOut': 120,
		'showNavArrows':false,
		'hideOnOverlayClick': false,
		'enableEscapeButton' : true
	});

	$("a.fancybox").fancybox({
		'speedIn': 50,
		'speedOut': 120,
		'width': 640,
		'height': '95%',	
		'showNavArrows':false,
		'centerOnScroll': true,
		'hideOnOverlayClick': false,
		'enableEscapeButton' : true,
		'type': 'iframe',
		'padding' :0,
		'afterClose': function(){window.location=window.location;}
	});

	$("a.fancysmall").fancybox({
		'speedIn': 50,
		'speedOut': 70,
		'width': 600,
		'showNavArrows':false,
		'centerOnScroll': true,
		'hideOnOverlayClick': true,
		'enableEscapeButton' : true,
		'type': 'iframe',
		'padding' :0,
		'autoResize ' : true,
		'arrows' : false,
		'afterClose': function(){window.location=window.location;}
	});

	$("a.fancymedium").fancybox({
		'speedIn': 50,
		'speedOut': 70,
		'width': '60%',
		'minHeight': '80%',	
		'showNavArrows':false,
		'centerOnScroll': true,
		'hideOnOverlayClick': true,
		'enableEscapeButton' : true,
		'type': 'iframe',
		'padding' :0,
		'autoResize ' : true,
		'arrows' : false,
		'afterClose': function(){window.location=window.location;}
	});

	$("a.fancymedium_nr").fancybox({
		'speedIn': 50,
		'speedOut': 70,
		'width': '60%',
		'minHeight': '80%',	
		'showNavArrows':false,
		'centerOnScroll': true,
		'hideOnOverlayClick': true,
		'enableEscapeButton' : true,
		'type': 'iframe',
		'padding' :0,
		'autoResize ' : true,
		'arrows' : false
	});

	$("a.fancymedium_nr_large").fancybox({
		'speedIn': 50,
		'speedOut': 70,
		'width': '95%',
		'minHeight': '80%',	
		'showNavArrows':false,
		'centerOnScroll': true,
		'hideOnOverlayClick': true,
		'enableEscapeButton' : true,
		'type': 'iframe',
		'padding' :0,
		'autoResize ' : true,
		'arrows' : false,
		'scrollOutside' : false
	});



	$("a.fancylarge").fancybox({
		'speedIn': 50,
		'speedOut': 70,
		'width': '90%',
		'height': '95%',	
		'minHeight': '95%',	
		'showNavArrows':false,
		'centerOnScroll': true,
		'hideOnOverlayClick': true,
		'enableEscapeButton' : true,
		'type': 'iframe',
		'padding' :0,
		'afterClose': function(){window.location=window.location;}, 
		//'onComplete': function(){$.fancybox.resize}		
	});

	$('#fancybox-content-holder').on('resize',function(){
		var height = $('#fancybox-content-holder').height() + 25;
		$('#fancybox-wrap').height(height);
	});

	//IMPOSTO IL DATEPICKER AGLI INPUT CON CLASSE .datepicker
	$.datepicker.setDefaults($.datepicker.regional["it"]);
	$(".datepicker" ).datepicker({ dateFormat: 'dd-mm-yy'});
	$(".datepicker_my" ).datepicker({ 
		dateFormat: 'dd-mm-yy', 
		changeMonth: true, 
		changeYear: true,
		yearRange: '1930:n'
	});

	$(".daterange" ).each(function(){
		var min = $(this).data('min');
		var max = $(this).data('max');
		$(this).datepicker({ 
					dateFormat: 'dd-mm-yy',
					minDate: min,
					maxDate: max
				});

	});


	$(".daterange_start" ).each(function(){
		var min = $(this).data('min');
		//var max = $(this).data('max');
		$(this).datepicker({ 
					dateFormat: 'dd-mm-yy',
					minDate: min
				});

	});


	//FORM DI VALIDAZIONE IN JS
	$(".validator").validationEngine();
	$(".validator_left").validationEngine({
		promptPosition : 'topLeft'
	});

	//Pretty button
	$(".prettyButton").buttonset();

	$('.caldispo').click(function(e){
		e.preventDefault();
		$('#myModal').modal('show');
	});

	$("#selectWeek").on("change",function(){
		var url = window.location.href;    
		var index = 0;
		if (url.indexOf('?') > -1){
			newURL = url.substring(0, index);
		}
		window.location.href = newURL += '?sett=' + $(this).find("option:selected" ).val();
	});
	//ordinamento liste
	/*var options_list = {
			valueNames: [ 'title' ],
			page: 15,
			plugins: [
				[ 'paging', { 
				  pagingClass: "topPaging",
				  innerWindow: 1,
        			left: 2,
        			right: 2
				} ]
			]
        };*/
	
	//ORDINAMENTO
	//Ordinamento record (passare tabella da ordinare e assicurarsi di avere la colonna posizione nella tabella nel db) (N.B. Gli id della lista devono essere listItem_{id} )
	if($('.sorting').length>0){
		$(".sorting").sortable({
			connectWith: '.sorting',
			handle : '.handle',
			forceHelperSize : false,
			forcePlaceholderSize : false,
			update : function () {
				var order = $(this).sortable('serialize');
				$.ajax(jsSetting['pathadmin']+"common/sort.php?modulo="+jsSetting['modulo']+"&id_rif="+$(this).attr('data-id_rif')+"&rif="+$(this).attr('data-rif')+"&table="+$(this).attr('data-table')+"&"+order+"&cache=" + (new Date()).getTime());
			}
		});
	}
	if($('.simple_sorting').length>0){
		$(".simple_sorting").sortable({
			handle : '.handle',
			forceHelperSize : false,
			forcePlaceholderSize : false,
			update : function () {
				var order = $(this).sortable('serialize');
				$.ajax(jsSetting['pathadmin']+"common/sort.php?modulo="+jsSetting['modulo']+"&table="+$(this).attr('data-table')+"&"+order+"&cache=" + (new Date()).getTime());
			}
		});
	}

	// Fade OUT feedback add_mod
	if($('.feedback_add_mod').length > 0){

		setTimeout(function(){
			$('.feedback_add_mod').fadeOut(1000);
		}, 7000);
	}
	
	//ORDINAMENTO MULTIPLO + GESTIONE TENDINE
	//Ordinamento multiplo(passare tabella da ordinare e assicurarsi di avere la colonna posizione, parent e depth nella tabella nel db) (N.B. Gli id della lista devono essere list_{id} )
	if($('.nestedSortable').length > 0){

		jsSetting['maxLevels'] = $('.nestedSortable').attr('data-livelpag');

		var openItems = JSON.parse( localStorage.getItem('nestedSortable_'+window.location.pathname) );
		if (typeof openItems == 'undefined' || openItems == null){
			var openItems = new Array();
		}

		function hide_toogle (){

			$('.togleSlide').show();

			$('.nestedSortable li').each( function() {

				var iddi = $(this).attr('id');

				if($('#'+iddi+' li').length==0){
					$('#'+iddi+' .togleSlide').hide();
				}
		   });

		   $('.nestedSortable .aggiungi').show();

		   var li_child ='';

		   for(i=0; i < jsSetting['maxLevels']; i++){
			   li_child += ' li';
		   }

		   $('.nestedSortable '+li_child+' .aggiungi').hide();

		}

		$('.nestedSortable ol:first-child').nestedSortable({
			disableNesting: 'no-nest',
			forcePlaceholderSize: true,
			handle: '.handle',
			helper: 'clone',
			items: 'li',
			maxLevels: jsSetting['maxLevels'],
			opacity: .6,
			placeholder: 'placeholder',
			revert: 250,
			tabSize: 25,
			tolerance: 'pointer',
			toleranceElement: '> div',
			update: function () {
				var list = $(this).nestedSortable('toArray');
				hide_toogle ();			
				$.post(
					jsSetting['pathadmin']+'common/sort_nested.php',
					{ update_sql: 'ok',modulo: jsSetting['modulo'], list: list, table: $(this).attr('data-table') },
					function(data){
						$("#result").hide().html(data).fadeIn('slow')
					},
					"html"
				);
			}
		});
	
		hide_toogle ();
		
		$('.togleSlide').on('click', function(){

			var valid = $(this).attr('data-id');
			$('#list_'+valid+'>ol').toggle();

			if($(this).children('i').hasClass('fa-caret-right')){

				$(this).children('i').removeClass('fa-caret-right').addClass('fa-caret-down');
				//$('#list_'+valid+' ol .togleSlide').children('i').removeClass('fa-caret-right').addClass('fa-caret-down');
				openItems.push(valid);

			}else{

				$(this).children('i').removeClass('fa-caret-down').addClass('fa-caret-right');

				var index = openItems.indexOf(valid);
				if (index > -1) {
				    openItems.splice(index, 1);
				}

			}

			localStorage.setItem( 'nestedSortable_'+window.location.pathname, JSON.stringify(openItems) );

		});

		// In partenza apro tutte le righe salvate come aperte

		for (var i = openItems.length - 1; i >= 0; i--) {

			var valid = openItems[i];

			$('#list_'+valid+'>ol').show();
			$('#list_'+valid+' .togleSlide').first().children('i').removeClass('fa-caret-right').addClass('fa-caret-down');
		};

	}

	//ABILITA o DISABILITA un record
	//Setta e desetta la colonna abilitato del record indicato della tabella indicata
	pubblicaDef = new $.Deferred();
	$('.pubblica').click(function(e){
		e.preventDefault();
		var obj = $(this);
		var id = obj.attr('data-id');
		$.ajax({ type: "POST",url: jsSetting['pathadmin']+"common/pubblica.php", data: "modulo="+jsSetting['modulo']+"&table="+obj.attr('data-table')+"&campo="+obj.attr('data-campo')+"&id="+id, cache: false, async: false, dataType: "json",
			success: function(result) {
				if(result.campo != 1){
					obj.removeClass('fa-check-square-o').addClass('fa-square-o');
				}else{
					obj.removeClass('fa-square-o').addClass('fa-check-square-o');
				}

				pubblicaDef.notifyWith(obj, [result]);
			},
			error: function(result) {
			}
		});
	});
	
	//CANCELLAZIONE
	//Cancello determinato record di un record di una determinata tabella
	$('.cancella').live('click',function(e){
		e.preventDefault();
		valid = $(this).attr('data-id');
		if(confirm($(this).attr('data-ask'))){
	  		$.ajax({ type: "get", url: jsSetting['pathadmin']+"common/del.php",data: "modulo="+jsSetting['modulo']+"&id="+valid+"&table="+$(this).attr('data-table'),cache: false, async: false,
				success: function(result) {
					$('#listItem_'+valid+', .listItem_'+valid).fadeOut();
					feedback.show('Voce cancellata correttamente');
				},
				error: function(result) {
			}
			});
		}
	});
	//CANCELLAZIONE
	//Cancello determinato record di un record di una determinata tabella
	$('.cancella_jsn').live('click',function(e){
		e.preventDefault();

		var obj = $(this),
			valid = obj.attr('data-id');

		if(confirm(obj.attr('data-ask'))){
	  		$.ajax({ type: "get", url: jsSetting['pathadmin']+"common/del.php",data: "modulo="+jsSetting['modulo']+"&id="+valid+"&table="+obj.attr('data-table'),cache: false, async: false,
				success: function(result) {
					obj.closest('tr').fadeOut();
					feedback.show('Voce cancellata correttamente');
				},
				error: function(result) {
			}
			});
		}
	});

	//personalizzato per cancellare tutte le pagine e le sottopagine
	$('.cancella_n').live('click',function(){
		valid = $(this).attr('data-id');
		if(confirm($(this).attr('data-ask'))){
			$.ajax({ type: "get", url: jsSetting['pathadmin']+"common/del_nested.php",data: "id="+valid+"&table="+$(this).attr('data-table')+"&modulo="+jsSetting['modulo'],cache: false, async: false,
				success: function(result) {
					$('#list_'+valid).fadeOut();
				},
				error: function(result) {
			}
			});
		}
	});



	//Order list
	if($('#showSort').length>0){
		var options_list = {
				page: 20,
				plugins: [
					[ 'paging', { 
						pagingClass: "topPaging",
						innerWindow: 1,
						left: 1,
						right: 1
					} ]
				],
				valueNames: [ 'title' ]
			};
		var hackerList = new List('showSort', options_list);
	}
	//Order list
	if($('#showSortOrder').length>0){
		var options_list = {
				valueNames: [ 'title' ]
			};
		var hackerList = new List('showSortOrder', options_list);
		
		$('.search').live('keyup',function(){
			if($(this).val()==""){
				$('.handle').show();
			}else{
				$('.handle').hide();
			}
		});
	}


	//Rimuovo l'indicazione di caricamento pagina
	$('#loadPage').fadeOut(300,function(){
		//$(this).remove();
	});

});

renderingtinyMCE = new $.Deferred();
//Tex editor
tinyMCE.init({
		// General options
		language : 'it',
		elements : 'nourlconvert',
		mode : "textareas",
		theme : "modern",
		width  : '100%',
        editor_selector : "mceSimple",
        plugins: "autoresize",
		// Theme options
		theme_advanced_buttons1 : "bold,italic,underline,strikethrough,|,link,unlink,justifyleft,justifycenter,justifyright,justifyfull,|,bullist,numlist,|,forecolor,hr,code",
		theme_advanced_buttons2 : "",
		theme_advanced_buttons3 : "",
		theme_advanced_buttons4 : "",
		theme_advanced_toolbar_location : "top",
		theme_advanced_toolbar_align : "left",
		theme_advanced_statusbar_location : "bottom",
		theme_advanced_resizing : true,
		convert_urls : false,
		onpageload : renderingtinyMCE.resolve


		// Example content CSS (should be your site CSS)
		//content_css : "../../../style/style.css"

	});	




//Tex editor
tinyMCE.init({
		// General options
		language : 'it',
		elements : 'nourlconvert',
		mode : "textareas",
		theme : "modern",
		height  : '350px',
        editor_selector : "mceSimpleNewsletter",
		plugins : [
			        "advlist autolink lists link image charmap print preview anchor",
			        "searchreplace visualblocks code fullscreen",
			        "insertdatetime media table contextmenu paste responsivefilemanager"
			    ],
		// Theme options
		theme_advanced_buttons1 : "bold italic underline strikethrough | link image justifyleft justifycenter justifyright justifyfull | fontsizeselect forecolor hr",
		theme_advanced_buttons2 : "",
		theme_advanced_buttons3 : "",
		theme_advanced_buttons4 : "",
		theme_advanced_toolbar_location : "top",
		theme_advanced_toolbar_align : "left",
		theme_advanced_statusbar_location : "bottom",
		theme_advanced_resizing : true,
		convert_urls : false


		// Example content CSS (should be your site CSS)
		//content_css : "../../../style/style.css"

	});	
	
	
	tinyMCE.init({
			language : 'it',
			elements : 'nourlconvert',
			mode : "textareas",
			theme : "modern",
			width  : '100%',
			height  : '220px',
			editor_selector : "mceSmall",
			plugins : [
				        "advlist autolink lists link image charmap print preview anchor",
				        "searchreplace visualblocks code fullscreen",
				        "insertdatetime media table contextmenu paste responsivefilemanager"
				    ],
		    toolbar: "insertfile undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image",
		    menubar: false,
			paste_use_dialog : false,
			theme_advanced_resizing : true,
			theme_advanced_resize_horizontal : true,
			apply_source_formatting : true,
			force_br_newlines : true,
			force_p_newlines : false,	
			relative_urls : false,
			convert_urls : false,
			external_filemanager_path: jsSetting['path'] + "moduli/filemanager/",
			filemanager_title:"Gestione file" ,
			external_plugins: { "filemanager" : jsSetting['path'] + "moduli/filemanager/plugin.min.js"}
		});	

	tinyMCE.init({
			language : 'it',
			elements : 'nourlconvert',
			mode : "textareas",
			theme : "modern",
			width  : '837px',
			height  : '425px',

			content_css : jsSetting['path'] + "style/bootstrap.css",
			editor_selector : "mceBig",
			plugins : [
				        "autoresize advlist autolink lists link image charmap print preview hr anchor pagebreak",
				        "searchreplace wordcount visualblocks visualchars code fullscreen",
				        "insertdatetime media nonbreaking save table colorpicker contextmenu directionality",
				        "emoticons template paste textcolor "
				    ],
		    tool: "inserttable",
		    toolbar: "insertfile undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image",
			paste_use_dialog : false,
			paste_text_sticky: true,
				paste_text_sticky_default: true,
			paste_auto_cleanup_on_paste : true,
	        theme_advanced_resizing : true,
			//theme_advanced_resize_horizontal : true,
			//apply_source_formatting : false,
			force_br_newlines : true,
			force_p_newlines : false,	
			relative_urls : false,
			convert_urls : false,
			image_advtab : true,
			table_cell_adv_tab: true,
			external_filemanager_path: jsSetting['path'] + "moduli/filemanager/",
			filemanager_title:"Gestione file" ,
			external_plugins: { "filemanager" : jsSetting['path'] + "moduli/filemanager/plugin.min.js"},
			setup: function(editor) {

				if (typeof jsModuleSetting !== 'undefined' && typeof jsModuleSetting['tinyMce_myMenu'] === 'object') {

					$.each(jsModuleSetting['tinyMce_myMenu'], function(name, value){

					    var submenuArr = Array();

  		       			$.each(value, function(section, content){
  		       				submenuArr.push({
  		       					text: section,
  		       					onclick: function(){
  		       						editor.insertContent(content);

  		       					}
  		       				});
  		       			});
  		       			
		       			editor.addMenuItem(name, {
	   			            text: name,
	   			            context: 'tools',
				            menu: submenuArr
	   			        });

					});

				};
		   	}
		});


var select_all = {
	init : function(){
		var self = this;
		self.sel_btn = $("a.select_all");

		self.sel_btn.toggle(
			function() {
				$(this)
					.text("deseleziona tutto")
					.closest("div")
					.find("input[type='checkbox']")
					.attr("checked", "checked");
			},
			function() {
				$(this)
					.text("seleziona tutto")
					.closest("div")
					.find("input[type='checkbox']")
					.removeAttr("checked");
			}
		);
	}
}

if($('#orderTable').length>0 || $('#orderTable_man').length>0 || $('#orderTableServer').length>0){

	renderingTable = new $.Deferred();
	notifyTable = new $.Deferred();

	function save_dt_view (oSettings, oData) {

		var filters;

		filters = $('.filtri');

		oData['filtri'] = filters.serializeArray();

	  	localStorage.setItem( 'DataTables_'+window.location.pathname, JSON.stringify(oData) );

	  	//createCookie('DataTables_'+window.location.pathname, JSON.stringify(oData));
	}

	function load_dt_view (oSettings) {

		var oData = JSON.parse( localStorage.getItem('DataTables_'+window.location.pathname) );

		if (typeof oData != 'undefined' && oData != null){
			if ('filtri' in oData){
				for (i=0; oData.filtri.length > i; i++) {
					var objs = $('#custom_toolbar .filtri[name='+oData.filtri[i].name+']');

					objs.each(function() {
						var obj = $(this);

						if(obj.attr('type') == 'radio'){

							if(obj.val() == oData.filtri[i].value){
								obj.attr('checked', true);
							}
						}else{
							obj.val(oData.filtri[i].value);
						}

					});
				} 
			}
		}

	  	return oData;
	}


	function reset_dt_view() {
	  localStorage.removeItem('DataTables_'+window.location.pathname);
	}
	

	if($('#orderTable').length > 0){
	  	/* Build the DataTable with third column using our custom sort functions */
		table = $('#orderTable').dataTable({
			"aoColumnDefs": [
	        	{ "bSortable": false,  "aTargets": [ "no_order" ] }
	    	],
			"oLanguage": {
				"sUrl": jsSetting['path']+"js/plugins/DataTables/datatables.italian.txt"
			},
			"aLengthMenu": [[10, 25, 50, 100, 150, -1], [10, 25, 50, 100, 150, "Tutti"]],	
			"iDisplayLength": 50,
			"bStateSave": true,
			"fnStateSave": function(oSettings, oData) { save_dt_view(oSettings, oData); },
	      	"fnStateLoad": function(oSettings) { return load_dt_view(oSettings); },
			"aaSorting": [],
			"sDom": 'l<"toolbar">frtip',
			"fnInitComplete" : renderingTable.resolve
		});
	}

	// if($('#orderTable_man').length > 0){
	//   	/* Build the DataTable with third column using our custom sort functions */
	// 	table = $('#orderTable_man').dataTable({
	// 		"aoColumnDefs": [
	//         	{ "bSortable": false,  "aTargets": [ "no_order" ] }
	//     	],
	// 		"oLanguage": {
	// 			"sUrl": jsSetting['path']+"js/plugins/DataTables/datatables.italian.txt"
	// 		},
	// 		"aLengthMenu": [[10, 25, 50, 100, 150, -1], [10, 25, 50, 100, 150, "Tutti"]],	
	// 		"iDisplayLength": 50,
	// 		"bStateSave": true,
	// 		"fnStateSave": function(oSettings, oData) { save_dt_view(oSettings, oData); },
	//       	"fnStateLoad": function(oSettings) { return load_dt_view(oSettings); },
	// 		"aaSorting": [],
	// 		"sDom": 'l<"toolbar">frtip',
	// 		"fnInitComplete" : renderingTable.resolve
	// 	});
	// }

	if($('#orderTableServer').length > 0){

		table = $('#orderTableServer').dataTable( {
			"aoColumnDefs": [
				{ "bSortable": false,  "aTargets": [ "no_order" ] }
			],
			"oLanguage": {
				"sUrl": jsSetting['path'] + "js/plugins/DataTables/datatables.italian.txt"
			},
			"aLengthMenu": [[10, 25, 50, 100, 150, -1], [10, 25, 50, 100, 150, "Tutti"]],	
			"iDisplayLength": 50,
			"bStateSave": true,
			"fnStateSave": function(oSettings, oData) { save_dt_view(oSettings, oData); },
			"fnStateLoad": function(oSettings) { return load_dt_view(oSettings); },
	      	"fnServerParams": function ( aoData ) {

	      		var oData = JSON.parse( localStorage.getItem('DataTables_' + window.location.pathname) );

	      		if (oData) {

	      			save_dt_view(aoData,oData);
	      			
	      		};

	      		var load_filter = load_dt_view(); 

	      		if ( ! load_filter ) {
	      			return;
	      		};


	      		for (var i = load_filter.filtri.length - 1; i >= 0; i--) {
	      			aoData.push( load_filter.filtri[i] ); 
	      		};

	      	},
			"bProcessing": true,
			"bServerSide": true,
			//"aaSorting": [],
			"aaSorting": [[ 1, "asc" ]],
			"sDom": 'l<"toolbar">frtip',
			"sAjaxSource": jsSetting['pathadmin']+'common/DataTable-json-list.php?modulo='+jsSetting['modulo'],
			"fnDrawCallback": function( oSettings ) {
			      notifyTable.notify();
			    },
			"fnInitComplete" : renderingTable.resolve
		} );
	}

	// Aggiungo la toolbar alla tabella una volta finito il rendering
	renderingTable.done(function() {

		// TOOLBAR ORDINE TABELLA

		$("#custom_toolbar").detach().appendTo("div.toolbar");

		// =============================================

		// FILTRI
		var filters;

		filters = $('#custom_toolbar .filtri');

		filters.on("change", function() {

			table.fnDraw();

		});


		$.fn.dataTableExt.afnFiltering.push(

			function( oSettings, aData, iDataIndex ) {

		 		var result = 0, n_filters = 0;;

				filters.each(function() {

					var value, filter = "", row_search = false, selaData = new Array, col, obj = $(this);

					//In che conolle cercare

					if(obj.attr('data-collum')){

						var col =  JSON.parse(obj.attr('data-collum'));

						var i=0;
						while(i<aData.length)
						{	

							if($.inArray(i, col) >= 0){

								selaData.push(aData[i]);

							}

							i++;
						}

					} else {

						selaData = aData;

					}

					if(obj.attr('type') == 'radio'){
						//= Radio
						if(obj.is(':checked')){
							value = obj.val();
						}

					}else{
						//= Select
						if(obj.attr('data-get') == 'value'){

							value = obj.children().filter(":selected").val();

						}else{

							value = obj.children().filter(":selected").text();

						}
					}

					if(typeof value == 'undefined'){
						return true;
					}


					// Se il valore è impostato su tutti allora sarà sicuramente positivo
					if(value == "Tutti" || value == "Tutte"){

						row_search = true;

					} else{ 

					var i=0;

						while(i<selaData.length){

							//Analizzo i vari metodi di ricerca
							if (obj.data('equal') == 1) {

								if(value == selaData[i]){

									row_search = true;

								}

								i++;

							} else {

								if(selaData[i].indexOf(value) >= 0){

									row_search = true;

								}

								i++;
							}

						}

					}

					if(row_search){

						result ++;

					}

					n_filters ++;

				});

				if(result == n_filters){
					return true;
				}else{
					return false;
				}

			}
		);

		table.fnDraw();
	});

	//Selezione e deselezione righe... ed azioni correllate sulle righe selezionate

	var dataTableTools = {

		init : function(){

			var self = this;

			self.dataTableTools = $('.dataTableTools');
			self.actionTool = self.dataTableTools.find('.actionTool');
			self.dataTable = $('.dataTable');

			self.cache();
			
			if (typeof renderingTable !='undefined'){

				renderingTable.done(function(){

					self.loadIstance();

				});

			}

		},
		
		cache : function(){

			this.itemsRow = this.dataTable.find('.dataTableRow');

		},

		loadIstance : function(){

			var self = this;

			self.dataTableTools.find('a.seleziona-tutti').on('click', function(){

				self.cache();

				self.itemsRow.attr('checked', true);

			});

			self.dataTableTools.find('a.deseleziona-tutti').on('click', function(){

				self.cache();

				self.itemsRow.attr('checked', false);

			});

			self.actionTool.on('click', function(){

				self.cache();

				var obj = $(this), 
					collum = obj.data('collum'), 
					value = obj.data('value'),
					items_id = new Array();


				self.itemsRow.each(function(){

					var item = $(this);

					if (item.is(':checked')) {

						items_id.push(item.val());

					}

				});

				self.updateStatus(items_id, collum, value);
			});


			self.dataTable.on('click', '.rowTool', function(){

				var obj = $(this), 
					collum = obj.data('collum'), 
					value = obj.data('value'),
					items_id = new Array();

				items_id.push(obj.data('id'));

				self.updateStatus(items_id, collum, value);

			});

		},
		updateStatus : function (items_id, collum, value){

			if (items_id.length == 0) {
				return false;
			}
			
			var data =  {'items_id' : items_id, 'collum' : collum, 'value' : value};

			return $.ajax({
				type: 'POST',
				cache: false,
				url: jsSetting['pathadmin'] + jsSetting['modulo'] + '/json_actionTool',
				data: data,
				success: function(){

					if ($('#orderTableServer').length > 0) {
						table.fnDraw();
					} else {
						window.location = window.location;
					}
				},
				error: function(){
					alert('error');
				}
			}).promise();


		}

	}
}

////--------------------------------------\\\\
// GESTIONE SWITCH Textarea/span CAMPO NOTE \\
fastwriteDef = new $.Deferred();
var fastwrite = {
	init : function(){

		var self = this;

		self.showWriteClass = 'showWrite';
		self.fastWriteClass = 'fastWrite';
		self.wrapBoxClass = 'wrapBox';

		self.isEdit = false;
		
		//creo la textarea
		self.create();

		$('.' + self.showWriteClass).closest('.' + self.wrapBoxClass).on('click',function(){
			if(!self.isEdit){
				self.changetoEdit($(this).children('.' + self.showWriteClass));
			}
		});

		self.background.on('click',function(){
			self.changeView();
		});

		$('.' + self.fastWriteClass).on('keydown', function(evt) {

			var keyCode = evt.keyCode || evt.which; 

	        if (keyCode === $.ui.keyCode.ESCAPE) {
	        	evt.preventDefault(); 
	            self.closeEdit();
        	} else if (keyCode === 9) { 
	 			evt.preventDefault(); 
				self.skipNext();
			} 
	    });
	},
	create : function(){
		var self = this;

		var objCSS = {
			'z-index' : 9998,
			'top' : 0,
			'left' : 0,
			'background' : '#000',
			'opacity' : 0.3,
			'position' : 'fixed',
			'width' : '100%',
			'height' : '100%',
			'display' : 'block'
		}


		$('<div id="background"></div>').appendTo($('body')).css(objCSS).hide();

		self.background = $('#background');

		$('.' + self.fastWriteClass).each(function(){
			var inp = $(this);
			inp.wrap(function(){
				return '<span class="' + self.wrapBoxClass + ' icon-edit"></span>';
			});

			var objCSS = {
				'cursor' :'pointer',
				'min-height' : 20,
				'min-width' : 20,
				'display' : 'block',
				'position' : 'relative'
			}

			var parent = inp.closest('.' + self.wrapBoxClass);

			$('<span></span>').appendTo(parent).addClass(self.showWriteClass).text(' ' + inp.val()).parent().css(objCSS);

			inp.hide();
		});

	},
	changetoEdit : function(note){
		var self = this;

		self.background.fadeIn('fast');

		var objCSS = {
			'z-index' : 9999,
			'position' : 'absolute'
		}

		var editNote = note.siblings('.' + self.fastWriteClass);

		$('.' + self.fastWriteClass).removeClass('active')
		editNote.val($.trim(note.text())).css(objCSS).addClass('active').show().focus();

		self.isEdit = true;
		//note.hide();

	},
	changeView : function(){
		var self = this;

		self.background.stop(true).fadeOut('fast');

		$('.' + self.fastWriteClass).each(function(){
			var editNote = $(this);
			var note = $(this).siblings('.' + self.showWriteClass);
			if(editNote.val()!=""){
				note.text(' ' + editNote.val()).show();
				editNote.hide();
			}
		});

		var objClose = $('.' + self.fastWriteClass + '.active')
		fastwriteDef.notify(objClose,'close');

		self.isEdit = false;
	},
	closeEdit : function(){
		var self = this;

		self.background.stop(true).fadeOut('fast');

		$('.' + self.fastWriteClass).each(function(){
			var editNote = $(this);
			var note = $(this).siblings('.' + self.showWriteClass);

			note.show();
			editNote.hide();
		});

		self.isEdit = false;
	},
	skipNext : function(){
		
		var foundAct  = false;
		var new_open = false;
		var self = this;

		$('.' + self.fastWriteClass).each(function(){
			if(foundAct){
				new_open = $(this).siblings('.' + self.showWriteClass);
				return false;
			}
			if($(this).hasClass('active')){
				foundAct = true;
			}
		});

		if(new_open){
			new_open.attr('data-sonmin','eco');
			this.changeView();
			this.changetoEdit(new_open);	
		}
	}
};


	$('textarea.editNote').hide().on('click',function(e){
		e.stopPropagation();
	});



//Compliatore automatico input 
var autocomplete = {
	init : function(option){
		var self = this;

		self.dafaultOpts = {
			obj : ".tokenInput",
			preventDuplicates : true,
			searchingText: "Ricerca...",
			noResultsText: "Nessun risultato.",
			hintText: "Digitare un valore per la ricerca",
			tokenLimit: null
		};

		self.opts = $.extend(self.dafaultOpts,option);
		
		self.obj = $(self.opts.obj);
		self.obj.each(function(){
			var dis = $(this);
			dis.tokenInput(
				dis.attr('data-call'), 
				{
				theme: "facebook",
	      		//resultsFormatter: function(item){ return "<li><div>[" + item.id + "] " + item.name + "</div><div class='full_name'>" + item.nome + " " + item.cognome + "  ("+item.palestre+")</div></li>" },
	    		//tokenFormatter: function(item) { return "<li><p>[" + item.id + "] " + item.nome + " <strong>" + item.cognome + "</strong></p></li>" },	
				resultsFormatter: function(item){ 
					var account_info = '';
					if(typeof item.small_account_info != 'undefined'){
						account_info = " <span class='account_info'>[" + item.small_account_info + "]</span>"
					}

					return "<li><div>" + item.name + account_info +" </div><div class='full_name'></div></li>";
				},
				tokenFormatter: function(item) { 
					var small_account_info = '';

					if(typeof item.small_account_info != 'undefined'){
						small_account_info = " <span class='small_account_info'>[" + item.small_account_info + "]</span>"
					}

					return "<li><p>" + item.name + "</strong> " + small_account_info + "</p></li>" 
				},	
				prePopulate: (dis.data('prepop')),
				preventDuplicates : self.opts.preventDuplicates,
				searchingText: self.opts.searchingText,
				noResultsText: self.opts.noResultsText,
				hintText: self.opts.hintText,
				tokenLimit: self.opts.tokenLimit
			});
		});
	
		//Selezione rapida utenti
		self.choice_modal = $('#choice_modal');

		$('.selezione_rapida').on('click', function(){

			self.choice_modal.modal('show');
			self.choice_modal.find('.mymodal-conferma').attr('data-filtro', $(this).data('filtro'));

		});	


		self.choice_modal.find('.mymodal-conferma').on('click', function(){

			var form = self.choice_modal.find('form');

			//Tra quali utenti devo effettuare il filtro
			var filtro = $(this).data('filtro'); 

			self.getUser(form.serialize(), filtro).done(function(result){

				if (!result) {
					feedback.show('Nessun comune trovato!', 'alert-error')
					return false;
				};

				self.obj.each(function(){
					
					var dis = $(this);
					
					for (var i = result.length - 1; i >= 0; i--) {
						dis.tokenInput("add", result[i]);
					};
				});

				self.choice_modal.modal('hide');
				self.choice_modal.find('input').attr('checked', false).button('refresh');;
			})

		});
	},
	getComuni : function (serial, filtro){

		return $.ajax({
			type: "GET",
			url: jsSetting['pathadmin']+'comuni/json-list/'+filtro+'/scelta_rapida',
			dataType: "json",
			data: serial,
			error: function(error) {
			    alert(error);
			}
		}).promise();

	}
} 

//DA TESTARE
var showbox = {
	init : function(){

		var self = this;
		self.obj = $(".showbox");
		self.obj.change(function(){

			if($(this).attr('type') == 'radio'){
				//= Radio
				if(!$(this).is(':checked')){
					return;	
				}
			}
			
			var reference = $(this).attr('data-reference');
			var command = $(this).attr('data-command');
			self.showit(reference, command);
		});
		self.carica();
		self.speed = 300;

	},
	carica : function(){

		var self = this;
		self.obj.each(function(i) {

			if($(this).attr('type') == 'radio'){
				//= Radio
				if(!$(this).is(':checked')){
					return;	
				}
			}


			var reference = $(this).attr('data-reference');
			var command = $(this).attr('data-command');
			self.showit(reference, command);
		});

	},
	showit : function(reference, command){

		var self = this;

		if(command=='show'){
			$(reference).slideDown(self.speed);
		} else if (command == 'hide'){
			$(reference).slideUp(self.speed);
		} else {
			if($(reference).is(":visible")){
				$(reference).slideUp(self.speed);
			}else{
				$(reference).slideDown(self.speed);
			}
			
		}

	}
};


//OGGETTO POPOVER (il popup dinamico che comparea a destra degli oggetti){
var tooltip = {
	init : function(){
		$('[rel="tooltip"]').tooltip();
	}
}



//OGGETTO POPOVER (il popup dinamico che comparea a destra degli oggetti){
var popover = {
	init : function(){
		$('[rel="popover"]').popover({ 
			trigger:"hover", 
			html:true
		});
		$('[rel="popover-left"]').popover({ 
			trigger:"hover", 
			placement:"left",
			html:true
		});
		$('[rel="popover-top"]').popover({ 
			trigger:"hover", 
			placement:"top",
			html:true
		});
		$('[rel="popover-bottom"]').popover({ 
			trigger:"hover", 
			placement:"bottom",
			html:true
		});
	},
	set: function(obj,title,text,rel){

		rel = typeof rel !== 'undefined' ? rel : 'popover';

		obj	.attr('data-original-title',title)
			.attr('data-content',text)
			.attr('rel',rel);

		this.init();
	},
	clear: function(obj){

		obj	.removeAttr('data-original-title')
			.removeAttr('data-content')
			.removeAttr('rel');

		this.init();
	}
}


//--------------------------------------------------------
// OGGETTO FEEDBACK (il popup che compare ad ogni feedback)

var feedback = {
	init : function(){
		this.feedback = $('#feedback');
		this.delay = 2500;
		this.translate = 300;
		this.durationIn = 600;
		this.durationOut = 800;
	},
	moveup : function(){
		var items = this.feedback.find('.feedback-item');
		items.each(function(){

			var height = parseInt($(this).css('bottom'),10)+parseInt($(this).outerHeight(),10)+5;
			$(this).animate({
				bottom : height				
			},
			{
				duration : this.translate,
				queue : false
			});
		});
	},
	show : function(text, specialClass){

		//parametro di default specialClass
		if(specialClass==null){
			specialClass = 'alert-info';
		}

		this.moveup();
		$('<div class="feedback-item alert ' + specialClass + '"/>')
			.text(text)
			.appendTo(this.feedback)
			.hide()
			.fadeIn(this.durationIn)
			.delay(this.delay)
			.fadeOut(
				this.durationOut,
				function(){
					$(this).remove();
				});
	}
}



var mymodal = {
	init : function(){
		this.mymodal = $('#mymodal');
		this.mytitle = this.mymodal.find('.modal-title');
		this.mycontent = this.mymodal.find('.modal-body');
		this.myfooter = this.mymodal.find('.modal-footer');

		this.option = {
			title : '',
			content : '',
			button : '<a href="#" class="btn " data-dismiss="modal">Annulla</a><a href="#" class="btn btn-primary mymodal-conferma">Conferma</a>',
			richiama: function(){},
			callback: function(){}
			};
	},
	show : function(option){

		this.opts = $.extend(this.option,option);

		this.mytitle.html(this.opts.title);
		this.mycontent.html(this.opts.content);
		this.myfooter.html(this.opts.button);
		
		this.mymodal.modal('show');

		this.opts.richiama();
		//return this.mymodal;
	},
	confirm : function(option){
		var dis = this;
		dis.show(option);
	
		var waiting = new $.Deferred();

		dis.mymodal.find('.mymodal-conferma').on('click',function(){
			//Eseguo il callback prima della chiusura
			dis.opts.callback();
			//Segno chiuso il ciclo del modal
			waiting.resolve();
			dis.mymodal.modal('hide');
		});

		return waiting.promise();
		
	}

}


//Multi UploadiFy

var SetUploadify = {
	init : function(){
		var self = this;

		self.singleContainer = $('.visualizza_single_file');
		self.multiContainer = $('.visualizza_multi_file');

		self.myUplyClass = '.uploadify';
		
		self.startSession();
		self.carica();

	},
	cache :function(){
		
		var self = this;

		self.info_update = $('.info_update');
		self.form_car = $('form#caratteristiche');
		self.t = function(){};

		$('.visualizza_immagini .del_file').on('click', function(){
			var id_rif = $(this).data('id_rif');
			var id = $(this).data('id');
			var name_rif = $(this).data('name_rif');

			if($(this).hasClass('askConfirm')){
				if(confirm('Cancellare file?')){
					self.del_file(id_rif, name_rif,id);
				}
			}else{
				self.del_file(id_rif, name_rif,id);
			}
		});

		$('ul.sorting_files').sortable({
			forceHelperSize : false,
			forcePlaceholderSize : false,
			update : function () {
				var order = $(this).sortable('serialize');
				$.ajax(jsSetting['pathadmin']+"common/sort.php?modulo="+jsSetting['modulo']+"&id_rif="+$(this).attr('data-id_rif')+"&rif="+$(this).attr('data-rif')+"&table="+$(this).attr('data-table')+"&"+order+"&cache=" + (new Date()).getTime());
			}
		});


		self.info_update.hide();

		if (self.form_car.length > 0) {

			self.form_car.find('input').on('keyup',function(){

				var obj = $(this);

				clearTimeout(self.t);

				self.t = setTimeout(function(){

					self.info_update.fadeIn();

					obj.attr('title',obj.val());

					$.ajax({ 
							type: "POST",
							url: jsSetting['pathadmin']+"common/sync_multi_file_car.php", 
							data: self.form_car.serialize()+'&async=1&table='+self.form_car.data('table')+'&name='+self.form_car.data('name')+'&id_rif='+self.form_car.data('id_rif')+'&modulo='+jsSetting['modulo'], 
							cache: false, 
							async: false,
							success: function(result) {
								v = setTimeout(function(){
									self.info_update.fadeOut(800);
								}, 300);
							}
					});
				},600);
			});
		};

	},
	startSession : function(option){
		var self = this;

		// == SINGLE FILE
		this.singleContainer.each(function(){
			
		var maxsize = $(this).data('maxsize'),
			fileExt = $(this).data('fileext'),
			fileDesc = $(this).data('filedesc'),
			id_rif = $(this).data('id_rif'),
			name_rif = $(this).data('name_rif'),
			uppy = $(this).children(self.myUplyClass);

			var uploadiOtp = {
					'swf'       		: jsSetting['path'] + 'js/plugins/uploadify/uploadify.swf',  // FLASH
					'uploader'         	: jsSetting['pathadmin'] + 'common/uploadify.php', // FLASH
					'uploadScript'      : jsSetting['pathadmin'] + 'common/uploadify.php', // HTML5
					'buttonText'		: 'Seleziona File', // FLASH - HTML5
					//'debug'          	: true, // FLASH
					'multi'          	: true, // FLASH
					'auto'           	: true, // FLASH - HTML5
					'fileDataName'		: uppy.attr('name'), // FLASH
					'wmode'	 			: 'transparent', // FLASH
					'fileTypeExts'		: fileExt, // FLASH
					'fileSizeLimit'		: maxsize, // FLASH
					'fileTypeDesc'		: fileDesc, // FLASH
					'removeTimeout'		: 1, // FLASH
					'removeCompleted' 	: 1, // HTML5
					'queueID'        	: 'queue_' + name_rif, // FLASH - HTML5
					'queueSizeLimit'  	: 1, // FLASH
					'formData' 			: {'modulo': jsSetting['modulo'], 'session': jsSetting['session_id'], 'id_rif': id_rif, 'nome': name_rif}, // FLASH - HTML5
					'onUploadSuccess'	: function(file, data, response) { // FLASH
						self.carica();
				  	},
		  	 	    'onUploadComplete'  : function(file, data) { // HTML5
		  	 	    	self.carica();	 	    
		  	 	    }
				};

				uppy.uploadifive($.extend({
				  	'onFallback': function(){
				    	uppy.uploadify(uploadiOtp);
				    	$('.noHtml5Upp').remove();
				    	$('#custom-queue').removeClass('well');
				  	}
				}, uploadiOtp));
		});

		// == MULTI FILE
		this.multiContainer.each(function(){
			
			var maxsize = $(this).data('maxsize');
				fileLimit = $(this).data('filelimit'),
				fileExt = $(this).data('fileext'),
				fileDesc = $(this).data('filedesc'),
				id_rif = $(this).data('id_rif'),
				name_rif = $(this).data('name_rif'),
				uppy = $(this).find(self.myUplyClass);



			if(fileLimit == "" || fileLimit == "*"){
				queueSizeLimit = 999;
			} else {
				queueSizeLimit = fileLimit;
			} 

			var uploadiOtp = {
					'swf'       		: jsSetting['path'] + 'js/plugins/uploadify/uploadify.swf',  // FLASH
					'uploader'         	: jsSetting['pathadmin'] + 'common/uploadify.php', // FLASH
					'uploadScript'      : jsSetting['pathadmin'] + 'common/uploadify.php', // HTML5
					'buttonText'		: 'Seleziona File', // FLASH - HTML5
					//'debug'          	: true, // FLASH
					'multi'          	: true, // FLASH
					'auto'           	: true, // FLASH - HTML5
					'fileDataName'		: uppy.attr('name'), // FLASH
					'wmode'	 			: 'transparent', // FLASH
					'fileTypeExts'		: fileExt, // FLASH
					'fileSizeLimit'		: maxsize, // FLASH
					'fileTypeDesc'		: fileDesc, // FLASH
					'removeTimeout'		: 1, // FLASH
					'removeCompleted' 	: 1, // HTML5
					'queueID'        	: 'queue_' + name_rif, // FLASH - HTML5
					'queueSizeLimit'  	: queueSizeLimit, // FLASH
					'itemTemplate' 	: '<div id="${fileID}" class="uploadify-queue-item uploadifive-queue-item col-sm-4">\
	               							<div><div class="cancel close">\
	               								<a href="javascript:$(\'#${instanceID}\').uploadify(\'cancel\', \'${fileID}\')">X</a>\
	               							</div>\
	               							<span class="fileName filename">${fileName} (${fileSize})</span><span class="fileinfo"></span><span class="data"></span>\
	               							<div class="uploadify-progress progress">\
												<div class="uploadify-progress-bar progress-bar"><!--Progress Bar--></div>\
											</div>\
	               						</div></div>', // FLASH
					'formData' 			: {'modulo': jsSetting['modulo'], 'session': jsSetting['session_id'], 'id_rif': id_rif, 'nome': name_rif}, // FLASH - HTML5
					'onUploadSuccess'	: function(file, data, response) { // FLASH
						self.carica();
				  	},
		  	 	    'onUploadComplete'  : function(file, data) { // HTML5
		  	 	    	self.carica();	 	    
		  	 	    }
				};

				uppy.uploadifive($.extend({
				  	'onFallback': function(){
				    	uppy.uploadify(uploadiOtp);
				    	$('.noHtml5Upp').remove();
				    	$('#custom-queue').removeClass('well');
				  	}
				}, uploadiOtp));

		
		});
	},
	carica : function(option){
		this.singleContainer.each(function(){
			var item = $(this);

			var name_rif = item.data('name_rif');
			var id_rif = item.data('id_rif');

			$.ajax({ 
				type: "get", 
				url: jsSetting['pathadmin'] + 'common/load_single_file.php',
				data: 'modulo=' + jsSetting['modulo']+'&id_rif=' + id_rif + '&name=' + name_rif,
				cache: false, async: false,
				success: function(result) {
				item.find('.visualizza_immagini').html(result);
				}
			});
		});

		this.multiContainer.each(function(){
			var item = $(this);

			var name_rif = item.data('name_rif');
			var id_rif = item.data('id_rif');

			$.ajax({ 
				type: "get", 
				url: jsSetting['pathadmin'] + 'common/load_multi_file.php',
				data: 'modulo='+jsSetting['modulo']+'&id_rif=' + id_rif + '&name=' + name_rif,
				dataType: "html",
				cache: false, async: false,
				success: function(result) {
					item.find('.visualizza_immagini').html(result);
					/*$('input').off().on('click', function(){
						$(this).focus();
					});*/
					//$('input[type=text]').after('<input type="text" name="boh">')
				}
			});
		});

		this.cache();
	},
	del_file : function(id_rif,name,id){

		var id = typeof id !== 'undefined' ? id : null;

	  	$.ajax({ 
	  		type: "get", 
	  		url: jsSetting['pathadmin'] + 'common/single_file_del.php',
	  		data: "id_rif="+id_rif+"&modulo="+jsSetting['modulo']+"&name="+name+"&id="+id,
	  		cache: false, async: false,
			success: function(result) {
				if(id){
					$('#listItem_'+id+name).fadeOut();
				}else{
					$('#listItem_'+id_rif+name).fadeOut();
				}
			
			}
	  	});
	}
}

/*

# == DA COMPLETARE MA CON BUON POTENZIALE..


var jQueryUpload = {
	init : function(){
		var self = this;

		self.url = jsSetting['pathadmin'] + 'common/jQueryUpload.php';
		self.multiContainer = $('.visualizza_multi_file');

		self.myUplyClass = $('.fileupload');
		
		self.cache();

		self.startSession();
		self.carica();

	},
	cache : function(){

		var self = this;

	 	self.uploadButton = $('<button/>')
            .addClass('btn')
            .prop('disabled', true)
            .text('Processing...')
            .on('click', function () {
                var $this = $(this),
                    data = $this.data();
                $this
                    .off('click')
                    .text('Abort')
                    .on('click', function () {
                        $this.remove();
                        data.abort();
                    });
                data.submit().always(function () {
                    $this.remove();
                });
            });
	},
	startSession : function (){

		var self = this;

		// == MULTI FILE
		self.myUplyClass.each(function(){

			var item = $(this),
				name_rif = item.data('name_rif'),
				id_rif = item.data('id_rif');

			$(this).fileupload({
			        url: self.url+'?modulo='+jsSetting['modulo']+'&id_rif=' + id_rif + '&name=' + name_rif,
			        dataType: 'json',
			        autoUpload: true,
			        acceptFileTypes: /(\.|\/)(gif|jpe?g|png|pdf)$/i,
			        maxFileSize: 5000000, // 5 MB
			        // Enable image resizing, except for Android and Opera,
			        // which actually support image resizing, but fail to
			        // send Blob objects via XHR requests:
			        disableImageResize: /Android(?!.*Chrome)|Opera/
			            .test(window.navigator && navigator.userAgent),
			        previewMaxWidth: 100,
			        previewMaxHeight: 100,
			        previewCrop: true
			    }).on('fileuploadadd', function (e, data) {
			        data.context = $('<div/>').appendTo('#files');
			        $.each(data.files, function (index, file) {
			            var node = $('<p/>')
			                    .append($('<span/>').text(file.name));
			            if (!index) {
			                node
			                    .append('<br>')
			                    .append(self.uploadButton.clone(true).data(data));
			            }
			            node.appendTo(data.context);
			        });
			    }).on('fileuploadprocessalways', function (e, data) {
			        var index = data.index,
			            file = data.files[index],
			            node = $(data.context.children()[index]);
			        if (file.preview) {
			            node
			                .prepend('<br>')
			                .prepend(file.preview);
			        }
			        if (file.error) {
			            node
			                .append('<br>')
			                .append(file.error);
			        }
			        if (index + 1 === data.files.length) {
			            data.context.find('button')
			                .text('Upload')
			                .prop('disabled', !!data.files.error);
			        }
			    }).on('fileuploadprogressall', function (e, data) {
			        var progress = parseInt(data.loaded / data.total * 100, 10);
			        $('#progress .bar').css(
			            'width',
			            progress + '%'
			        );
			    }).on('fileuploaddone', function (e, data) {
			        $.each(data.result.files, function (index, file) {
			            var link = $('<a>')
			                .attr('target', '_blank')
			                .prop('href', file.url);
			            $(data.context.children()[index])
			                .wrap(link);
			        });
			    }).on('fileuploadfail', function (e, data) {
			        $.each(data.result.files, function (index, file) {
			            var error = $('<span/>').text(file.error);
			            $(data.context.children()[index])
			                .append('<br>')
			                .append(error);
			        });
			    });
		});
	},
	carica : function (){

	}
}*/

//Funzione cerca nuovi messaggi
var notify = {
	init : function(){

		var self = this;


		if($('.nav').length == 0){
			return;
		}

		self.searchNotify().done(function(result){
			$.each( result, function(){
				if(this.num !== 0){
					$(this.selector).children('.notifyMenu').remove();
					$(this.selector).append('<span class="notifyMenu">'+this.num+'</span>');
				}

			});
		});

		//Ogni 10 secondi si ricarica
		//var t = setTimeout(function(){self.init()}, 10000);

	},
	searchNotify : function(){
		return $.ajax({
	 		type: "POST",
	  		url: jsSetting['pathadmin']+'home/check_notify_info',
	  		dataType: "json",
		}).promise();
	}
}

// DA FINIRE
var contentReload ={
	init: function(){
		var self = this;

		self.cache();

		$('.updateContent').on('click', function(e){
			e.preventDefault();

			var href = $(this).attr('href');

			self.loadContent(href).done(function(result){

				self.mainContent.html(result);
				self.cache();


				//Reinizializzo le varie funzioni
				showbox.init();
				tooltip.init();
				popover.init();
				feedback.init();
				mymodal.init();
				SetUploadify.init();
				select_all.init();
			});
		});
	},
	cache : function(){
		this.updateContent = $('.updateContent');
		this.mainContent = $('#mainContent');
	},
	loadContent : function(href){
		var self = this;
		feedback.show('Caricamento pagina');	
		$('#loadPage').fadeIn();

		return $.ajax({
				type: 'GET',
				url: href
			}).promise();
	}

}


var noEscape = {

	init : function(){

		this.cache();
		this.bindEvent();

	},
	cache : function(){

		this.goodbye = true;

		this.formChk = $('form.noEscape');
		this.formChk_imput = this.formChk.find('input');

	},
	bindEvent : function (){

		var self = this;

		self.formChk_imput.on({
			change : function (){
				self.goodbye = false;
			},
			keyup : function(){
				self.goodbye = false;
			}
		});

		$( window ).on('beforeunload',function() {

			if ( ! self.goodbye) {

				return false;

			};

		});

		self.formChk.on('submit', function(){

			self.goodbye = true;

		})

	}
}





//Inizializzo le varie funzioni
showbox.init();
tooltip.init();
popover.init();
feedback.init();
mymodal.init();
SetUploadify.init();
select_all.init();
noEscape.init();
//contentReload.init();

//jQueryUpload.init();

//cerco eventuali notifiche di messaggi
//setTimeout(function() {notify.init();}, 10); //= Incremento il ritardo per anticipare altri eventuali load.