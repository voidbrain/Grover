AddModd = {
	
	init : function(){
		var self = this;

		self.uply = $('.uplyList');

		self.startSession();
		self.carica();
		
	},
	cache :function(){
		
	},
	startSession : function(option){
		
		var self = this;

		var obj = self.uply;

		obj.uploadify({
			'swf'       		: jsSetting['path'] + 'js/plugins/uploadify/uploadify.swf',
			'uploader'         	: jsSetting['pathadmin'] + jsSetting['modulo'] + '/sync_list',
			'buttonText'		: 'Seleziona File',
			'debug'          	: false,
			'multi'          	: true,
			'auto'           	: true,
			'wmode'	 			: 'transparent',
			'removeTimeout'		: 1,
			'queueSizeLimit'    : 1,
			'fileSizeLimit' 	: 5242880,
			'fileTypeExts'   	: '*.csv;',
			'fileTypeDesc'      : 'Formato files (.CSV)',
			'queueID'        	: 'custom-queue',
			'itemTemplate' 		: '<div id="${fileID}" class="uploadify-queue-item span4">\
									<div><div class="cancel">\
										<a href="javascript:$(\'#${instanceID}\').uploadify(\'cancel\', \'${fileID}\')">X</a>\
									</div>\
									<span class="fileName">${fileName} (${fileSize})</span><span class="data"></span>\
									<div class="uploadify-progress">\
										<div class="uploadify-progress-bar"><!--Progress Bar--></div>\
									</div>\
           						</div></div>',
			'formData' 			: {'modulo': jsSetting['modulo'], 'session': jsSetting['session_id'], 'id_list' : obj.data('id_list')},
			'onUploadSuccess'	: function(file, data, response) {
				window.location = window.location;
			}
		});	
		self.cache();

	},
	carica : function(option){
		
	},
	del_file : function(id_rif,name,id){
	}
}


// var //liste_tool = {
// 	init : function(){

// 		//Cancellazione associazione

		

// 	}
// }


$(function(){

	$('.cancella_assoc').on('click', function(e){

			e.preventDefault();

			var id_rif = $(this).attr('data-id_rif'),
			 	id_list = $(this).attr('data-id_list');

			if(confirm('Rimuovere contatto da lista?')){
		  		$.ajax({ 
	  				type: "get",
					url: jsSetting['pathadmin']+jsSetting['modulo']+"/del/assoc",
					data: "modulo="+jsSetting['modulo']+"&id_rif="+id_rif+"&id_list="+id_list,
					cache: false, 
					async: false,
		  			success: function(result) {
				  		$('#listItem_'+id_rif).fadeOut();
				  		feedback.show('Voce cancellata correttamente');
				  		//utilityDef.notify('cancellazione', valid);
			  		},
					error: function(result) {
				  	}
				});
			}
		});

	$('.opengestioneLista').on('click', function(e){

			e.preventDefault();
			$('.gestioneLista').toggleClass("hide");

		})

	//if ($('.add_mod').length > 0) {
		AddModd.init();
	//};

	$('#myTab a').click(function (e) {
		e.preventDefault();
		$(this).tab('show');
	})

	//liste_tool.init();

});