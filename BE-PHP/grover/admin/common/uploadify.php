<?php
if (!isset($_POST['session'])) {
    exit;
} else {
    session_id($_POST['session']);
    session_start();
}
/*
Uploadify v2.1.4
Release Date: November 8, 2010

Copyright (c) 2010 Ronnie Garcia, Travis Nickels

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/


if ( ! empty($_FILES)) {
	$tempFile = $_FILES['Filedata']['tmp_name'];
	//$targetPHPPath = '../up/';

	$nome_file = fix_file_name($_FILES['Filedata']['name']);
	$data = date("Y-m-d H:i:s");
	$id_rif = $_POST['id_rif'];
	$base_root_upload = $config['admin'][MODULO]['root_upload'];

	if($_POST['table']){
		$base_table = $_POST['table'];
	}else{
		$base_table = $tabella['main'];
	}
	
	if(isset($_POST['nome'])){ //Vedo che tipologia di file caricare
		$keys = explode(';',$_POST['nome']);
		foreach($keys as $k){
			$do[$k] = $file_info[$k];
		}
	}else{ //se non è esettato non eseguo nulla
		$do = $file_info;
	}


	foreach ($do as $k => $v){ //estrapolo lista sotto elementi della categoria del file di caricare (es. thumb, thumb_admin, pop, etc.)

		$root_upload = (isset($do[$k]['admin']['root_upload'])) ? $do[$k]['admin']['root_upload'] : $base_root_upload;
		$table = (isset($do[$k]['admin']['table'])) ? $do[$k]['admin']['table'] : $base_table;

		//Controllo numero di file
		if(isset($do[$k]['admin']['fileLimit']) && $do[$k]['admin']['fileLimit'] != "*"){

			$items = $db->where('id_rif',$id_rif)->where('name', $k)->where('table_rif', $table)->get($tabella['file'])->result();

			if(count($items)>=$do[$k]['admin']['fileLimit']){
				continue;
			}

		}


		if($do[$k]['admin']['multi']==1){ //se per questo elemento è previsto un inserimento multiplo allora salvo il valore nel db

			$db->set('posizione', 'posizione + 1', FALSE)->update($tabella['file']);

			$arr['id_rif'] = $id_rif;
			$arr['table_rif'] = $table;
			$arr['name'] = $k;
			$arr['posizione'] = 0;
			$arr['file_name'] = $nome_file;
			$arr['data_inserimento'] = $data;

			//Controllo che nelle caratteristiche non vi sia il titolo... in quel caso preimposto con il nome del file..
			if(isset($file_info[$k]['admin']['caratteristiche']['titolo'])){

				$nmfl = explode('.',$nome_file);
				$car['titolo'] = $nmfl[0];
				$arr['caratteristiche'] = json_encode($car);

			}

			$db->insert($tabella['file'],$arr);
				
			$id_multi = '_'.$db->insert_id();
		}


		if($do[$k]['admin']['type'] != 'file'){ 
			foreach ($v as $sk => $sv){  //estraggo singole caratteristiche del file	

				$old_nome_file_thumb = found_file(PHPPATH.$root_upload,$id_rif.$id_multi.'_'.$k.'_'.$sk.'_');
				$old_targetFile_thumb = PHPPATH.$root_upload.$old_nome_file_thumb;
				if($old_nome_file_thumb){
					@unlink($old_targetFile_thumb);
				}
			
				$targetFile = PHPPATH.$root_upload.$id_rif.$id_multi.'_'.$k.'_'.$sk.'_'.$nome_file; //nome del file immagine finale
				resize_and_save($tempFile,$targetFile,$sv['x'],$sv['y']);
				$save_file[$k][$sk] = $root_upload.$id_rif.$id_multi.'_'.$k.'_'.$sk.'_'.$nome_file;
			}
		}else{
			$nome_file_del = found_file(PHPPATH.$root_upload,$id_rif.$id_multi.'_'.$k.'_'); //nome del file da cancellare
			@unlink(PHPPATH.$root_upload.$nome_file_del);

			$targetFile = PHPPATH.$root_upload.$id_rif.$id_multi.'_'.$k.'_'.$nome_file;  //nome del file finale
			move_uploaded_file($tempFile,$targetFile);
			$save_file[$k] = $root_upload.$id_rif.$id_multi.'_'.$k.'_'.$nome_file;
		}	

		if($do[$k]['admin']['multi'] != 1){ //se per questo elemento NON è previsto l'inserimento multiplo.. aggiorno la colonna in database dedicata ai file

			$db_file = $db->where("id", $id_rif)->get($table)->row();
			if (isset($db_file->file_info)) {
				$db_file_info = json_decode($db_file->file_info, TRUE);
				$final_file_info = (array)$save_file + (array)$db_file_info;
				$result['file_info'] = json_encode($final_file_info);
				$db->where("id", $id_rif)->update($table, $result);
			}

		}
	}
	echo str_replace($_SERVER['DOCUMENT_ROOT'],'','SUCCESS');
	// } else {
	// 	echo 'Invalid file type.';
	// }
}
?>
