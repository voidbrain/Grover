<? 

//Libreria file Zip
include(PHPPATH . 'libs/zip.php'); 

//Configurazione generale #= To do list
include(PHPPATHADMIN . 'inc/config.php'); 

//Classe con le funzioni base dell'admin
include(PHPPATHADMIN . 'inc/admin.class.php'); 

//Classe controllo permessi
include(PHPPATHADMIN . 'inc/perms.class.php'); 

//Librerie extra
include(PHPPATH . 'libs/simple_html_dom.php'); //Libreria per parsing html
include(PHPPATH . 'libs/Mobile_Detect.php'); //Libreria detect mobile
#include(PHPPATH . 'libs/nusoap/lib/nusoap.php'); //Libreria per chiamate Soap Service
#include(PHPPATH . 'libs/UploadHandler.php'); //Libreria per l'upload di file con il jQueryUpload

//============================================================\\
// Inserisco nell'oggetto $user tutti i parametri dell'utente \\
//============================================================\\
///== ==   =   =
# Compilazione less..

switch (ENVIRONMENT)
{
	case 'development':
		$less = new lessc;
		try {
			$less->checkedCompile(PHPPATH."style/admin.style.less", PHPPATH."style/admin.style.css");
		} catch (exception $e) {
		  	echo "Errore compilazion less: " . $e->getMessage();
		}
	break;
}


// Creo la classe admin
$admin = new Admin();
// Creo l'istanza perms
$perms = new Perms();
// Creo l'istanza per il controllo dispositivo utente
$mobile_detect = new mobile_detect;
$data= Array();

//Controllo il login dell'utente
if($user->check_perms('*')){

	$user_info = $user->user_info;
	$user_tipolgia_info = $user->user_tipolgia_info;
	
	$data['user_info'] = $user_info;
	$data['user_tipolgia_info'] = $user_tipolgia_info;

	if(method_exists('Admin','set_variables')){
		$data['perms'] = $perms;
		$admin->set_variables($data);
	}
	
	if(method_exists('Perms','set_variables')){
		$data['admin'] = $admin;
		$perms->set_variables($data);
	}

}

# ===== PRELOAD SET
// Parametri da precaricare ad ogni modulo (se presente la funnzione ->set_variables<-)

$data_mod_load['admin'] = $admin;
$data_mod_load['perms'] = $perms;
$data_mod_load['user_info'] = $user_info;
$data_mod_load['user_tipolgia_info'] = $user_tipolgia_info;

# Preload personalizzati

if ($clienti) {
	$data_mod_load['clienti'] = $clienti;
}
if ($frmAdd) {
	$data_mod_load['frmAdd'] = $frmAdd;
}
if ($user) {
	$data_mod_load['user'] = $user;
}