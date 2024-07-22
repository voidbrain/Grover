<?php
if(!isset($_GET['modulo'])){die('verificare settaggio variabile modulo');}else{$a_modulo=$_GET['modulo'];}
include("../moduli/".$a_modulo."/config.php");


$id = $_GET['id'];

if(isset($_GET['table'])){
	$table = $_GET['table'];
}


function del ($id){
	global $tabella;
	global $table;
	global $db;
	$sel=mysql_query("SELECT id FROM ".$table." WHERE parent = $id");
	while ($s=mysql_fetch_assoc($sel)){
		del($s['id']);
	}

	if($file_info){
		foreach($file_info as $k => $v){
			if($file_info[$k]['admin']['multi']==1){ //se per questo elemento è previsto un inserimento multiplo allora prendo il valore nel db
				$multi_files=mysql_query("SELECT * FROM ".$tabella['file']." WHERE id_rif='".$id."' AND table_rif = '".$table."' AND name = '".$k."' ");
				while($multi_file=mysql_fetch_assoc($multi_files)){
					if($file_info[$k]['admin']['type'] == 'file'){
						$nome_file = found_file($path.$root_upload,$id.'_'.$multi_file['id'].'_'.$k.'_');
						@unlink($path.$root_upload.$nome_file);
					}else{
						foreach ($v as $sk => $sv){
							$old_nome_file_thumb = found_file($path.$root_upload,$id.'_'.$multi_file['id'].'_'.$k.'_'.$sk);
							$old_targetFile_thumb = $path.$root_upload.$old_nome_file_thumb;
							@unlink($old_targetFile_thumb);
						}
					}
					mysql_query("DELETE FROM ".$tabella['file']." WHERE id = '".$multi_file['id']."'");
				}
			}else{
				if($file_info[$k]['admin']['type'] == 'file'){
					$nome_file = found_file($path.$root_upload,$id.'_'.$k.'_');
					@unlink($path.$root_upload.$nome_file);
				}else{
					foreach ($v as $sk => $sv){
						$old_nome_file_thumb = found_file($path.$root_upload,$id.'_'.$k.'_'.$sk);
						$old_targetFile_thumb = $path.$root_upload.$old_nome_file_thumb;
						#echo $old_targetFile_thumb;
						@unlink($old_targetFile_thumb);
					}
				}
			}
		}
	}
	
	//mysql_query("DELETE FROM ".$table." WHERE id = $id");
	$table_fields = $db->list_fields($table);
	if(in_array('cancellato', $table_fields)){
		

		$result['cancellato'] = 1;
		$result['data_cancellazione'] = date("Y-m-d H:i:s");
		$result['data_modifica'] = date("Y-m-d H:i:s");
		if($table=="pages"){
			$upd["ospedale"]  = date("Y-m-d H:i:s");
			$upd["servizi"]  = date("Y-m-d H:i:s");
			$upd["reparti"]  = date("Y-m-d H:i:s");
			$upd["partners"]  = date("Y-m-d H:i:s");
    		$db->where('id',1)->update($config['db_pfx'].'app_sync',$upd);
		}
		if($table=="news"){
			$upd["news"]  = date("Y-m-d H:i:s");
    		$db->where('id',1)->update($config['db_pfx'].'app_sync',$upd);
		}

		$db->where('id',$id)->update($table,$result);

	}else{
		$db->delete($table, array('id' => $id)); 
	}
}

del($_GET['id']);
			


?>
