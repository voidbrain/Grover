<?
/**
* CLASSE DEL MODULO 
* Dipendenze classe User sito pubblico
*/
class Modulo extends Servizi
{

    function __construct()
    { 
      parent::__construct();

      global $feedback_sync;
      $this->feedback_sync = $feedback_sync; 

      //$this->tabella['servizi'] = $this->tabella['main'];


    }

    public function set_variables($data)
    {
      if (is_array($data)) {
        foreach ($data as $k => $v) {
          $this->{$k} = $v;
        }
      }
    }


  /********
  ***** PERMESSI DEL MODULO
  ****/
    public function sync ($id){
      $result = clear_table_result($_POST,$this->tabella['main']);
      $ck_item = $this->db->where('id',$id)->get($this->tabella['main'])->row();


      if($ck_item){
        // =========
        // == Modifica

        if( ! $this->perms('modifica',$ck_item)) die('Non hai i permessi amministrativi');
        
          $this->db->where('id',$id)->update($this->tabella['main'],$result);
          $this->sync_id = $ck_item->id;
          $this->feedback_class = "success";

          $upd["servizi"] = date("Y-m-d H:i:s");
          $this->db->where('id',1)->update('contarina_app_sync',$upd);

         $this->feedback = 'Ecosportello modificato correttamente';

      }else{  
        // ==============
        // == Inserimento

        
        if( ! $this->perms('aggiunta')) die('Non hai i permessi amministrativi');
        $this->db->insert($this->tabella['main'],$result);
        $this->sync_id = $this->db->insert_id();
        $this->feedback_class = "success";
        $this->feedback = 'Ecosportello inserito correttamente';

        $upd["servizi"] = date("Y-m-d H:i:s");
        $this->db->where('id',1)->update('contarina_app_sync',$upd);
      }
      

    }

    public function del_item_call(){
    $upd["servizi"] = date("Y-m-d H:i:s");
    $this->db->where('id',1)->update('contarina_app_sync',$upd);
   }

  function get_dataTable_json($iDisplayStart = 0, $iDisplayLength = 10, $sSearch = "", $sEcho, $sort, $filter=NULL){
    
      $Col[0] = 'titolo';
      
      
      if (is_array($sort['Col'])) {
        foreach ($sort['Col'] as $k => $v) {
          if($Col[$v] ){
             $this->db->order_by($Col[$v], $sort['Dir'][$k]);
         }
        }
      }

      $items = $this->get_items();
      
      $return = array();

      $count = 0;
      $count_display = 0;

      if($items){
      foreach($items as $item){

        if ( ! $this->perms('vedi', $item)) {
          continue;
        }

        $count ++;

        $count_display ++;
       
        if ($iDisplayStart > $count || ($iDisplayLength > 0 && ($iDisplayStart + $iDisplayLength) < $count) ){
          continue;
        }

        //$item = $this->get_item($item->id, TRUE);

        //Compongo la stringa per il filtro di ricerca
        $searchIn =  $item->titolo;

        if (!(preg_match_all('/' . $sSearch  . '/i', $searchIn, $var)) && ($sSearch!="")){
          $count_display --;
          continue;
        }

        $return[] = $item;
        }
      }
      $aaData = array();

      foreach ($return as $item) {

        //$item = $this->get_item($item);

        $row[0] = $item->titolo;
        
       
        

        $row[1] = "
            <div class='btn-group btn-group-sm pull-right'>

              <a href='".PATHADMIN.MODULO."/main/main_add_mod/".$item->id."' class='btn btn-sm btn-primary' title='modifica' >
                  <i class='fa fa-edit'></i> <span class='hidden-sm'>Modifica</span>
              </a>
              <a href='#' class='btn cancella_jsn btn-sm btn-danger' data-table='".$this->tabella['main']."' data-id='".$item->id."' data-ask='Cancellare elemento?' title='cancella' >
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