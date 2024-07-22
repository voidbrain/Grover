<?


$id_rif = $_POST['id_rif'];
$name = $_POST['name'];
$table = ($_POST['tabella']) ? $_POST['tabella'] : $tabella['file'];

if(isset($file_info[$name]['admin']['caratteristiche'])){

	if(count($_POST['id'])>0 && isset($name)){

		foreach ($_POST['id'] as $id) {

            $car = $file_info[$name]['admin']['caratteristiche'];

            foreach ($car as $c => $v){
            	$car_sav[$c] = $_POST['caratteristiche'][$id][$c];

			}

        	$add['caratteristiche'] = json_encode($car_sav);

			$db->where('id',$id)->where('id_rif',$id_rif)->where('name',$name)->update($table, $add);

		}

	}

}
?>