$(function(){
	if ($("#piechartlette").length){
        $.plot($("#piechartlette"), datalette, {
            series: { pie: { show: true } },
            grid: { hoverable: false, clickable: false },
            legend: { show: false },
            colors: ["#FA5833", "#2FABE9"]
        });    
   	}
   	if ($("#piechartinviate").length){
        $.plot($("#piechartinviate"), datainviate, {
            series: { pie: { show: true } },
            grid: { hoverable: false, clickable: false },
            legend: { show: false },
            colors: ["#FA5833", "#2FABE9"]
        });    
   	}
   	if ($("#piechartplatform").length){
        $.plot($("#piechartplatform"), dataplatform, {
            series: { pie: { show: true } },
            grid: { hoverable: false, clickable: false },
            legend: { show: false },
            colors: ["#c33a05", "#1e8fc6"]
        });    
   	}

	newsLetter.init();
});

var newsLetter = {
	init : function(){
		//Inizializzo le variabili
		var self = this;

		jsModuloSetting = (typeof jsModuloSetting !== 'undefined') ? jsModuloSetting : new Array();
		jsSetting = (typeof jsSetting !== 'undefined') ? jsSetting : new Array();

		// self.check_all = $(".check_all");
		// self.show_class = ".check_";
		self.check_lista = $(".check_lista");
		self.form = $('form#step');
		self.saveBtn = $('a#salva');
		self.saveControl = $('input[name=save]');

		self.send_n_mail = 2;

		self.passo = jsModuloSetting['passo'];

		self.saveBtn.on('click',function(e){
			e.preventDefault;
			self.saveControl.attr('value', 1);
			self.form.submit();
		});

		//Inizializzo i vari passi
		if(self.passo == 2){
			self.init_template();
		} else if(self.passo == 3){
			self.init_destinatari();
		} else if (self.passo == 5) {
			self.pre_invio();
		} else if (self.passo == 6) {
			self.init_invio();
		} else if (self.passo == 7) {
			self.show_finished();
		}

	},
	init_template : function(){
		var self = this;
		self.clickObj = "label";
		self.classObj = ".hide_radio";
		
		self.obj = $(self.classObj);
		self.objClick = $(self.classObj + " " + self.clickObj);

		self.obj.children(self.clickObj).click(function(){
			var item = $(this).closest(self.classObj);
			self.showit_radio(item);
		});
		self.carica_radio();
	},
	carica_radio: function(){
		var self = this;
		this.obj.each(function(i) {
			var item = $(this);
			if(item.children('input').is(":checked")){
				self.showit_radio(item);	
			}
		});
	},
	showit_radio: function(item){
		var name_in = item.children('input').attr('name');
		$('input[name="'+name_in+'"]').attr('checked',false);
		$('input[name="'+name_in+'"]').parents('.hide_radio').removeClass('hide_radio_check');
		item.addClass('hide_radio_check');
		item.children('input').attr('checked',true);
	},
	init_destinatari : function(){

		var self = this;

		self.check_lista.change(function(){
			var obj = $(this);
			self.carica_check();
		});

		self.carica_check();

	},
	pre_invio : function(){

		var self = this;
	},
	init_invio : function(){

		var self = this;
		self.lista_indirizzi = jsModuloSetting['lista_indirizzi'];
		self.progressBar = $('.progress-bar');
		self.action = $('.action');
		self.count_invio = $('.count_invio');
		self.stop_play = $('#stop_play');

		if(confirm(jsModuloSetting['ask'])){
			self.send();
		} else {
			window.location = jsSetting['pathadmin'] + jsSetting['modulo'] + '/main/step/5';
		}

	},
	show_finished : function(){

		$('.showList').on('click',function(){
			 $('#listMessage').toggleClass('hide');
		});
	},
	send : function() {

		var self = this
			length = self.lista_indirizzi.length,
			SendTo = new Array;
			

		self.i = (self.i) ? self.i : 0;

		for (var i = self.send_n_mail - 1; i >= 0; i--) {

			// Finito
			if (self.i == length)  break; 

			self.i ++;
			self.count_invio.text(self.i + ' di ' + length);
			self.progress_increment(self.i,length);

			if (self.lista_indirizzi[(self.i - 1)]['status'] == 1) continue;

			SendTo.push(self.lista_indirizzi[(self.i - 1)]['email']);

		};

		//la segnalazione di invio mail
		$.get(jsSetting['pathadmin'] + jsSetting['modulo'] + '/send_mail', {
			'dest': SendTo
		}).done(function() {

			if (self.i == length) {
				// Finito
				self.form.submit();
			} else {
				// Continua
				self.t_send = self.send();
			}

		});
		
	},
	progress_increment : function(i,total){
		
		//Visualizzo incremento sulla progress bar
		
		var percent = i * 100 / total;
		this.progressBar.css({'width' : percent+'%'});

		if(i == total){
			this.progressBar.removeClass('active');
		}

	},
	carica_check: function(){

		var self = this;

		this.check_lista.each(function(i) {
			var obj = $(this);
			if (obj.is(':checked')) {
				obj.closest('li').find('.check_lista').attr('checked',true);
			}

		});

	},
	showit: function(obj){

		var self = this;
		var sub_box = $(self.show_class + obj.attr('name'));
		var sub_check = $(self.show_class + obj.attr('name')).find('input[type=checkbox]');
		var sub_checked = $(self.show_class + obj.attr('name')).find('input[type=checkbox]:checked');

		if (obj.is(":checked")){
			sub_box.slideUp(300);
			sub_check.attr('checked', true);		
		} else {
			sub_box.slideDown(300);
			if(sub_checked.length == sub_check.length){
				sub_check.attr('checked', false);	
			}
		}

	}
}