<?php

    $arr = array();

    $items = $modulo->get_list_filter($_GET);


    # JSON-encode the response
    $json_response = $modulo->TokenInputTransform($items);

    # Optionally: Wrap the response in a callback function for JSONP cross-domain support
    if($_GET["callback"]) {
        $json_response = $_GET["callback"] . "(" . $json_response . ")";
    }

    # Return the response
    echo $json_response;
