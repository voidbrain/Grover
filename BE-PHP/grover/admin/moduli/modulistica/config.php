<?php

//////TABELLE////////

//IPORTANTE: le tabelle base sono: main,cat,c. Rispettivamente per la principale, quella di una sua categoria di riferimento (campo id_rif o categoria nel db) e tabella per file allegati. E' ovviamente possibile aggiungere altre tabelle, ma ricordarsi non sovrapporre questi nomi essendo che sono usati qua e la per il sito :).


$tabella['main'] = $config['modulistica']['tabella']['modulistica']; //tabella di riferimento

$config['admin'][MODULO]['root_upload'] = $config['modulistica']['file_dir'];


$file_info = array();

$file_info = $config['modulistica']['file_info'];

$soggetto = 'Modulo';
$soggetti = 'Moduli';

$feedback_add = 'Modulo aggiunto correttamente';
$feedback_sync = 'Modulo aggiornato con successo';
$feedback_empty = 'Non tutti i parametri sono stati impostati correttamente';

$richiesta_canc = 'Cancellare modulo?';

$config['admin'][MODULO]['title'] = 'Gestione moduli';
