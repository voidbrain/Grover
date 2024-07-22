<? 
/*********************************************************/
/* CLASSE INTERROGAZIONE TABELLE					     */
/* V 1.5							    	 		     */
/*********************************************************/


class gen_obj{

  public $arr_fields = array();
  public $key;
  public $value;
  public $table;
  public $addwhere = '';
  public $orderby = '';
  protected $prefix;
  protected $debug = FALSE;

	function __construct($table = NULL){
		if($table){
			$this->costruttore("create",$table);
		}
	}

  	function costruttore($key = NULL, $value = NULL, $table = NULL){

     $this->key = $key;
     $this->value = $value;
	 $this->tree = array();

	 if($table != NULL){
	 	$this->table = $table;
	 }

	// SET TABLE
	if($key =='create'){
		$this->table = $value;


	// SELECT
	}elseif(($key != "") && ($value!= "")&& ($key != "new")){
   		$load_query = "SELECT * FROM " . $this->table . " WHERE ".$key." ='".$value."' ".$this->addwhere." ".$this->groupby." ".$this->orderby." ".$this->limit;

   		if ($this->debug) {
   			echo $load_query;
   		}

     	$this->popola($load_query);

     // INSERT
	}else if(($key != "") && ($value!= "") && ($key == "new")&&(!$this->onlyread)){  #inserimento
		$q ="insert into " . $this->table . " (id) values('0')";     #inserimento via sql
		$result = mysql_query($q);

		if ($this->debug && ! $result) {
   			echo mysql_error();
   		}

		$this->key = "id";  #settaggio della chiaca a ID
		$this->value = mysql_insert_id();   #recupera l'ID del record inserito
		$this->popola("SELECT * FROM ". $this->table." WHERE " . $this->key . " = '" .$this->value."' ".$this->orderby); #popolo l'oggetto con i dati dal DB
   		#echo("<hr>".mysql_insert_id()."<br />".$q."<hr>");
		$list_keys = array_keys($value); #prendo i dati per popolare l'oggetto dao POST????
		for($a = 0 ; $a < count($list_keys);$a++){
			if($list_keys[$a] != "id" && $list_keys[$a] != "action" && $list_keys[$a] != "key" && $list_keys[$a] != "value"){
				 $this->$list_keys[$a] = $value[$list_keys[$a]]; #setto le propriet&agrave; dell'oggetto
			}
		}
		return ($this->saveObject() ? $this->value : FALSE);   #salvo


	}elseif($key=="all"){
   		$load_query = "SELECT * FROM " . $this->table." ".$this->addwhere." ".$this->groupby." ".$this->orderby." ".$this->limit;

   		if ($debug) {
   			echo $load_query;
   		}

		$this->popola($load_query);
	}
}

 function onlyread(){
 	$this->onlyread = true;
 }
 
 function Mod_addslashes($string){
 	if(get_magic_quotes_gpc()==1){
 		$string = stripslashes($string);
 	}
	return addslashes($string);
 }
 
 function popola($query){
	$res = mysql_query($query);

	if ( ! $res) {
   		echo mysql_error();
   		return FALSE;

	}

	$num_flds = mysql_num_fields($res);
	if(mysql_num_rows($res)==0){
		return FALSE;
	}else{
		while($usr = mysql_fetch_assoc($res)){
			for($a = 0 ; $a < $num_flds ; $a++){
				$field_name = mysql_field_name($res,$a);
				if(is_array($this->select)){
					if(in_array($field_name,$this->select)){
						if($field_name != $this->key){
							array_push($this->arr_fields,$field_name);
						}
						$this->$field_name = $usr[$field_name];
						$record[$field_name] = $usr[$field_name];
					}
				}else{
					if($field_name != $this->key){
						array_push($this->arr_fields,$field_name);
					}
					$this->$field_name = $usr[$field_name];
					$record[$field_name] = $usr[$field_name];
				}
				 #echo("-".$field_name."<br />");
			}
			$this->tree[] = $record;
		}
	}
 }

 function deleteObject(){
	  if(!$this->onlyread){
	  	return mysql_query("delete from " . $this->table . " where ".$this->key." = '" .$this->value. "' ".$this->addwhere." ".$this->limit);
		#echo "delete from " . $this->table . " where ".$this->key." = '" .$this->value. "' ".$this->addwhere;
	  }
 }

 function sync($arr){
	$list_keys = array_keys($arr);
	for($a = 0 ; $a < count($list_keys);$a++){
		#echo("-".$list_keys[$a]."-.".$arr[$list_keys[$a]]."<br />");
    	if($list_keys[$a] != "id" && $list_keys[$a] != "action" ){
        	$this->$list_keys[$a] = $arr[$list_keys[$a]];
			#echo $this->$list_keys[$a].'<br>';
       	}
  	}
   	$this->saveObject();
 }

 function saveObject(){
	if(!$this->onlyread){
		$query = "update " . $this->table . " ";
		$fields = $this->arr_fields;
		for($k = 0 ; $k < count($fields);$k++){
			if($k == 0 && $fields[0]!= ""){
				$query .= "set ".  $fields[0] ."=\"".$this->Mod_addslashes($this->$fields[0])."\" ";
			}else{
				$query .= " , ".  $fields[$k] ."=\"".$this->Mod_addslashes($this->$fields[$k])."\" ";
			}
			#echo $this->$fields[0].'<br>';
		}
		$query .= " where " . $this->key . " = '" .$this->value. "' ".$this->addwhere;
		#echo $query;
		return mysql_query($query);
	}


       #echo "-".$query."-";
		#echo("<hr>".htmlentities($query)."<hr style=' border:5px solid #000;'<br>");
 }

 	// RESET DI TUTTE LE VARIABILI (eccetto la tabella associata)
	public function clear (){ //da testare
		$fields = $this->arr_fields;
		foreach($this->arr_fields as $k =>$v){
			unset($this->$fields[$k]);
			$this->$fields[$k] = "";
		}

		unset($this->key);
		unset($this->value);
		unset($this->orderby);
		unset($this->addwhere);
		unset($this->tree);
		unset($this->limit);
		unset($this->groupby);
		unset($this->arr_fields);

		$this->key = "";
		$this->value = "";
		$this->orderby = "";
		$this->addwhere = "";
		$this->limit = "";
		$this->groupby = "";
		$this->arr_fields = array();
		$this->tree = array();
		
	}

	// ==========================================================
	// SHORTHAND
	// ==========================================================
	
	// Prefisso tabella
	public function set_prefix($prefix = NULL) {

		$this->prefix = $prefix;

	}

	// Selezione tabella
	public function set_table($table = NULL) {

		$this->table = $this->prefix . $table;

	}

	// Select
	public function where($field = NULL, $value = NULL) {
				
		$this->costruttore($field, $value);

		return $this->tree;
		
	}

	// Update
	public function update($fields = NULL) {
		
		$this->sync($fields);

	}

	// Delete
	public function delete() {
		
		return (bool) $this->deleteObject();

	}

	// Insert (ritorna l'id inserita se corretta)
	public function insert($fields = NULL) {

		return $this->costruttore("new", $fields);

	}

	// Singola riga
	public function row() {

		return ($this->tree && is_array($this->tree)) ? $this->tree[0] : FALSE;

	}

	// Aggiungo where
	public function and_where($field = NULL, $value = NULL) {

		$this->addwhere .= ' AND ' . $field . " = '" . $value . "'";

	}

	// Aggiungo or where
	public function or_where($field = NULL, $value = NULL) {

		$this->addwhere .= ' OR ' . $field . " = '" . $value . "'";

	}

	// Aggiungo un limite di selezione
	public function limit($offset = 1, $start = 0) {

		$this->limit .= ' LIMIT ' . $start . " , " . ($start+$offset) . "";

	}

	public function order_by($field = NULL, $direction = 'ASC') {

		// Inizio
		if ($this->orderby == '') {

			$this->orderby .= ' ORDER BY ' . $field . " " . $direction;

		}

		// Continuazione
		else {

			$this->orderby .= ', ' . $field . " " . $direction;

		}

	}

	public function debug($value = TRUE) {

		$this->debug = (bool) $value;

	}

	public function get($value = 'all', $key = 'id') {

		if($value=='all'){

			$this->costruttore('all');

		}else{

			$this->costruttore($key, $value);
			
		}
		
	}

	/* ESEMPIO SHORTHAND

	$db = new gen_obj;
	$db->set_prefix($ds_db_pfx);
	$db->set_table('carrello');

	$fields = array(
		'codice_articolo' => 50,
	    'codice_articolo' => 20,
	    'utente_codice' => 20,
	    'quantita' => 20,
	    'caratteristiche' => '',
	    'data_inserimento' => '2012-07-05'
	);

	$last_value = $db->insert($fields);

	$db->where('id', $last_value);

	$fields = array(
		'codice_articolo' => 51,
	    'codice_articolo' => 21,
	    'utente_codice' => 21,
	    'quantita' => 21,
	    'caratteristiche' => '',
	    'data_inserimento' => '2013-07-05'
	);

	$db->update($fields);
	$db->where('id', $last_value);
	$db->delete();

	*/

}