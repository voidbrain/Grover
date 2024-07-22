<?
/**
* CLASSE DEL MODULO 
*/
class Modulo extends Newsletter
{

    function __construct()
    {   
      parent::__construct();
    }
    
    public function set_variables($data)
    {
      if (is_array($data)) {
        foreach ($data as $k => $v) {
          $this->{$k} = $v;
        }
      }
    }


    //Prendo tutti gli elementi che l'utente pu&ograve; vedere
    public function get_items(){
      
      $items = $this->db->get($this->tabella['newsletter_liste'])->result();

      foreach ($items as $item) {

        if(!$this->perms('vedi',$item)){
          continue;
        }

        $item = $this->get_item($item);

        $return[] = $item;
      }

      return $return;
    }

    public function get_item($item){

    	if ( ! is_object($item)) {
    		$item = $this->db->where('id', $item)->get($this->tabella['newsletter_liste'])->row();
		  }

		  //$item->iscritti = $this->db->where('id_list', $item->id)->get($this->tabella['newsletter_iscritti'])->result();

    	return $item;
    }

    public function del_item($id)
    {
      $this->db->where('id', $id)->delete($this->tabella['newsletter_liste']);
      $this->db->where('id_list', $id)->delete($this->tabella['newsletter_iscritti']);
      //echo  $this->db->last_query();
      return TRUE;
    }


    public function insertSingleAssoc($data)
    { 

      if (ereg('^.+@.+\..+$',$data['email'])) {
        $insertData[] = $data;
      }

      $this->syncMultiRows($insertData, FALSE);
    }
 

    public function insertMultiAssoc($data)
    { 
      $dataRows = explode("\n", $data['lista_email']);

      foreach ($dataRows as $row) {

        if (ereg('^.+@.+\..+$',$row)) {

           $insertData[] = array('email' => trim($row));
        }

      }
      $this->syncMultiRows($insertData, FALSE);
    }
 

    public function syncMultiRows($iscritti, $del = TRUE)
    { 
    	
      if ( ! $iscritti) {
        return FALSE;
      }

        // ==============================================
        // Aggiornamento o inserimento iscritti
        // ==============================================

        $iscritti_totali = $this->db->get($this->tabella['newsletter_iscritti'])->result(); 

        foreach ($iscritti_totali as $iscritto) {
          $iscritti_list[$iscritto->email] = $iscritto->id;
        }

        //Scorro le varie righe 
        foreach ($iscritti as $iscritto) {

            if (ereg('^.+@.+\..+$',$iscritto['email'])) {

              if ($iscritti_list[$iscritto['email']]) {
                $update[] = array('id' => $iscritti_list[$iscritto['email']], 'soggetto' => $iscritto['soggetto'], 'data_modifica' => date("Y-m-d H:i:s"));
              } else {
                $insert[] = array('email' => $iscritto['email'], 'soggetto' => $iscritto['soggetto'], 'data_inserimento' => date("Y-m-d H:i:s"), 'data_modifica' => date("Y-m-d H:i:s"));
              }

            }

        }

        $this->db->insert_batch($this->tabella['newsletter_iscritti'], $insert);
        $this->db->update_batch($this->tabella['newsletter_iscritti'], $update, 'id');

        // ==============================================
        // Aggiorno o inserisco associazioni
        // ==============================================

        $iscritti_totali = $this->db->get($this->tabella['newsletter_iscritti'])->result(); 

        foreach ($iscritti_totali as $iscritto) {
          $iscritti_list[$iscritto->email] = $iscritto->id;
        }

        //Scorro le varie righe 
        foreach ($iscritti as $iscritto) {

            if ($iscritti_list[$iscritto['email']]) {

              $assoc[] = array('id_rif' => $iscritti_list[$iscritto['email']], 'id_list' => $_POST['id_list']);

            }

        }

        if ($del) {
          $this->db->where('id_list', $_POST['id_list'])->delete($this->tabella['newsletter_iscritti_assoc']);
        }

        $this->db->insert_batch($this->tabella['newsletter_iscritti_assoc'], $assoc);
        //echo $this->db->last_query();
    }

  

  /********
  ***** PERMESSI DEL MODULO
  ****/

  //Funzione per il controllo della checklist
    public function perms($contesto, $soggetto = NULL)
    {
      switch ($contesto) {
        case 'vedi':
          	return TRUE;
          	break;
        case 'aggiunta':
           	return TRUE;
          	break;
        case 'modifica':
         	return TRUE;
          	break;
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