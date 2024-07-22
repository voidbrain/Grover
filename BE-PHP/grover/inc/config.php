<?php
////////////////////////////////////////
/// PARAMETRI DI CONFIGURAZIONI BASE ///
////////////////////////////////////////


//======== ANAGRAFICA ==
$config['name'] = "Grover";
$config['blurb'] = "";
$config['phone'] = "";
$config['fax'] = "";
$config['piva'] = "";
$config['cf'] = "";
$config['sede'] = "";
$config['address'] = "";
$config['cap'] = "31100";
$config['city'] = "Treviso";
$config['province'] = "TV";
$config['latitudine'] = "45.0";
$config['longitudine'] = "12.0";
$config['site'] = "grover.it";
$config['db_pfx'] = "grover_"; //prefisso del database


// LISTA E-MAIL DEI VARI FORM




//======== MULTILINGUA ==
//se il multilingua è settato a true la path avra come inizio (it/,en/,de/) a seconda del caso
$config['multilingua'] = FALSE;
//lingue concesse
$config['lng_list'] = array('it','en');
//lingua di default
$config['default_lng'] = 'it';

//se il sito è impostato in undercostruction l'utente base non vedrà il sito in fase di sviluppo
$config['undercostruction'] = FALSE;


//======== PARAMETRI BASE ==
//Partita iva
$config['iva'] = 22;

// Codice analitics UA-XXXXX-X
$config['analytics'] = '';


//======== MODULI ==
$config['module_base_path'] = 'moduli/'; //Directory dei moduli
$config['modules'] = array( //Elenco moduli da caricare
	'form-address',
	'pages',
	'newsletter',
	'user',
	'news',
	'ricerca',
);

//====================================  ======= = ======  === ==  =
//======== VARIABILI CHE CAMBIANO IN BASE ALLA FASE DI SVILUPPO ==

switch (ENVIRONMENT)
{
	case 'development':
		//Mail base del sito
		$config['email'] = "daniele.bordignon@gmail.com";
		// root http del sito
		$config['root'] = 'http://igor/sancamillo_it/sancamillo_it';
	break;
	case 'testing':
		//Mail base del sito
		$config['email'] = "";
		// root http del sito
		$config['root'] = '';

	break;
	case 'production':
		//Mail base del sito
		$config['email'] = "";
		// root http del sito
		$config['root'] = '';

	break;
}


//== Imposto la timezone in "Europe / rome"
date_default_timezone_set('Europe/Rome');



//////////////////////////////////////
/// PARAMETRI CONNESSIONE DATABASE ///
//////////////////////////////////////

// MySQL settings
switch (ENVIRONMENT){
	case 'development':
		/* OFFLINE */
		define('MYSQL_HOST','localhost');
		define('MYSQL_USER','root');
		define('MYSQL_PASS','root');
		define('MYSQL_DB','grover');
	break;

	case 'testing':
		 define('MYSQL_HOST','62.149.150.124');
		 define('MYSQL_USER','Sql365115');
		 define('MYSQL_PASS','6a1c26b9');
		 define('MYSQL_DB','Sql365115_5');
	break;
	
	case 'production':
		/* ONLINE */
		define('MYSQL_HOST','62.149.150.124');
		define('MYSQL_USER','Sql365115');
		define('MYSQL_PASS','6a1c26b9');
		define('MYSQL_DB','Sql365115_5');

	break;

	default:
		exit('Non è impostata correttamente la modalità di sviluppo');
}



/////////////////////////////////////////////////
/// PARAMETRI DI CONFIGURAZIONI PERSONALIZZATI///
/////////////////////////////////////////////////



$config['sezioni_modulistica']=Array(
	1 => 'Accettazione',
	2 => 'Amministrazione',
	3 => 'Laboratorio Analisi'
	);

## == Riscrittura vecchi URL


// $config['routing']['vecchio_url'] = "nuovo_url";


///////////////////////////////////////
/// CAMBIAMENTO CONFIG PER TEST MODE///
///////////////////////////////////////

#specificare una lista di mail che cambieranno in fase di test mode
$test_mail = array('email');

if(isset($_GET['test_mode'])&&$_GET['test_mode']==2){
	setcookie("mail", '', time()-3600);
	setcookie("test_mode", '', time()-3600);
}elseif(isset($_GET['test_mode'])&&$_GET['test_mode']==1){
	if(isset($_GET['test_mail'])){
		$set_test_mail = $_GET['test_mail'];
	}else{
		$set_test_mail = 'daniele.bordignon@gmail.com';
	}
	setcookie("mail", $set_test_mail, time()+3600);
	setcookie("test_mode", 1, time()+3600);
	$titolo_test = "|||MODALITA' DI TEST|||mail:".$set_test_mail."|||";
}elseif(isset($_COOKIE['test_mode'])&&$_COOKIE['test_mode']==1){
	$set_test_mail = $_COOKIE['mail'];
	$titolo_test = "|||MODALITA' DI TEST|||mail:".$set_test_mail."|||";
}

//se la test mail è settata cambio tutti i parametri di configurazione delle mail impostati
if(isset($set_test_mail)){
	foreach ($test_mail as $tmail) {
		$config[$tmail] = $set_test_mail;
	}
}
