<?
//////TABELLE////////

//IPORTANTE: le tabelle base sono: main,cat,c. Rispettivamente per la principale, quella di una sua categoria di riferimento (campo id_rif o categoria nel db) e tabella per file allegati. E' ovviamente possibile aggiungere altre tabelle, ma ricordarsi non sovrapporre questi nomi essendo che sono usati qua e la per il sito :).


$tabella['main'] = $config['newsletter']['tabella']['newsletter_liste'];
$tabella['liste_newsletter']['main'] = $tabella['main'];
$tabella['liste_newsletter']['newsletter_iscritti'] = $config['newsletter']['tabella']['newsletter_iscritti'];
$tabella['liste_newsletter']['newsletter_iscritti_assoc'] = $config['newsletter']['tabella']['newsletter_iscritti_assoc'];
$tabella['liste_newsletter']['black_list'] = $config['newsletter']['tabella']['black_list'];



$config['liste_newsletter']['root_tmp'] = 'files/tmp/';

$n_livelpag = 2;


$config['admin'][MODULO]['title'] = 'Liste destinatari';
$titolo = "Liste destinatari";
$soggetto = 'Lista';
$soggetti = 'Liste';

$feedback_add = 'Lista aggiunta correttamente';
$feedback_sync = 'Lista aggiornata con successo';
$feedback_empty = 'Non tutti i parametri sono stati impostati correttamente';

$richiesta_canc = 'Cancellare Lista?';

?>