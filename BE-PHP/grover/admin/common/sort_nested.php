<? 
if (!empty($_POST["list"]) && !empty($_POST["update_sql"])) {
	if ($_POST["update_sql"] = 'ok') {
		if (!empty($_POST["list"])) {
			foreach ($_POST["list"] as $key => $value) {
				$set = "";
				$add = array();
				
				if ($value['parent_id']=='root'){
					$value['parent_id'] = 0;
				}
				
				$add['parent'] = $value['parent_id'];

				if($value['depth']>$min_livelpag){
					$add['depth'] = $value['depth']-1;
				}
				
				$add['posizione'] = $key;
				
				if($_GET['table']){
					$table = $_GET['table'];
				}else{
					$table = $tabella['main'];
				}

				//Aggiorno
				$db->where("id",$value['item_id'])->update($table,$add);
				echo $db->last_query();
			}
		}
	} 
} 
?>
