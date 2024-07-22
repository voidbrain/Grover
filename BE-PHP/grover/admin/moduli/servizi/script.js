// ==============
// CARICAMENTO LIBRERIA JS FORM ADDRESS

function loadjscssfile(filename){
  	var fileref=document.createElement('script');
  	fileref.setAttribute("type","text/javascript");
  	fileref.setAttribute("src", filename);
 	
 	if (typeof fileref!="undefined"){
  		document.getElementsByTagName("head")[0].appendChild(fileref);
 	}
}

$(function(){
	loadjscssfile(jsSetting['path'] + "moduli/form-address/script.js");
});
