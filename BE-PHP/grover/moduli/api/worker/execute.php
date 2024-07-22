<?
error_reporting(E_ALL);
$method = $_SERVER['REQUEST_METHOD'];
$default_time = 946681201000;
$default_table = $config['db_pfx']."settings";

header('Cache-Control: no-cache, must-revalidate');
header('Expires: Mon, 26 Jul 1997 05:00:00 GMT');
header("Content-Type: application/json");

header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");
header('Access-Control-Allow-Methods: GET, DELETE, POST, PUT, OPTIONS');
header("Access-Control-Allow-Origin: *");

$output = [];

$data = $_GET;

$db->where("lastUpdate >",0);
$row = $db->get($default_table)->row();

$ch = curl_init(); 
$address = 'http://'.$row->address . ":8084"."/?action=".$data["action"]."&id=".$data["id"]."&type=".$data["type"];
echo $address;
function GetFeed($json_url){
     $feed = file_get_contents($json_url);
     return ($feed);
}

$output = GetFeed($address);
print_r($output);
