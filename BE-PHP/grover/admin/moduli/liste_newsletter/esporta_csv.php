<?
$item = $modulo->get_item($requestURI[3]);

$iscritti = $modulo->get_iscritti_lista($item, TRUE);


if ( ! $item) {
	die('nessuna corrispondenza trovata');
}

$file_name = fix_file_name($item->titolo)."_" . date("Y-m-g_H-i-s") . ".csv";

header('Content-Type: text/x-csv');
header('Expires: ' . gmdate('D, d M Y H:i:s') . ' GMT');
header('Pragma: no-cache');
header('Content-Disposition: attachment; filename='.$file_name);

$fp = fopen('php://output', 'w');

if ($iscritti) {
	foreach ($iscritti as $isc) {
	
		$linea_dati = array();
		
		array_push($linea_dati, $isc['email']);
		array_push($linea_dati, $isc['soggetto']);
	
		fputcsv($fp, $linea_dati, ';');
	}
}


exit;

?>