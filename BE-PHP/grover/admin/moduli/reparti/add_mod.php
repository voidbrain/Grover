<?php

$comuni_list = $frmAdd->getComuni("026"); // comuni treviso
$comuni_select = array(0 => 'Seleziona Comune');
foreach ($comuni_list as $comune_list) {
    $comuni_select[$comune_list["codice"]] = $comune_list["nome"];
}
?>

<!-- <div class="row">
    <div class="col-sm-4">
        <?=simple_add_modd_input_3('lat', 'lat', (($item->lat) ? $item->lat : $_POST['lat']), 'class=""');?>
    </div>
    <div class="col-sm-4">
        <?=simple_add_modd_input_3('lng', 'lng', (($item->lng) ? $item->lng : $_POST['lng']), 'class=""');?>
    </div>
</div> -->
<div class="row">
    <div class="col-sm-6">
        
       <?=simple_add_modd_input_3('titolo', 'Nome', (($item->titolo) ? $item->titolo : $_POST['titolo']), 'class=""');?>
    </div> 
    <div class="col-sm-6">
        <?=simple_add_modd_input_3('telefono', 'Telefono', (($item->telefono) ? $item->telefono : $_POST['telefono']), 'class=""');?>
    </div> 
</div>
<div class="row">
    <div class="col-sm-3">
        <strong>Luned&igrave;</strong><br />
        <textarea class="textarea" name="lun"><?=($item->lun) ? $item->lun : $_POST['lun']?></textarea>
    </div>
    <div class="col-sm-3">
        <strong>Marted&igrave;</strong><br />
        <textarea class="textarea" name="mar"><?=($item->mar) ? $item->mar : $_POST['mar']?></textarea>
    </div>
    <div class="col-sm-3">
        <strong>Mercoled&igrave;</strong><br />
        <textarea class="textarea" name="mer"><?=($item->mer) ? $item->mer : $_POST['mer']?></textarea>
    </div>
    <div class="col-sm-3">
        <strong>Gioved&igrave;</strong><br />
        <textarea class="textarea" name="gio"><?=($item->gio) ? $item->gio : $_POST['gio']?></textarea>
    </div>
</div>
<div class="row">    
    <div class="col-sm-3">
        <strong>Venerd&igrave;</strong><br />
        <textarea class="textarea" name="ven"><?=($item->ven) ? $item->ven : $_POST['ven']?></textarea>
    </div>
    <div class="col-sm-3">
        <strong>Sabato</strong><br />
        <textarea class="textarea" name="sab"><?=($item->sab) ? $item->sab : $_POST['sab']?></textarea>
    </div>
    <div class="col-sm-3">
        <strong>Domenica</strong><br />
        <textarea class="textarea" name="sab"><?=($item->dom) ? $item->dom : $_POST['dom']?></textarea>
    </div>
</div>


<hr style="clear:both">