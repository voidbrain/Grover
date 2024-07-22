<?
$passo = 5;

$modulo->init($passo);

$laststeps = $modulo->able($passo);

$arr = $modulo->send_newsletter($_GET['dest']);

# JSON-encode the response
$json_response = json_encode($arr);

# Optionally: Wrap the response in a callback function for JSONP cross-domain support
if($_GET["callback"]) {
    $json_response = $_GET["callback"] . "(" . $json_response . ")";
}

# Return the response
echo $json_response;

?>