<?php

$id = $_GET['id'];
$id_rif = $_GET['id_rif'];
$name = $_GET['name'];
$root_upload = (isset($file_info[$name]['admin']['root_upload'])) ? $file_info[$name]['admin']['root_upload'] : $config['admin'][MODULO]['root_upload'];
$table = (isset($file_info[$name]['admin']['table'])) ? $file_info[$name]['admin']['table'] : $tabella['main'];


if($do[$name]['admin']['multi']!=1){ //se per questo elemento NON è previsto l'inserimento multiplo.. aggiorno la colonna in database dedicata ai file

	$db_file = $db->where("id", $id_rif)->get($table)->row();

	if (isset($db_file->file_info)) {
		$db_file_info = json_decode($db_file->file_info, TRUE);
	}

}



if($file_info[$name]['admin']['multi']==1){ //se per questo elemento è previsto un inserimento multiplo allora prendo il valore nel db
	
	$db->where('id',$id)->delete($tabella['file']);
	$id_multi = '_'.$id;
}

if($file_info[$name]['admin']['type'] == 'file'){

	$nome_file = found_file(PHPPATH.$root_upload,$id_rif.$id_multi.'_'.$name.'_');
	@unlink(PHPPATH.$root_upload.$nome_file);
	unset($db_file_info[$name]);

}else{

	foreach ($file_info[$name] as $sk => $sv){

		$old_nome_file_thumb = found_file(PHPPATH.$root_upload,$id_rif.$id_multi.'_'.$name.'_'.$sk);
		$old_targetFile_thumb = PHPPATH.$root_upload.$old_nome_file_thumb;
		@unlink($old_targetFile_thumb);
		unset($db_file_info[$name][$sk]);

	}

}


if($do[$name]['admin']['multi']!=1){ //se per questo elemento NON è previsto l'inserimento multiplo.. aggiorno la colonna in database dedicata ai file

	$result['file_info'] = json_encode($db_file_info);
	$db->where("id", $id_rif)->update($table, $result);

}
?>

	