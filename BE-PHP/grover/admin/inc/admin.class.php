<? 
/**
* 
*/
class admin
{
	protected $db;
	protected $config;

	function __construct()
	{
		global $db;
		global $config;

		$this->db = $db;
		
		#$this->log = $config['admin']['log'];
		#$this->log_table = $config['admin']['log_table'];
		
		$this->loadUpload = FALSE;

		$this->oggi = date('Y-m-d');
	}

	public function set_variables($data)
	{
	  	if (is_array($data)) {
	    	foreach ($data as $k => $v) {
	     	 	$this->{$k} = $v;
	    	}
	  	}
	}


/*
	private function login($user, $pass){

		$user_info = $this->db->where(array('name' => $user, 'pass' => $pass, 'abilitato' => 1))->get($this->tabella_user)->row();

		//Se le password nel database non sono cryptate... e non ho trovato una corrispondenza... allora ciclo e crypto
		if( ! $this->crypt_pass && ! $user_info){

			$user_list = $this->db->where(array('name' => $user, 'abilitato' => 1))->get($this->tabella_user)->result();

			foreach($user_list as $user){
				if($pass == md5($user->pass)){ //Se tro una corrispondenza salvo ed esco

					$user_info = $user;
					continue;
				}
			}
		}


		if($user_info){
			//Verifico se la tipologia dell'utente è attiva e abilitata al login
			$user_tipo = $this->db->where(array('abilitato' => 1, 'loggable' => 1, 'id' => $user_info->tipologia))->get($this->tabella_user_tipo)->row();
			if($user_tipo || $user_info->super_user == 1){
								
				$this->set_session($user_info);	
				$this->set_session_info();

				if($user_tipo->ricorda_login){
					$this->set_cookie($user_info);
				}

				return TRUE;
			}else{
				return FALSE;
			}

		}else{
			return FALSE;
		}
	}*/
	
	/*
	public function logout(){

		unset($_SESSION[$this->pfx_session.'user']);
		unset($_SESSION[$this->pfx_session.'user_id']);
		unset($_SESSION[$this->pfx_session.'super_user']);
		
		if(isset($_COOKIE[$this->pfx_session.'sav_user'])){ //se presente si distrugge il cookie di login automatico 
			setcookie($this->pfx_session."sav_user",$cok,time()-9999, "/", FALSE); 
		}
	
	}*/


    public function do_list_bootstrap($array, $livello=0, $parent=NULL){

        if ($livello == 0) {
            $ul_class = 'nav nav-tabs nav-stacked main-menu';
        }else if ($livello > 0){
            $ul_class = ' ';
        }

        $return .= '<ul class="' . $ul_class . ' ">';

        foreach ($array as $key => $value) {
            //Reset variabili 
            $submenu = FALSE;
            $li_class = '';
            $a_class = '';
            $a_data_togle = '';
            $a_href = ($value['dest']&&$value['dest']!='#') ? PATHADMIN . $value['dest'] : '#';
            $li_active_class = (in_array(MODULO, (array) $value['moduli'])) ? ' active ' : '';

            if($key=="divider") {
                $return .= '<li class="divider"></li>';
                continue;
            }

            if( ! $this->perms->nav($parent.fix_file_name($key))){
                continue;
            }

            if(is_array($value['subpage'])){
                if(count($value['subpage'])>0){ 
                    $submenu = TRUE;
                    if ($livello == 0) {
                        $li_class = ' dropdown ';
                        $a_class = ' dropmenu';
                        $a_data_togle = ' data-toggle="dropdown" ';
                    } else if ($livello > 0){
                        $li_class = ' dropdown-submenu ';
                        $a_class = ' submenu ';
                    }
                }
            }

            $return .= '<li class=" ' . $li_class . ' ' . $li_active_class . '" data-no-collapse="true" id="'.fix_file_name($key).'">';
            $return .= '<a class=" ' . $a_class . '" ' . $a_data_togle . ' href="' . $a_href .'" title="'. $value['desc'] . '">';
            if ($value['icon']) {
                $return .= '<i class="fa '.$value['icon'].'"></i>';
            }
            $return .= "<span class='hidden-sm'>".$key."</span>";
            $return .= ($submenu && $livello==0) ? '<span class="label"><i class="fa fa-angle-down"></i></span>' : '' ;
            $return .= '</a>';

            if($submenu){
                $return .= $this->do_list_bootstrap($value['subpage'],$livello+1,$parent.fix_file_name($key));
            }

            $return .= '</li>';
        }

        $return .= '</ul>';

        return $return;
       
    }


	public function set_session_info($id_user=NULL){

		$id_user = ($id_user) ? $id_user : $_SESSION[$this->pfx_session.'user_id'];

		$this->user_info = $this->get_user_info($id_user); 
		$this->user_tipolgia_info = $this->get_user_tipolgia_info($this->user_info->tipologia); 
		
		//$this->user_info->utenti_collegati_arr = json_decode($this->user_info->utenti_collegati, TRUE);
		
		//Imposto un array con tutte le palestre dell'utente
		$user_pal = json_decode($this->user_info->palestre,TRUE);
		$user_pal = $user_pal['palestre'];

		$this->user_pal = $user_pal; 

		return ($this->user_info && $this->user_tipolgia_info);

	}


	public function get_user_tipolgia_info($id_tipo){
		return $this->db->where('id', $id_tipo)->get($this->tabella_user_tipo)->row();
	}



	// ==== ======= =    = =     =
	// ==== GESTIONE FILES 

	function addmodHtmlFile ($file_info, $id_rif, $key = "*"){

		if(!$id_rif || $id_rif == "" || ! $file_info){
			return FALSE;
		}

		$return = '';

		if ($key == "*") {
			foreach ($file_info as $key => $value) {
				$return .= $this->singleHtmlFile($file_info,$key,$id_rif);
			}
		}else{
			$return .= $this->singleHtmlFile($file_info,$key,$id_rif);
		}

		return $return;
	}


	function singleHtmlFile ($file_info, $key, $id_rif){


		$value = $file_info[$key];

		$return = "";

		if($value['admin']['multi'] == 1){ //Uploadify multi files

			$return = "<div class='col-md-2'><a class='btn' href='". PATHADMIN . MODULO . "/main/main_gestione_multi_file/" . $id_rif . "/" . $key . "' > <i class='fa fa-folder'></i> " . $value["admin"]["title"] . "</a></div>";

		} else { //Uploadify single file

			$fileDesc = $value['admin']['fileDesc'];
			$maxsize = $value['admin']['maxsize'];
			$fileExt = $value['admin']['fileExt'];
			$class = ($value['admin']['class']) ? $value['admin']['class'] : 'col-md-2';
			
			$return = "<div class='visualizza_single_file ".$class." ".$value['admin']['class']."' data-id_rif='" . $id_rif . "' data-name_rif='" . $key . "' data-maxsize='" . $maxsize . "' data-fileext='" . htmlentities($fileExt) . "' data-filedesc='" . htmlentities($fileDesc) . "' >
		    	<h5>" . $value["admin"]["title"] . ":</h5>
		        	<span class='info'>(Max " . format_size($maxsize) . " " . $fileDesc . ")</span><br />
		         	<input type='file' class='uploadify' id='" . $key . "' name='Filedata' />
		            <div id='queue_" . $key . "' class='queue'>
		            	<div id='visualizza_" . $key . "' class='visualizza_immagini no_sort'></div>
        				<div class='noHtml5Upp'>Trascina qui il tuo file</div>		
					</div>
		   	</div>";
		}

		return $return;
	}

	//Generazione html per uploadiFy in multi gallery
	function singleHtmlFileMulti ($file_info, $id_rif, $key){
		
		$value = $file_info[$key];

		$return = "";


		if($value['admin']['multi'] != 1){
			return FALSE;
		}

		$fileLimit 	= $value['admin']['fileLimit'];
		$fileDesc 	= $value['admin']['fileDesc'];
		$maxsize 	= $value['admin']['maxsize'];
		$fileExt 	= $value['admin']['fileExt'];
		
		$return .= "
				<div class='row visualizza_multi_file' data-fileLimit='" . $fileLimit . "' data-id_rif='" . $id_rif . "' data-name_rif='" . $key . "' data-maxsize='" . $maxsize . "' data-fileext='" . htmlentities($fileExt) . "' data-filedesc='" . htmlentities($fileDesc) . "'>
					<div class='col-sm-2'>
				    	<h5>" . $value["admin"]["title"] . ":</h5>
			        	<span class='info'>(Max " . format_size($maxsize) . " " . $fileDesc . ")</span><br />
			         	<input type='file' class='uploadify' id='" . $key . "' name='Filedata' />
				    </div>
				    <div class='col-sm-10'>
		         		<div id='queue_" . $key . "' class='row queue well'>
		         			<div class='noHtml5Upp'>Trascina qui i tuoi files</div>	
		         		</div>
			   		</div>
			   		<br style='clear:both'>
		         	<div class='col-md-12'>
		            	<div id='visualizza_" . $key . "' class='visualizza_immagini row'></div>
		            </div>
	            </div>";
		
		return $return;
	}

}