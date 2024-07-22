<? 
header('Content-type: application/json');

if(!isset($_POST['modulo'])){die('verificare settaggio variabile modulo');}else{$a_modulo=$_POST['modulo'];}
include("../moduli/".$a_modulo."/config.php");

$id_link = $_POST['id_link'];
$pub_query = mysql_query("SELECT abilitato FROM $table WHERE id = '$id_link' ");

$pub = mysql_fetch_array($pub_query);

if($pub['abilitato']==1){
	$result['abilitato'] = 0;
}else{
	$result['abilitato'] = 1;
}
mysql_query("UPDATE $table SET abilitato  = '".$result['abilitato']."' WHERE id='$id_link'");

echo json_encode($result);

#mysql_query("UPDATE $table SET pubblica = '$pub_val'");
?>