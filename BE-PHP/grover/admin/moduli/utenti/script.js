function loadjscssfile(filename){
  	var fileref=document.createElement('script')
  	fileref.setAttribute("type","text/javascript")
  	fileref.setAttribute("src", filename)
 	
 	if (typeof fileref!="undefined")
  		document.getElementsByTagName("head")[0].appendChild(fileref)
}


var gestUser = {
	init : function(){
		var self = this;
	},
}

$(function(){
	
	gestUser.init();
	autocomplete.init();

	loadjscssfile(jsSetting['path'] + "moduli/form-address/script.js");

});
