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

				<em><?=$item['titolo']?> (<?=$item['count']?>); </em>

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
	 <hr>
	<div class="row">
		<span class="">
			
			<?php 
			$user = $modulo->extract_userlist_info();
			
			$count['inviate'] = 0;
			$count['lette'] = 0;
			$count['totali'] = 0;
			
			foreach ($user as $k => $v) {
				$count['totali'] ++;
				$count['inviate'] = ($v['status'] == 1) ? ($count['inviate'] + 1) : $count['inviate'];
				$count['lette'] = ($v['stat']['letta'] == 1) ? ($count['lette'] + 1) : $count['lette'];
			}
			?>
			
			<div>
				<span>
					<strong>RIEPILOGO INVIO:</strong><br>
					Inviate: <strong style='font-size:16px;'><?php echo $count['inviate'] ?></strong> / <?php echo $count['totali'] ?> <br>
					Lette: <strong style='font-size:16px;'><?php echo $count['lette'] ?></strong>  / <?php echo $count['totali'] ?>
					
				</span>
				
			</div>
		</span>
		<br>
		<span class="">
			<a href="#" class="showList btn btn-default"><em>Vedi lista e-mail</em></a>
			<?php 
			//$user = $modulo->extract_userlist_info();
			 ?>
			<div class="hide" id="listMessage">
				<br>
				<ul>
				<?php 
				foreach ((array)$user as $email => $v): 
					?>
					<li class="span4">
						<?=$email?>
						<em>(<?
							switch ($v['status']) {
								case 1:
									echo "Inviata";
									break;
								case 2:
									echo "Errore";
									break;
								case 3:
									echo "Errore formato email";
									break;	
								default:
									echo "n/d";
									break;
							}
							?>)</em>

							<?php if ($v['stat']['letta'] == 1): ?>
								<strong>[Letta]</strong>
							<?php endif ?>
					</li>
				<?php endforeach ?>
				</ul>
			</div>		
		</span>
	</div> 
</div>
<div class="well">
	<h4>Messaggio</h4>
	<a class="btn btn-inverse" href="<?=PATHADMIN?><?=MODULO?>/step-anteprima/<?=$passo?>/<?=$modulo->get_session('id')?>" target="_blank">Vedi Messaggio</a>
</div>
<div class="clearfix">
	<div class="btn-group pull-right">
	  	<a class="btn btn-small btn-primary" href="<?=PATHADMIN?><?=MODULO?>">Chiudi</a>
	</div>
</div>	