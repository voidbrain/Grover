<?
/**
* CLASSE DEL MODULO 
*/
class Modulo extends Pages
{

  function __construct()
  { 
    parent::__construct();

    global $feedback_sync;
    $this->feedback_sync = $feedback_sync; 

    $this->tabella['main'] = $this->tabella['pages'];

  }

  public function set_variables($data)
  {
    if (is_array($data)) {
      foreach ($data as $k => $v) {
        $this->{$k} = $v;
      }
    }
  }

  public function sync($id)
  {
      
      
      //$_POST["modificabile"] = ($_POST["modificabile"]) ? 1 : 0;
      $parent = $this->db->where("id",$_POST['parent'])->get($this->tabella['main'])->row();

      $result = clear_table_result($_POST,$this->tabella['main']);
      $result['abilitato'] = ($_POST['abilitato']) ? $_POST['abilitato'] : 0;
      $result['modificabile'] = ($_POST['modificabile']) ? $_POST['modificabile'] : 0;
      $result['menuvisible'] = ($_POST['menuvisible']) ? $_POST['menuvisible'] : 0;

      if ($parent){
        $result['depth'] = $parent->depth + 1;
      }

      $ck_item = $this->db->where('id',$id)->get($this->tabella['main'])->row();

      if($_POST['action']=='modifica'){

        unset($result['parent']);

        $result['data_modifica'] = date("Y-m-d H:i:s");

        $this->db->where('id', $ck_item->id)->update($this->tabella['main'],$result);

        $this->sync_id = $ck_item->id;
        $this->feedback_class = "success";
        $this->feedback = 'Pagina modificata correttamente';

      }else{

        $this->db->set('posizione', 'posizione + 1', FALSE)->update($this->tabella['main']);

        if($result['permalink'] == ""){

          $all_pages = $this->db->get($this->tabella['main'])->result();
          $prmLink = array();

          foreach($all_pages as $pag){
            $prmLink[] = $pag->permalink;
          }

          $result['permalink'] = crea_url($result['titolo'],$prmLink);
          
        }
        
        //cambio formato ora
        $result['data_inserimento'] = date("Y-m-d H:i:s");

        $this->db->insert($this->tabella['main'],$result);

        $this->sync_id = $this->db->insert_id();

        $this->feedback_class = "success";
        $this->feedback = 'Pagina aggiunta correttamente';

      }
      $upd["ospedale"]  = date("Y-m-d H:i:s");
      $upd["reparti"]   = date("Y-m-d H:i:s");
      $upd["servizi"]   = date("Y-m-d H:i:s");
      $upd["partners"]  = date("Y-m-d H:i:s");
      $this->db->where('id',1)->update($this->config['db_pfx'].'app_sync',$upd);

  }
   

  /********
  ***** PERMESSI DEL MODULO
  ****/

  //Funzione per il controllo della checklist
    public function perms($contesto, $soggetto = NULL)
    {
      //Ad ogni CONTESTO verifico se l'utente ha poteri amministrativi sul soggetto
      switch ($contesto) {
        //vedere
        case 'vedi':
          return TRUE;
          break;
        //aggiungere
        case 'aggiunta':
          return TRUE;
          break;
        //modificare 
        case 'modifica':
          return TRUE;
          break;
        //cancellare
        case 'cancellazione':
          return TRUE;
          break;
        //Se non è ben definito
        default:
          return FALSE;
          break;
      }
      return FALSE;
        
    }
}
?>