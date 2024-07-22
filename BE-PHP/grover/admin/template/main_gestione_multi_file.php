<? 
$id_rif = $requestURI[4];
$name = $requestURI[5];
?>
<div class="info_update">
  	<img src="<?=PATH?>img/loader.gif" alt=""> Aggiornamento in corso...
</div>
<div>
	<div class="container">
		<fieldset>
			<legend><?=($file_info[$name]['admin']['title'])?> - <?=$soggetti?></h2></legend>
			<a class="btn btn-sm btn-inverse" href='<?=PATHADMIN?><?=MODULO?>/'>
			  <i class="fa fa-arrow-left"></i> <?=$soggetti?>
			</a>
			<a class="btn btn-sm btn-inverse" href='<?=PATHADMIN?><?=MODULO?>/main/main_add_mod/<?=$id_rif?>'>
			  <i class="fa fa-home"></i> <?=$soggetto?> <?if(method_exists('Modulo','get_item')){?>"<?=$modulo->get_item($id_rif)->titolo?>"<?}?>
			</a>


			<hr>
  			<div class="row">
	        <?
	          echo $admin->singleHtmlFileMulti($file_info,$id_rif,$name);
	        ?>
	      	</div>
		</fieldset>
	</div>
</div>