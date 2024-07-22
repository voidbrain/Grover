<?	
$method = $_SERVER['REQUEST_METHOD'];
$http_origin = $_SERVER['HTTP_ORIGIN'];
$default_time = 946681201000;
$ettings_table = $config['db_pfx']."settings";
$system_log = $config['db_pfx']."system_log";
$probes_log = $config['db_pfx']."probes_log";
$workers_log = $config['db_pfx']."workers_log";
$_GET = ($_POST?$_POST:$_GET);

header('Cache-Control: no-cache, must-revalidate');
header('Expires: Mon, 26 Jul 1997 05:00:00 GMT');
header("Content-Type: text/html");

header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");
header('Access-Control-Allow-Methods: GET, POST, PUT');
header("Access-Control-Allow-Origin: $http_origin");

function get_client_ip() {
	$ipaddress = '';
	if (getenv('HTTP_CLIENT_IP'))
			$ipaddress = getenv('HTTP_CLIENT_IP');
	else if(getenv('HTTP_X_FORWARDED_FOR'))
			$ipaddress = getenv('HTTP_X_FORWARDED_FOR');
	else if(getenv('HTTP_X_FORWARDED'))
			$ipaddress = getenv('HTTP_X_FORWARDED');
	else if(getenv('HTTP_FORWARDED_FOR'))
			$ipaddress = getenv('HTTP_FORWARDED_FOR');
	else if(getenv('HTTP_FORWARDED'))
		 $ipaddress = getenv('HTTP_FORWARDED');
	else if(getenv('REMOTE_ADDR'))
			$ipaddress = getenv('REMOTE_ADDR');
	else
			$ipaddress = 'UNKNOWN';
	return $ipaddress;
}

$data = $_GET;
$output = [];

switch ($_GET["action"]) {
	case "START":
		if($data["serialNumber"]){
			$db->where("device",($data["serialNumber"]));
			$found = $db->get($ettings_table)->row();
			if($found) {
				$el = (object)[];
				$el->id = $found->id;
				$el->lastUpdate = time()*1000;
				$el->device = $data["serialNumber"];
				$el->operatingMode = $found->operatingMode;
				$el->address = get_client_ip();
				$el->port = $data["port"];
				$db->where("id",  $found->id);
				$db->update($ettings_table, $el);
				$output["item"] = $el;
				$output["query"] = $db->last_query();
			} else {
				$el = (object)[];
				$el->lastUpdate = time()*1000;
				$el->device = $data["serialNumber"];
				$el->mode = 0; // default mode, all scheduled events
				$el->address = get_client_ip();
				$el->port = $data["port"];
				$db->insert($ettings_table, $el);
				$output["query"] = $db->last_query();
				$item = $db->where("id",$id)->get($ettings_table)->row();
        $output["item"] = $el;
				
			}
		}
	break;

	case "LOG":
	$data = json_decode(file_get_contents("php://input"));
	// echo file_get_contents("php://input");
	// print_r(json_decode(file_get_contents("php://input")));
	$el = $data->item;

			$db->where("device",($data->serialNumber));
			$found = $db->get($ettings_table)->row();
			if($found) {
				$el->lastUpdate = time()*1000;

				$el->ipAddress = get_client_ip();
			
				switch ($data->item->type) {
					case 'probe': 
						$table = $probes_log;
					break;
					case 'worker':
						$table = $workers_log; 
					break;
					default:
						$table = $system_log;
					break;
				}

				$db->insert($table, $el);
			echo $db->last_query();
			echo "<br />______<br />";
				$item = $db->where("id",$db->insert_id())->get($table)->row();
			echo $db->last_query();
        $output = $item;
			}
		
		
	break;
	
	default:
		$output = array();
	break;

	}

	echo json_encode($output, JSON_NUMERIC_CHECK);
