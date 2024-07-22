<?
/*********************************************************/
/* RACCOLTA DI FUNZIONI								     */
/* V 3.2.5	+ TAROCCAMENTI  		    	 		     */
/*********************************************************/

/*VARIABILI DI CONFIGURAZIONE*/
/*giorni*/
$dizionario['giorni_it'] = array('Dom','Lun','Mar','Mer','Gio','Ven','Sab');
$ds_giorni_it = array('Dom','Lun','Mar','Mer','Gio','Ven','Sab');
$dizionario['giorni_short_it'] = array('D','L','M','M','G','V','S');
$ds_giorni_short_it = array('D','L','M','M','G','V','S');

/*mesi:*/
$dizionario['mese_it'] = array( '01'=>'gen' , '02'=>'feb' , '03'=>'mar' , '04'=>'apr' , '05'=>'mag' , '06'=>'giu' , '07'=>'lug' , '08'=>'ago' , '09'=>'set' , '10'=>'ott' , '11'=>'nov' , '12'=>'dic');
$ds_mese_it = array( '01'=>'gen' , '02'=>'feb' , '03'=>'mar' , '04'=>'apr' , '05'=>'mag' , '06'=>'giu' , '07'=>'lug' , '08'=>'ago' , '09'=>'set' , '10'=>'ott' , '11'=>'nov' , '12'=>'dic');
$dizionario['mese_en'] = array( '01'=>'jan' , '02'=>'feb' , '03'=>'mar' , '04'=>'apr' , '05'=>'may' , '06'=>'jun' , '07'=>'jul' , '08'=>'aug' , '09'=>'sep' , '10'=>'oct' , '11'=>'nov' , '12'=>'dec');
$ds_mese_en = array( '01'=>'jan' , '02'=>'feb' , '03'=>'mar' , '04'=>'apr' , '05'=>'may' , '06'=>'jun' , '07'=>'jul' , '08'=>'aug' , '09'=>'sep' , '10'=>'oct' , '11'=>'nov' , '12'=>'dec');

$dizionario['mese_long_it'] = array( '01'=>'Gennaio' , '02'=>'Febbraio' , '03'=>'Marzo' , '04'=>'Aprile' , '05'=>'Maggio' , '06'=>'Giugno' , '07'=>'Luglio' , '08'=>'Agosto' , '09'=>'Settembre' , '10'=>'Ottobre' , '11'=>'Novembre' , '12'=>'Dicembre');
$ds_mese_long_it = array( '01'=>'Gennaio' , '02'=>'Febbraio' , '03'=>'Marzo' , '04'=>'Aprile' , '05'=>'Maggio' , '06'=>'Giugno' , '07'=>'Luglio' , '08'=>'Agosto' , '09'=>'Settembre' , '10'=>'Ottobre' , '11'=>'Novembre' , '12'=>'Dicembre');

$dizionario['mese_long_en'] = array( '01'=>'January' , '02'=>'February' , '03'=>'March' , '04'=>'April' , '05'=>'May' , '06'=>'June' , '07'=>'July' , '08'=>'August' , '09'=>'September' , '10'=>'October' , '11'=>'November' , '12'=>'December');
$ds_mese_long_en = array( '01'=>'January' , '02'=>'February' , '03'=>'March' , '04'=>'April' , '05'=>'May' , '06'=>'June' , '07'=>'July' , '08'=>'August' , '09'=>'September' , '10'=>'October' , '11'=>'November' , '12'=>'December');

$dizionario['dizionario_it'] = array ('ore' => 'ore');
$ds_dizionario_it = array ('ore' => 'ore');
$dizionario['dizionario_en'] = array ('ore' => 'hours');
$ds_dizionario_en = array ('ore' => 'hours');

//Impostare l'array in base la lingua
$dizionario['giorni'] = lang($lng,$dizionario['giorni_it'],$dizionario['giorni_en']);
$ds_giorni = lang($lng,$ds_giorni_it,$ds_giorni_en);
$dizionario['mese'] = lang($lng,$dizionario['mese_it'],$dizionario['mese_en']);
$ds_mese = lang($lng,$ds_mese_it,$ds_mese_en);
$dizionario['mese_long'] = lang($lng,$dizionario['mese_long_it'],$dizionario['mese_long_en']);
$ds_mese_long = lang($lng,$ds_mese_long_it,$ds_mese_long_en);
$dizionario['dizionario'] = lang($lng,$dizionario['dizionario_it'],$dizionario['dizionario_en']);
$ds_dizionario = lang($lng,$ds_dizionario_it,$ds_dizionario_en);

/*********************************************************/
/* FUNZIONI GENERICHE  								     */
/*********************************************************/

//LANG
//FUNZIONE: in base alla lingua settata nel primo valore restituisce il corrispettivo contenuto ordine... in ordine (ita-eng-deu-fra) di default ita
function lang ($lng,$ita=NULL,$eng=NULL,$deu=NULL,$fra=NULL,$esp=NULL){
	
	if(($lng == 'eng' || $lng == 'en') && $eng != ''){
		return $eng;
	}elseif(($lng == 'deu' || $lng == 'de') && $deu != ''){
		return $deu;
	}elseif(($lng == 'fra' || $lng == 'fr') && $fra != ''){
		return $fra;
	}elseif(($lng == 'esp' || $lng == 'es') && $esp != ''){
		return $esp;
	}else{
		return $ita;
	}
}

//PASSGEN
//FUNZIONE: genera una password ........
function passgen($len)
  {
  $pass = "";

  if($len > 5 && $len < 17)
    {
    srand((double) microtime() * 1000000);
    for($i=0;$i<12;$i++) {
      $actual_rand =rand(48,122);
      if($actual_rand)
         $pass .= chr($actual_rand);
      }
      $pass = substr(base64_encode($pass), 0, $len);
    }
     $pass = ereg_replace("/", chr(rand(97,122)),$pass);
  $pass = strtolower($pass);
  return $pass;
  }
  
//FUNZIONE PULIZIA ARRAY CON SOLI I RECORD PRESENTI SULLA TABALLE IN DATABASE
//FUNZIONE: Dato un determinato array e una tabella di riferimento pulisce l'array fornito con soli i campi presenti nella tabella indicata

function clear_table_result($_array, $table){

	$_array = pulisci($_array);

	//Ottengo lista dei campi dalla tabella in database e imposto il result con solo i parametri utili
	$result = mysql_query("SHOW COLUMNS FROM " . $table);

	if (!$result) {
	  	echo 'Could not run query: ' . mysql_error();
	    exit;
	}

	if (mysql_num_rows($result) > 0) {
	    while ($row = mysql_fetch_assoc($result)) {
	        $table_fields[]= $row['Field'];
	    }
	}

	foreach ($_array as $key => $value) {

      	if(in_array($key, $table_fields)){

        		$arr[$key] = $value;

      	}

	}

	unset($arr['id']);

	return $arr;
}

/*********************************************************/
/* FUNZIONI ELABORAZIONE NUMERI E DATE				     */
/*********************************************************/

//CLEAN DECIMAL
//FUNZIONE: eliminazione del .00 alla fine di un decimale
function clean_decimal($decimal) {
	$decimal = str_replace(".00", "", $decimal );
	return $decimal;
}

//NUMBER PAD 
//FUNZIONE: dato un numero in ingresso e la sua lungezza. Mi ritorna il numero inserito preceduto da 0 fino ad arrivare alla lunghezza desiderata. (es. 1 -> 01, 11->11; per un numero inserito con lunghezza 2)... Utile per i numeri associati alle date.
function number_pad($number,$n) {
	return str_pad((int) $number,$n,"0",STR_PAD_LEFT);
}

//CLEAN START 0
//FUNZIONE: eliminazione gli zari davanti a un numero
function clean_zero($num){
	if($num[0]==0) $num=substr($num,1); //elimino lo 0 davanti al numero
	if($num[0]==0) clean_zero($num);
	return $num;
}

//FORMAT DATA
//FUNZIONE: Formatta la data con con i mesi scritti in forma letterale eliminando le informazioni sull'ora
function format_data($gdata) {
	global $dizionario;
	  $arr = explode("-",$gdata);
	  if($arr[2]<10)  $arr[2] = ereg_replace("0","",$arr[2]);
	  return $arr[2]." ".$dizionario['mese'][$arr[1]]." ".$arr[0];
  };

//FORMAT DATA ORA
//FUNZIONE: Formatta la data con con i mesi scritti in forma letterale mantenendo le informazioni sull'ora da Y-m-d h:m:s in es. 29 Mag 2011 ore 15:30

function format_data_ora ($gdata) {
	global $dizionario;

  	$tmp = explode(" ",$gdata);
	$ore = explode(":",$tmp[1]);

	  $arr = explode("-",$tmp[0]);
	  if($arr[2]<10)  $arr[2] = ereg_replace("0","",$arr[2]);
 	return $arr[2]." ".$dizionario['mese'][$arr[1]]." ".$arr[0] ." ".$dizionario['ore']." ".$ore[0].":".$ore[1];
};

//FORMAT DATA
//FUNZIONE: Formatta la data con con i mesi scritti in forma letterale eliminando le informazioni sull'ora da Y-m-d h:m:s in es. 29 Mag 2011 

function format_only_data ($gdata) {
	global $dizionario;

  	$tmp = explode(" ",$gdata);
  	if(!is_array($tmp)){
  		$tmp[0] = $gdata;
  	}

  	$arr = explode("-",$tmp[0]);
  	if($arr[2]<10)  $arr[2] = ereg_replace("0","",$arr[2]);
  	return $arr[2]." ".$dizionario['mese'][$arr[1]]." ".$arr[0];
};

//GIRA DATA
//FUNZIONE: gira una data da YYYY-MM-DD a DD-MM-YYYY
function giradata($data){
	return implode("-",array_reverse(explode("-",$data)));
}

//GIRA DATA
//FUNZIONE: controllo formato data che deve essere DD-MM-YYYY
function ControlloData($data){
	if(!ereg("^[0-9]{2}-[0-9]{2}-[0-9]{4}$", $data)){
		return false;
	}else{
		$arrayData = explode("-", $data);
		$Giorno = $arrayData[0];
		$Mese = $arrayData[1];
		$Anno = $arrayData[2];
		if(!checkdate($Mese, $Giorno, $Anno)){
			return false;
		}else{
			return true;
		}
	}
}


//FORMAT PREZZO
//FUNZIONE: formatta il prezzo aggiungendo . per le migliaia e , per i decimali. (es. 1219800.23 -> 1.219.800,23)
function format_prezzo($val, $decimal = 2){
		 $val= number_format($val, $decimal, ',', '.');
		 return $val;
		 }
		 
//FORMAT PREZZO SAVE
//FUNZIONE: riformatta il prezzo per il salvataggio nel database. (es. 1.219.800,23 -> 1219800.23)		 
function format_prezzo_save($val){
		 $val= ereg_replace(",",".",ereg_replace("\.","",$val));
		 return $val;
		 }

//GIRA DATA ORA 
//FUNZIONE: gira una data da YYYY-MM-DD h:m:s a DD-MM-YYYY h:m
function giradata_ora($data){
	$data_ora = explode(' ',$data);
	$ora_ex = explode(':',$data_ora[1]);
	return implode("-",array_reverse(explode("-",$data_ora[0]))).' '.$ora_ex[0].':'.$ora_ex[1];
}

//FORMA MINI DATA ORA
//FUNZIONE: Formatta la data con con i mesi scritti in forma letterale mantenendo le informazioni sull'ora da Y-m-d h:m:s in es. 29.07.2012

function format_mini_data_ora ($gdata) {

  	$tmp = explode(" ",$gdata);
	$ore = explode(":",$tmp[1]);

  	$arr = explode("-",$tmp[0]);
  	if($arr[2]<10)  $arr[2] = ereg_replace("0","",$arr[2]);

 	return number_pad($arr[2],2).".".number_pad($arr[1], 2).".".$arr[0];
};


//FORMA MINI DATA
//FUNZIONE: Formatta la data con con i mesi scritti in forma letterale mantenendo le informazioni sull'ora da Y-m-d in es. 29.07.12
function format_mini_data($gdata) {

	  $arr = explode("-",$gdata);
	  if($arr[2]<10)  $arr[2] = ereg_replace("0","",$arr[2]);

	  return number_pad($arr[2],2) . "." . number_pad($arr[1], 2) . "." . substr($arr[0],-2,2);
  };
  

////FUNZIONE GIORNI DELLA SETTIMANA \\\\\
////FUNZIONE: Data una data in formato (Y-m-d) viene restituito un array con chiavi:
//// W : il numero della settimana di appartenenza
//// giorno : il giorno in cui si trova
//// anno : l'anno in cui si trova
//// lunedi : il primo giorno della settimana
//// domenica : l'ultimo giorno della settimana

function FirstLastWeek($data) {

list($anno, $mese, $giorno) = explode('-', $data);

$w = date('w', mktime(0,0,0, $mese, $giorno, $anno));
$day['W'] = date('W', mktime(0,0,0, $mese, $giorno, $anno));

$dizionario['giorni']=array(0=>'Domenica', 1=>'Lunedì', 2=>'Martedì',3=>'Mercoledì',
              4=>'Giovedì', 5=>'Venerdì', 6=>'Sabato');

$day['giorno'] = $dizionario['giorni'][$w];
$day['anno'] = $anno;
 
if($w == 0 )  {
  $day['lunedi']   = date('Y-m-d', mktime(0,0,0, $mese, $giorno - 6, $anno));
  $day['mercoledi']   = date('Y-m-d', mktime(0,0,0, $mese, $giorno - 4, $anno));
  $day['giovedi']   = date('Y-m-d', mktime(0,0,0, $mese, $giorno - 3, $anno));
  $day['domenica'] = date('Y-m-d', mktime(0,0,0, $mese, $giorno, $anno));
} else {
  $day['lunedi']   = date('Y-m-d', mktime(0,0,0, $mese, $giorno - $w + 1, $anno));
  $day['mercoledi']   = date('Y-m-d', mktime(0,0,0, $mese, $giorno - $w + 3, $anno));
  $day['giovedi']   = date('Y-m-d', mktime(0,0,0, $mese, $giorno - $w + 4, $anno));
  $day['domenica'] = date('Y-m-d', mktime(0,0,0, $mese, $giorno - $w + 7, $anno));
}
return $day;
}
  


// FUNZIONE STAGIONE \\\
//Data una data e il periodo

function season ($data, $stagioni = NULL){

	if(!$stagioni){
		$stagioni = array(
				'primavera' 	=> '03-20', 
				'estate' 		=> '06-20', 
				'autunno' 		=> '09-22', 
				'inverno' 		=> '12-21'); //mm-dd
	}

	$date_ex = explode('-', $data);
	$year = $date_ex[0];

	foreach ($stagioni as $key => $value) {
	 	if(datediff('G',$data,$year.'-'.$value)<=0){
	    	$return['data_inizio'] = $year.'-'.$value;
	  	}
	}

	foreach ($stagioni as $key => $value) {
	  	if(datediff('G',$data,$year.'-'.$value)>0){
	    	$return['data_fine'] = $year.'-'.$value;
	   		break;
	  	}	
			$return['stagione'] = $key;
	}

	if(!isset($return['data_inizio'])){
	  $return['data_inizio'] = ($year-1) . '-' . $stagioni['inverno'];
	}
	if(!isset($return['data_fine'])){
	  $return['data_fine'] = ($year+1) . '-' . $stagioni['primavera'];
	}
	if(!isset($return['stagione'])){
		$return['stagione'] = 'inverno';
	}

	return $return;

}

  
////FUNZIONE DIFFERENZA TRA DUE DATE \\\\\
////FUNZIONE: Date due date in formato (Y-m-d) viene restituito il loro intervallo espresso nel formato richisto nel primo parametro:
//// A - calcolo differenza in anni.
//// M - calcolo differenza in mesi.
//// S - calcolo differenza in settimane.
//// G - calcolo differenza in giorni.

function datediff($tipo, $partenza, $fine)
{
	switch ($tipo)
	{
		case "A" : $tipo = 365;
		break;
		case "M" : $tipo = (365 / 12);
		break;
		case "S" : $tipo = (365 / 52);
		break;
		case "G" : $tipo = 1;
		break;
	}
	$arr_partenza = explode("-", $partenza);
	$partenza_gg = $arr_partenza[2];
	$partenza_mm = $arr_partenza[1];
	$partenza_aa = $arr_partenza[0];
	$arr_fine = explode("-", $fine);
	$fine_gg = $arr_fine[2];
	$fine_mm = $arr_fine[1];
	$fine_aa = $arr_fine[0];
	$date_diff = mktime(12, 0, 0, $fine_mm, $fine_gg, $fine_aa) - mktime(12, 0, 0, $partenza_mm, $partenza_gg, $partenza_aa);
	$date_diff  = floor(($date_diff / 60 / 60 / 24) / $tipo);
	return $date_diff;
} 
  
////FUNZIONE CONVERTI ORE\\\\\
////FUNZIONE: Dato un orario in formato string('hh:mm') o int(m) ritorna relativamente il suo reciproco nel formato corretto 

function convert_hours($hours){
	if(is_string($hours)){
		$hours_arr = explode(':', $hours);
		
		if(!is_array($hours_arr)){
			return FALSE;
		}

		return ((int)$hours_arr[0]*60+(int)$hours_arr[1]);

	}else if(is_int($hours)){
		$mins = $hours%60;
		$hours = ($hours-$mins)/60; 


		$mins = ($mins<10) ?  '0' . $mins : $mins ;

		$hours = ($hours<10) ? '0' . $hours : $hours ;

		return $hours . ':' . $mins;
	}
	return FALSE;
}

////MICRO TIME FLOAT\\\\\
////FUNZIONE:ritorna l'ora in formato millesimale
function microtime_float ()
{
    list ($msec, $sec) = explode(' ', microtime());
    $microtime = (float)$msec + (float)$sec;
    return $microtime;
}
  
/*********************************************************/
/* FUNZIONI ELABORAZIONE STRINGHE			             */
/*********************************************************/

////CLEAN NAME\\\\\
////FUNZIONE:pulisce nome in ingresso
function clean_name($name) { 
$name = strtolower($name);
$code_entities_match = array(' ' ,'!' ,'@' ,'#' ,'$' ,'%' ,'^' ,'&' ,'*' ,'(' ,')' ,'+' ,'{' ,'}' ,'|' ,':' ,'"' ,'<' ,'>' ,'?' ,'[' ,']' ,'' ,';' ,"'" ,',' ,'_' ,'/' ,'*' ,'+' ,'~' ,'`' ,'=' ,' ' ,'---' ,'--','--','à','ù','è','é','ò','ì','°'); 
$code_entities_replace = array('-' ,'-' ,'-' ,'' ,'' ,'' ,'-' ,'-' ,'' ,'' ,'' ,'' ,'' ,'' ,'' ,'-' ,'' ,'' ,'' ,'' ,'' ,'' ,'' ,'' ,'' ,'-' ,'-' ,'-' ,'' ,'' ,'' ,'' ,'' ,'-' ,'-' ,'-','-','a','u','e','e','o','i',''); 
$name = str_replace($code_entities_match, $code_entities_replace, $name); 
$correzioni = array("À" => "A", "Á" => "A", "Â" => "A", "Ä" => "A", "Å" => "A", "Æ" => "AE", "Ç" => "C", "È" => "E", "É" => "E", "Ê" => "E", "Ë" => "E", "Ì" => "I", "Í" => "I", "Î" => "I", "Ï" => "I", "Ñ" => "N", "Ò" => "O", "Ó" => "O", "Ô" => "O", "Ö" => "O", "Ù" => "U", "Ú" => "U", "Û" => "U", "Ü" => "U", "ß" => "ss", "à" => "a", "á" => "a", "â" => "a", "ä" => "a", "æ" => "ae", "ç" => "c", "è" => "e", "é" => "e", "ê" => "e", "ë" => "e", "ì" => "i", "í" => "i", "î" => "i", "ï" => "i", "ñ" => "n", "ò" => "o", "ó" => "o", "ô" => "o", "ö" => "o", "ù" => "u", "ú" => "u", "û" => "u", "ü" => "u", "Ő" => "O", "ő" => "o", "Œ" => "OE", "œ" => "oe");
foreach($correzioni as $k => $v) {
	$name = str_replace($k, $v, $name);
}
return $name; 
}

////FIX FILE NAME\\\\\
////FUNZIONE:pulisce nome in ingresso [Versione più tacchente del clean name]
function fix_file_name($string){

	$correzioni = array("À" => "A", "Á" => "A", "Â" => "A", "Ä" => "A", "Å" => "A", "Æ" => "AE", "Ç" => "C", "È" => "E", "É" => "E", "Ê" => "E", "Ë" => "E", "Ì" => "I", "Í" => "I", "Î" => "I", "Ï" => "I", "Ñ" => "N", "Ò" => "O", "Ó" => "O", "Ô" => "O", "Ö" => "O", "Ù" => "U", "Ú" => "U", "Û" => "U", "Ü" => "U", "ß" => "ss", "à" => "a", "á" => "a", "â" => "a", "ä" => "a", "æ" => "ae", "ç" => "c", "è" => "e", "é" => "e", "ê" => "e", "ë" => "e", "ì" => "i", "í" => "i", "î" => "i", "ï" => "i", "ñ" => "n", "ò" => "o", "ó" => "o", "ô" => "o", "ö" => "o", "ù" => "u", "ú" => "u", "û" => "u", "ü" => "u", "Ő" => "O", "ő" => "o", "Œ" => "OE", "œ" => "oe", "Ã" => "A", "ã" => "a", "å" => "a", "Õ" => "O", "Ø" => "O", "õ" => "o", "ø" => "o", "ÿ" => "y");

	$string = strtr ($string, $correzioni);

    for($i=0 ; $i < strlen($string); $i++) {
        if(!ereg("([0-9A-Za-z_.])",$string[$i]))
            $string[$i] = "-";
    }
    return $string;
}


////unMAGIC QUOTE\\\\\
////FUNZIONE: Rimozione magic quotes ove presente....
function unMagicQuotify($ar) {
	if(get_magic_quotes_gpc()==1){
 		$fixed = array();
 		foreach ($ar as $key=>$val) {
 		  if (is_array($val)) {
 		    $fixed[stripslashes($key)] = unMagicQuotify($val);
 		  } else {
 		    $fixed[stripslashes($key)] = stripslashes($val);
 		  }
 		}
 		return $fixed;
 	}else{
 		return $ar;
 	}
}


////PULISCE\\\\\
////FUNZIONE:trasforma tutto tramite ciclo in codice html esclusi i tag html
function pulisci_for(&$arr){
               $trans = get_html_translation_table(HTML_ENTITIES);
               $list_keys = array_keys($arr);
               $list_values = array_values($arr);
               for($e = 0 ; $e < count($list_values); $e++){
                      $encoded = ereg_replace("&quot;","\"", ereg_replace("'","'",ereg_replace("&lt;","<", ereg_replace("&gt;",">", ereg_replace("&amp;","&",strtr($list_values[$e], $trans) )) ) ));
                      $arr[$list_keys[$e]]=  $encoded;
               }
        }
////FUNZIONE:trasforma tutto in codice html esclusi i tag html
function pulisci($arr){

	$arr = unMagicQuotify($arr);

	foreach ($arr as $k => $v){
	 	if(is_string($v)){
		   	$encoded[$k] = ereg_replace("&quot;","\"",ereg_replace("&quot;","'", ereg_replace("&lt;","<", ereg_replace("&gt;",">", ereg_replace("&amp;","&",$v )))));
	  	}else{
		  	$encoded[$k] = $v;
	  	}
	}
	
	return $encoded;
	
}

////MOD ADDSLASHES\\\\\
////FUNZIONE: verifica presenza magic quotes nel php ini e in caso di mancanza aggiunge l\'addslashses
function Mod_addslashes($string){
	if(get_magic_quotes_gpc()==1){
	  	return ($string);
  	}else{ 
	  	return (addslashes($string));
  	} 
}


////TAGLIA STRINGA\\\\\
////FUNZIONE: Taglia una stringa all'altezza richiesta con possibilità di tener conto degli spazi finali. (stringa*,lunghezza massima*,taglio drastico,pedice) *obbligatori.... Di default taglio drastico è impostato su false, quindi taglia negli spazi, impostare true per tagliare esattamente all'altezza impostata. il pedice invece è automaticamente impostato come '...'
function TagliaStringa($stringa, $max_char, $no_space = false, $final = '...'){
	$stringa = trim($stringa);
	$stringa = strip_tags($stringa);
	$arr_last = array(';', ',','.',':','\'','"',' ');
	if($no_space&&strlen($stringa)>$max_char){
		$stringa_f = substr_replace($stringa,'',$max_char);
	}else{
		$stringa = str_replace('&nbsp;', '', $stringa);
		if(strlen($stringa)>$max_char){
			$stringa_tagliata=substr($stringa, 0,$max_char);
			$last_space=strrpos($stringa_tagliata," ");
			$stringa_ok=substr($stringa_tagliata, 0,$last_space);
			$stringa_f = $stringa_ok;
		}
	}
	if($stringa_f != ''){
		if(in_array(substr($stringa_f, -1),$arr_last)){ //verifico che prima della parte finale non ci siano i valori contenuti in $arr_last
			$stringa_f = substr($stringa_f, 0, - 1); 
		}
		return $stringa_f.$final;
	}else{
		return $stringa;
	}
}


////TRONCA HMTL\\\\\
////FUNZIONE: TruncateHtml can truncate a string up to a number of characters while preserving whole words and HTML tags
/**
 * @param string $text String to truncate.
 * @param integer $length Length of returned string, including ellipsis.
 * @param string $ending Ending to be appended to the trimmed string.
 * @param boolean $exact If false, $text will not be cut mid-word
 * @param boolean $considerHtml If true, HTML tags would be handled correctly
 *
 * @return string Trimmed string.
 */
function TruncateHtml($text, $length = 100, $ending = '...', $exact = false, $considerHtml = true) {
	if ($considerHtml) {
		//Concedo questi tag
		$text = strip_tags($text, '<p><a><span><div><strong><em><i><strike><h1><h2><h3><h4><h5><ul><ol><li>');

		// if the plain text is shorter than the maximum length, return the whole text
		if (strlen(preg_replace('/<.*?>/', '', $text)) <= $length) {
			return $text;
		}
		// splits all html-tags to scanable lines
		preg_match_all('/(<.+?>)?([^<>]*)/s', $text, $lines, PREG_SET_ORDER);
		$total_length = strlen($ending);
		$open_tags = array();
		$truncate = '';
		foreach ($lines as $line_matchings) {
			// if there is any html-tag in this line, handle it and add it (uncounted) to the output
			if (!empty($line_matchings[1])) {
				// if it's an "empty element" with or without xhtml-conform closing slash
				if (preg_match('/^<(\s*.+?\/\s*|\s*(img|br|input|hr|area|base|basefont|col|frame|isindex|link|meta|param)(\s.+?)?)>$/is', $line_matchings[1])) {
					// do nothing
				// if tag is a closing tag
				} else if (preg_match('/^<\s*\/([^\s]+?)\s*>$/s', $line_matchings[1], $tag_matchings)) {
					// delete tag from $open_tags list
					$pos = array_search($tag_matchings[1], $open_tags);
					if ($pos !== false) {
					unset($open_tags[$pos]);
					}
				// if tag is an opening tag
				} else if (preg_match('/^<\s*([^\s>!]+).*?>$/s', $line_matchings[1], $tag_matchings)) {
					// add tag to the beginning of $open_tags list
					array_unshift($open_tags, strtolower($tag_matchings[1]));
				}
				// add html-tag to $truncate'd text
				$truncate .= $line_matchings[1];
			}
			// calculate the length of the plain text part of the line; handle entities as one character
			$content_length = strlen(preg_replace('/&[0-9a-z]{2,8};|&#[0-9]{1,7};|[0-9a-f]{1,6};/i', ' ', $line_matchings[2]));
			if ($total_length+$content_length> $length) {
				// the number of characters which are left
				$left = $length - $total_length;
				$entities_length = 0;
				// search for html entities
				if (preg_match_all('/&[0-9a-z]{2,8};|&#[0-9]{1,7};|[0-9a-f]{1,6};/i', $line_matchings[2], $entities, PREG_OFFSET_CAPTURE)) {
					// calculate the real length of all entities in the legal range
					foreach ($entities[0] as $entity) {
						if ($entity[1]+1-$entities_length <= $left) {
							$left--;
							$entities_length += strlen($entity[0]);
						} else {
							// no more characters left
							break;
						}
					}
				}
				$truncate .= substr($line_matchings[2], 0, $left+$entities_length);
				// maximum lenght is reached, so get off the loop
				break;
			} else {
				$truncate .= $line_matchings[2];
				$total_length += $content_length;
			}
			// if the maximum length is reached, get off the loop
			if($total_length>= $length) {
				break;
			}
		}
	} else {
		if (strlen($text) <= $length) {
			return $text;
		} else {
			$truncate = substr($text, 0, $length - strlen($ending));
		}
	}
	// if the words shouldn't be cut in the middle...
	if (!$exact) {
		// ...search the last occurance of a space...
		$spacepos = strrpos($truncate, ' ');
		if (isset($spacepos)) {
			// ...and cut the text in this position
			$truncate = substr($truncate, 0, $spacepos);
		}
	}
	// add the defined ending to the text
	$truncate .= $ending;
	if($considerHtml) {
		// close all unclosed html-tags
		foreach ($open_tags as $tag) {
			$truncate .= '</' . $tag . '>';
		}
	}
	return $truncate;
}


////IS EMAIL\\\\\
////FUNZIONE: Valida il formato di una email
function is_mail($email) { 
	return (ereg('^.+@.+\..+$',$email)); 
}   


////CREA URL\\\\\
////FUNZIONE: Pulisce l'url e aggiunge caratteri prima e dopo per rendere l'url unico in caso di corrispondenza
function crea_url($url, $arrayUrl = NULL, $charAdd = '-') { 

	$url = clear_url_name($url);

	if ( is_array($arrayUrl) ) {

		$url = build_url($url, $arrayUrl, $charAdd);

	}

	return $url; 
}   

function build_url($url, $arrayUrl, $charAdd, $count = 0) { 

	$checkUrl = ($count > 0) ? $url . $charAdd . $count : $url;

	if ( in_array($checkUrl, $arrayUrl) ) {

    	$count ++;

		return build_url($url, $arrayUrl, $charAdd, $count);

    } else {

    	return $checkUrl; 

    }

}   

////CLEAR URL NAME\\\\\
////FUNZIONE: pulisce nome in ingresso in modo da renderlo più trendy e alla moda
function clear_url_name($string){

	$string = trim($string);
    $string = strtr ($string, "ÀÁÂÃÄÅàáâãäåÒÓÔÕÖØòóôõöøÈÉÊËèéêëÇçÌÍÎÏìíîïÙÚÛÜùúûüÿÑñ", "AAAAAAaaaaaaOOOOOOooooooEEEEeeeeCcIIIIiiiiUUUUuuuuyNn");
    $string = strtolower($string);
    //$string = urlencode($string);

    $new_string = "";
    $last_str = '-';

    for($i=0 ; $i < strlen($string); $i++) {

        if( ! ereg("([0-9A-Za-z])",$string[$i])){

            $string[$i] = "-";
        	
        }

        if ($last_str != '-' || $string[$i] != "-") {

        	$new_string .= $string[$i];

        }

    	$last_str = $string[$i];

    }

    return $new_string;
}

function crea_url_table($titolo, $table, $charAdd = '-', $key = 'permalink')
{

	$result = mysql_query("SELECT {$key} AS permalink FROM " . $table);

	while ($row = mysql_fetch_assoc($result)){
		$permalinks[$row['permalink']] = $row['permalink'];
	}

	return crea_url($titolo, $permalinks, $charAdd);

}


////VALIDAZIONE CODICE FISCALE\\\\\
////FUNZIONE: Dato un codice fiscale in ingresso, verifica che quest'ultimo sia corretto controllando l'ultima cifra.

function validateCodiceFiscale($cf){

	if($cf == '') return false; 

	if(strlen($cf) != 16) return false; 

	$cf = strtoupper($cf); 

	if( ! preg_match("/[A-Z0-9]+$/", $cf)) return false;

	$s = 0; 

	for($i=1; $i<=13; $i+=2){ 

		$c=$cf[$i]; 

		if('0'<=$c and $c<='9') 
			$s+=ord($c)-ord('0'); 
		else 
			$s+=ord($c)-ord('A'); 
	} 

	for($i = 0; $i <= 14; $i += 2){ 

		$c = $cf[$i];

	 	switch($c){ 
	 		case '0': 
	 			$s += 1;
			break;
			case '1': 
				$s += 0;
			break;
			case '2': 
				$s += 5;
			break;
			case '3': 
				$s += 7;
			break;
			case '4': 
				$s += 9;
			break;
			case '5': 
				$s += 13;
			break;
			case '6': 
				$s += 15;
			break;
			case '7': 
				$s += 17;
			break;
			case '8': 
				$s += 19;
			break;
			case '9': 
				$s += 21;
			break;
			case 'A': 
				$s += 1;
			break;
			case 'B': 
				$s += 0;
			break;
			case 'C': 
				$s += 5;
			break;
			case 'D': 
				$s += 7;
			break;
			case 'E': 
				$s += 9;
			break;
			case 'F': 
				$s += 13;
			break;
			case 'G': 
				$s += 15;
			break;
			case 'H': 
				$s += 17;
			break;
			case 'I': 
				$s += 19;
			break;
			case 'J': 
				$s += 21;
			break;
			case 'K': 
				$s += 2;
			break;
			case 'L': 
				$s += 4;
			break;
			case 'M': 
				$s += 18;
			break;
			case 'N': 
				$s += 20;
			break;
			case 'O': 
				$s += 11;
			break;
			case 'P': 
				$s += 3;
			break;
			case 'Q': 
				$s += 6;
			break;
			case 'R': 
				$s += 8;
			break;
			case 'S': 
				$s += 12;
			break;
			case 'T': 
				$s += 14;
			break;
			case 'U': 
				$s += 16;
			break;
			case 'V': 
				$s += 10;
			break;
			case 'W': 
				$s += 22;
			break;
			case 'X': 
				$s += 25;
			break;
			case 'Y': 
				$s += 24;
			break;
			case 'Z': 
				$s += 23;
			break;
		} 
	} 

	return ( chr($s%26+ord('A')) == $cf[15] );
}

////////VIDEO CODE\\\\\\\\\
////FUNZIONE: dato un url in ingresso (di vimeo o youtube) ritorna un array contenente:
### ['piattaforma'] : piattaforma
### ['code'] : codice del video

function video_code($url){
	$image_url = parse_url($url);
	if($image_url['host'] == 'www.youtube.com' || $image_url['host'] == 'youtube.com'){
		$array = explode("&", $image_url['query']);
		$result['piattaforma'] = 'youtube';
		$result['code'] = substr($array[0], 2);
	}elseif($image_url['host'] == 'www.vimeo.com' || $image_url['host'] == 'vimeo.com'){
		$result['piattaforma'] = 'vimeo';
		$result['code'] = substr($image_url['path'], 1);
	}else{
		$video['piattaforma'] = false;
		$video['code'] = false;
	}
	return $result;
}

////////CODE VIDEO IMAGE \\\\\\\\\
////FUNZIONE: dato un codice e una piattaforma mi ritorna un array contenente:
### ['url_video'] : Url del video
### ['url_image'] : Url dell'immagine di anteprima di default

function code_video_image($piattaforma, $code){
	if($piattaforma=="youtube"){
		$result['url_video']="http://www.youtube.com/watch?v=".$code;
		$result['url_video_embed']="http://www.youtube.com/embed/".$code;
		$result['url_image']="http://img.youtube.com/vi/".$code."/0.jpg";;
	}elseif($piattaforma=="vimeo"){ 
		$result['url_video']="https://www.vimeo.com/".$code;
		$result['url_video_embed']="https://player.vimeo.com/video/".$code;
		$request_url = "http://vimeo.com/api/v2/video/".$code.".php";
		$c = curl_init();
		$timeout = 5;
		curl_setopt($c, CURLOPT_URL, $request_url);
		curl_setopt($c, CURLOPT_RETURNTRANSFER, 1);
		curl_setopt($c, CURLOPT_CONNECTTIMEOUT, $timeout);
		$curlContent = trim(curl_exec($c));
		curl_close($c);
		$hash = unserialize($curlContent);
		$result['url_image']=$hash[0]["thumbnail_large"];
	}else{
		$video['url_video'] = false;
		$video['url_video_embed'] = false;
		$video['url_image'] = false;
	}
	return $result;
}


//////// PRETTY ARRAY\\\\\\\\\
////FUNZIONE: dato un array ritorna i suoi valori in formato stringa con un separatore in mezzo 
### es. array('banana', 'mela', 'pera') => banana, mela, pera

function pretty_array($array, $sep = ", "){
	
	$result = "";
	$s = "";

	foreach ($array as $arr) {
		$result .= $s.$arr;
		$s = $sep;
	}

	return $result;
}

  

/*********************************************************/
/* FUNZIONI ELABORAZIONE FILE				             */
/*********************************************************/

//INFORMAZIONI PESO CARTELLA
////FUNZIONE:data una cartella ritorna il suo peso in byte
function get_dir_size($dir_name){
    $dir_size =0;
	if (is_dir($dir_name)) {
		if ($dh = opendir($dir_name)) {
			while (($file = readdir($dh)) !== false) {
				if($file !="." && $file != ".."){
					if(is_file($dir_name."/".$file)){
						$dir_size += filesize($dir_name."/".$file);
					}
					/* check for any new directory inside this directory */
					if(is_dir($dir_name."/".$file)){
						$dir_size +=  get_dir_size($dir_name."/".$file);
					}
				}
			}
    	}
  		closedir($dh);
   	}
	return $dir_size;
}

//FORMATTAZIONE PESO
////FUNZIONE:dato un valore in byte ritorna il suo valore formattato correttamente
function format_size($bytes, $precision = 2){

	$units = array('B', 'KB', 'MB', 'GB', 'TB'); 

    $bytes = max($bytes, 0); 
    $pow = floor(($bytes ? log($bytes) : 0) / log(1024)); 
    $pow = min($pow, count($units) - 1); 

    // Uncomment one of the following alternatives
  	$bytes /= pow(1024, $pow);
    // $bytes /= (1 << (10 * $pow)); 

    return round($bytes, $precision) . ' ' . $units[$pow]; 
}

////ESTENSIONE\\\\\
////FUNZIONE:dato il nome del file mi estrapola l'estensione del file (ATTENZIONE estrapola il .qualcosa dinale... non va ad esaminare il reale contenuto del file)

function estensione($filename){
	$estensione=pathinfo($filename, PATHINFO_EXTENSION);
	return $estensione;
}

//FOUND FILE
//FUNZIONE: cerca all'interno di una specifica cartella un file basandosi su una parte parziale del suo nome.. Se non lo trova ritornerà false
function found_file ($dir,$c_name){

	if ( ! is_dir($dir)) {
		return FALSE;
	}
	
	if (substr($dir, -1) != "/") {
		$dir = $dir."/";
	}

	foreach (glob($dir.$c_name."*") as $mod) {
	    $found = str_replace($dir,'', $mod);
		break;
	}

	return ($found) ? $found : FALSE;

}

//FOUND MULTI FILE
//FUNZIONE: cerca all'interno di una specifica cartella tutti i file basandosi su una parte parziale del suo nome.. Se non trova nulla ritornerà false
function found_multi_file ($dir,$c_name){

	if ( ! is_dir($dir)) {
		return FALSE;
	}
	
	if (substr($dir, -1) != "/") {
		$dir = $dir."/";
	}

	foreach (glob($dir.$c_name."*") as $mod) {
	   	$found[] = str_replace($dir,'', $mod);
	}

	return ($found) ? $found : FALSE;

}

////RESIZE AND SAVE\\\\\
////FUNZIONE:ridimensiona immagini .jpg, .gif e .png e le salva nella directory impostata (fonte*,destinazione*,larghezza,altezza)  *obbligatori
function resize_and_save($src,$name,$max_w=NULL,$max_h=NULL){
	$jpeg_quality = 100;

	list($img_w, $img_h, $tipe, $attr) = getimagesize($src);	
	
	if($tipe==2){
		$img = imagecreatefromjpeg($src);
	}elseif($tipe==3){
		$img = imagecreatefrompng($src);
	}elseif($tipe==1){
		$img = imagecreatefromgif($src);
	}else{
		return false;
	}
	
	$img_w = imagesx($img);
	$img_h = imagesy($img);
	
	if($max_w != null && $max_h != null){							//specificati altezza e larghezza max
			if(($img_w < $max_w) && ( $img_h < $max_h)){
					$resized_img_w = $img_w;
					$resized_img_h = $img_h;
			}else if($img_w > $img_h){									//landscape
					$resized_img_h = round(($img_h * $max_w)/$img_w);
					$resized_img_w = $max_w;
					if($resized_img_h > $max_h){
						$resized_img_h = $max_h;
						$resized_img_w = round(($img_w*$max_h)/$img_h);
					}
					clearstatcache();
			}else if ($img_w < $img_h){								//portrait
					$resized_img_w = round(($img_w * $max_h)/$img_h);
					$resized_img_h = $max_h;
					if($resized_img_w > $max_w){
						$resized_img_w = $max_w;
						$resized_img_h = round(($img_h*$max_w)/$img_w);
					}
			}else{
					if($max_w > $max_h){
						$resized_img_w = $max_h;
						$resized_img_h = $max_h;
					}else if($max_w < $max_h){
						$resized_img_w = $max_w;
						$resized_img_h = $max_w;
					}else{
						$resized_img_w = $max_w;
						$resized_img_h = $max_h;
					}
			}
	}else if($max_w != null && $max_h == null){						//specificata solo larghezza max
				if($img_w < $max_w ){
					$resized_img_w = $img_w;
					$resized_img_h = $img_h;
				}else{
					$resized_img_h = round(($max_w*$img_h)/$img_w);
					$resized_img_w = $max_w;
				}
	}else if($max_w == null && $max_h != null){						//specificata solo altezza  max
				if($img_h < $max_h){
					$resized_img_w = $img_w;
					$resized_img_h = $img_h;
				}else{
					$resized_img_w = round(($max_h*$img_w)/$img_h);
					$resized_img_h = $max_h;
			}
	}else{	// nessuna specifica sulle misure
		$resized_img_w = $img_w;
		$resized_img_h = $img_h;
	}

	
//FINITI I CALCOLI DELLE NUOVE MISURE CREO LE NUOVE IMMAGINI
if($tipe==2){
	  $resized_img=imagecreatetruecolor($resized_img_w,$resized_img_h)or die('non crea immagine resizata');
	  imagecopyresampled($resized_img,$img,0,0,0,0,$resized_img_w,$resized_img_h,imagesx($img),imagesy($img))or die('non copia immagine');
	  imagejpeg($resized_img,$name,$jpeg_quality);
}elseif($tipe==3||$tipe==1){
	  $resized_img=imagecreatetruecolor($resized_img_w,$resized_img_h)or die('non crea immagine resizata');
	  // Setto le trasparenze
	  imagealphablending($resized_img , false);
	  imagesavealpha($resized_img,true);
	  //imagecolorallocatealpha mi regola il valore della trasparenza.. con 127 finale si ha la massima trasparenza
	  $transparentColor = imagecolorallocatealpha($resized_img, 255, 255, 255, 127);
	  imagefilledrectangle($resized_img, 0, 0, $resized_img_w, $resized_img_h, $transparentColor);	
	  imagecopyresized($resized_img,$img,0,0,0,0,$resized_img_w,$resized_img_h,imagesx($img),imagesy($img)) or die("Problemi nel ridimensionamento dell'immagine");
	  imagepng($resized_img,$name) or die("Problemi nel salvataggio dell'immagine da ridurre");
  }
  clearstatcache();
  return true;
 }
  

////FUNZIONE IN ARRAY CASE INSENSITIVE\\\\\
// In array con case insensitive http://www.php.net/manual/en/function.in-array.php#101132
function in_arrayi($needle, $haystack) {

    for($h = 0 ; $h < count($haystack) ; $h++) {
        $haystack[$h] = strtolower($haystack[$h]);
    }

    return in_array(strtolower($needle),$haystack);
}


////FUNZIONE BIG BANG\\\\\
////FUNZIONE: Esplode il 90% degli array trasformati in stringa fino a 3 elementi di concatenamento  crea un array finale contenente chiavi e array descrittivi

function bigbang($control){
	//esplodo le caratteristiche del prodotto
	$first = explode (';;',$control);
	if(is_array($first)){
		foreach ($first as $f){
			$second = explode ('::',$f);
			$third = explode (',,',$second[1]);
			if(is_array($third)){
				$c_control[$second[0]] = $third;
			}else{
				if($second[1]!=""){
					$c_control[$second[0]] = $second[1];
				}
			}
		}
	}else{
		$second = explode ('::',$control);
		if(!is_array($second)){
			$c_control[$second[0]] = $second[1];
		}else{
			$second = explode (',,',$control);
			$c_control[$second[0]] = $second[1];
		}
	}
	
	if(is_array($c_control)){
		return $c_control;
	}else{
		return false;
	}
}


////FUNZIONE IS IN BIG BANG\\\\\
////FUNZIONE: Verifica se una determinata chiave è presente in un contenitore formattato con il metodo big bang.

function is_in_bigbang($search_keys = NULL, $parent = NULL, $bigbang = NULL) {

	// BIG BANG!
	$bigbang = bigbang($bigbang);

	// Converto in ogni caso la chiave/i in array
	foreach ((array) $search_keys as $value) {
		$return .=  $value . '- ' . $parent . ' - ' . $bigbang . '<br>';

		// Il genitore è valido e l'elemento è al suo interno (case insensitive)
		if (is_array($bigbang[$parent]) && in_arrayi($value, (array) $bigbang[$parent])) {

			return true;

		}

	}

	return false;

}


////FUNZIONE IS IN JSON\\\\\
////FUNZIONE: Verifica se una determinata chiave è presente in un contenitore formattato con il metodo json (versione nobile del bigbang).

function is_in_json($search_keys = NULL, $parent = NULL, $bigjson = NULL) {

	// JSON!
	$json_explo = json_decode($bigjson,TRUE);

	// Converto in ogni caso la chiave/i in array
	foreach ((array) $search_keys as $value) {

		// Il genitore è valido e l'elemento è al suo interno 
		if (is_array($json_explo[$parent]) && in_arrayi($value, (array) $json_explo[$parent])) {

			return true;

		}

	}

	return false;

}

////FUNZIONE IS IN JSON FISCALE\\\\\
////FUNZIONE: Verifica fiscale se una determinata chiave è presente in un contenitore formattato con il metodo json (versione nobile del bigbang).

function is_in_json_fiscal($search_keys = NULL, $parent = NULL, $bigjson = NULL) {

	$return = TRUE;
	// JSON!
	$json_explo = json_decode($bigjson,TRUE);

	// Converto in ogni caso la chiave/i in array
	foreach ((array) $search_keys as $value) {

		// Il genitore è valido e l'elemento è al suo interno 
		if (is_array($json_explo[$parent]) && in_arrayi($value, (array) $json_explo[$parent])) {
			$return = TRUE;
		}else {
			return FALSE;
		}

	}

	return $return;

}


////FUNZIONE GENESIS\\\\\
////FUNZIONE: Dato un arary ritorno la stringa per salvarlo 
# $array = array(
# 	'chiave_1' => array('a','b','c'),
# 	'chiave_2' => 3
# 	);
# 
# return chiave_1::a,,b,,c;;chiave_2::3


function genesis($array) {

	$sep1 = ""; // ;;
	$sep2 = "::"; // ::
	$sep3 = ",,"; // ,,

	$return = "";

	//primo ciclo
	foreach ($array as $key => $value) {
		//verifico che il secondo parametro sia un array
		if(is_array($value)){

			$return .= $sep1 . $key . $sep2 . implode($sep3, $value);
			
		}else{

			$return .= $sep1 . $key . $sep2 . $value;

		}

		$sep1 = ";;"; // ;;
	}

	return $return;

}



////FUNZIONE REQUESTED PAGE\\\\\
////FUNZIONE: In base alla variabile in indresso ritorna l'url attuale della pagina
function requested_page($req='path') {
	
	$protocol = ((int) $_SERVER['SERVER_PORT'] === 443)? 'https://' : 'http://';
	
	if(str_replace('\\','/',pathinfo($_SERVER['SCRIPT_NAME'],PATHINFO_DIRNAME))!='/'){
		$path=str_replace('\\','/',pathinfo($_SERVER['SCRIPT_NAME'],PATHINFO_DIRNAME)).'/';

	}else{
		$path=str_replace('\\','/',pathinfo($_SERVER['SCRIPT_NAME'],PATHINFO_DIRNAME));
	}
	
	$page = ((!empty($_SERVER['REQUEST_URI']))? $_SERVER['REQUEST_URI'] : '');
	
	$current_page = $protocol . $_SERVER['HTTP_HOST'].$page;
	
	switch($req){
		case "path":
			return $path;
			break;
		case "domain":
			return $protocol.$_SERVER['HTTP_HOST'];
			break;
		case "domainpath":
			return $protocol.$_SERVER['HTTP_HOST'].$path;
			break;
		case "page":
			return $page;
			break;
		case "lastpage":
			return str_replace($path,"",$page);
			break;
		default:
			return $current_page;
			break;
	}
} 

/*********************************************************/
/* FUNZIONI PERMESSI AMMINISTRATIVI 		             */
/*********************************************************/

////FUNZIONE CHE VERIFICA I PERMESSI\\\\\
////FUNZIONE: Verifica i privliegi amministrativi delle varie aree ('macroarea','sottorestrizioni','eventuale_prefisso')... es. "moduli::news,,homebox,,articoli;;news::eng".. (in questo caso l'utente avrà accesso alle macro moduli e news, e se richiesto alle sottorestrizioni realative 'news,homebox,articoli' e 'eng' per le news.
////ISTRUZIONI:
#### Vi sono più casi dove l'accesso è consentito o è negato
#### 1) Sempre ok se si è super amministratori
#### 2) Se rif è impostato in '*', necessita solo l'autenticazione utente generico
#### 3) Se rif è impostato in 'user', avarà accesso solo l'utente impostato nel secondo campo..
#### 4) Ok se si ha accesso alla macro area 
#### 5) Ok se si ha accesso alla macro area e alla sottorestrizione specifica
  
function check_perms($rif=NULL,$val=NULL,$pfx_session = ""){ //Si passa se..

	$first = explode (';;',$_SESSION[$pfx_session.'access']);
	foreach ($first as $f){
		$second = explode ('::',$f);
		$c_control[$second[0]] = explode(',,',$second[1]);
	}
	
	if ($_SESSION[$pfx_session.'user'] ){
		if($rif=='user'){ //..l'utente corrisponde all'utente inserito..
			if($_SESSION[$pfx_session.'user']==$val){
				return true;
			}else{
				return false;
			}
		}elseif ($_SESSION[$pfx_session.'super_user']==1){ //..è super user..
			return true;
		}elseif($rif=='*'){ //..è un utente qualsiasi..
			return true;
		}elseif($rif!=NULL&&$val==NULL){
			if(array_key_exists($rif,$c_control)){ //..la macroarea corrisponde..
				return true;
			}else{
				return false;
			}
		}elseif($rif!=NULL&&$val!=NULL){
			if(array_key_exists($rif,$c_control)){
				if(in_array($val,$c_control[$rif])){ //..macroarea e sottorestrizione corrispondono.
					return true;
				}else{
					return false;
				}
			}else{
				return false;
			}
		}else{
			return false;	
		}
	}else{
	  	return false;
	}
}  
  
/*********************************************************/
/* FUNZIONI ELABORAZIONE PAGINAZIONE		             */
/*********************************************************/

////BREADCUM + BREADCRUMB\\\\\
////FUNZIONE: Ritorna un array ordinato con la lista dei parenti legati legato alla sua profondità. (assicurarsi di aver inserito il cnct prima del file functions.php; lo script si ferma automaticamente appena incontra come parente l'id 1 corrispondente alla root)
function breadcumb ($id,$tabella){
	return breadcrumb ($id,$tabella);
}

function breadcrumb ($id,$tabella){
	$sel=mysql_query("SELECT * FROM ".$tabella." WHERE id = '".$id."'");
	$s=mysql_fetch_assoc($sel);
	$result[] = $id;
	$depth = $s['depth'];
	for($i=1;$i<$depth;$i++){
		$id = $s['parent'];
		if($s['parent']!=1){
			$sel=mysql_query("SELECT * FROM ".$tabella." WHERE id = '".$id."'");
			$s=mysql_fetch_assoc($sel);
			$result[] = $id ;
		}
	}
	return array_reverse($result);
}  

////CHILD TREE\\\\\
////FUNZIONE: Ritorna un array ordinato con la lista dei parenti legati legato alla sua profondità. (assicurarsi di aver inserito il cnct prima del file functions.php; lo script si ferma automaticamente appena incontra come parente l'id 1 corrispondente alla root)

function childtree ($id,$tabella){
	$sel= mysql_query("SELECT t.*, (SELECT COUNT(id) FROM $tabella WHERE parent=t.id LIMIT 1) AS children FROM $tabella AS t WHERE parent=".$id);
	 while( $child = mysql_fetch_array($sel)){
		 $result[] = $child;
		 $search_ch = childtree ($child['id'],$tabella);
		 if($search_ch){
			 $result = array_merge($result,$search_ch);
		 }
	 }
	 return  $result ;
}

////PAGINAZIONE RISULTATI\\\\\
////FUNZIONE:	imposta la paginazione nei risultati

function draw_navigation_bar($url,$tot,$prod_xp,$page,$page_limit,$sw,$link_class) {
	$succ_page=$page+1;
	$prec_page=$page-1;
	$k=0; $j=0;
	$group=array(array());
	if(!strstr($url,"?")) $url.="?"; else $url.="&";
	$tot_p=ceil($tot/$prod_xp); // Totale delle pagine da visualizzare;
    for($i=1;$i<=$tot_p;$i++) {
    	if($j<$page_limit) {
        	$group[$k][$j]=$i;$j++;
		} else {
        	$k++;$j=0;$group[$k][$j]=$i;$j++;
       	}
    }
    $tot_group=sizeof($group);
    for($i=0;$i<$tot_group;$i++) {
    	if(in_array($page,$group[$i])) {
        	$start_idx=$group[$i][0];$gruppo=$i;$i=$tot_group;
         }
     }
	if ($sw == 1) {
//  $start_idx=$page;
// STAMPA [PREC]
    	$grp_back=$start_idx-$page_limit;
    	if($page>$page_limit) $mul=1;
    		if ($tot_p>1) {
        		echo "<div id='pagination'>";
            	if($page==1) {
            		echo "&nbsp;&nbsp;&nbsp;&nbsp;";
            	} else {
                	if (($page>1)) {
						echo "&nbsp;<a class='".$link_class."' href=\"".$url."page=1&mul=$mul\" ><img src='images/indietro_bis.gif' class='motore'></a>";
					}
                	echo "&nbsp;<a class='".$link_class."'  href=\"".$url."page=$prec_page&mul=0\"  ><img src='images/indietro.gif' class='motore'></a>&nbsp;";
            	}
//STAMPA PAGINE INTERMEDIE
     			$k=0;
     			for($i=$start_idx;$i<=$tot_p;$i++) {
     				if($i==$page){
						echo "<span style='background-color:#d10707;color:#ffffff;padding-left:4px;padding-right:4px;padding-bottom:1px;padding-top:2px;'>$i</span> ";
					} elseif ($i<($page_limit+$start_idx)) {
        				echo "<span style='border:1px solid #d10707;padding-left:2px;padding-right:2px;margin:2px;'><a class='".$link_class."' href=\"".$url."page=$i&mul=$mul\" >$i</a></span>";
					} else {
            			$k=$i;$i=$tot_p;
        			}
      	 		}
      	 	if( ($k==0) ) {
      	 		if($i>$tot_p) $i=$tot_p;
        		$k=$i;
      	 	}
// STAMPA [SUCC]
      	 	if($page==$tot_p) {
      			echo "&nbsp;&nbsp;";
      	 	} else {
        		echo "&nbsp;<a class='".$link_class."' href=\"".$url."page=$succ_page&mul=0\"><img src='images/avanti.gif' class='motore'></a></span>&nbsp;";
         		if($page<=$tot_p) echo "<a class='".$link_class."' href=\"".$url."page=$k&mul=1\" ><img src='images/avanti_bis.gif' class='motore'></a>&nbsp;";
      		}
      		#echo "</span></div>";
    	}
	}
	if ($tot_p > 1) { echo "</div>"; }
	if ($sw == 0) {
	$limitstart=($page-1)*$prod_xp;
	$limitend=$prod_xp;
	$limit="LIMIT $limitstart,$limitend";
	}
	if ($sw == 2) {
		if($tot_p>1){
			echo "pag. $page di $tot_p";
    	}
	}
    return($limit);
}; 

////FORM LABEL FORM\\\\\
// Funzione inserendo un nome del select, una serie di opzione, l'opzione scelta, e eventuali extra(classi, id, etc.) ritorna un select form
function form_label($label_text = '', $id = '', $attributes = array())
{

	$label = '<label';

	if ($id != '')
	{
		$label .= " for=\"$id\"";
	}

	if (is_array($attributes) AND count($attributes) > 0)
	{
		foreach ($attributes as $key => $val)
		{
			$label .= ' '.$key.'="'.$val.'"';
		}
	}

	$label .= ">$label_text</label>";

	return $label;
}

////SELECT FORM\\\\\
// Funzione inserendo un nome del select, una serie di opzione, l'opzione scelta, e eventuali extra(classi, id, etc.) ritorna un select form
function form_dropdown($name = '', $options = array(), $selected = array(), $extra = '')
	{
		// If name is really an array then we'll call the function again using the array
		if (is_array($name) && isset($name['name']))
		{
			isset($name['options']) OR $name['options'] = array();
			isset($name['selected']) OR $name['selected'] = array();
			isset($name['extra']) OR $name['extra'] = array();

			return form_dropdown($name['name'], $name['options'], $name['selected'], $name['extra']);
		}

		if ( ! is_array($selected))
		{
			$selected = array($selected);
		}

		// If no selected state was submitted we will attempt to set it automatically
		if (count($selected) === 0 && isset($_POST[$name]))
		{
			$selected = array($_POST[$name]);
		}

		if ($extra != '')
		{
			$extra = ' '.$extra;
		}

		$multiple = (count($selected) > 1 && strpos($extra, 'multiple') === FALSE) ? ' multiple="multiple"' : '';

		$form = '<select name="'.$name.'"'.$extra.$multiple.">\n";

		foreach ($options as $key => $val)
		{
			$key = (string) $key;

			if (is_array($val))
			{
				if (empty($val))
				{
					continue;
				}

				$form .= '<optgroup label="'.$key."\">\n";

				foreach ($val as $optgroup_key => $optgroup_val)
				{
					$sel = in_array($optgroup_key, $selected) ? ' selected="selected"' : '';
					$form .= '<option value="'.$optgroup_key.'"'.$sel.'>'.(string) $optgroup_val."</option>\n";
				}

				$form .= "</optgroup>\n";
			}
			else
			{
				$form .= '<option value="'.$key.'"'.(in_array($key, $selected) ? ' selected="selected"' : '').'>'.(string) $val."</option>\n";
			}
		}

		return $form."</select>\n";
	}

////SIMPLE ADD MOD INPUT\\\\
// Funzione: dato un nome, una descrizione, un valore e eventualmente attributi extra ritorna un semplice contenitore con label e input per twitter bootstrap
function simple_add_modd_input ($name,$desc,$value=NULL,$attr=NULL,$type="text", $class_cg=""){
	
	$find = array('(*)','*',':');
	$replace = array('','','');

	$placeholder = str_replace($find, $replace, $desc);
	$placeholder = preg_replace('#(<.*?>).*?(</.*?>)#', '$1$2', $placeholder); // Rimuovo eventuale testo contenuti nei tag
	$placeholder = strip_tags($placeholder);

	$result = '<div class="control-group ' . $class_cg . '">
					<label class="control-label" for="' . $name . '">' . $desc . ':</label>
					<div class="controls">
						<input name="' . $name . '" id="' . $name . '" type="' . $type . '" placeholder="' . $placeholder . '" value="' . str_replace('"', '&quot;', $value) . '" ' . $attr . '/>
					</div>
				</div>';
return $result;
}


////SIMPLE ADD MOD INPUT BOOTSTRAP 3\\\\
// Funzione: dato un nome, una descrizione, un valore e eventualmente attributi extra ritorna un semplice contenitore con label e input per twitter bootstrap
function simple_add_modd_input_3 ($name,$desc,$value=NULL,$attr=NULL,$type="text", $class_cg=""){
	
	$find = array('(*)','*',':');
	$replace = array('','','');
	$placeholder = str_replace($find, $replace, $desc);
	$placeholder = preg_replace('#(<.*?>).*?(</.*?>)#', '$1$2', $placeholder); // Rimuovo eventuale testo contenuti nei tag
	$placeholder = strip_tags($placeholder);

	$find = array('class ="','class = "','class= "');
	$attr = str_replace($find,'class="', $attr);
	
	$pos = strpos($attr, 'class="');

	if ($pos === FALSE) {
		$attr .= ' class="form-control"';
	} else {
		$attr = str_replace('form-control','', $attr);
		$attr = str_replace('class="','class=" form-control ', $attr);
	}
	

	$result = '<div class="form-group row ' . $class_cg . '">
					<label class="col-md-11 control-label" for="' . $name . '">' . $desc . ':</label><br>
					<div class="col-md-11">
						<input name="' . $name . '" id="' . $name . '" type="' . $type . '" placeholder="' . $placeholder . '" value="' . str_replace('"', '&quot;', $value) . '" ' . $attr . '/>
					</div>
				</div>';
return $result;
}

function simple_add_modd_input_3_pulito ($name,$desc,$value=NULL,$attr=NULL,$type="text", $class_cg=""){
	
	$find = array('(*)','*',':');
	$replace = array('','','');
	$placeholder = str_replace($find, $replace, $desc);
	$placeholder = preg_replace('#(<.*?>).*?(</.*?>)#', '$1$2', $placeholder); // Rimuovo eventuale testo contenuti nei tag
	$placeholder = strip_tags($placeholder);

	$find = array('class ="','class = "','class= "');
	$attr = str_replace($find,'class="', $attr);
	
	$pos = strpos($attr, 'class="');

	if ($pos === FALSE) {
		$attr .= ' class="form-control"';
	} else {
		$attr = str_replace('form-control','', $attr);
		$attr = str_replace('class="','class=" form-control ', $attr);
	}
	

	$result = '<div class="' . $class_cg . '">
					<label class=" control-label" for="' . $name . '">' . $desc . ':</label><br>
					<div class="">
						<input name="' . $name . '" id="' . $name . '" type="' . $type . '" placeholder="' . $placeholder . '" value="' . str_replace('"', '&quot;', $value) . '" ' . $attr . '/>
					</div>
				</div>';
return $result;
}



////SIMPLE FORMDROPDOW INPUT\\\\
// Funzione: dato un nome, una descrizione, un valore e eventualmente attributi extra ritorna un semplice contenitore con label e input per twitter bootstrap
function simple_dropdown_input ($name,$desc,$options = array(), $selected = array(),$attr=NULL, $class_cg=""){
	$result = '<div class="control-group ' . $class_cg . '">
					<label class="control-label" for="' . $name . '">' . $desc . ':</label>
					<div class="controls">
						' . form_dropdown($name, $options, $selected, ' id="' . $name . '" ' .$attr) . '
					</div>
				</div>';
	return $result;
}


////SIMPLE FORMDROPDOW INPUT BOOTSTRAP 3\\\\
// Funzione: dato un nome, una descrizione, un valore e eventualmente attributi extra ritorna un semplice contenitore con label e input per twitter bootstrap
function simple_dropdown_input_3 ($name,$desc,$options = array(), $selected = array(),$attr=NULL, $class_cg=""){

	$find = array('class ="','class = "','class= "');
	$attr = str_replace($find,'class="', $attr);
	
	$pos = strpos($attr, 'class="');

	if ($pos === FALSE) {
		$attr .= ' class="form-control"';
	} else {
		$attr = str_replace('form-control','', $attr);
		$attr = str_replace('class="','class=" form-control ', $attr);
	}

	$result = '<div class="form-group row '.$class_cg.'">
					<label class="col-md-11 control-label" for="' . $name . '">' . $desc . ':</label><br>
					<div class="col-md-11">
						' . form_dropdown($name, $options, $selected, ' id="' . $name . '" ' .$attr) . '
					</div>
				</div>';
	return $result;
}

function simple_dropdown_input_3_pulito ($name,$desc,$options = array(), $selected = array(),$attr=NULL){

	$find = array('class ="','class = "','class= "');
	$attr = str_replace($find,'class="', $attr);
	
	$pos = strpos($attr, 'class="');

	if ($pos === FALSE) {
		$attr .= ' class="form-control"';
	} else {
		$attr = str_replace('form-control','', $attr);
		$attr = str_replace('class="','class=" form-control ', $attr);
	}

	$result = '<div class="">
					<label class=" control-label" for="' . $name . '">' . $desc . ':</label><br>
					<div class="">
						' . form_dropdown($name, $options, $selected, ' id="' . $name . '" ' .$attr) . '
					</div>
				</div>';
	return $result;
}

////CLASSE FEEDBACK\\\\
// Funzione: se un oggetto viene ritrovato all'interno di un array contenente la lsita degli errori allora ritorna error
function feedback_class($needle, $haystack, $error_class="has-error", $success_message = "has-success")
{
	if ( ! is_array($haystack)) {
		return FALSE;
	}

	return (in_array($needle, $haystack)) ? $error_class : $success_message;

}


/*********************************************************/
/* FUNZIONI PERSONALIZZATE PER IL SITO		             */
/*********************************************************/