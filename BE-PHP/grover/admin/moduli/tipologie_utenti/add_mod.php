<div class="row">
    <div class="col-sm-6">
        <?=simple_add_modd_input_3('titolo','Titolo',$item->titolo)?>
    </div>    
    <div class="col-sm-6">
        <div class="row">
            <div class="col-sm-6">
                <h5>TIPOLOGIA ATTIVA: </h5>
                <strong>Attivo</strong> 
                <label class="switch switch-primary">
                    <input type="checkbox" <?=($item->abilitato == 1) ? 'checked' : '';?> class="switch-input" name="abilitato" value="1">
                    <span data-off="No" data-on="Si" class="switch-label"></span>
                    <span class="switch-handle"></span>
                </label>
            </div>
        </div>
    </div>
</div>
<div class="row">
    <div class="col-sm-3">
        <h5>ABILITAZIONE MODULI</h5>
        <ul class="no-style-list">
        <?
        foreach ($config['admin']['moduli_list'] as $key => $value) {
            
            $check = (is_in_json($value, 'moduli', $item->privilegi)) ? 'checked="cheked"' : '';
           
            echo '<li>
                    <label class="checkbox inline">' . $value . '<input value="' . $value . '" type="checkbox" name="moduli[]" ' . $check . '></label>
                  </li>';
        }

        ?>
        </ul>
    </div>
    <div class="col-sm-3">
        <h5>GESTIONE MENU</h5>
        <?
         function do_list_bootstrap($array,$livello=0,$parent=NULL){
            global $item;

            if ($livello == 0) {
                $ul_class = 'no-style-list allseldes';
            }

            $return .= '<ul class="' . $ul_class . '">';

            foreach ($array as $key => $value) {
                //Reset variabili 
                $submenu = FALSE;

                if($key=="divider") {
                    continue;
                }

                if(is_array($value['subpage'])){
                    if(count($value['subpage'])>0){ 
                        $submenu = TRUE;
                    }
                }


                $check = (is_in_json($parent.fix_file_name($key), 'nav', $item->privilegi)) ? 'checked="cheked"' : '';
                
                $return .= '<li>
                                <label class="checkbox inline">' . $key . '<input id="' . $parent.fix_file_name($key) . '" value="' . $parent.fix_file_name($key) . '" type="checkbox" name="nav[]" ' . $check . '> - <span class="info muted">Dest: ' . $value['dest'] . '</span></label>';

                if($submenu){
                    $return .= do_list_bootstrap($value['subpage'], $livello+1, $parent.fix_file_name($key));
                }

                $return .= '</li>';
            }

            $return .= '</ul>';

            return $return;
           
        }

        echo do_list_bootstrap($config['admin']['moduli_menu']);        

    ?></div>
</div>