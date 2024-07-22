<?
if(isset($_GET['id_rif']) && ($_GET['id_rif']!='undefined') && $_GET['id_rif'] != ""){
	#$where = "AND id_rif = '".$_GET['id_rif']."'";
	if($_GET['rif']){
		$rif= $_GET['rif'];
	}else{
		$rif= 'id_rif';
	}
	$add[$rif] = $_GET['id_rif'];	
}



if(!isset($_GET['table']) || $_GET['table'] == 'undefined'){
	$table = $tabella['main'];
}else{
	$table = $_GET['table'];
}

foreach ($_GET['listItem'] as $pos => $id) :
	$add['posizione'] = $pos;

	$db->where('id',$id)->update($table,$add);
	
	echo $db->last_query();
	#mysql_query( "UPDATE ".$table." SET posizione ='". $positione ."'  $add WHERE `id` = '".$id."' $where");
endforeach;

?>
