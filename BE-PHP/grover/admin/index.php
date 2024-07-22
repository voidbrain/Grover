<?php

define('PHPPATHADMIN', PHPPATH .'admin/');


// QUI VIENE FATTO IL ROUTING DELLA PAGINA AMMINISTRATIVA
# Attenzione non stampare codice html in questa pagina potrebbe causare problemi per pagine admin che usano ajax
include(PHPPATHADMIN . 'inc/admin.boot.php'); 

// il $requestURI è impostato con la seguente struttura (configurazione di default per i moduli, sono concesse ecezioni)
# $requestURI = array {
# 	 0 => root admin,
# 	 1 => azione da svolgere/modulo di riferimento,
# 	 2 => modulo di riferimento,
# 	 3 => riferimento	
# }

//visualizzo se è stato effettuato il login

if($user->check_perms('*')){

	if($perms->superuser() || TRUE){


	// controllo il secondo parametro per impostare cosa visualizzare
	switch ($requestURI[1]) {
		case 'ajax':

			//così facendo apro la pagina richiesta dentro l'admin (temporaneo finchè non trovo niente di meglio)
			include(PHPPATHADMIN . '/' . str_replace($requestURI[0],'', $_GET['request']));
			break;

		case 'common':
			$modulo = ($_POST['modulo']) ? $_POST['modulo'] : $_GET['modulo'];
			define('MODULO',$modulo);

			//Controllo se l'utente può gestire il modulo
			if(!$perms->check_modulo(MODULO)){ die('Non hai i permessi amministrativi.'); }

			//Verifico presenza file di configurazione del modulo
			if(file_exists(PHPPATHADMIN. 'moduli/' . MODULO . '/config.php')){
				//Carico file di configurazione del modulo
				include PHPPATHADMIN. 'moduli/' . MODULO . '/config.php';

			}else{
 				die('Errore individione modulo e relativo file config.');
 			}

 			
 			//Verifico presenza di una classe personalizzata per il modulo
 			if(file_exists(PHPPATHADMIN . 'moduli/' . MODULO . '/class.php')){
 				//Carico classe del modulo
 				include PHPPATHADMIN . 'moduli/' . MODULO . '/class.php';
 				//Creo l'oggetto
 				$modulo = new Modulo;
 				if(method_exists('Modulo','set_variables')){

 					$modulo->set_variables($data_mod_load);
 				}

 			}

			//così facendo apro la pagina richiesta dentro l'admin (temporaneo finchè non trovo niente di meglio)
			include(PHPPATHADMIN . '/' . str_replace($requestURI[0],'', $_GET['request']));
			break;
		default:


			//Non essendo un caso speciale definisco il secondo parametro dell'urlo come modulo di appartenenza  nella costante MODULO
			if(!is_dir(PHPPATHADMIN . 'moduli/' . $requestURI[1]) || $requestURI[1]==""){
				//Se il modulo selezionato non esiste imposto il primo modulo del menu come il modulo da visualizzare

				if (is_dir(PHPPATHADMIN . 'moduli/splash')) {
					define('MODULO','splash');
				}

				#$modules_key = array_keys($config['admin']['moduli_menu']);
				#$modules = $config['admin']['moduli_menu'][$modules_key[0]]['moduli'][0];
				#define('MODULO',$modules);
				foreach ($config['admin']['moduli_list'] as $modulo) {
					if ($perms->check_modulo($modulo)) {
						define('MODULO', $modulo);
						break;
					}
				}


			}else{

				define('MODULO',$requestURI[1]);

			}

			//Controllo se l'utente può gestire il modulo
			if(!$perms->check_modulo(MODULO)){ die('Non hai i permessi amministrativi.'); }

			//Verifico presenza file di configurazione del modulo
			if(file_exists(PHPPATHADMIN . 'moduli/' . MODULO . '/config.php')){
				//Carico file di configurazione del modulo
				include PHPPATHADMIN . 'moduli/' . MODULO . '/config.php';

			}

			//Verifico presenza di una classe personalizzata per il modulo
			if(file_exists(PHPPATHADMIN . 'moduli/' . MODULO . '/class.php')){
				//Carico classe del modulo
				include PHPPATHADMIN . 'moduli/' . MODULO . '/class.php';
				//Creo l'oggetto
				$modulo = new Modulo;
				if(method_exists('Modulo','set_variables')){

					$modulo->set_variables($data_mod_load);
				}

			}
			
			//In base al secondo parametro definisco il template di visualizzazione i controlli hanno questa precendeza:
			// 1 : Verifico se esiste il template predefinito e generico per quell'azione (add_mod,galleria,etc.)
			// 2 : Verifico se esiste all'interno del modulo esiste un file php con quel nome (pagine speciali per il modulo)
			// 3 : Carico il template principale dell'area amministrativa (che andrà a caricare l'index di ogni modulo).

			if(file_exists(PHPPATHADMIN . 'template/' . $requestURI[2] . '.php')){

				include PHPPATHADMIN . 'template/' . $requestURI[2] . '.php';

			}elseif(file_exists(PHPPATHADMIN . 'moduli/' . MODULO . '/' . $requestURI[2] . '.php')){

				include PHPPATHADMIN . 'moduli/' . MODULO . '/' . $requestURI[2] . '.php';

			}else{

				include PHPPATHADMIN . 'template/main.php';

			}
			break;

		}

	} else {
		
		include PHPPATHADMIN . 'template/no_perms.php';
	
	}
}else{
	//
	include PHPPATHADMIN . 'template/login.php';

}
