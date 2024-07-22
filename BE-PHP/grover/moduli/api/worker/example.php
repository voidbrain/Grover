<? $_POST = ($_POST?$_POST:$_GET);
	$http_origin = $_SERVER['HTTP_ORIGIN'];

	header('Cache-Control: no-cache, must-revalidate');
	header('Expires: Mon, 26 Jul 1997 05:00:00 GMT');
	header("Content-Type: text/html");

	header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");
	header('Access-Control-Allow-Methods: GET, POST, PUT');
	header("Access-Control-Allow-Origin: $http_origin");
	$settings = array(
		"sensor" => "gps",
		"time" => 1351824120,
		"data" => array(
		48.756080,
		2.302038
		)
	);

	echo json_encode($settings);