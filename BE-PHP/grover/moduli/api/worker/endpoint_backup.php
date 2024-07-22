<?	
$method = $_SERVER['REQUEST_METHOD'];
$_POST = ($_POST?$_POST:$_GET);
$http_origin = $_SERVER['HTTP_ORIGIN'];

header('Cache-Control: no-cache, must-revalidate');
header('Expires: Mon, 26 Jul 1997 05:00:00 GMT');
header("Content-Type: text/html");

header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");
header('Access-Control-Allow-Methods: GET, POST, PUT');
header("Access-Control-Allow-Origin: $http_origin");

date_default_timezone_set('Europe/Amsterdam');
$date = new DateTime(); 
$time = $date->format('U');
$time = $time + 7200;

switch ($_POST["action"]) {
	case "SETUP_SYSTEM":
			$settings = array(
				"clock" => array (
					"priority" => (int)2,
					"jobs" => array (
						array ( "on" => "6:29"),
						array ( "on" => "22:29")
					)
				),
				"settings" => array (
					"store_data" => (bool)false,
					"date_time" => (int)$time,
					"ph_vcc" => (int)6,
					"ph_gnd" => (int)7,
					"t_vcc" => (int)8,
					"t_gnd" => (int)9,
					"ec_vcc" => (int)10,
					"ec_gnd" => (int)11,
					"night_mode_on" => "1:00",
					"night_mode_off" =>"8:00",
					"work_mode" => (int)4
				    // WORKING_MODE_FULL = 5;			|	D	vents on, 	pumps on, 	sensors on 		N 		vents on, 	pumps on, 	sensors on 
			        // WORKING_MODE_ON = 4;				|	D	vents on, 	pumps on, 	sensors on 		N 		vents off, 	pumps off, 	sensors on 
			        // WORKING_MODE_SILENT = 3;			| 	D	vents off, 	pumps on, 	sensors on 		N 		vents off, 	pumps off, 	sensors on 
			        // WORKING_MODE_SUPER_SILENT = 2;	| 	D	vents off, 	pumps off,	sensors on 		N 		vents off, 	pumps off,	sensors on 
			        // WORKING_MODE_OFF = 1;			| 	D	vents off, 	pumps off,	sensors off 	N 		vents off, 	pumps off,	sensors off


				),
				"calendar" => array( 
					array( 	"week_n" => (int)2, 	"id_dose" 	=>	(int)1),
					array( 	"week_n" => (int)8, 	"id_dose" 	=>	(int)2),
					array( 	"week_n" => (int)10, 	"id_dose" 	=>	(int)3),
					array( 	"week_n" => (int)14, 	"id_dose" 	=>	(int)4),
					array( 	"week_n" => (int)16, 	"id_dose" 	=>	(int)5)
				),
				"doses" => array( /*PH=5.8+/-0.5*/
					array( 	"id_dose" => (int)1,	"grow" => (int)3, 	"micro" => (int)3, 	"bloom" => (int)3, 	"ripen" => (int)0,	"EC" => 1.3		),
					array( 	"id_dose" => (int)2,	"grow" => (int)7, 	"micro" => (int)7, 	"bloom" => (int)7, 	"ripen" => (int)0,	"EC" => 1.5		),
					array( 	"id_dose" => (int)3,	"grow" => (int)15,	"micro" => (int)10, "bloom" => (int)5, 	"ripen" => (int)0,	"EC" =>	2.5		),
					array( 	"id_dose" => (int)4,	"grow" => (int)5, 	"micro" => (int)10, "bloom" => (int)15, "ripen" => (int)0,	"EC" => 2.5		),
					array( 	"id_dose" => (int)5,	"grow" => (int)0, 	"micro" => (int)0, 	"bloom" => (int)0, 	"ripen" => (int)60,	"EC" =>	2		)
				)
				
			);
		break;
		case "SETUP_ENV":
			$settings = array(
				"lights" => array (
					array ( 
						"pin" => (int)11, "enabled" => (bool)true,
						"priority" => (int)2,
						"jobs" => array (
							array ( "on" => "8:00", "off" => "18:00")
						)
					),
				),
				"fans" => array (
					array ( 
						"pin" => (int)12, "enabled" => (bool)true,
						"priority" => (int)4,
						"jobs" => array (
							array ( "on" => "8:00", "off" => "10:00"),
							array (	"on" => "12:00", "off" => "16:00")
						)
					),
					array ( 
						"pin" => (int)13, "enabled" => (bool)true,
						"priority" => (int)4,
						"jobs" => array (
							array ( "on" => "8:00", "off" => "10:00"),
							array (	"on" => "12:00", "off" => "16:00")
						)
					)
				),
			);
		break;
	case "TIME":
			$settings = array(
				"settings" => array ( "store_data" => false, "date_time" => $time )
			);
		break;
	case "CONFIRM":
			$settings = array();
		break;
	case (preg_match('/SETUP_POT_.*/', $_POST["action"]) ? true : false) :
		$id = str_replace("SETUP_POT_","",$_POST["action"]);
		if($id){
			$settings = array(
				"pots" => array (
					array (
						"id" => (int)$id, // $pot->id
						"day_start" => 1544375606, // strtotime($pot->day_start_grow)
						"enabled" => TRUE, // (bool)1
						"probes" => array (
							"ph" =>  array ( 
								"pin" => (int)($id."1"), 
								"priority" => (int)2,
								"jobs" => array (
									array ( "on" => "8:00"),
									array ( "on" => "12:00")
								)
							),
							"ec" =>  array ( 
								"pin" => (int)($id."2"), 
								"priority" => (int)2,
								"jobs" => array (
									array ( "on" => "8:00"),
									array ( "on" => "12:00")
								)
							),
							"t" =>  array ( 
								"pin" => (int)($id."3"), 
								"priority" => (int)2,
								"jobs" => array (
									array ( "on" => "8:00"),
									array ( "on" => "12:00")
								)
							),
							"h2oLev" =>  array ( 
								"pin" => (int)($id."4"), 
								"priority" => (int)2,
								"jobs" => array (
									array ( "on" => "8:00"),
									array ( "on" => "12:00")
								)
							)
						),
						"pumps" => array (
							"fertilizer" =>  array ( 
								"pin" => (int)($id."5"), 
								"priority" => (int)4,
								"jobs" => array ( 
									array ( "on" => "8:00"), array ( "on" => "12:00" ) 
								)
							),
							"wateradd" => array ( 
								"pin" => (int)($id."7"),
								"priority" => (int)4,
								"jobs" => array ( 
									array ( "on" => "9:00"), array ( "on" => "13:00") 
								)
							),
							"waterloop" =>  array (
								"pin" => (int)($id."6"),
								"priority" => (int)3,
								"jobs" => array (
									array ( "on" => "8:00",  "off" => "10:00"),
									array ( "on" => "12:00",  "off" => "16:00")
								)
							)
						),
					),
				)
			);
		}
		break;
	
	default:
		$settings = array();
		break;

	}

	echo json_encode($settings);
