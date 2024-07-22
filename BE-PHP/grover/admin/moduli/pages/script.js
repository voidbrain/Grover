var pages = {
	init : function(){

		var self = this;

		self.selectPage = $('#page_content_id');
		self.modificabile = $('#modificabile');
		self.content_page = $('#content_page');

		self.selectPage.on('change', function(){
			self.updateContent();
		});
		self.modificabile.on('change', function(){
			self.updateContent();
		});
		self.updateContent();

	},
	updateContent : function(){

		if(this.selectPage.val() != 0 || this.modificabile.val() == 0){
			this.content_page.addClass('hide');
		}else{
			this.content_page.removeClass('hide');
		}

	}
}

$(function(){
	
	pages.init();

});