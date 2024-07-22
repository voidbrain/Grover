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
<form action="" method="POST" id="step" class="validator form-horizontal">
  <input type="hidden" name="save" value="1">
	  <div class="row">
	  	<span class="span10">
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
	    	
	    	if($count_list==0){ continue; } //Se non vi è nessun iscritto lo elimino dalla selezione
	  		?>
	  	  		<div class="span2 check_newsletter_liste">
	  	  			<input value="<?=$list->id?>" name="filtri[newsletter_liste][]" type="checkbox" id="newsletter_liste_<?=$list->id?>" class="" <?=$checked?>> <?=$list->titolo?> (<?=$count_list?>)
	  	  		</div>
	  		<?
	    	}
	    ?>	
	  </div>
	  <hr>
	  <div class="row">
	  	<span class="span10">
	  		<h5>Iscritti alla Newsletter del sito (divisi per lingua browser): </h5>
	  		<?
	  		$checked = (count($lingue) == count($filtri['iscritti'])) ? 'checked="checked"' : '' ;
	  		?>
	  		<input type="checkbox" value='1' name='iscritti' class="check_all" <?=$checked?>> <strong><em>Tutti gli iscritti (<?=count($modulo->extract_list_iscritti())?>)</em></strong>
	  	</span>
	  	<?
	  	if ($lingue) {
		  	foreach ($lingue as $lng) {

		  		$checked = (in_array($lng, (array)$filtri['iscritti'])) ? 'checked="checked"' : '' ;
		  		$count_list = count($modulo->extract_list_iscritti($lng));
		  		?>
		  			<div class="span2 check_iscritti">
		  				<input value="<?=$lng?>" name="filtri[iscritti][]" type="checkbox" id="iscritti_<?=$lng?>" class="" <?=$checked?>> <?=$lng?> (<?=$count_list?>)
		  			</div>
		  		<?
		  	}
	  	} else {
	  		echo "<em class='span10'>Nessun utente registrato</em>";
	  	}
	    ?>	
	  </div>
	
	
  <br style="clear:both" />
  <hr>
  <div class="clearfix">
  	<a href="<?=PATHADMIN?><?=MODULO?>/main/step/<?=($passo-1)?>" class="btn  pull-left"> Indietro </a>
    <div class="btn-group pull-right">
      <!-- <a class="btn btn-small" id="salva">Salva</a> -->
      <input class="btn btn-primary" type="submit" value="Prosegui">
    </div>
  </div>
</form>