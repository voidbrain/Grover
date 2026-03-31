<?php

# === Stabilisco connessione con il database
$conn = mysqli_connect(MYSQL_HOST,MYSQL_USER,MYSQL_PASS,MYSQL_DB) or exit("Nessuna connessione al database"); 

# === Inizio la session
if (array_key_exists('session', $_REQUEST))
session_id($_REQUEST['session']);
session_start();


# ===IMPOSTO LA PATH DEL SITO

//path per i link di sistema (css,js)
if(str_replace('\\','/',pathinfo($_SERVER['SCRIPT_NAME'],PATHINFO_DIRNAME))!='/'){
    $path=str_replace('\\','/',pathinfo($_SERVER['SCRIPT_NAME'],PATHINFO_DIRNAME)).'/';
}else{
    $path=str_replace('\\','/',pathinfo($_SERVER['SCRIPT_NAME'],PATHINFO_DIRNAME));
}
define('PATH',$path);

// path per i link href
$pathhref = PATH;

# === Impostazione generale della lingua
if($config['multilingua']){
	if(!isset($requestURI[0])||(isset($requestURI[0])&&$requestURI[0]=="")){
		$lng = $config['default_lng'];
	}else{
		$lng = $requestURI[0];
	}
	//riscrivo la path degli href
	$pathhref = PATH . $lng.'/';

	//Definisco un offset per le pagine richiamate
	$offsetURI = 1;
}else{
	$lng = $config['default_lng'];
}

define('PATHHREF',$pathhref);


# === Includo tutti i file e librerie necessarie per il sito

include(PHPPATH . 'libs/db.php');
include(PHPPATH . 'libs/functions.php');
