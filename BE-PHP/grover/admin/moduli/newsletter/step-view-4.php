<?
// ==================================================
// =====  =   COMPONI NEWSLETTER
// ==================================================


$content = json_decode($modulo->get_session('content'), TRUE);
$content = (array)$content;

//Prendo gli elementi dinamici del template
$input_list = $modulo->scomponi_template();

?>
<form action="" method="POST" id="step" class="validator">
<p>
  Inserisci il contenuto della newsletter. 
</p>

<input type="hidden" name="save" value="1">
	<div class="row">
		<div class="col-md-4">
			<?
		foreach ((array)$input_list as $item) {
			switch ($item['tipo']) {
				case 'img-input':

					// Impostare sul config.php i parametri base dell'immagine con l'id associato
					if( ! isset($file_info[$item['id']])) break;

					$file_info[$item['id']]['admin']['title'] = $item['title'];

					?>
						<?php echo $admin->addmodHtmlFile($file_info,$modulo->get_session('id'),$item['id']); ?>
					<?
					break;
				case 'allegato-input':

					// Impostare sul config.php i parametri base dell'allegato con l'id associato
					if( ! isset($file_info[$item['id']])) break;

					$file_info[$item['id']]['admin']['title'] = $item['title'];

					?>
						<?php echo $admin->addmodHtmlFile($file_info,$modulo->get_session('id'),$item['id']); ?>
					<?	
					break;
			}
		}

	?>
		</div>
		<div class="col-md-8">
			<?
		foreach ((array)$input_list as $item) {
			switch ($item['tipo']) {
				case 'text-input':
					?>
					<div class="col-md-12">
						<div class="control-group">
							<label for="<?=$item['id']?>" class="control-label"><?=$item['title']?>:</label>
							<div class="controls">
								<input type="text" class="col-md-12" value="<?=(isset($content[$item['id']])) ? $content[$item['id']] : $item['value']?>" placeholder="<?=$item['title']?>" id="<?=$item['id']?>" name="content[<?=$item['id']?>]">
							</div>
						</div>
					</div>
					<?
					break;
				case 'textarea-input':
					?>
				    <div class="col-md-12">
				    	<div class="control-group">
							<br /><label class="control-label" for="<?=$item['id']?>"><?=$item['title']?>:</label> 
							<!-- <div class="controls "> -->
								<textarea name="content[<?=$item['id']?>]" id="<?=$item['id']?>" class="mceSimpleNewsletter"><?=(isset($content[$item['id']])) ? stripslashes($content[$item['id']]) : $item['value']?></textarea>
							<!-- </div> -->
						</div>
					</div>
					<?
					break;
			}
		}

	?>
		</div>
	</div>
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