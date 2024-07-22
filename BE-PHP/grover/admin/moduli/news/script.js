$(function(){
	
	autocomplete.init();
	$("#sez_tutte").on("click",function(){
		if($(this).attr("checked")!="checked"){
			$("#sezioni input[type='checkbox']").not($(this)).attr("checked",false);
		}else{
			$("#sezioni input[type='checkbox']").not($(this)).attr("checked",true);
		}
	});
	$("#sezioni input[type='checkbox']").not("#sez_tutte").on("click",function(){
		if($(this).attr("checked")!="checked"){
			$("#sez_tutte").attr("checked",false);
		}
	});
	count=4;
	$("#sezioni input[type='checkbox']").not("#sez_tutte").each(function(){
		if($(this).attr("checked")!="checked"){
			--count;
		}
	})
	if(count==0){
		$("#sezioni input[type='checkbox']").attr("checked",true);
	}
});