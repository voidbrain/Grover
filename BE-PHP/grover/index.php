<?php

// Questa variavile definisce lo stato 
define('ENVIRONMENT', 'testing');

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
		case 'admin': // ADMIN

			include PHPPATH . 'admin/index.php';
			break;

		case 'ajax': // CHIAMATE AJAX

			$requestPAG = "";

			for ($i=1; $i < count($requestURI); $i++) { 
				$requestPAG .= $requestURI[$i] . '/';
			}

			if(file_exists(PHPPATH . substr($requestPAG, 0, -1) . '.php')){

				include PHPPATH . substr($requestPAG, 0, -1) . '.php';

			}else{
				#header('location: ' . PATH . '404');	
			}
			break;

		default: 
			//verifico se il sistema sta girando in multilingua
			$requestPAG = $requestURI[0+$offsetURI];


			//rieffetuo lo switch del reale parametro (lo switch è per parametri speciali che ora non mi vengono in mente... )
			switch ($requestPAG) {
				case 'p':
					include PHPPATH . 'template/pages.php';
					break;
				default:

					if(file_exists(PHPPATH . 'template/' . $requestPAG . '.php')){

						include PHPPATH . 'template/' . $requestPAG . '.php';

					}else if (isset($requestPAG) && $requestPAG !=""){

						header('location: ' . PATHHREF . '404');

					}else if ( ! in_array($requestURI[0], $config ['lng_list']) && $config['multilingua'] && $requestURI[0] != 404 &&  $requestURI[0] != ""){

						header('location: ' . PATH . $config['default_lng'] . '/404');

					}else{
						if($config['undercostruction']){
							header('location: ' . PATHHREF . 'under-construction');
						}else{
							include PHPPATH . 'template/index.php';
						}

					}
				break;
			}
			break;
	}
}
?>