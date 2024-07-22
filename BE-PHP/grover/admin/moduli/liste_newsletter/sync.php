<?
	pulisci($_POST);
	
	if($_POST['insertSingleAssoc'] == 1) {
		$modulo->insertSingleAssoc($_POST);
	}else if ($_POST['insertMultiAssoc'] == 1) {
		echo "pasticcio";
		$modulo->insertMultiAssoc($_POST);
	}else{
		if($_POST['action']!=""){
			if ($_POST['action']=='modifica') {
				$db->where('id',$_POST['id'])->update($tabella['main'],$result);
				$id_rif = $_POST['id'];
				$feedback_class = "success";
				$feedback = $feedback_sync;
			}else{
				
				//in fase di creazione lo forzo visibile nel resto delle selezioni
				$db->insert($tabella['main'],$result);
				$id_rif = $db->insert_id();
				$feedback_class = "success";
				$feedback = $feedback_add;
			}
		}else{
			$feedback_class = "error";
			$feedback = $feedback_empty;
		}
	}
?>