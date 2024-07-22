<?
//INIZIO INTERROGAZIONE DATABASE//
//controlli PHP prima dell'inserimento
if($_POST['action']!=""){

	pulisci($_POST);

	//Creo stringa privilegi
	if(is_array($_POST['nav'])){
		$genesi['nav'] = $_POST['nav'];
	}else{
		$genesi['nav'] = "";
	}

  	/*	
  	foreach ($config['modulo']['azioni_su_utenti'] as $act) {

  		$genesi['utenti_'.$act] = $_POST['utenti_'.$act];

  	}
  	*/

  	/*
  	if(isset($_POST['palestre'])){
  		$genesi['palestre'][] = $_POST['palestre'];
  	}else{
  		$genesi['palestre'] = "";
  	}
  	*/


  	$genesi['moduli'] = (isset($_POST['moduli'])) ? $_POST['moduli'] : "";

  	//$genesi['altre_azioni'] = (isset($_POST['altre_azioni'])) ? $_POST['altre_azioni'] : "";

	$result['privilegi'] = json_encode($genesi);


	if($_POST['action']=='modifica'){

		$_POST['data_modifica'] = date("Y-m-d H:i:s");

		$db->where('id',$_POST['id'])->update($tabella['main'],$result);
		
		$id_rif = $_POST['id'];

		$feedback_class = "success";
		$feedback = $feedback_sync;


	}else{

		//in fase di creazione lo forzo visibile nel resto delle selezioni
		

		$_POST['data_inserimento'] = date("Y-m-d H:i:s");

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