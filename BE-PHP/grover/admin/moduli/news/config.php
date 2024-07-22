<?php

//////TABELLE////////

//IPORTANTE: le tabelle base sono: main,cat,c. Rispettivamente per la principale, quella di una sua categoria di riferimento (campo id_rif o categoria nel db) e tabella per file allegati. E' ovviamente possibile aggiungere altre tabelle, ma ricordarsi non sovrapporre questi nomi essendo che sono usati qua e la per il sito :).


$tabella['main'] = $config['db_pfx'].'news';

$file_info = array();

$file_info['copertina'] = array(
	'admin' => array(
			'x' => 85 , 'y' => 75,
			'type' => 'image', 
			'title' => 'Immagine',
			'fileExt' => '*.jpg;*.png;*.gif',
			'maxsize' => 5242880,
			'fileDesc' => 'Formato (.JPG,.PNG,.GIF)'),
	'thumb' => array('x' => 400 , 'y' => 400),
	'normal' => array('x' => 900 , 'y' => 900));

$file_info['allegato'] = array(
	'admin' => array(
			'type' => 'file', 
			'title' => 'Allegato',
			'fileExt' => '*',
			'maxsize' => 5242880,
			'fileDesc' => 'tutti i files'));

$config['admin'][MODULO]['root_upload'] = 'files/news/';


$soggetto = 'News';
$soggetti = 'News';

$feedback_add = 'News aggiunta correttamente';
$feedback_sync = 'News aggiornata con successo';
$feedback_empty = 'Non tutti i parametri sono stati impostati correttamente';

$richiesta_canc = 'Cancellare News?';

$config['admin'][MODULO]['title'] = 'Gestione News';
