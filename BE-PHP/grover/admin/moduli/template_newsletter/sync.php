<?
//INIZIO INTERROGAZIONE DATABASE//

//controlli PHP prima dell'inserimento
if($_POST['action']!=""){

	

	if($_POST['action']=='modifica'){

		$db->where('id',$_POST['id'])->update($tabella['main'],$result);
		
		$id_rif = $_POST['id'];

		$feedback_class = "success";
		$feedback = $feedback_sync;


	}else{

		$db->insert($tabella['main'],$result);

		$id_rif = $db->insert_id();

		$feedback_class = "success";
		$feedback = $feedback_add;
	}

}else{

	$feedback_class = "error";
	$feedback = $feedback_empty;
	
}

//FINE INTERROGAZIONE DATABASE//
?>