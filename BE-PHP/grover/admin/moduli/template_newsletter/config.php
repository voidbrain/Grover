<?

//////TABELLE////////

//IPORTANTE: le tabelle base sono: main,cat,c. Rispettivamente per la principale, quella di una sua categoria di riferimento (campo id_rif o categoria nel db) e tabella per file allegati. E' ovviamente possibile aggiungere altre tabelle, ma ricordarsi non sovrapporre questi nomi essendo che sono usati qua e la per il sito :).

$tabella['main'] = $config['newsletter']['tabella']['template']; 
$tabella['template'] = $config['newsletter']['tabella']['template']; 
$tabella['black_list'] = $config['newsletter']['tabella']['black_list']; 

$tabella['iscritti_newsletter'] = $config['newsletter']['tabella']['iscritti_newsletter']; 

$tabella['newsletter_liste'] = $config['newsletter']['tabella']['newsletter_liste']; 
$tabella['newsletter_iscritti'] = $config['newsletter']['tabella']['newsletter_iscritti']; 

$config['admin'][MODULO]['root_upload'] = 'files/newsletter/';

$config['modulo']['invio'] = TRUE; //Abilitazione invio mail

$config['modulo']['status'] = array(
						1 => 'Configurazione',
						2 => 'Template',
						3 => 'Destinatari',
						4 => 'Componi',
						5 => 'Anteprima',
						6 => 'Invio',
						7 => 'Riepilogo');

$config['modulo']['session_pfx'] = "newsletter_";

//Settaggi base
$config['modulo']['ds']['nomeMit'] = "Klekoo srl";
$config['modulo']['ds']['emailMit'] = "klekoo@klekoo.com";
$config['modulo']['ds']['ritorna'] = "klekoo@klekoo.com";


//Fileinfo per newsletter con allegati
$file_info = array();

$file_info['copertina'] = array(
	'admin' => array(
			'x' => 120 , 'y' => null,
			'type' => 'image', 
			'title' => 'Immagine',
			'fileExt' => '*.jpg;*.png;*.gif',
			'maxsize' => 5242880,
			'fileDesc' => 'Formato (.JPG,.PNG,.GIF)'),
	'normal' => array('x' => 260 , 'y' => null));

$config['admin'][MODULO]['root_upload'] = 'files/newsletter/static/';
	
$soggetto = 'Template';
$soggetti = 'Template';

$feedback_add = 'Template aggiunto correttamente';
$feedback_sync = 'Template aggiornato con successo';
$feedback_empty = 'Non tutti i parametri sono stati impostati correttamente';

$richiesta_canc = 'Cancellare Template?';

/*if(!$perms->superuser()){
	die('Non hai permessi amministrativi');
}*/

/*

TABELLE
*/

#if(!check_perms('moduli',$nome_modulo)) die('Non hai permessi amministrativi'); // Prima di iniziare verifico i permessi amministrativi dell'utente

?>