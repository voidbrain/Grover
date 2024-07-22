<?
$http_origin = $_SERVER['HTTP_ORIGIN'];
$method = $_SERVER['REQUEST_METHOD'];
$default_time = 946681201000;
$default_table = $config['db_pfx']."plants";

header('Cache-Control: no-cache, must-revalidate');
header('Expires: Mon, 26 Jul 1997 05:00:00 GMT');
header("Content-Type: application/json");

header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");
header('Access-Control-Allow-Methods: GET, DELETE, POST, PUT, OPTIONS');
header("Access-Control-Allow-Origin: $http_origin");

$output = [];

// switch ($method) {
// 	case 'POST':
//         $data = json_decode(file_get_contents("php://input"));
//         $el = $data->item;
//         $el->lastUpdate = time()*1000;
//         if($el->id){
//             $db->where("id",$el->id)->update($default_table,$el);
//             $id = $el->id;
//         }else{
//             $db->insert($default_table,$el);
//             $id = $db->insert_id();
//         }
//         $item = $db->where("id",$id)->get($default_table)->row();
//         $data = array(
//             'items' =>  array($item)
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

            $output["query"] = $db->last_query();
            $output["items"][] = (array)$record;
        }
        break;

    case 'GET':                                                                 // GET
        $data = $_GET;
        $modifiedSince = ($data["lastUpdate"]?:$default_time);
        if($data["id"]){ $db->where("id",($data["id"])); }else{ $db->where("lastUpdate >",$modifiedSince); }
        $output["items"] = $db->get($default_table)->result();
        $output["query"] = $db->last_query();
        $output["tableDefinition"] = $db->field_data($default_table);
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
