<?
/*$palestre = $modulo->get_palestre_list();*/
$lingue = $modulo->get_lingue_list();
$liste_newsletter = $modulo->get_newsletter_liste_list();


$filtri = json_decode($modulo->get_session('filtri'), TRUE);
$filtri = (array)$filtri;
?>
<p>
  Seleziona la lista di utenti a cui vuoi inviare la newsletter.
</p>
<form action="" method="POST" id="step" class="validator">
  <input type="hidden" name="save" value="1">
	  <div>
	  	<span class="col-sm-13">
	  		<h5>Liste newsletter: </h5>
	  		<?
	  		$checked = (count($liste_newsletter) == count($filtri['newsletter_liste'])) ? 'checked="checked"' : '' ;
	  		?>
	  		<input type="checkbox" value='1' name='newsletter_liste' class="check_all" <?=$checked?>> <strong><em>Tutte le liste newsletter (<?=count($modulo->extract_list_newsletter_liste())?>)</em></strong>
	  	</span>

	    <?
	    foreach ($liste_newsletter as $list) {

	    	$checked = (in_array($list->id, (array)$filtri['newsletter_liste'])) ? 'checked="checked"' : '' ;
	    	$count_list = count($modulo->extract_list_newsletter_liste($list->id));
	    	
	    	if($count_list==0){ continue; } //Se non vi &egrave; nessun iscritto lo elimino dalla selezione
	  		?>
	  	  		<div class="col-md-2 check_newsletter_liste">
	  	  			<input value="<?=$list->id?>" name="filtri[newsletter_liste][]" type="checkbox" id="newsletter_liste_<?=$list->id?>" class="" <?=$checked?>> <?=$list->titolo?> (<?=$count_list?>)
	  	  		</div>
	  		<?
	    	}
	    ?>	
	  </div>
	  <hr>
	  <div>
	  	<span class="col-sm-13">
	  		<h5>Iscritti alla Newsletter del sito: </h5>
	  		<?
	  		$checked = (count($lingue) == count($filtri['iscritti'])) ? 'checked="checked"' : '' ;
	  		?>
	  		<input type="checkbox" value='1' name='iscritti' class="check_all" <?=$checked?>> <strong><em>Tutti gli iscritti (<?=count($modulo->extract_list_iscritti())?>)</em></strong>
	  	</span>
	  	<?
	  	foreach ($lingue as $lng) {

	  		$checked = (in_array($lng, (array)$filtri['iscritti'])) ? 'checked="checked"' : '' ;
	  		$count_list = count($modulo->extract_list_iscritti($lng));
	  		?>
	  			<div class="col-md-2 check_iscritti">
	  				<input value="<?=$lng?>" name="filtri[iscritti][]" type="checkbox" id="iscritti_<?=$lng?>" class="" <?=$checked?>> <?=$lng?> (<?=$count_list?>)
	  			</div>
	  		<?
	  	}
	    ?>	
	  </div>
	  <hr>

  <br style="clear:both" />
  <hr>

  <div class="clearfix">
  	<a href="<?=PATHADMIN?><?=MODULO?>/main/step/<?=($passo-1)?>" class="btn  pull-left"> Indietro </a>
    <div class="btn-group pull-right">
      <!-- <a class="btn btn-sm" id="salva">Salva</a> -->
      <input class="btn btn-primary" type="submit" value="Prosegui">
    </div>
  </div>
</form>