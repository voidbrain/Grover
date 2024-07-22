<div class="row">
    <div class="col-md-12"><br />
    	<?=simple_add_modd_input('name','nome',$item->name, 'class="validate[required]"')?>
    	<input name="abilitato" type="hidden" value="1" /> 
	</div>
</div>
<div class="row">
    <div class="col-md-12">
    	<div class="control-group"><br />
			<label class="control-label" for="tipologia">Piccola descrizione:</label>
			<div class="controls">
				<textarea name="descrizione" class="textarea"><?=$item->descrizione?></textarea>
			</div>
		</div>
	</div>
</div>
<div class="row">
    <div class="col-md-12">
    	<div class="control-group"><br />
			<label class="control-label" for="tipologia">Codice HTML da incorporare:</label>
			<div class="controls">
				<textarea name="corpo" class="textarea"><?=$item->corpo?></textarea>
			</div>
		</div>
	</div>
</div>

<div class="row">
    <?
    echo $admin->addmodHtmlFile($file_info,$item->id);
    ?>
</div>