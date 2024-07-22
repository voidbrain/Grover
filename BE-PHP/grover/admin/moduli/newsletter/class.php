<?php
/**
* CLASSE DEL MODULO 
*/
class Modulo extends Newsletter
{
  protected $config;

  function __construct()
  {

    parent::__construct();

    global $config;

    $this->config = $config; 

    $this->newsletter_pfx = $config['modulo']['session_pfx'];
  }


  public function set_variables($data)
  {
    if (is_array($data)) {
      foreach ($data as $k => $v) {
        $this->{$k} = $v;
      }
    }
  }


  public function init($passo, $id = FALSE){

    if ($passo === 'start'){

      $this->clear_session();

    } else if  ($passo === 'id') {

      $this->clear_session();
      $this->get_saved($id);
      $this->passo = $this->laststeps();
      
    } else {

      $this->passo = (int)$passo;

    }

    return TRUE;

  }

  private function clear_session(){

    foreach ($_SESSION as $key => $value) {
      if(strncmp($key, $this->newsletter_pfx, strlen($this->newsletter_pfx)) == 0){
        unset($_SESSION[$key]);
      }
    }
    return TRUE;

  }

  private function get_saved($id){

    $newsletter = $this->db->where('id', $id)->get($this->tabella['main'])->row();

    $this->set_session('template', $newsletter->template);
    $this->set_session('oggetto', $newsletter->oggetto);
    $this->set_session('nomeMit', $newsletter->nomeMit);
    $this->set_session('emailMit', $newsletter->emailMit);
    $this->set_session('ritorna', $newsletter->ritorna);
    $this->set_session('filtri', $newsletter->filtri);
    $this->set_session('content', $newsletter->content);
    $this->set_session('stato', $newsletter->stato);
    $this->set_session('corpo', $newsletter->corpo);
    $this->set_session('grouplist_info', $newsletter->grouplist_info);

    $this->set_session('id', $id);

    return TRUE;

  }

  private function get_stored($select = NULL){

    //Prendo variabili salvate nella sessione

    if(!$this->cache['get_stored'][$select]){

      $this->cache['get_stored'][$select] = FALSE;

      if($select){
        $this->db->select($select);
      }

      $newsletter = $this->db->where('id', $this->get_session('id'))->get($this->tabella['main'])->row();

      if(isset($newsletter->{$select}) && (string)$newsletter->{$select} != "" && (int)$newsletter->{$select} >= 0){

        $this->cache['get_stored'][$select] =$newsletter->{$select};

       }

    }
     
    return $this->cache['get_stored'][$select];

  }

  public function get_session($select = NULL){
   
    if (isset($_SESSION[$this->newsletter_pfx.$select]) && (string)$_SESSION[$this->newsletter_pfx.$select] != "" && (int)$_SESSION[$this->newsletter_pfx.$select] >= 0){

      return $_SESSION[$this->newsletter_pfx.$select];

    } else if(isset($this->config['modulo']['ds'][$select])) {

      return $this->config['modulo']['ds'][$select];

    } else {

      return FALSE;

    }

  }

  private function save_session(){

    $arr['template'] = ($this->get_session('template')) ? $this->get_session('template') : '';
    $arr['oggetto'] = ($this->get_session('oggetto')) ? $this->get_session('oggetto') : '';
    $arr['nomeMit'] = ($this->get_session('nomeMit')) ? $this->get_session('nomeMit') : '';
    $arr['emailMit'] = ($this->get_session('emailMit')) ? $this->get_session('emailMit') : '';
    $arr['ritorna'] = ($this->get_session('ritorna')) ? $this->get_session('ritorna') : '';
    $arr['filtri'] = ($this->get_session('filtri')) ? $this->get_session('filtri') : '';
    $arr['content'] = ($this->get_session('content')) ? $this->get_session('content') : '';
    $arr['stato'] = ($this->get_session('stato')) ? $this->get_session('stato') : '';
    $arr['corpo'] = ($this->get_session('corpo')) ? addslashes(stripslashes($this->get_session('corpo'))) : '';
    $arr['grouplist_info'] = ($this->get_session('grouplist_info')) ? ($this->get_session('grouplist_info')) : '';

    if($arr['stato'] == 1){
      $arr['data_invio'] = date("Y-m-d H:i:s");
    }
    if( ! $this->get_session('id')){
      $arr['data_creazione'] = date("Y-m-d H:i:s");
      $arr['id_user'] = $this->user_info->id;
      $return = $this->db->insert($this->tabella['main'],$arr);
      $this->set_session('id', $this->db->insert_id());
    }else{
      $return = $this->db->where('id',$this->get_session('id'))->update($this->tabella['main'],$arr);
    }

    if($return){
      $this->feedbackClass = 'success';
      $this->feedback = 'Salvataggio riuscito correttamente';
    }else{
      $this->feedbackClass = 'danger';
      $this->feedback = 'Salvataggio non riuscito';
    }
    
    return TRUE;

  }

  
    public function rebuild($id)
    { 

        $this->clear_session();
        $this->get_saved($id);

        $arr['template'] = ($this->get_session('template')) ? $this->get_session('template') : '';
        $arr['oggetto'] = ($this->get_session('oggetto')) ? $this->get_session('oggetto') : '';
        $arr['nomeMit'] = ($this->get_session('nomeMit')) ? $this->get_session('nomeMit') : '';
        $arr['emailMit'] = ($this->get_session('emailMit')) ? $this->get_session('emailMit') : '';
        $arr['ritorna'] = ($this->get_session('ritorna')) ? $this->get_session('ritorna') : '';
        $arr['filtri'] = ($this->get_session('filtri')) ? $this->get_session('filtri') : '';
        $arr['content'] = ($this->get_session('content')) ? $this->get_session('content') : '';
        $arr['stato'] = 0;
        // $arr['corpo'] = ($this->get_session('corpo')) ? addslashes($this->get_session('corpo')) : '';
        // $arr['grouplist_info'] = ($this->get_session('grouplist_info')) ? ($this->get_session('grouplist_info')) : '';

        if($arr['stato'] == 1){
          $arr['data_invio'] = date("Y-m-d H:i:s");
        }

        $arr['data_creazione'] = date("Y-m-d H:i:s");
        $arr['id_user'] = $this->user_info->id;
        $return = $this->db->insert($this->tabella['main'],$arr);

        $new_id = $this->db->insert_id();

        $html = str_get_html(stripslashes($this->get_session('corpo')), true, true, DEFAULT_TARGET_CHARSET, false);

        foreach($html->find('.img-input') as $element){

          // Verifico presenza immagine    
          $nome_file_normal = found_file(PHPPATH.$this->config['admin'][MODULO]['root_upload'], $id.'_'.$element->id . '_normal');
          $targetFile_normal = $this->config['root'].'/'.$this->config['admin'][MODULO]['root_upload'].$nome_file_normal;

          if ($nome_file_normal ) {

            copy ( PHPPATH . $this->config['admin'][MODULO]['root_upload'] . $nome_file_normal , PHPPATH . $this->config['admin'][MODULO]['root_upload'] . str_replace($id.'_'.$element->id , $new_id.'_'.$element->id, $nome_file_normal) );

            // Immagine admin
            $nome_file_admin = found_file(PHPPATH.$this->config['admin'][MODULO]['root_upload'], $id.'_'.$element->id . '_admin');
            copy ( PHPPATH . $this->config['admin'][MODULO]['root_upload'] . $nome_file_admin , PHPPATH . $this->config['admin'][MODULO]['root_upload'] . str_replace($id.'_'.$element->id , $new_id.'_'.$element->id, $nome_file_admin) );

          }
        } 


        $this->clear_session();
        $this->get_saved($this->db->insert_id());

        if($return){
          $this->feedbackClass = 'success';
          $this->feedback = 'Salvataggio riuscito correttamente';
        }else{
          $this->feedbackClass = 'error';
          $this->feedback = 'Salvataggio non riuscito';
        }
        
        return TRUE;
    }

  //verifico abilitazione allo step 2
  private function save_progress_mail($email, $status = 0){

    $utenti = $this->db->select('lista_utenti')->where('id',$this->get_session('id'))->get($this->tabella['main'])->row();

    if($utenti->lista_utenti != ""){
      $aUtenti = json_decode($utenti->lista_utenti,TRUE);
    }


    if(count((array)$aUtenti) == 0){

      $getUtenti = $this->extract_session_email_list();

       foreach ($getUtenti as $item) {
        
        $aUtenti[$item['email']] = array('email' => $item['email'], 'soggetto' => $item['soggetto'], 'status' => 0);
        
      }

    }

    if (is_array($email)) {
      foreach ($email as $em) {

        if ($this->validateEmail($em['email'])) {
          $aUtenti[$em['email']]['status'] = $em['status'];
        }

      }
    } else {

      if ($this->validateEmail($email)) {
        $aUtenti[$email]['status'] = $status;
      }

    }

    $arr['lista_utenti'] = json_encode($aUtenti);

    $this->db->where('id',$this->get_session('id'))->update($this->tabella['main'],$arr);

    //Rinnovo il fatto che l'e-mail &egrave; partita
    $this->set_session('stato' , 3);
    $this->save_session();


    return TRUE;

  }

  
  //verifico abilitazione allo step 2
  public function status_newsletter($newsletter = NULL){

    if ( ! is_object($newsletter)) {
      $newsletter = $this->db->where('id',$newsletter)->get($this->tabella['main'])->row();
    }
    
    $status = 0; // newsletter in fase di costruzione

    if($newsletter && $newsletter->stato != 0){
      $status = $newsletter->stato;

      if($newsletter->lista_utenti == ""){
        $status --;
      }
    }


    return $status;

  }

   public function laststeps(){
     
    $get_accepted = $this->acceptedsteps();
    $return = (in_array(5, $get_accepted) && $this->passo <= 5) ? 5 : $get_accepted[count($get_accepted)-1];

    return $return;

   }


   public function acceptedsteps(){
     if(!$this->cache['acceptedsteps']){
        //verifico lo step 2
        if($this->able(1)){
          $this->cache['acceptedsteps'][] = 1;
        }

        //verifico lo step 2
        if($this->able(2)){
          $this->cache['acceptedsteps'][] = 2;
        }

        //verifico lo step 3
        if($this->able(3)){
          $this->cache['acceptedsteps'][] = 3;
        }

        //verifico lo step 4
        if($this->able(4)){
          $this->cache['acceptedsteps'][] = 4;
        }

        //verifico lo step 5
        if($this->able(5)){
          $this->cache['acceptedsteps'][] = 5;
        }

        //verifico lo step 6
        if($this->able(6)){
          $this->cache['acceptedsteps'][] = 6;
        }

        //verifico lo step 7
        if($this->able(7)){
          $this->cache['acceptedsteps'][] = 7;
        }
      }
    return $this->cache['acceptedsteps'];
   }

   //verifico abilitazione allo step 2

   public function able($passo){
      switch ($passo) {
        case 1:  
            if(($this->get_session('stato') != 0 && $this->get_session('stato') != 1) || $this->passo == 6){
              return FALSE;
            }
            return TRUE;
            break;
         case 2:  
             if(!$this->get_session('oggetto') || !$this->get_session('nomeMit') || !$this->get_session('emailMit') || !$this->get_session('ritorna') || ($this->get_session('stato') != 0 && $this->get_session('stato') != 1) || $this->passo == 6){
               return FALSE;
             }
             
             return TRUE;
             break;   
        //verifico abilitazione allo step 3
        case 3:  
            if(!$this->get_session('template') || ($this->get_session('stato') != 0 && $this->get_session('stato') != 1) || $this->passo == 6){
              return FALSE;
            }
            
            return TRUE;
            break;
        //verifico abilitazione allo step 4
        case 4:  

            $filtri = json_decode($this->get_session('filtri'), TRUE);
            if( ! is_array($filtri) || count($filtri) == 0 || ($this->get_session('stato') != 0 && $this->get_session('stato') != 1) || $this->passo == 6){
              return FALSE;
            }

            return TRUE;
            break;
        //verifico abilitazione allo step 5
        case 5:  

            $content = json_decode($this->get_session('content'), TRUE);
            if( ! is_array($content) || count($content) == 0 || $this->get_session('stato') == 2 || $this->passo == 6){
              return FALSE;
            }
            
            return TRUE;
            break;
        //verifico abilitazione allo step 6
        case 6:  

            if($this->get_session('stato') != 1 && $this->get_session('stato') != 3){
              return FALSE;
            }

            return TRUE;
            break;
        //verifico abilitazione allo step 7
        case 7:  
            if($this->get_session('stato') != 2){
              return FALSE;
            }

            return TRUE;
            break;
        }
      }  
          

   public function verifysteps($passo){
    if(in_array($this->passo, $this->acceptedsteps()) && $this->passo != 0 && $passo == $this->passo){
      return TRUE;
    }else{
      return FALSE; 
    }

   }

   //==================== ===== = 
   //== AZIONI RELATIVE AI VARI POST E INTEREZIONE SESSIONE/DB 

   public function sync($data){

    $data = pulisci($data);

    $return = FALSE;

    switch ($this->passo) {
      case 1: {
        // == STEP 1
        if(!isset($data['oggetto']) || !isset($data['nomeMit']) || !ereg('^.+@.+\..+$',$data['emailMit']) || !ereg('^.+@.+\..+$',$data['ritorna'])){
          $this->feedbackClass = 'danger';
          $this->feedback = 'Non tutti i valori sono stati inserito  correttamente';
          $return = FALSE;
        }

        $this->set_session('oggetto' , $data['oggetto']);
        $this->set_session('nomeMit' , $data['nomeMit']);
        $this->set_session('emailMit' , $data['emailMit']);
        $this->set_session('ritorna' , $data['ritorna']);

        $return = TRUE;
        break;
      }
      case 2: {
        // == STEP 2
        if(!isset($data['template'])){
          $this->feedbackClass = 'danger';
          $this->feedback = 'Selezionare un template';
          $return = FALSE;
        }

        $this->set_session('template' , $data['template']);

        $return = TRUE;

        break;
      }
      case 3: {
        // == STEP 3
        if( ! is_array($data['filtri'])){
          $this->feedbackClass = 'danger';
          $this->feedback = 'Selezionare almeno un\'opzione';
          $return = FALSE;
        }

        $this->set_session('filtri', json_encode($data['filtri']));
        $this->set_session('grouplist_info', '');


        $return = TRUE;

        break;
      }
      case 4: {
        // == STEP 4
        if( ! is_array($data['content'])){
          $this->feedbackClass = 'danger';
          $this->feedback = 'Selezionare almeno un\'opzione';
          $return = FALSE;
        }

        $this->set_session('content', json_encode($data['content']));
        $this->set_session('corpo', '');


        $return = TRUE;

        break;
      }
      case 5: {
        
        $return = TRUE;
        //Se sto semplicente salvando non setto a 1 lo stato (1 invio in corso e non terminato)
        if($data['save'] != 1){
          $this->set_session('stato' , 1);
        }
        $this->set_session('corpo' , $this->ricomponi_template());
        $this->set_session('grouplist_info', json_encode($this->extract_grouplist_info()));

        $this->save_session();

        break;
      }    
      case 6: {
        
        $return = FALSE;
        //Se sto semplicente salvando non setto a 1 lo stato (1 invio in corso e non terminato)
        if($data['fine'] == 1){
          $this->set_session('stato' , 2);
          $this->set_session('corpo' , $this->ricomponi_template());
          $this->save_session();

          $return = TRUE;
        }

        break;
      }      

    }

    if($return && $data['save'] == 1){

      $this->save_session();
      $this->passo ++;
      return $return;

    } else if ($return){

       $this->passo ++;
       return $return;

    } else {

      return $return;

    }

   }


   public function get_template_list(){

     return $this->db->order_by('posizione','ASC')->where('abilitato', 1)->get($this->tabella['template'])->result();

   }

   public function set_session($key, $value){

     $_SESSION[$this->newsletter_pfx.$key] = $value;

   }

   public function scomponi_template(){

     $template = $this->db->where('id', $this->get_session('template'))->get($this->tabella['template'])->row();
     
     if($template->corpo != ""){
          $html = str_get_html($template->corpo);
     
     
          // Cerca il numero di text-input
          foreach($html->find('.text-input, .textarea-input, .img-input, .allegato-input') as $element){
     
            $type = "";
            $type = (strpos($element->attr['class'], 'text-input') === false) ? $type : 'text-input';
            $type = (strpos($element->attr['class'], 'textarea-input') === false) ? $type : 'textarea-input';
            $type = (strpos($element->attr['class'], 'img-input') === false) ? $type : 'img-input';
            $type = (strpos($element->attr['class'], 'allegato-input') === false) ? $type : 'allegato-input';

            if ($element->id == "" || $element->title == "") {
              continue;
            }
     
            $return[] = array('tipo' => $type, 'title' => $element->title, 'id' => $element->id, 'value' => trim($element->innertext));
     
          } 
      }

     return $return;

   }


    public function ricomponi_template($usermail = NULL){

      $template = $this->db->where('id', $this->get_session('template'))->get($this->tabella['template'])->row();
      $newsletter = $this->db->where('id', $this->get_session('id'))->get($this->tabella['main'])->row();
 
      if($newsletter->corpo == "" || $this->get_session('stato') == 0){

        $html = str_get_html($template->corpo, true, true, DEFAULT_TARGET_CHARSET, false);

        $content = json_decode($this->get_session('content'), TRUE);
        $content = (array)$content;

        // Cerca il numero di text-input
        foreach($html->find('.text-input, .textarea-input') as $element){
         $element->innertext = stripslashes($content[$element->id]);
        } 

        foreach($html->find('.img-input') as $element){

          $nome_file = found_file(PHPPATH.$this->config['admin'][MODULO]['root_upload'], $this->get_session('id').'_'.$element->id . '_normal');
          $targetFile_file = $this->config['root'].'/'.$this->config['admin'][MODULO]['root_upload'].$nome_file;
          if($nome_file){
            $element->innertext = '<img src="'.$targetFile_file.'">';
          }
        } 

      } else{
        
        $html = stripslashes($newsletter->corpo);
        
      }

      $pathlng = ($this->config['multilingua']) ? $this->config['root'].'/'.$this->config['default_lng'] : $this->config['root'];

      if ($usermail) {

        // Link per l'inserimento in black list
        $html = str_replace('@@URLREMOVE@@', $pathlng.'/newsletter/remove/'.$this->generate_remove_mail_code($usermail).'?email='.$usermail, $html);

        // Immagine per statistiche
        $html = str_replace($pathlng.'/newsletter-stat/img.png', $pathlng.'/newsletter-stat/'.$this->generate_stat_mail_code($usermail).'/'.$this->get_session('id').'/img.png?email='.$usermail, $html);
        $html = str_replace('@@URLSTAT@@', $pathlng.'/newsletter-stat/'.$this->generate_stat_mail_code($usermail).'/'.$this->get_session('id').'/img.png?email='.$usermail, $html);
        
      } else {

        $html = str_replace('@@URLSTAT@@', $pathlng.'/newsletter-stat/img.png', $html);

      }

      $html = ereg_replace("@@ROOT@@",$this->config['root'],$html);
      return $html;

    }


    public function chekAttachment()
    {

      $return = array();
      $template = $this->db->where('id', $this->get_session('template'))->get($this->tabella['template'])->row();

      $html = str_get_html($template->corpo, true, true, DEFAULT_TARGET_CHARSET, false);

      foreach($html->find('.allegato-input') as $element){

        $nome_file = found_file(PHPPATH.$this->config['admin'][MODULO]['root_upload'], $this->get_session('id').'_'.$element->id);
        $targetFile_file = PHPPATH.$this->config['admin'][MODULO]['root_upload'].$nome_file;
        if($nome_file){
          $return[$element->id] = $targetFile_file;
        }
      } 


      return $return;
    }

    // ================================
    // GESTIONE LISTE UTENTI E CATEGORIE
    // ================================



    //Estraggo la lista dalle liste importate e esporatte
   /* public function extract_list_newsletter_liste($filtro = 'all'){

      if( ! isset($this->cache['newsletter_liste'][$filtro])){

        //Rimuovo utenti segnati in black list
        $ban_list = $this->getBannedList();

        foreach ($ban_list as $email) {
          //$this->db->where('email !=', $email);
        }

        $email = array();

        if ($filtro != 'all') {
           $this->db->where('A.id_list', $filtro);
        }

        $this->db->select('I.email1 AS email1, I.email2 AS email2, I.email3 AS email3');

        $this->db->from($this->tabella['newsletter_iscritti']. ' AS I');
        $this->db->join($this->tabella['newsletter_iscritti_assoc']. ' AS A', 'A.id_rif = I.id');

        $this->db->group_by('I.id');

        $iscritti = $this->db->get()->result();

        foreach ($iscritti as $isc) {

          if ($this->validateEmail($isc->email1) && ! in_array($isc->email1, $ban_list)) {
            $email[] = $isc->email1;
          }

          if ($this->validateEmail($isc->email2) && ! in_array($isc->email2, $ban_list)) {
            $email[] = $isc->email2;
          }

          if ($this->validateEmail($isc->email3) && ! in_array($isc->email3, $ban_list)) {
            $email[] = $isc->email3;
          }

        }

        $this->cache['newsletter_liste'][$filtro] = $email;
      
      }
       
      return $this->cache['newsletter_liste'][$filtro];

    }*/


  /*  //Estraggo la lista dei clienti
    public function extract_list_clienti($filtro = 'all'){

      if(!$this->cache['extract_list_clienti'][$filtro]){

        //Rimuovo utenti segnati in black list
        $ban_list = $this->getBannedList();

        foreach ($ban_list as $email) {
          $this->db->where('email !=', $email);
        }

        if ($filtro != 'all') {
           $this->db->where('key_rel', $filtro);
        }

        $this->cache['extract_list_clienti'][$filtro] = $this->db->group_by('email')->select('email')->get($this->tabella['clienti'])->result();
      
      }
       
      return $this->cache['extract_list_clienti'][$filtro];

    }

    //Estraggo la lista degli iscritti alla newsletter
    public function extract_list_iscritti($filtro = 'all'){


      if(!$this->cache['extract_list_iscritti'][$filtro]){

        //Rimuovo utenti segnati in black list
        $ban_list = $this->getBannedList();

        foreach ($ban_list as $email) {
          $this->db->where('email !=', $email);
        }

        if ($filtro != 'all') {
           $this->db->where('lingua', $filtro);
        }

        $this->cache['extract_list_iscritti'][$filtro] = $this->db->group_by('email')->select('email')->get($this->tabella['iscritti_newsletter'])->result();

      }
       
      return $this->cache['extract_list_iscritti'][$filtro];

    }*/

    // ===================================================
    // ESTRAZZIONE LISTA EMAIL ED INFO DAI FILTRI
    // =======================================


    public function extract_grouplist_info(){

      $newsletter = $this->db->where('id', $this->get_session('id'))->where('grouplist_info !=', '')->get($this->tabella['main'])->row();

      $return = array();

      if($newsletter){

        $return = json_decode($newsletter->grouplist_info, TRUE);

      } else {
      
        $filtri = json_decode($this->get_session('filtri'), TRUE);
        $filtri = (array)$filtri;

        foreach ($filtri as $key => $values) {
          foreach ($values as $val) {

            $val_split = split('-', $val);

            $lista = $this->get_lista($val_split[0], $val_split[1]);

            if ($lista) {

              $return[] = array('tipo' => $key, 'tipo_title' => 'Liste', 'titolo' => $lista->bread_titolo, 'count' => count($this->get_iscritti_lista($lista, FALSE, $val_split[1])));
            }
          }
        }
      }   

      return $return;      

    }

    //Estraggo un'array con la lista degli utenti
    public function extract_session_email_list(){

      $return = array();
      
      $filtri = json_decode($this->get_session('filtri'), TRUE);
      $filtri = (array)$filtri;

      foreach ($filtri as $key => $values) {
        foreach ($values as $val) {

          $val_split = split('-', $val);

          // Verifico corrispondenza lista
          $lista = $this->get_lista($val_split[0], $val_split[1]);

          if ($lista) {

            // Ottengo lista iscritti per ogni lsita (Guardare classe generica)
            $iscritti = $this->get_iscritti_lista($lista, FALSE, $val_split[1]);

            if (is_array($iscritti)) {
              foreach ($iscritti as $iscritto) {
                $return[$iscritto['email']] = $iscritto;  
              }
            }

          }

        }
      }

      return $return;      
    }

    //Estraggo un'array con la lista degli utenti e il losto stato di avanzamento nel db
    public function extract_send_email_list(){

      $utenti = $this->db->select('lista_utenti')->where('id',$this->get_session('id'))->get($this->tabella['main'])->row();

      $aUtenti = json_decode($utenti->lista_utenti, TRUE);

      if($utenti->lista_utenti == "" || count($aUtenti) == 0){

        $getUtenti = $this->extract_session_email_list();

        foreach ($getUtenti as $email) {

          $aUtenti[$email['email']] = array('email' => $email['email'], 'soggetto' => $email['soggetto'], 'status' => 0);

        }

      }

      return $aUtenti;

    }


    //Estraggo un'array con la lista degli utenti e il loro stato salvato nella tabella della newsletter
    public function extract_userlist_info(){
      
      $utenti = $this->db->select('lista_utenti')->where('id',$this->get_session('id'))->get($this->tabella['main'])->row();

      $aUtenti = json_decode($utenti->lista_utenti,TRUE);
            
      return $aUtenti;

    }


    // ================================
    // INVIO E-MAIL
    // ================================

    public function invia_test($data){
      if( ! $data){
        return FALSE;
      }
      if(ereg('^.+@.+\..+$',$data['email_test'])){
        if($this->invio_mail(array('email' => $data['email_test']), 'TEST:'.$this->get_session('oggetto'))){
          $this->feedbackClass = 'success';
          $this->feedback = 'E-mail di prova inviata correttamente all\'indirizzo: ' . $data['email_test'];
          return TRUE;
        }else{
          $this->feedbackClass = 'danger';
          $this->feedback = 'Problema nell\'invio della mail';
          return FALSE;
        }

      } else {
        $this->feedbackClass = 'danger';
        $this->feedback = 'E-mail inserita non corretta';
        return FALSE;
      }

    }

    public function send_newsletter($email){

      foreach ((array)$email as $em) {
        if(ereg('^.+@.+\..+$',$em)){
          if($this->invio_mail(array('email' => $em), $this->get_session('oggetto'))){
            $return['feedbackClass'] = 'success';
            $return['feedback'] = 'E-mail di prova inviata correttamente';
            $return['status'] = TRUE;
            $email_stat[] = array( 'email' => $em, 'status' => 1);
          }else{
            $return['feedbackClass'] = 'error';
            $return['feedback'] = 'Problema nell\'invio della mail';
            $return['status'] = FALSE;
            $email_stat[] = array( 'email' => $em, 'status' => 2);
          }

        } else {
          $return['feedbackClass'] = 'error';
          $return['feedback'] = 'E-mail inserita non corretta';
          $return['status'] = FALSE;
          $email_stat[] = array( 'email' => $em, 'status' => 3);
        }
      }

      $this->save_progress_mail($email_stat);

      return $return;

    }

    public function invio_mail($email,$oggetto = NULL){

      switch (ENVIRONMENT)
      {
        case 'development':
           $email['email'] = 'loris@klekoo.com';
           $email['soggetto'] = 'Klekoo';
        break;
        case 'testing':
        case 'production':
          $email = $email;
        break;
      }


      //Mi assicuro di essere nel passo giusto e che sia abilitato l'invio
      if ($this->config['modulo']['invio'] && $this->passo >= 5) {

        //Ricreo il corpo della newsletter
        $body = $this->ricomponi_template($email['email']);

        //Controllo allegati
        $allegati = $this->chekAttachment();

        //CREZIONE E INVIO EMAIL
        $mail = new MyMailer(); // defaults to using php "mail()"

        //Aggiungo eventuali allegati
        foreach ($allegati as $all) {
          $mail->AddAttachment($all);
        }

        $mail->AddReplyTo($this->get_session('ritorna'));
        $mail->SetFrom($this->get_session('emailMit'),$this->get_session('nomeMit'));
        $mail->AddAddress($email['email']);
        $mail->Subject = ($oggetto) ? $oggetto : $this->get_session('oggetto');
        $mail->AltBody = strip_tags(str_replace(array("<br>","<br />"), "\n", $body));
        $mail->MsgHTML($body);
        return $mail->Send();

      } else {

        return FALSE;

      }
    }
  


  /********
  ***** PERMESSI DEL MODULO
  ****/

  //Funzione per il controllo della checklist
    public function perms($contesto,$soggetto)
    {
      //Ad ogni CONTESTO verifico se l'utente ha poteri amministrativi sul soggetto
      switch ($contesto) {
        //vedere lo stato di utente
        case 'vedi':
          //se l'utente &egrave; un super super user pu&ograve; essere visto solo da un suo simile
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