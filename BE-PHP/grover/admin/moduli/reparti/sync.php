<?php
//INIZIO INTERROGAZIONE DATABASE//

//controlli PHP prima dell'inserimento
$modulo->sync($id_rif);

$feedback_class = $modulo->feedback_class;
$feedback = $modulo->feedback;
$id_rif = $modulo->sync_id;

//FINE INTERROGAZIONE DATABASE//
