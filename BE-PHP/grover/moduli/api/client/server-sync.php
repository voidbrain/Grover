<?
$http_origin = $_SERVER['HTTP_ORIGIN'];
$method = $_SERVER['REQUEST_METHOD'];

header('Cache-Control: no-cache, must-revalidate');
header('Expires: Mon, 26 Jul 1997 05:00:00 GMT');
header("Content-Type: application/json");

header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");
header('Access-Control-Allow-Methods: GET, DELETE, POST, PUT, OPTIONS');
header("Access-Control-Allow-Origin: $http_origin");

if (array_key_exists('HTTP_ORIGIN', $_SERVER)) {
    $origin = $_SERVER['HTTP_ORIGIN'];
}
else if (array_key_exists('HTTP_REFERER', $_SERVER)) {
    $origin = $_SERVER['HTTP_REFERER'];
} else {
    $origin = $_SERVER['REMOTE_ADDR'];
}

$output = [];
$output['serverTime'] = time()*1000;
$output['webClientIp'] = $origin;

echo json_encode($output, JSON_NUMERIC_CHECK);
