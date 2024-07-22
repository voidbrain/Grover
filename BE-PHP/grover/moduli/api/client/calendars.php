<?
$http_origin = $_SERVER['HTTP_ORIGIN'];
$method = $_SERVER['REQUEST_METHOD'];
$default_time = 946681201000;
$default_table = $config['db_pfx']."calendars";
$secondary_table = $config['db_pfx']."calendars_phases";

header('Cache-Control: no-cache, must-revalidate');
header('Expires: Mon, 26 Jul 1997 05:00:00 GMT');
header("Content-Type: application/json");

header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");
header('Access-Control-Allow-Methods: GET, DELETE, POST, PUT, OPTIONS');
header("Access-Control-Allow-Origin: $http_origin");

$output = [];

// switch ($method) {
// 	case 'POST':
// 		$data = json_decode(file_get_contents("php://input"));
// 		$el = $data->item;
// 		$el->lastUpdate = time()*1000;
// 		if($el->id){
// 			$db->where("id",$el->id)->update($default_table,$el);
//             $id = $el->id;
// 		}else{
// 			$db->insert($default_table,$el);
//             $id = $db->insert_id();
// 		}
// 		$item = $db->where("id",$id)->get($default_table)->row();
//         $data = array(
//             'items' =>  array($item),
//         );
//         $output = (array)$data;
//         break;

// 	case 'GET':
// 		$data = $_GET;
//    		$modifiedSince = ($data["lastUpdate"]?:$default_time);
// 		if($data["id"]){ $db->where("id",($data["id"])); }else{ $db->where("lastUpdate >",$modifiedSince); }
// 		$output = $db->get($default_table)->result();
// 		break;

// 	case 'DELETE':                                                             // UPDATE DELETE
//         $output['id'] = $_GET["id"];
//         $output['lastUpdate'] = time()*1000;
//         $output['enabled'] = 0;
//         $output['deleted'] = 1;
//         $output["result"] = ($db->where("id",$output['id'])->update($default_table,$output) ? true : false);
//         $output["query"] = $db->last_query();
//         break;
// }

switch ($method) {
    case 'POST':
        $data = json_decode(file_get_contents("php://input"));
        $els = $data->items;

        foreach ($els as $el) {


            //$phases = json_decode($record['phases']);
            unset($record['phases']);
            $el->lastUpdate = time()*1000;
            $record = (array)$el;
            if(array_key_exists("synced",$record)){unset($record['synced']);}

            if($record['id'] && $record['id']!=0){                                  // UPDATE
                if($db->where("id",$record['id'])->update($default_table,$record)){
                    $record["result"] = true;
                }else{
                    $record["result"] = false;
                }
            }else{                                                                  // INSERT
                $record["enabled"] = 1;
                unset($record['id']);
                if($db->insert($default_table,$record)){
                    $record["id"] = $db->insert_id();
                    $output["result"] = true;
                }else{
                    $output["result"] = false;
                }
            }

            $db->where("idCalendar", $record['id'])->delete($secondary_table);
            foreach ($el->phases as $phase) {

                $row['idCalendar'] = $record['id'];
                $row['duration'] = $phase->duration;
                $row['idPhase'] = $phase->id;
                $row['pos'] = $phase->pos;
                $db->insert($secondary_table,$row);
            }


            $output["query"] = $db->last_query();
            $output["items"][] = (array)$record;
            // echo "<pre>";
            // print_r($output["items"]);
            // echo "</pre>";
            // die();
        }
        break;

    case 'GET':                                                                 // GET
        $data = $_GET;
        $modifiedSince = ($data["lastUpdate"]?:$default_time);
        if($data["id"]){ $db->where("id",($data["id"])); }else{ $db->where("lastUpdate >",$modifiedSince); }
        $output["items"] = $db->get($default_table)->result();

        foreach ($output["items"] as $item) {

            $db->where("idCalendar",$item->id)->order_by('pos','asc');
            $el = $db->get($secondary_table)->result();
            $item->phases = [];
            foreach ($el as $row) {
                $phase = new stdClass();
                $phase->id = $row->id;
                $phase->name = $row->name;
                $phase->idDose = $row->idDose;
                $phase->pos = $row->pos;
                $phase->duration = $row->duration;
                $phase->isBlooming = $row->isBlooming;
                $phase->isFlushing = $row->isFlushing;

                $phase->minTemp = $row->minTemp;
                $phase->maxTemp = $row->maxTemp;
                $phase->minWaterLevel = $row->minWaterLevel;
                $phase->maxWaterLevel = $row->maxWaterLevel;
                $phase->minPh = $row->minPh;
                $phase->maxPh = $row->maxPh;
                $phase->minEC = $row->minEC;
                $phase->maxEC = $row->maxEC;
                array_push($item->phases, $phase);
            }

        }
        $output["query"] = $db->last_query();
        break;

    case 'DELETE':                                                             // UPDATE DELETE
        $output['id'] = $_GET["id"];
        $output['lastUpdate'] = time()*1000;
        $output['enabled'] = 0;
        $output['deleted'] = 1;
        $output["result"] = ($db->where("id",$output['id'])->update($default_table,$output) ? true : false);
        break;
}

echo json_encode($output, JSON_NUMERIC_CHECK);
