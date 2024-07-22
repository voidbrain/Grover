<?
$items = $modulo->get_items();

if ( ! $items) {
	die('nessuna corrispondenza trovata');
}

$file_name = "Estrazione_" . date("Y-m-g_H-i-s") . ".csv";

header('Content-Type: text/x-csv');
header('Expires: ' . gmdate('D, d M Y H:i:s') . ' GMT');
header('Pragma: no-cache');
header('Content-Disposition: attachment; filename='.$file_name);

$fp = fopen('php://output', 'w');


$linea_header=Array();

array_push($linea_header, 'Data iscrizione');
array_push($linea_header, 'Tipologia');
array_push($linea_header, 'Stato');
array_push($linea_header, 'Nome azienda');
array_push($linea_header, 'E-mail');
array_push($linea_header, 'P.IVA e C.F.');
array_push($linea_header, 'Nazione');
array_push($linea_header, 'Regione');
array_push($linea_header, 'Provincia');
array_push($linea_header, 'Comune');
array_push($linea_header, 'Cap');
array_push($linea_header, 'Localita');
array_push($linea_header, 'Telefono');
array_push($linea_header, 'Via/Numero Civico');
array_push($linea_header, 'Sito');
array_push($linea_header, 'Settore');
array_push($linea_header, 'Tags');
array_push($linea_header, 'Descrizione Breve');

fputcsv($fp, $linea_header,';');

$total = 0;

foreach ($items as $item) {

	$linea_dati=array();

	array_push($linea_dati, format_data_ora($item->data_inserimento));
	array_push($linea_dati, $modulo->get_tipologia($item->tipologia)->titolo);
	array_push($linea_dati, (($item->abilitato == 1) ? 'Attiva' : 'Bloccata'));
	array_push($linea_dati, $item->nome);
	array_push($linea_dati, $item->name);
	array_push($linea_dati, $item->p_iva);
	array_push($linea_dati, $modulo->frmAdd->getNazione($item->stato)->Nazione);
	array_push($linea_dati, $modulo->frmAdd->getRegione($item->regione)->regione);
	array_push($linea_dati, $modulo->frmAdd->getProvincia($item->provincia)->provincia);
	array_push($linea_dati, $modulo->frmAdd->getComune($item->comune)->comune);
	array_push($linea_dati, $item->cap);
	array_push($linea_dati, $item->localita);
	array_push($linea_dati, $item->telefono);
	array_push($linea_dati, $item->indirizzo);
	array_push($linea_dati, $item->sito);
	array_push($linea_dati, $modulo->get_settore($item->settore)->titolo);
	array_push($linea_dati, $item->tags_str);
	array_push($linea_dati, (html_entity_decode(TagliaStringa($item->descrizione , 250), ENT_COMPAT , 'UTF-8')));

	fputcsv($fp, $linea_dati,';');

}


// Testo di riassunto dei filtri
if ($filters) {

	foreach ($filters as $filter_id) {
		$filters_text[] = $statuses[$filter_id];
	}
	
	$more_info[] = array("","","","Tipi di ordine cercati:",implode(', ', $filters_text));
}

//stampo i feedback
if(is_array($more_info)){
	foreach ($more_info as $mf) {
		fputcsv($fp, $mf,';');
	}
}

exit;

?>