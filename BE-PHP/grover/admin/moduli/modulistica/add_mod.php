<?php 
$pages_list = $pages->get_adjacency_items();

$pages_arr = array('Seleziona');
$ghirigori = array('', ' == ', '  ------ ', '  ---------- ');
foreach ($pages_list as $page) {
    $pages_arr[$page['id']] = $ghirigori[$page['depth']] . $page['titolo'];
}

?>

<input type="hidden" name="sezione_id" value="<?=($item->sezione_id) ? $item->sezione_id : $_GET['sezione_id']?>">

<div class="row">
    <div class="col-sm-6">
        <?=simple_add_modd_input_3('titolo','Titolo', (($item->titolo) ? $item->titolo : $_POST['titolo']))?>
    </div>
    <div class="col-sm-6">
        <?=simple_dropdown_input_3('page_id','Visualizzato in pagina', $pages_arr, (($item->page_id) ? $item->page_id : $_POST['page_id']))?>
    </div>    
</div>
<br>
<div class="row">
    <?
        echo $admin->addmodHtmlFile($file_info, $item->id);
    ?>
</div>