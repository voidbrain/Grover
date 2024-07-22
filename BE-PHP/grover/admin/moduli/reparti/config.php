<?

//////TABELLE////////

//IPORTANTE: le tabelle base sono: main,cat,c. Rispettivamente per la principale, quella di una sua categoria di riferimento (campo id_rif o categoria nel db) e tabella per file allegati. E' ovviamente possibile aggiungere altre tabelle, ma ricordarsi non sovrapporre questi nomi essendo che sono usati qua e la per il sito :).

$tabella['main'] = $tabella['reparti']['main']; //tabella di riferimento

$titolo = 'Gestione orari reparti';
$soggetto = 'Reparto';
$soggetti = 'Reparti';

$feedback_add = 'Reparto aggiunto correttamente';
$feedback_sync = 'Reparto aggiornato con successo';
$feedback_empty = 'Non tutti i parametri sono stati impostati correttamente';

$richiesta_canc = 'Cancellare reparto?';

$file_info  = array();
//$file_info = $config['user']['file_info'];

$config['admin'][MODULO]['title'] = $titolo;

/*if(!$perms->superuser()){
	die('Non hai permessi amministrativi');
}*/

/*
TABELLE
*/

#if(!check_perms('moduli',$nome_modulo)) die('Non hai permessi amministrativi'); // Prima di iniziare verifico i permessi amministrativi dell'utente

?>