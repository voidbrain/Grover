<?php 
$nazioni = $frmAdd->getNazioni();
$regioni = $frmAdd->getRegioni();
$regioni_usa = $frmAdd->getRegioni(TRUE);
$province = $frmAdd->getProvince(($item->regione) ? $item->regione : $_POST['regione']); //ottengo il codice della regione e filtro i risultati se già loggato
$comuni = $frmAdd->getComuni(($item->provincia) ? $item->provincia : $_POST['provincia']);

/*$settori = $modulo->get_settori();
foreach ($settori as $set) {
    $settori_arr[$set->id] = $set->titolo; 
}
*/
$tipologie = $modulo->get_tipologie_utenti();
foreach ($tipologie as $tipo) {
    $tipologie_arr[$tipo->id] = $tipo->titolo; 
}

$tipologia = ($item->tipologia) ? $item->tipologia : 1;

       
?>
<div class="row">
    <div class="col-sm-4">
        <?=simple_dropdown_input_3('tipologia','Tipologia (*)',$tipologie_arr , (($item->tipologia) ? $item->tipologia : $_POST['tipologia']))?>
    </div>
    <div class="col col-sm-1">
        <strong>Attivo</strong>
        <label class="switch switch-primary">
            <input type="checkbox" <?=($item->abilitato == 1 || $_POST['abilitato'] == 1) ? 'checked' : '';?> class="switch-input" name="abilitato" value="1">
            <span data-off="No" data-on="Si" class="switch-label"></span>
            <span class="switch-handle"></span>
        </label>
    </div>
</div>
<hr>
<div class="row">
  <?php if ($action == 'aggiungi'): ?>
      <div class="col-sm-6">
          <?=simple_add_modd_input_3('name','Nome utente <br><span class="info">Inserire la mail di riferimento del\'utente</span>', (($item->name) ? $item->name : $_POST['name']), 'class=""')?>
      </div>
      <div class="col-sm-6">
          <?=simple_add_modd_input_3('pass','<br>Password (*)', '', 'class=" "')?>
      </div>
  <?php else: ?>
      <div class="col-sm-6">
          <?=simple_add_modd_input_3('name','Nome utente <br><span class="info">Inserire la mail di riferimento del\'utente</span>', (($item->name) ? $item->name : $_POST['name']), 'class=" "')?>
      </div>
      <div class="col-sm-6">
          <?=simple_add_modd_input_3('pass','Password <br><span class="info">Inserire una password per modificare la password attuale o crearne una nuova. Lasciare vuoto per non modificare nulla.</span>', $item->clean_pass)?>
      </div>
  <?php endif ?>
</div>

<div class="row">
    <div class="col-sm-6">
        <?=simple_add_modd_input_3('nome','Nome', (($item->nome) ? $item->nome : $_POST['nome']))?>
    </div>
    <div class="col-sm-6">
      <?=simple_add_modd_input_3('telefono','Numero di Telefono', (($item->telefono) ? $item->telefono : $_POST['telefono']))?>
    </div>
    <div class="col-sm-6">
      <?=simple_add_modd_input_3('indirizzo','Via/Numero Civico', (($item->indirizzo) ? $item->indirizzo : $_POST['indirizzo']))?>
    </div>

</div>

<div class="row">
    <div class="col col-sm-12">
        <strong>Descrizione: </strong>
        <textarea name='descrizione' class="col col-sm-12 mceBig"><?=(($item->descrizione) ? $item->descrizione : $_POST['descrizione'])?></textarea>
    </div>  
</div>


<hr style="clear:both">    

<div class="row">

    <? echo $admin->addmodHtmlFile($file_info, $id_rif); ?>

</div>

<hr style="clear:both">

