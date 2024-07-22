<?
// ==================================================
// =====  =   SELEZIONE UTENTI
// ==================================================


/*$palestre = $modulo->get_palestre_list();*/
$liste = $modulo->get_adjacency_items();

$filtri = json_decode($modulo->get_session('filtri'), TRUE);
$filtri = (array)$filtri;


?>
<p>
  Seleziona la lista di utenti a cui vuoi inviare la newsletter.
</p>
<form action="" method="POST" id="step" class="validator">
	<input type="hidden" name="save" value="1">
	<div>

		<h4>Liste:</h4>

		<div class="filter_list" id="filter_list" data-table="<?=$tabella['main']?>" data-livelpag="<?=$n_livelpag?>">
		<?
			$depth = -1;
			$flag = false;
			$first = true;

			foreach($liste as $item) {

				$ul_classe = $li_classe = '';

				$depth_r = $item['depth'];

				$ul_classe = ($first) ? 'depth_'.$depth_r.'' : 'depth_'.$depth_r.' allseldes';

				while ($depth_r > $depth) { 
					echo "<ul class='{$ul_classe} listecheck'>\n"."<li id='list_{$item['id']}' class='{$li_classe}' >"; 
					$flag = false; 
					$depth++; 
				}

				while ($depth_r < $depth) { 
					echo "</li>\n", "</ul>\n"; 
					$depth--; 
				}

				if ($flag) { 
					echo "</li>\n", "<li id='list_{$item['id']}' class='{$li_classe}'>"; 
					$flag = false; 
				}

				$checked = (in_array($item['id'].'-'.$item['key'], (array)$filtri['newsletter_liste'])) ? 'checked="checked"' : '' ;
				$count_list = count($modulo->get_iscritti_lista($item['id'], FALSE, $item['key']));
				?>
					<div class=" check_newsletter_liste">
						<label>
							<input value="<?=$item['id'].'-'.$item['key']?>" name="filtri[newsletter_liste][]" type="checkbox" id="newsletter_liste_<?=$item['id']?>" class="check_lista" <?=$checked?>>
							<?=$item['titolo']?> <?=($count_list > 0) ? '('.$count_list.')' : '' ?>
						</label>
					</div>
				<?
				
				$flag = true;
				$first = false;
			
			}
			while ($depth-- > -1) { echo "</li>\n", "</ul>\n"; }
		?>  
		</div>

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