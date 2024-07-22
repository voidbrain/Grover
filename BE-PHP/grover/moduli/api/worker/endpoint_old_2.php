<?	$_POST = ($_POST?$_POST:$_GET);
	$http_origin = $_SERVER['HTTP_ORIGIN'];

	header('Cache-Control: no-cache, must-revalidate');
	header('Expires: Mon, 26 Jul 1997 05:00:00 GMT');
	header("Content-Type: text/html");

	header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");
	header('Access-Control-Allow-Methods: GET, POST, PUT');
	header("Access-Control-Allow-Origin: $http_origin");
	echo "*";

	date_default_timezone_set('Europe/Amsterdam');
	$date = new DateTime(); 
	$time = $date->format('U');
	$time = $time + 7200;

if($_POST["action"]=="SETUP"){
	$settings = array(
		"lights" => array (
			array ( "id_pin" => (int)11, "enabled" => (bool)true )
		),
		"fans" => array (
			array ( "id_pin" => (int)12, "enabled" => (bool)true ),
			array ( "id_pin" => (int)13, "enabled" => (bool)true )
		),
		"pots" => array (
			array (
				"id" => (int)3,
				"probes" => array (
					"ph" =>  array ( "id_pin" => (int)14, "enabled" => (bool)true ),
					"ec" =>  array ( "id_pin" => (int)15, "enabled" => (bool)true ),
					"t" =>  array ( "id_pin" => (int)18, "enabled" => (bool)true )
				),
				"pumps" => array (
					"fertilizer" =>  array ( "id_pin" => (int)16, "enabled" => (bool)true ),
					"waterloop" =>  array ( "id_pin" => (int)17, "enabled" => (bool)true )
				),
			)
		),
		"settings" => array (
			"store_data" => false,
			"date_time" => $time,
			"ph_vcc" => (int)6,
		    "ph_gnd" => (int)7,
		    "t_vcc" => (int)8,
		    "t_gnd" => (int)9,
		    "ec_vcc" => (int)10,
		    "ec_gnd" => (int)11
		)
	);
}
if($_POST["action"]=="TIME"){
	$settings = array(
		"settings" => array ( "store_data" => false, "date_time" => $time )
	);
}
if($_POST["action"]=="SETUP_CLOCK"){
	$settings = array(
		"clock" => array (
			"schedules" => array (
				array ( "on" => "8:00", "idJob" => "d-c_0"),
				array ( "on" => "22:29", "idJob" => "d-c_1")
			)
		)
	);
}
if($_POST["action"]=="SETUP_LIGHTS"){
	$settings = array(
		"lights" => array (
			array (
				"schedules" => array (
					array ( "on" => "8:00", "off" => "18:00", "idJob" => "d-l_0")
				)
			)
		)
	);
}
if($_POST["action"]=="SETUP_FANS"){
	$settings = array(
		"fans" => array (
			array (
				"schedules" => array (
					array ( "on" => "8:00", "off" => "10:00", "idJob" => "d-f_0_0"),
					array (	"on" => "12:00", "off" => "16:00", "idJob" => "d-f_0_1")
				)
			),
			array (
				"schedules" => array (
					array ( "on" => "8:00", "off" => "10:00", "idJob" => "d-f_1_0"),
					array ( "on" => "12:00", "off" => "16:00", "idJob" => "d-f_1_1")
				)
			)
		),
	);
}
if($_POST["action"]=="SETUP_POTS"){
	$settings = array(
		"pots" => array (
			array (
				"id" => (int)3,
				"probes" => array (
					"ph" =>  array (
						// "schedules" => array ( 
						// 	array ( "on" => "8:00", "idJob" => "d-p_0_ph_0"), array ( "on" => "12:00", "idJob" => "d-p_0_ph_1") 
						// )
					),
					"ec" =>  array (
						// "schedules" => array ( 
						// 	array ( "on" => "8:00", "idJob" => "d-p_0_ec_0"), array ( "on" => "12:00", "idJob" => "d-p_0_ph_1") 
						// )
					),
					"t" =>  array (
						// "schedules" => array ( 
						// 	array ( "on" => "8:00", "idJob" => "d-p_0_t_0"), array ( "on" => "12:00", "idJob" => "d-p_0_t_1") 
						// )
					)
				),
				"pumps" => array (
					"fertilizer" =>  array (
						// "schedules" => array (
						// 	array ( "on" => "8:00", "off" => "10:00", "idJob" => "d-p_0_pw_0"),
						// 	array ( "on" => "12:00", "off" => "16:00", "idJob" => "d-p_0_pw_1")
						// )
					),
					"waterloop" =>  array (
						// "schedules" => array (
						// 	array ( "on" => "8:00", "off" => "10:00", "idJob" => "d-p_0_pw_0"),
						// 	array ( "on" => "12:00", "off" => "16:00", "idJob" => "d-p_0_pw_1")
						// )
					)
				),
			)
		)
	);
}
	echo json_encode($settings);

	echo "*";
	


	// echo "<pre>";
	// print_r($_POST);
	// print_r($_GET);
	// echo "</pre>";
