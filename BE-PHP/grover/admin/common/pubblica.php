<? 
$id = $_POST['id'];
$root_upload = $config['admin'][MODULO]['root_upload'];
$campo = ($_POST['campo'] && trim($_POST['campo']) != "" && trim($_POST['campo']) != "undefined") ? $_POST['campo'] : 'abilitato';
$table = ($_POST['table'] && trim($_POST['table']) != "" && trim($_POST['table']) != "undefined") ? $_POST['table'] : $tabella['main'];

$id = $_POST['id'];
$pub = $db->where('id', $id)->get($table)->row();
if($pub->{$campo}==1){
	$result[$campo] = 0;
}else{
	$result[$campo] = 1;
}

$db->where('id', $id)->update($table,$result);

$jreturn['campo'] = $result[$campo];
echo json_encode($jreturn);

#mysql_query("UPDATE $table SET pubblica = '$pub_val'");
?>