<?

//////TABELLE////////

//IPORTANTE: le tabelle base sono: main,cat,c. Rispettivamente per la principale, quella di una sua categoria di riferimento (campo id_rif o categoria nel db) e tabella per file allegati. E' ovviamente possibile aggiungere altre tabelle, ma ricordarsi non sovrapporre questi nomi essendo che sono usati qua e la per il sito :).

$tabella['main'] = $config['db_pfx'].'tipologie_utenti'; //tabella di riferimento


$soggetto = 'Tipologia';
$soggetti = 'Tipologie';

$feedback_add = 'Tipologia aggiunta correttamente';
$feedback_sync = 'Tipologia aggiornata con successo';
$feedback_empty = 'Non tutti i parametri sono stati impostati correttamente';

$richiesta_canc = 'Cancellare Tipologia?';


$config['modulo']['azioni_su_utenti'] = array ('visualizza','aggiunta','modifica','cancellazione','modifica_presenze','visualizza_presenze','assegnare_scadenze','gestisci_agenda','conferma_agenda','approva_ferie');

/* === INFO ======

- approva ferie = permette la tipologia di utente in questione di approvare o rifiutare le richieste di ferie da parte di un'altro utente.

================= */



$config['modulo']['altre_azioni'] = array ('gestione_news','pripria_agenda');
/*
TABELLE
*/


?>