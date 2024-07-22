<p>
  Seleziona la grafica per la newsletter che vuoi inviare.
</p>
<form action="" method="POST" id="step" class="validator form-horizontal">
  <input type="hidden" name="save" value="1">
  <div class="row">
    <?
    $count = 0;
    $templates = $modulo->get_template_list();
    foreach ($templates as $temp) {
    	if($count!=0 && $count%3 == 0){ echo '</div><div class="row">'; }
    	$checked = ($modulo->get_session('template') == $temp->id) ? 'checked="checked"' : '' ;

      $nome_file_thumb = found_file(PHPPATH.$config['admin'][MODULO]['root_upload'].'static',$temp->id.'_template');
      $targetFile_thumb = PATH.$config['admin'][MODULO]['root_upload'].'static/'.$nome_file_thumb;

      ?>
      <span class="hide_radio span3">
          <input value="<?=$temp->id?>" name="template" type="radio" class="validate[required]" <?=$checked?> id="template_<?=$temp->id?>">
          <label for="template_<?=$temp->id?>" />
            <div class="img">
              <?php if ($nome_file_thumb): ?>
                <img src="<?=$targetFile_thumb?>">  
              <?php endif ?>
            </div>
            <div class="desc">
              <strong><?=htmlentities($temp->name)?></strong>
            </div>
            <div class="desc_code">
              <?=$temp->descrizione?>
            </div>
        </label>
      </span>
      <?
    }
    ?>	
  </div>
  <br style="clear:both" />
  <hr>
  <div class="clearfix">
    <a href="<?=PATHADMIN?><?=MODULO?>/main/step/<?=($passo-1)?>" class="btn  pull-left"> Indietro </a>
    <div class="btn-group pull-right">
     <!--  <a class="btn btn-small" id="salva">Salva</a> -->
      <input class="btn btn-primary" type="submit" value="Prosegui">
    </div>
  </div>
</form>