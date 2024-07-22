<? 
/**
* CLASSE PER LA GESTIONE DEI PERMESSI
*
* Dipendenze:
* -libs/function.php (libreria funzioni)
* -admin/inc/admin.boot.php (settaggio variabili utente)
*/
class Perms
{
	protected $db;

	function __construct()
	{
		global $db;

		$this->db = $db;
	}


	public function set_variables($data)
	{
	  if (is_array($data)) {
	    foreach ($data as $k => $v) {
	      $this->{$k} = $v;
	    }
	  }
	}


	//Se super super user
	public function super()
	{
		if($this->user_info->super_user){
			return TRUE;
		}

		return FALSE;
	}
	//Se super user (e quindi super super user)
	public function superuser()
	{
		if(	$this->super()||
			$this->user_info->tipologia==1){
			return TRUE;
		}

		return FALSE;
	}


	/********
	***** ABILITAZIONE MODULO
	****/

	public function check_modulo($modulo)
	{	

		// Sblocco temporaneo in attesa di diversi privilegi
		#return TRUE;

		if ($this->cache['check_modulo'][$modulo]) {
			return $this->cache['check_modulo'][$modulo];
		}

		if(	$this->super()){
			return TRUE;
		}
		
		$return = (is_in_json($modulo, 'moduli', $this->user_tipolgia_info->privilegi));

		$this->cache['check_modulo'][$modulo] = $return;

		return $this->cache['check_modulo'][$modulo];
	}

	/********
	***** BARRA DI NAVIGAZIONE
	****/

	//Funzione per il controllo della barra di navigazione
	public function nav($key)
	{	

		// Sblocco temporaneo in attesa di diversi privilegi
		#return TRUE;
		
		if($this->super() || //Se super super user
			is_in_json($key,'nav',$this->user_tipolgia_info->privilegi)){
        	return TRUE;
     	}

     	return FALSE;
	}


	/********
	***** CHECK_PERMS
	****/

	public function check_perms($rif=NULL, $val=NULL, $soggetto = NULL, $key = 'privilegi'){
		if(!$soggetto){
			$soggetto = $this->user_info;
		}

		$c_control = json_decode($soggetto->{$key}, TRUE);

		if ($this->super()){ //..è super user..
			return TRUE;
		}

		if(!is_array($c_control)){
			return FALSE;
		}

		if ($rif!=NULL&&$val==NULL){
			if(array_key_exists($rif,$c_control)){ //..la macroarea corrisponde..
				return TRUE;
			}else{
				return FALSE;
			}
		} elseif ($rif!=NULL&&$val!=NULL){
			if(array_key_exists($rif,$c_control)){
				if(!is_array($c_control[$rif])){
					return FALSE;
				}elseif(in_array($val,$c_control[$rif])){ //..macroarea e sottorestrizione corrispondono.
					return TRUE;
				}else{
					return FALSE;
				}
			}else{
				return FALSE;
			}
		}else{
			return FALSE;	
		}
	}
	
	
	/********
	***** GESTIONE TIPOLOGIE UTENTI
	****/

	//Funzione per il controllo delle tipologie di utenti
	public function tipologie_utenti($contesto,$soggetto)
	{
		//Ad ogni CONTESTO verifico se l'utente ha poteri amministrativi sul soggetto
		switch ($contesto) {
			//vedere lo stato di utente
			case 'vedi':
				//se l'utente è un super super user può essere visto solo da un suo simile
				if($this->superuser()){
		        	return TRUE;
		     	}
				break;
			//aggiungere un utente
			case 'aggiunta':
				if($this->superuser()){
		        	return TRUE;
		     	}
				break;
			//modificare un utente
			case 'modifica':
				if($this->superuser()){
		        	return TRUE;
		     	}
				break;
			//cancellare un 	
			case 'cancellazione':

				if($this->super()){ 
		        	return TRUE;
		     	}
		     		return FALSE;
				break;
			default:
				return FALSE;
				break;
		}
		return FALSE;
	    	
	}

}
