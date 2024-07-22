<?
/**
* CLASSE DEL MODULO 
*/
class Modulo extends Newsletter
{
    protected $db;
    protected $perms;
    protected $user_info;
    protected $user_tipolgia_info;
    protected $tabella;
    protected $config;

    function __construct()
    {
       global $user_info;
       global $user_tipolgia_info;
       global $db;
       global $perms;
       global $tabella;
       global $config;

       $this->user_info = $user_info;
       $this->user_tipolgia_info = $user_tipolgia_info;
       $this->db = $db; 
       $this->perms = $perms; 
       $this->tabella = $tabella; 
       $this->config = $config; 

       $this->newsletter_pfx = $config['modulo']['session_pfx'];
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
    $arr['corpo'] = ($this->get_session('corpo')) ? addslashes($this->get_session('corpo')) : '';
    $arr['grouplist_info'] = ($this->get_session('grouplist_info')) ? ($this->get_session('grouplist_info')) : '';

    if($arr['stato'] == 1){
      $arr['data_invio'] = date("Y-m-d H:i:s");
    }

    if(!$this->get_session('id')){
      $arr['data_creazione'] = date("Y-m-d H:i:s");
      $arr['id_user'] = $this->user_info->id;
      $return = $this->db->insert($this->tabella['main'],$arr);
      $this->set_session('id',$this->db->insert_id());
    }else{
      $return = $this->db->where('id',$this->get_session('id'))->update($this->tabella['main'],$arr);
    }

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
  private function save_progress_mail($email, $status){
    
    $utenti = $this->db->select('lista_utenti')->where('id',$this->get_session('id'))->get($this->tabella['main'])->row();

    if($utenti->lista_utenti != ""){
      $aUtenti = json_decode($utenti->lista_utenti,TRUE);
    }

    if(count((array)$aUtenti) == 0){

      $getUtenti = $this->extract_session_email_list();

      foreach ($getUtenti as $item) {
        
        $aUtenti[$item->email] = array('status' => 0);
        
      }

    }

    $aUtenti[$email]['status'] = $status;

    $arr['lista_utenti'] = json_encode($aUtenti);

    $this->db->where('id',$this->get_session('id'))->update($this->tabella['main'],$arr);

    return TRUE;

  }

    //verifico abilitazione allo step 2
  public function status_newsletter($id = NULL){

    $status = 0; // newsletter in fase di costruzione
    
    $newsletter = $this->db->where('id',$id)->get($this->tabella['main'])->row();

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
            if($this->get_session('stato') != 0){
              return FALSE;
            }
            return TRUE;
            break;
         case 2:  
             if(!$this->get_session('oggetto') || !$this->get_session('nomeMit') || !$this->get_session('emailMit') || !$this->get_session('ritorna') || $this->get_session('stato') != 0){
               return FALSE;
             }
             
             return TRUE;
             break;   
        //verifico abilitazione allo step 3
        case 3:  
            if(!$this->get_session('template') || $this->get_session('stato') != 0){
              return FALSE;
            }
            
            return TRUE;
            break;
        //verifico abilitazione allo step 4
        case 4:  

            $filtri = json_decode($this->get_session('filtri'), TRUE);
            if(!is_array($filtri) || count($filtri) == 0 || $this->get_session('stato') != 0){
              return FALSE;
            }

            return TRUE;
            break;
        //verifico abilitazione allo step 5
        case 5:  

            if(! $this->able(1) || ! $this->able(2) || ! $this->able(3) || ! $this->able(4)){
              return FALSE;
            }

            $content = json_decode($this->get_session('content'), TRUE);
            if(!is_array($content) || count($content) == 0 || $this->get_session('stato') == 2){

              if (count($this->scomponi_template()) == 0) {
                return TRUE;
              }

              return FALSE;
            }
            
            return TRUE;
            break;
        //verifico abilitazione allo step 6
        case 6:  
            if($this->get_session('stato') != 1){
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

   public function sync($_POST){


    $return = FALSE;

    switch ($this->passo) {
      case 1: {
        // == STEP 1
        if(!isset($_POST['oggetto']) || !isset($_POST['nomeMit']) || !ereg('^.+@.+\..+$',$_POST['emailMit']) || !ereg('^.+@.+\..+$',$_POST['ritorna'])){
          $this->feedbackClass = 'error';
          $this->feedback = 'Non tutti i valori sono stati inserito  correttamente';
          $return = FALSE;
        }

        $this->set_session('oggetto' , $_POST['oggetto']);
        $this->set_session('nomeMit' , $_POST['nomeMit']);
        $this->set_session('emailMit' , $_POST['emailMit']);
        $this->set_session('ritorna' , $_POST['ritorna']);
		
		
		

        $return = TRUE;
        break;
      }
      case 2: {
        // == STEP 2
        if(!isset($_POST['template'])){
          $this->feedbackClass = 'error';
          $this->feedback = 'Selezionare un template';
          $return = FALSE;
        }

        $this->set_session('template' , $_POST['template']);

        $return = TRUE;

        break;
      }
      case 3: {
        // == STEP 3
        if(!is_array($_POST['filtri'])){
          $this->feedbackClass = 'error';
          $this->feedback = 'Selezionare almeno un\'opzione';
          $return = FALSE;
        }

        $this->set_session('filtri', json_encode($_POST['filtri']));

        $return = TRUE;

        break;
      }
      case 4: {
        // == STEP 4
        if(!is_array($_POST['content'])){
          $this->feedbackClass = 'error';
          $this->feedback = 'Selezionare almeno un\'opzione';
          $return = FALSE;
        }

        $this->set_session('content', json_encode($_POST['content']));

        $return = TRUE;

        break;
      }
      case 5: {
        
        $return = TRUE;
        //Se sto semplicente salvando non setto a 1 lo stato (1 invio in corso e non terminato)
        if($_POST['save'] != 1){
          $this->set_session('stato' , 1);
        }
        $this->set_session('corpo' , $this->ricomponi_template());
        $this->set_session('grouplist_info' , json_encode($this->extract_grouplist_info()));


        $this->save_session();

        break;
      }    
      case 6: {
        
        $return = FALSE;
        //Se sto semplicente salvando non setto a 1 lo stato (1 invio in corso e non terminato)
        if($_POST['fine'] == 1){
          $this->set_session('stato' , 2);
          $this->set_session('corpo' , $this->ricomponi_template());
          $this->save_session();

          $return = TRUE;
        }

        break;
      }      

    }

    if($return && $_POST['save'] == 1){

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

     $html = str_get_html($template->corpo);


     // Cerca il numero di text-input
     foreach($html->find('.text-input, .textarea-input, .img-input') as $element){

       $type = "";
       $type = (strpos($element->attr['class'], 'text-input') === false) ? $type : 'text-input';
       $type = (strpos($element->attr['class'], 'textarea-input') === false) ? $type : 'textarea-input';
       $type = (strpos($element->attr['class'], 'img-input') === false) ? $type : 'img-input';

       $return[] = array('tipo' => $type, 'title' => $element->title, 'id' => $element->id, 'value' => trim($element->innertext));

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

          $nome_file_thumb = found_file(PHPPATH.$this->config['admin'][MODULO]['root_upload'], $this->get_session('id').'_'.$element->id . '_normal');
          $targetFile_thumb = $this->config['root'].'/'.$this->config['admin'][MODULO]['root_upload'].$nome_file_thumb;
          if($nome_file_thumb){
            $element->innertext = '<img src="'.$targetFile_thumb.'">';
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

    // ================================
    // GESTIONE LISTE UTENTI E CATEGORIE
    // ================================


    public function get_newsletter_liste($id){

        return $this->db->where('id', $id)->get($this->tabella['newsletter_liste'])->row();

    }

    public function get_newsletter_liste_list(){

      if(!$this->cache['get_liste_list']){

        $this->cache['get_liste_list'] = $this->db->get($this->tabella['newsletter_liste'])->result();
      
      }
       
      return $this->cache['get_liste_list'];

    }

    public function get_palestre($key){

        return $this->db->where('key_rel', $key)->get($this->tabella['palestre'])->row();

    }

    public function get_palestre_list(){

      if(!$this->cache['get_palestre_list']){

        $this->cache['get_palestre_list'] = $this->db->order_by('posizione','ASC')->where('abilitato', 1)->get($this->tabella['palestre'])->result();
      
      }
       
      return $this->cache['get_palestre_list'];

    }

/*
    public function get_province($key){

      if(!$this->cache['get_province'][$key]){

        $this->cache['get_province'][$key] = $this->db->where('id', $key)->get($this->tabella['province'])->row();
      
      }
       
      return $this->cache['get_province'][$key];

    }

    public function get_province_list(){

        if(!$this->cache['get_province_list']){
           $return = array();

          $province_list = $this->db->order_by('provincia','ASC')->get($this->tabella['province'])->result();

           foreach ($province_list as $prov) {

            if(count($this->extract_list_iscritti($prov->id)) > 0 ){
              $return[] = $prov;
            }

          }

          $this->cache['get_province_list'] = $return;

        }

        return $this->cache['get_province_list'];

    }
*/

    public function get_lingue_list(){

      $lingue = $this->db->group_by('lingua_browser')->select('lingua_browser')->get($this->tabella['iscritti_newsletter'])->result();

      foreach ($lingue as $lng) {
          $return[] = $lng->lingua_browser;
      }
      return $return;

    }
    //Estraggo la lista dalle liste
    public function extract_list_newsletter_liste($filtro = 'all'){

      if(!$this->cache['newsletter_liste'][$filtro]){

        //Rimuovo utenti segnati in black list
        $ban_list = $this->getBannedList();

        foreach ($ban_list as $email) {
          $this->db->where('email !=', $email);
        }

        if ($filtro != 'all') {
           $this->db->where('id_lista', $filtro);
        }

        $this->cache['newsletter_liste'][$filtro] = $this->db->group_by('email')->select('email')->get($this->tabella['newsletter_iscritti'])->result();
      
      }
       
      return $this->cache['newsletter_liste'][$filtro];

    }


    //Estraggo la lista dei clienti
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
           $this->db->where('lingua_browser', $filtro);
        }

        $this->cache['extract_list_iscritti'][$filtro] = $this->db->group_by('email')->select('email')->get($this->tabella['iscritti_newsletter'])->result();

      }
       
      return $this->cache['extract_list_iscritti'][$filtro];

    }

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
            switch ($key) {
              case 'newsletter_liste':
                $return[] = array('tipo' => $key, 'tipo_title' => 'Liste Newsletter', 'titolo' => $this->get_newsletter_liste($val)->titolo, 'count' => count($this->extract_list_newsletter_liste($val)));
                break;
              /*case 'clienti':
                $return[] = array('tipo' => $key, 'tipo_title' => 'Lista Clienti Happyfit', 'titolo' => $this->get_palestre($val)->nome, 'count' => count($this->extract_list_clienti($val)));
                break;*/
              case 'iscritti':
                $return[] = array('tipo' => $key, 'tipo_title' => 'Iscritti newsletter', 'titolo' => $val, 'count' => count($this->extract_list_iscritti($val)));
                break;
            }
          }
        }
      }   

      return $return;      

    }


    //Estraggo un'array con la lista degli utenti divisi per categoria
    public function extract_session_list(){

      $return = array();
      
      $filtri = json_decode($this->get_session('filtri'), TRUE);
      $filtri = (array)$filtri;

      foreach ($filtri as $key => $values) {
        foreach ($values as $val) {
          switch ($key) {
            case 'newsletter_liste':
              $return[] = array('tipo' => $key, 'tipo_title' => 'Liste Newsletter', 'titolo' => $this->get_newsletter_liste($val)->titolo, 'lista' => $this->extract_list_newsletter_liste($val));
              break;
            /*case 'clienti':
              $return[] = array('tipo' => $key, 'tipo_title' => 'Lista Clienti Happyfit', 'titolo' => $this->get_palestre($val)->nome, 'lista' => $this->extract_list_clienti($val));
              break;*/
            case 'iscritti':
              $return[] = array('tipo' => $key, 'tipo_title' => 'Iscritti newsletter', 'titolo' => $val, 'lista' => $this->extract_list_iscritti($val));
              break;
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
          switch ($key) {
            case 'newsletter_liste':
              foreach ($this->extract_list_newsletter_liste($val) as $item) {
                $return[$item->email] = $item;
              }
             
              break;
            case 'clienti':
              foreach ($this->extract_list_clienti($val) as $item) {
                $return[$item->email] = $item;
              }
             
              break;
            case 'iscritti':
              foreach ($this->extract_list_iscritti($val) as $item) {
                $return[$item->email] = $item;
              }
              break;
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

        foreach ($getUtenti as $item) {
          $aUtenti[$item->email] = array('status' => 0);
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

    public function invia_test($_POST){
      if(!$_POST){
        return FALSE;
      }
      if(ereg('^.+@.+\..+$',$_POST['email_test'])){
        if($this->invio_mail($_POST['email_test'], 'TEST:'.$this->get_session('oggetto'))){
          $this->feedbackClass = 'success';
          $this->feedback = 'E-mail di prova inviata correttamente';
          return TRUE;
        }else{
          $this->feedbackClass = 'error';
          $this->feedback = 'Problema nell\'invio della mail';
          return FALSE;
        }

      } else {
        $this->feedbackClass = 'error';
        $this->feedback = 'E-mail inserita non corretta';
        return FALSE;
      }

    }

    public function send_newsletter($email){

      if(ereg('^.+@.+\..+$',$email)){
        if($this->invio_mail($email, $this->get_session('oggetto'))){
          $return['feedbackClass'] = 'success';
          $return['feedback'] = 'E-mail di prova inviata correttamente';
          $return['status'] = TRUE;
          $this->save_progress_mail($email,1);
        }else{
          $return['feedbackClass'] = 'error';
          $return['feedback'] = 'Problema nell\'invio della mail';
          $return['status'] = FALSE;
          $this->save_progress_mail($email,2);
        }

      } else {
        $return['feedbackClass'] = 'error';
        $return['feedback'] = 'E-mail inserita non corretta';
        $return['status'] = FALSE;
        $this->save_progress_mail($email,3);
      }

      return $return;

    }

    public function invio_mail($email,$oggetto = NULL){

      //$email = 'staff@klekoo.com';

      switch (ENVIRONMENT)
      {
        case 'development':
        case 'testing':
          $email = 'staff@klekoo.com';
        break;
        case 'production':
          $email = $email;
        break;
      }

      //Mi assicuro di essere nel passo giusto e che sia abilitato l'invio
      if ($this->config['modulo']['invio'] && $this->passo >= 5) {

        $body = $this->ricomponi_template($email);

        //CREZIONE E INVIO EMAIL
        $mail = new MyMailer(); // defaults to using php "mail()"
        $mail->AddReplyTo($this->get_session('ritorna'));
        $mail->SetFrom($this->get_session('emailMit'),$this->get_session('nomeMit'));
        $mail->AddAddress($email);
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
          //se l'utente è un super super user può essere visto solo da un suo simile
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