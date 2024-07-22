<?php

$pages = $modulo->get_adjacency_items();

$pages_arr = array('Contenuto personalizzato');
$ghirigori = array('', ' == ', '  ------ ', '  ---------- ');
foreach ($pages as $page) {
	$pages_arr[$page['id']] = $ghirigori[$page['depth']] . $page['titolo'];
}

?>

<style>
	.mceBig p{margin: 0 0 10px;text-align: left; font-size: 14px !important;}
	.mceBig h2{color: #004277!important;; font-size: 20px!important;;}
</style>

<input type='hidden' name='parent' value='<?=$_GET['parent']?>' />

<div class="row">

    <div class="col-sm-2">
		<strong>Abilita</strong>
		<label class="switch switch-primary">
		    <input type="checkbox" <?=($item->abilitato == 1 || $_POST['abilitato'] == 1 || ! $item) ? 'checked' : '';?> class="switch-input" name="abilitato" value="1">
		    <span data-off="No" data-on="Si" class="switch-label"></span>
		    <span class="switch-handle"></span>
		</label>
	</div>

    <div class="col-sm-2">
		<strong>Visibile</strong>
		<label class="switch switch-primary">
		    <input type="checkbox" <?=($item->menuvisible == 1 || $_POST['menuvisible'] == 1 || ! $item) ? 'checked' : '';?> class="switch-input" name="menuvisible" value="1">
		    <span data-off="No" data-on="Si" class="switch-label"></span>
		    <span class="switch-handle"></span>
		</label>
	</div>
	<div class="col-sm-2">

		<?php if ($item): ?>

			<!-- Button trigger modal -->
			<button class="btn btn-info btn-sm" data-toggle="modal" data-target="#myModal">
			  <i class="fa fa-link"></i> Vedi indirizzo pagina
			</button>

			<!-- Modal -->
			<div class="modal fade" id="myModal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
			  <div class="modal-dialog">
			    <div class="modal-content">
			      <div class="modal-header">
			        <button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button>
			        <h4 class="modal-title" id="myModalLabel">Indirizzo pagina: </h4>
			      </div>
			      <div class="modal-body">
			        <input readonly="" value="<?=$config['root'].'/it/'.$modulo->build_url($item->id)?>" class="form-control col-sm-6" onfocus="this.select();" onmouseup="return false;" >

			      </div>
			      <div class="modal-footer">
			        <button type="button" class="btn btn-default" data-dismiss="modal">Chiudi</button>
			      </div>
			    </div>
			  </div>
			</div>
		<?php endif ?>


	</div>
	<div class="col-sm-6 text-right">
		<?
		if($item->id){
			$breadcrumb = $modulo->build_breadcrumb($item->id);
		?>
			<div class="breadcrumb">
				<?php foreach (array_reverse($breadcrumb) as $bread): ?>
					<?php echo $sep ?><?php echo $bread->titolo ?>
				<?php $sep = ' &gt; '; endforeach ?>
			</div>

		<? } ?>
	</div>
</div>

<h5 class="box-subtitle">Contenuto <?=$soggetto?></h5>

<div class="row">
    <div class="col-sm-8">
    	<?=simple_add_modd_input_3('titolo', 'Titolo', (($item) ? $item->titolo : $_POST['titolo']), 'class="validate[required]"')?>
	</div>
    <div class="col-sm-4">
    	<?=simple_dropdown_input_3('page_content_id', 'Prendi contenuti dalla pagina', $pages_arr, (($item->page_content_id) ? $item->page_content_id : $_POST['page_content_id']))?>
	</div>
</div>

<div class="row <?=($item->modificabile == 0 && $item->modificabile != "") ? 'hide' : '';?>" id="content_page">
    <div class="col-sm-12">
    	<div class="control-group">
			<label class="control-label">Contenuto:</label>
			<div class="controls ">
				<textarea name="contenuto" class="mceBig col-sm-12"><?=(($item) ? $item->contenuto : $_POST['contenuto'])?></textarea>
			</div>
		</div>
	</div>
</div>
<div class="row">
	<br>
	<br>

	   	<?php
	   		if ($item && $item->depth == 0) {
				echo $admin->addmodHtmlFile($file_info,$id_rif, 'header');
				echo "Dimensione immagine attuale: 1170px x 192px";
	   		}
		?>
		
	</div>
<?php if($perms->super()){ ?>

	<hr>

	<h5 class="box-subtitle">Settaggi Superuser</h5>
	<div class="row">
	    <div class="col-sm-6">
		    <!-- <strong>Modificabile</strong>
		    <label class="switch switch-primary">
		        <input type="checkbox" <?=($item->modificabile == 1 || $_POST['modificabile'] == 1 || ! $item) ? 'checked' : '';?> class="switch-input" name="modificabile" class="switch-input"id="modificabile" value="1">
		        <span data-off="No" data-on="Si" class="switch-label"></span>
		        <span class="switch-handle"></span>
		    </label> -->

		    <?=simple_dropdown_input_3('modificabile', 'Modificabile', array( 0 => 'Non modificabile', 1 => 'Modificabile', 2 => 'Modificabile parzialmente'), (( ! $item) ? 1 : $item->modificabile) , 'class=""')?>

		</div>

	    <div class="col-sm-6">
	    	<?=simple_dropdown_input_3('redirect_to_page_id', 'Redirect pagina', (array(0 => 'Seleziona pagina') + $pages_arr), (($item->redirect_to_page_id) ? $item->redirect_to_page_id : $_POST['redirect_to_page_id']))?>
		</div>
	</div>
	<div class="row">
	    <div class="col-sm-6">
	    	<?=simple_add_modd_input_3('permalink','Forza url',(($item) ? $item->permalink : $_POST['permalink']),'class=" col-sm-4"')?>
		</div>
	    <div class="col-sm-6">
	    	<?=simple_add_modd_input_3('meta_title','Meta title',(($item) ? $item->meta_title : $_POST['meta_title']),'class=" col-sm-4"')?>
		</div>
	    <div class="col-sm-6">
	    	<?=simple_add_modd_input_3('meta_keyword','Meta keyword',(($item) ? $item->meta_keyword : $_POST['meta_keyword']),'class=" col-sm-4"')?>
		</div>
	    <div class="col-sm-6">
	    	<?=simple_add_modd_input_3('meta_description','Meta description',(($item) ? $item->meta_description : $_POST['meta_description']),'class="col-sm-4"')?>
		</div>
	</div>
	

<?php }else{ ?>

	<input type="hidden" value="<?=( ! $item) ? 1 : $item->modificabile?>" class=" hide" name="modificabile" id="modificabile" >

<?php } ?>





<script type="text/javascript">
    //SETTAGGI VARIABILI DEL MODULO
    jsModuleSetting = new Array();
    jsModuleSetting['tinyMce_myMenu'] = new Array();

 	<?php 
 	// CREAZIONE ARRAY PER MENU PERSONALIZZATO
 	foreach ($c_reparti->get_items() as $reparto){
 		$reparti_list[$reparto->titolo] = "@@orario-reparto-".$reparto->id."@@";
 	} 

 	$myMenu['Orari reparti'] = $reparti_list;

 	foreach ($servizi->get_items() as $servizio){
 		$servizi_list[$servizio->titolo] = "@@orario-servizio-".$servizio->id."@@";
 	} 

 	$myMenu['Orari servizi'] = $servizi_list;


 	?>

	jsModuleSetting['tinyMce_myMenu'] = <?php echo json_encode($myMenu) ?>;

</script>
