<?
/**
* CLASSE DEL MODULO 
* Dipendenze classe User sito pubblico
*/
class Modulo extends User
{

    function __construct()
    { 
      parent::__construct();

      global $feedback_sync;
      $this->feedback_sync = $feedback_sync; 

    }

    public function set_variables($data)
    {
      if (is_array($data)) {
        foreach ($data as $k => $v) {
          $this->{$k} = $v;
        }
      }
    }

    public function get_items()
    {
      $utenti = $this->db->get($this->tabella['utenti'])->result();

      $return = FALSE;
      
      if ($utenti) {
        foreach ($utenti as $user) {
          $return[] = $this->get_user_info($user);
        }
      }
      return $return;
    }

    public function get_item($id)
    {
      return $this->get_user_info($id);
    }


    public function sync ($id){

      $_POST['abilitato'] = ($_POST['abilitato']) ? 1 : 0;

      $result = clear_table_result($_POST,$this->tabella['utenti']);

      $ck_item = $this->db->where('id',$id)->get($this->tabella['utenti'])->row();

      if ($_POST['pass'] && trim($_POST['pass']) != "") {
        $result['pass'] = md5($_POST['pass']);
        $result['clean_pass'] = $_POST['pass'];
      } else {
        unset($result['pass']);
      }

      //Controllo il nome utente (email) di accesso
      if ($_POST['name'] && trim($_POST['name']) != "" && ( ! $ck_item || $ck_item->name != $_POST['name'])) {
        $ck_username_item = $this->verify_email($_POST['name']);
        if ($ck_username_item['status'] == 0) {
          $this->sync_id = $id;
          $this->feedback_class = "danger";
          $this->feedback = "Errore sul nome utente: " . $ck_username_item['feedback'];
          return FALSE;
        }
        $data['email'] = $_POST['name'];

      }


      if($ck_item){
        // =========
        // == Modifica

        $result['data_modifica'] = date("Y-m-d H:i:s");

        if( ! $this->perms('modifica',$ck_item)) die('Non hai i permessi amministrativi');
        
          $this->db->where('id',$id)->update($this->tabella['utenti'],$result);

          $this->sync_id = $ck_item->id;
          $this->feedback_class = "success";

          $this->feedback = 'Utente modificato correttamente';

      }else{  
        // ==============
        // == Inserimento

        $result['data_inserimento'] = date("Y-m-d H:i:s");

        if( ! $this->perms('aggiunta')) die('Non hai i permessi amministrativi');

        $this->db->insert($this->tabella['utenti'],$result);

        $this->sync_id = $this->db->insert_id();

        $this->feedback_class = "success";
        $this->feedback = 'Utente inserito correttamente';

      }

    }


    function get_dataTable_json($iDisplayStart = 0, $iDisplayLength = 10, $sSearch = "", $sEcho, $sort){
    
      /*$items = $this->db->where("id_user = '".$this->user_info->id . "' OR utenti_partecipanti LIKE '%" . $this->user_info->id . "%'")->order_by('data_ultimo_m','DESC')->get($this->tabella['main'])->result();*/

      // $Col[0] = 'file_info';
      $Col[0] = 'nome';
      $Col[1] = 'data_inserimento';
      $Col[2] = 'filiale';
      $Col[3] = 'codice';
      $Col[4] = 'abilitato';

      if (is_array($sort['Col'])) {
        foreach ($sort['Col'] as $k => $v) {
          $this->db->order_by($Col[$v], $sort['Dir'][$k]);
        }
      }

      $items = $this->get_items();
      
      $return = array();

      $count = 0;
      $count_display = 0;

      foreach($items as $item){

        if ( ! $this->perms('vedi', $item)) {
          continue;
        }

        $count ++;

        $count_display ++;
       
        if ($iDisplayStart > $count || ($iDisplayLength > 0 && ($iDisplayStart + $iDisplayLength) < $count) ){
          continue;
        }

        $item = $this->get_item($item, TRUE);

        //Compongo la stringa per il filtro di ricerca
        $searchIn = $item->nome . $item->codice;

        if (!(preg_match_all('/' . $sSearch  . '/i', $searchIn, $var)) && ($sSearch!="")){
          $count_display --;
          continue;
        }

        $return[] = $item;
      }

      $aaData = array();

      foreach ($return as $item) {

        $clienti = 0;
        if ($item->tipologia == 3) {
          $filter['agente'] = $item->codice; 
          $clienti = count($this->get_clienti_assoc($filter));
        }

        // $row[0] = '<img src="'.PATH.$item->file_info_arr['avatar']['admin'].'">';
        $row[0] = $item->nome;
        $row[1] = $this->get_tipologia($item->tipologia)->titolo;
        //$row[2] = $this->filiali->get_filiale($item->filiale_id)->titolo;
        $row[2] = (($item->abilitato == 1) ? '<div class="btn btn-sm btn-success">Attivo</div>' : '<div class="btn btn-sm btn-danger">Bloccato</div>');
        $row[3] = "
            <div class='btn-group btn-group-sm pull-right'>
              <!-- MODIFICA OGGETTO (Fancybox) -->
              <a href='".PATHADMIN.MODULO."/main/main_add_mod/".$item->id."' class='btn btn-sm btn-primary' title='modifica' >
                  <i class='fa fa-edit'></i> <span class='hidden-sm'>Modifica</span>
              </a>
     
              <!-- CANCELLA OGGETTO (aggiungere data-table e data-id) -->
              <a href='#' class='btn cancella_jsn btn-sm btn-danger' data-table='".$this->tabella['utenti']."' data-id='".$item->id."' data-ask='Cancellare elemento?' title='cancella' >
                  <i class='fa fa-trash-o'></i> 
              </a>  
            </div> 
          ";
        
        $aaData[] = $row;               
      
      }

      $output = array(
        "sEcho" => intval($sEcho),
        "iTotalRecords" => $count,
        "iTotalDisplayRecords" => $count_display,
        "aaData" => $aaData
      );


      return $output;

    }


  /********
  ***** PERMESSI DEL MODULO
  ****/

  //Funzione per il controllo della checklist
    public function perms($contesto,$soggetto = NULL)
    {
      //Ad ogni CONTESTO verifico se l'utente ha poteri amministrativi sul soggetto
      switch ($contesto) {
        //vedere lo stato di utente
        case 'vedi':

          if ($soggetto->super_user == 1 && ! $this->perms->super()) {
            return FALSE;
          }

          return TRUE;
          break;
        //aggiungere un utente
        case 'aggiunta':
          return TRUE;
          break;
        //modificare un utente
        case 'modifica':
          return TRUE;
          break;
        //cancellare un   
        case 'cancellazione':
         return TRUE;
          break;
        default:
          return FALSE;
          break;
      }
      return FALSE;
        
    }
}
?>