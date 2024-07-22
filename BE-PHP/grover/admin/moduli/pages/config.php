<?php

//////TABELLE////////

//IPORTANTE: le tabelle base sono: main,cat,c. Rispettivamente per la principale, quella di una sua categoria di riferimento (campo id_rif o categoria nel db) e tabella per file allegati. E' ovviamente possibile aggiungere altre tabelle, ma ricordarsi non sovrapporre questi nomi essendo che sono usati qua e la per il sito :).

$tabella['main'] = $config['db_pfx'].'pages'; //tabella di riferimento


$config['admin'][MODULO]['root_upload'] = $config['pages']['file_dir'];

$file_info = array();


$file_info = $config['pages']['file_info'];

//Profondità massima Adjacency
$n_livelpag = 4;

//Dizionario

$titolo = 'Gestione pagine';
$soggetto = 'Pagina';
$soggetti = 'Pagine';

$feedback_add = 'Pagina aggiunta correttamente';
$feedback_sync = 'Pagina aggiornata con successo';
$feedback_empty = 'Non tutti i parametri sono stati impostati correttamente';

$richiesta_canc = 'Cancellare Pagina?';
