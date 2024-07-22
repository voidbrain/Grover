<?php
$id_rif = $requestURI[3];

$name = $requestURI[4];

include(PHPPATHADMIN . 'inc/head.php'); 

?>

<div class="info_update">
  	<img src="<?=PATH?>img/intercom/loader.gif" alt=""> Aggiornamento in corso...
</div>
<div class="add_mod container">
	<div class="pop_content">
		<fieldset>
			<legend>Gestione <?=strtolower($file_info[$name]['admin']['title'])?> - <?=$soggetti?></h2></legend>
  			<a class="btn btn-small btn-inverse" href='<?=PATHADMIN?><?=MODULO?>/add_mod/<?=$id_rif?>'>
			  <i class="icon icon-arrow-left"></i> Indietro
			</a>
			<hr>
  			<div class="row">
	        <?php
	          echo $admin->singleHtmlFileMulti($file_info,$id_rif,$name);
	        ?>
	      	</div>
		</fieldset>
	</div>
</div>

<?php include(PHPPATH . 'admin/inc/footer.php'); ?>