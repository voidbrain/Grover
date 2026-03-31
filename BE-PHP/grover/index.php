<?php

// Questa variavile definisce lo stato 
define('ENVIRONMENT', 'development');

switch (ENVIRONMENT)
{
	case 'development':
	case 'testing':
	error_reporting(E_ALL & ~E_NOTICE & ~E_WARNING & ~E_DEPRECATED & ~E_STRICT);
		//error_reporting(E_ALL);
	break;

	
	case 'production':
		//error_reporting(0);
	error_reporting(E_ALL & ~E_NOTICE & ~E_WARNING & ~E_DEPRECATED & ~E_STRICT);
		
	break;

	default:
		exit('Non è impostata correttamente la modalità di sviluppo');
}

//Definisco la path del sistema
$phppath = pathinfo(__FILE__, PATHINFO_DIRNAME).'/';
define('PHPPATH',pathinfo(__FILE__, PATHINFO_DIRNAME).'/');

//File di configurazione
include(PHPPATH . 'inc/config.php');


########################################
############### ROUTING ################
########################################

// ATTENZIONE!!!
// l'index è diventato il file routing del sito la vera index si trova su template/index.php
// Assicurarsi di non stampare contenuto html per evitare di sputtanare tutto



//Verifico riscrittura per vecchie pagine
if(isset($config['routing'][$_GET['request']])){
	$request = $config['routing'][$_GET['request']];
}else{
	$request = $_GET['request'];
}



$a_request  = explode('?', $request);
$request = (is_array($a_request)) ? $a_request[0] : $request;
$requestURI = explode('/', $request);


//Tutte le informazioni da inizializzare prima di ogni codice
include(PHPPATH . 'inc/boot.php');


// 301 per vecchie pagine
if(isset($config['routing'][$_GET['request']])){
	header("HTTP/1.1 301 Moved Permanently"); 
	header("location:".PATH.$config['routing'][$_GET['request']]);
}

// SWITCH PAGINA RICHIESTA
// Con questo switch viene interrogato il primo parametro dell'url. Le esclusioni principali vanno impostate prima del parametro di default. Il parametro di default verifica se nella cartella template è presente

//verifico il primo parametro dell'url (baipassando il controllo multilingua)

if ( ! $skip_routing) {

	switch ($requestURI[0]) {
		case 'client': // API CLIENT ENDPOINTS
		case 'ajax': // API AJAX ENDPOINTS
			// Route all /client/* and /ajax/* requests to the API handler
			include PHPPATH . 'api/index.php';
			break;

		default: 
			// For API-only mode, return 404 for non-API routes
			http_response_code(404);
			header('Content-Type: application/json');
			echo json_encode(['error' => 'Not found', 'path' => $request]);
			break;
	}
}
?>
