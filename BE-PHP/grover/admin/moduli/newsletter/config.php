<?

//////TABELLE////////

//IPORTANTE: le tabelle base sono: main,cat,c. Rispettivamente per la principale, quella di una sua categoria di riferimento (campo id_rif o categoria nel db) e tabella per file allegati. E' ovviamente possibile aggiungere altre tabelle, ma ricordarsi non sovrapporre questi nomi essendo che sono usati qua e la per il sito :).


$tabella['main'] = $config['newsletter']['tabella']['main'];
$tabella['template'] = $config['newsletter']['tabella']['template'];
$tabella['black_list'] = $config['newsletter']['tabella']['black_list'];

$tabella['iscritti_newsletter'] = $config['newsletter']['tabella']['iscritti_newsletter'];
$tabella['clienti'] = $config['newsletter']['tabella']['clienti'];

$tabella['newsletter_liste'] = $config['newsletter']['tabella']['newsletter_liste'];
$tabella['newsletter_iscritti'] = $config['newsletter']['tabella']['newsletter_iscritti'];


$config['admin'][MODULO]['root_upload'] = $config['newsletter']['root_upload'];

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
$config['modulo']['ds']['nomeMit'] = "Barchiamo";
$config['modulo']['ds']['emailMit'] = "info@barchiamo.eu";
$config['modulo']['ds']['ritorna'] = "info@barchiamo.eu";


$file_info = array();

//Fileinfo per newsletter con allegati o immagini
$file_info['template_dinamic_head_img_1'] = array (
	'admin' => array (
			'x' => 600 , 'y' => 75,
			'type' => 'image', 
			'title' => 'Immagine Head',
			'fileExt' => '*.jpg;*.png;*.gif',
			'maxsize' => 3145728,
			'fileDesc' => 'Formato (.JPG,.PNG,.GIF)'),
	'normal' => array ('x' => 900 , 'y' => null));

$file_info['allegato1'] = array (
	'admin' => array (
			'type' => 'file', 
			'title' => 'Allegato',
			'fileExt' => '*;',
			'maxsize' => 10485760,
			'fileDesc' => 'Tutti i file'),
	'file' => array ('type'=>'file'));
	


$config['admin'][MODULO]['title'] = 'Newsletter';
$titolo = 'Newsletter';
$soggetto = 'Newsletter';
$soggetti = 'Newsletter';

$feedback_add = 'Newsletter aggiunta correttamente';
$feedback_sync = 'Newsletter aggiornata con successo';
$feedback_empty = 'Non tutti i parametri sono stati impostati correttamente';

$richiesta_canc = 'Cancellare Newsletter?';

/*if(!$perms->superuser()){
	die('Non hai permessi amministrativi');
}*/

/*

TABELLE
*/

#if(!check_perms('moduli',$nome_modulo)) die('Non hai permessi amministrativi'); // Prima di iniziare verifico i permessi amministrativi dell'utente

?>