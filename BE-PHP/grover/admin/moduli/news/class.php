<?
/**
* CLASSE DEL MODULO 
*/
class Modulo 
{
  protected $db;
    protected $perms;
    // protected $user_info;
    // protected $user_tipolgia_info;
    protected $tabella;

    function __construct(){ 
       global $db;
       global $perms;
       global $tabella;

       global $config;
       $this->db = $db; 
       $this->perms = $perms; 

       $this->tabella = $tabella['news'];
       $this->config = $config['news'];
       $this->global_config = $config;
    }

    public function set_variables($data)
    {
      if (is_array($data)) {
        foreach ($data as $k => $v) {
          $this->{$k} = $v;
        }
      }
    }

    public function del_item_call(){
    $upd["news"] = date("Y-m-d H:i:s");
    $this->db->where('id',1)->update('contarina_app_sync',$upd);
    echo  $this->db->last_query();
   }   
}
?>