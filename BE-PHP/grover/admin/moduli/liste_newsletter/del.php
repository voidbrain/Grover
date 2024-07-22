<?php

switch ($requestURI[3]) {
    case 'assoc':

        $modulo->removeAssoc($_GET['id_list'], $_GET['id_rif']);
        break;
}