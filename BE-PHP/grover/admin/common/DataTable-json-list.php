<?php

	foreach ($_GET as $key => $value) {
		
		if(strpos($key, 'iSortCol_') !== false && strpos($key, 'iSortCol_')==0){
			$sort['Col'][] = $value;
		}

		if(strpos($key, 'sSortDir_') !== false && strpos($key, 'sSortDir_')==0){
			$sort['Dir'][] = $value;
		}

		if(strpos($key, 'filter_') !== false && strpos($key, 'filter_')==0){
			if ($value == 'Seleziona...') {
				continue;
			}
			$filter[str_replace('filter_', '', $key)] = $value;
		}

	}

  	$output = $modulo->get_dataTable_json($_GET['iDisplayStart'], $_GET['iDisplayLength'], $_GET['sSearch'], $_GET['sEcho'], $sort, $filter);
  
  	echo json_encode( $output );
?>