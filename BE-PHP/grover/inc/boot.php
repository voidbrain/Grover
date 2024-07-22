<?php

# === Stabilisco connessione con il database
mysql_connect(MYSQL_HOST,MYSQL_USER,MYSQL_PASS) or exit("Nessuna connessione al database"); 
mysql_select_db(MYSQL_DB) or exit("Nessuna database trovato"); 

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

include(PHPPATH . 'libs/functions.php');
/*include(PHPPATH . 'libs/functions_boot.php');*/
include(PHPPATH . 'libs/db.php');
/*include(PHPPATH . 'libs/gen_obj.php');*/
include(PHPPATH . 'libs/class.phpmailer.php');
include(PHPPATH . 'libs/adjacency.php');
include(PHPPATH . 'libs/lessc.inc.php');
// include(PHPPATH . 'libs/mpdf/mpdf.php'); 



///== ==   =   =
# Compilazione less..

switch (ENVIRONMENT)
{
	case 'development':
		$less = new lessc;
		try {
			$less->checkedCompile(PHPPATH."style/style.less", PHPPATH."style/style.css");
		} catch (exception $e) {
		  echo "Errore compilazion less: " . $e->getMessage();
		}
	break;
}



// =================================================
// CARICAMENTO  file  del modulo MODULI
// =================================================
$module_mandatory_files = array('config.php', 'class.php');

foreach ($config['modules'] as $module) {

	foreach ($module_mandatory_files as $file) {

		if (is_file(PHPPATH . $config['module_base_path'] . $module . '/' . $file)) {

			require PHPPATH . $config['module_base_path'] . $module . '/' . $file;

		}
	}
	
}

// PRECARICO EVENTUALI CLASSI

if( in_array('user', $config['modules']) ){
	$user = new User;
}
if( in_array('form-address', $config['modules']) ){
	$frmAdd = new formAddress;
}
if( in_array('pages', $config['modules']) ){
	$pages = new Pages;
}
if( in_array('news', $config['modules']) ){
	$c_news = new News;
}
if( in_array('modulistica', $config['modules']) ){
	$c_modulistica = new Modulistica;
}
if( in_array('reparti', $config['modules']) ){
	$c_reparti = new Reparti;
}
if( in_array('servizi', $config['modules']) ){
	$servizi = new Servizi;
}

if( in_array('user', $config['modules']) ){
	$variables = array();
	$user->set_variables($variables);
	$user->check();	
}
if( in_array('pages', $config['modules']) ){
	$variables = array();
	$variables["frmAdd"] = $frmAdd;
	$pages->set_variables($variables);
}
