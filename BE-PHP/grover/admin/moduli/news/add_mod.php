<?php 

$tipologia = ($item->tipologia) ? $item->tipologia : 1;

?>

 <div class="row">
    <div class="col-sm-4">
        <?=simple_add_modd_input_3('titolo','Titolo', (($item->titolo) ? $item->titolo : $_POST['titolo']))?>
    </div>
    
    <div class="col-sm-4">
        <?=simple_add_modd_input_3('data','Data', (($item->data) ? giradata($item->data) : $_POST['data']),'class="datepicker"')?>
    </div>
    
    <div class="col col-sm-4">
                <strong>Attivo</strong>
                <label class="switch switch-primary">
                    <input type="checkbox" <?=($item->abilitato == 1 || $_POST['abilitato'] == 1) ? 'checked' : '';?> class="switch-input" name="abilitato" value="1">
                    <span data-off="No" data-on="Si" class="switch-label"></span>
                    <span class="switch-handle"></span>
                </label><br /><br />
            </div>
</div>
<div class="row">
    <div class="col col-sm-12">
        <strong>Descrizione: </strong>
        <textarea name='contenuto' class="col col-sm-10 mceBig"><?=(($item->contenuto) ? $item->contenuto : $_POST['contenuto'])?></textarea>
    </div>  
</div>
<br>
<div class="row">
    <?
    echo $admin->addmodHtmlFile($file_info,$item->id);
    ?>
</div>