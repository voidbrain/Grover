<?
//INIZIO INTERROGAZIONE DATABASE//

//controlli PHP prima dell'inserimento
if($_POST['action']!=""){

	pulisci($_POST);
	
	$result['abilitato'] = ($_POST['abilitato']) ? $_POST['abilitato'] : 0;
	$result["data"] = giradata($_POST['data']);

	if($_POST['action']=='modifica'){
		$result["data_modifica"] = date("Y-m-d H:i:s");
		$upd["news"] = date("Y-m-d H:i:s");
		
		$db->where('id',$_POST['id'])->update($tabella['main'],$result);
		
		$id_rif = $_POST['id'];

		$feedback_class = "success";
		$feedback = $feedback_sync;

		
        


	}else{
		$upd["news"] = date("Y-m-d H:i:s");
        

        $result["data_inserimento"] = date("Y-m-d H:i:s");
		//in fase di creazione lo forzo visibile nel resto delle selezioni
		$db->insert($tabella['main'],$result);

		$id_rif = $db->insert_id();

		$feedback_class = "success";
		$feedback = $feedback_add;

		
	}
	$upd["news"]  = date("Y-m-d H:i:s");
    $db->where('id',1)->update($config['db_pfx'].'app_sync',$upd);
    //echo $db->last_query();

}else{

	$feedback_class = "error";
	$feedback = $feedback_empty;
	
}

//FINE INTERROGAZIONE DATABASE//
?>