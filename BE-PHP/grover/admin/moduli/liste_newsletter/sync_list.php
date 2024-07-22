<?php
if (!isset($_POST['session'])) {
    exit;
} else {
    session_id($_POST['session']);
    session_start();
}

if (!empty($_FILES) && !empty($_POST['id_list']) ) {

	$tempFile = $_FILES['Filedata']['tmp_name'];

	// Check CSV
	$info = pathinfo($_FILES['Filedata']['name']);

	if (strtolower($info['extension']) != 'csv'){
		die('Il file caricato non e\' di tipo CSV');
	}
	

	// ==============================================
	// Lettura CSV
	// ==============================================
	$read = fopen($tempFile, "r");
	$riga = 0;
	$count = 0;

	// ==============================================
	// Aggiornamento o inserimento iscritti
	// ==============================================

	//Scorro le varie righe del csv
	while( ! feof($read)) {

	  	$riga++;

	  	// Esplodo la riga
	  	$row = fgetcsv($read, 9096, ';');


	  	if (ereg('^.+@.+\..+$',$row[0])) {

	  		$iscritti[] = array('email' => $row[0], 'soggetto' => $row[1]);

	  	}

	}

	$modulo->syncMultiRows($iscritti);

}