<?php
 
include("./config.php");


function del ($id){
	global $tabella;
	$sel=mysql_query("SELECT id FROM ".$tabella['main']." WHERE parent = $id");
	while ($s=mysql_fetch_assoc($sel)){
		del($s['id']);
	}
	mysql_query("DELETE FROM ".$tabella['main']." WHERE id = $id");
}

del($_GET['id']);
			


?>
