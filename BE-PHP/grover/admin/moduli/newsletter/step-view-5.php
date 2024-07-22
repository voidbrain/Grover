<div class="well">
	<h4>Intestazione messaggio</h4>
	<div class="">
		<span class="">
			<strong>Oggetto: </strong> 
		</span>
		<span class="">
			<?=$modulo->get_session('oggetto')?> 
		</span>
	</div>
	<div class="">
		<span class="">
			<strong>A: </strong> 
		</span>
		<span class="">
			<?php 
			$dest = $modulo->extract_grouplist_info();
			foreach ($dest as $item): 

				$titolo = ($old_tipo_title != $item['tipo_title']) ? $item['tipo_title'].':' : '';
				$old_tipo_title = $item['tipo_title'];

				?>
				
				<?php if ($titolo != ""): ?>
					<strong><?=$titolo?></strong>
				<?php endif ?>
				<em><?=$item['titolo']?> <?=($item['count'] > 0) ? '('.$item['count'].')' : '' ?>; </em>

			<?php endforeach ?>
		</span>
	</div>
	<div class="">
		<span class="">
			<strong>e-mail Mittente: </strong> 
		</span>
		<span class="">
			<?=$modulo->get_session('emailMit')?>
		</span>
	</div>
	<div class="">
		<span class="">
			<strong>Nome mittente: </strong> 
		</span>
		<span class="">
			<?=$modulo->get_session('nomeMit')?>
		</span>
	</div>
	<div class="">
		<span class="">
			<strong>e-mail Riposta: </strong> 
		</span>
		<span class="">
			<?=$modulo->get_session('ritorna')?>
		</span>
	</div>

</div>
<div class="well">
	<h4>Messaggio</h4>
	<a class="btn btn-inverse" href="<?=PATHADMIN?><?=MODULO?>/step-anteprima/<?=$passo?>" target="_blank">Vedi Anteprima</a>

	<hr>
	<a href="<?=PATHADMIN?><?=MODULO?>/pop/invia_test" id="invia_test" class="fancysmall btn">Invia mail di test</a>
</div>
<form action="" method="POST" id="step" class="validator form-horizontal">
  	<input type="hidden" name="save" value="0">
  	<div class="clearfix">
    	<div class="muted pull-right">Prima di inviare ti verr&agrave; chiesta un'ulteriore conferma. </div>
    	<br style="clear:both;">
    	<br style="clear:both;">

    	<?php if ($modulo->able($passo-1)): ?>
    		<a href="<?=PATHADMIN?><?=MODULO?>/main/step/<?=($passo-1)?>" class="btn  pull-left"> Indietro </a>
    	<?php endif ?>

    	<div class="btn-group pull-right">
    	  <!-- <a class="btn btn-sm" id="salva">Salva</a> -->
    	  <input class="btn btn-primary" type="submit" value="<?=($modulo->status_newsletter($modulo->get_session('id')) != 0) ? 'Continua invio newsletter' : 'Invia newsletter'?>">

    	</div>
  	</div>
</form>