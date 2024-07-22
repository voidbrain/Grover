<?php 
// ==================================================
// =====  =   SELEZIONE TEMPLATE
// ==================================================
 ?> 

<p>
  Seleziona la grafica per la newsletter che vuoi inviare.
</p>
<form action="" method="POST" id="step" class="validator form-horizontal">
  <input type="hidden" name="save" value="1">

    <?
    $count = 0;
    $templates = $modulo->get_template_list();
    foreach ($templates as $temp) {
      if($count!=0 && $count%3 == 0){ echo '</div><div class="row">'; }
      $checked = ($modulo->get_session('template') == $temp->id) ? 'checked="checked"' : '' ;
      
       $nome_file_thumb = found_file($config['admin'][MODULO]['root_upload']."static/" ,$temp->id.'_copertina_admin');
      $targetFile_thumb = $config['admin'][MODULO]['root_upload']."static/".$nome_file_thumb;

      ?>
      <span class="hide_radio col-sm-3">
          <input value="<?=$temp->id?>" name="template" type="radio" class="validate[required]" <?=$checked?> id="template_<?=$temp->id?>">
          <label for="template_<?=$temp->id?>" />
            <div class="img">
              <?php if ($nome_file_thumb): ?>
                <img src="<?=PATH.$targetFile_thumb?>">  
              <?php endif ?>
            </div>
            <div class="desc">
              <strong><?=htmlentities($temp->name)?></strong>
            </div>
            <div class="desc_code">
              <?=$temp->descrizione?>
            </div>
            <br style="clear:both" />
        </label>

      </span>
      <?
    }
    ?>  
  <br style="clear:both" />
  <hr>
  <div class="clearfix">
    <a href="<?=PATHADMIN?><?=MODULO?>/main/step/<?=($passo-1)?>" class="btn  pull-left"> Indietro </a>
    <div class="btn-group pull-right">
     <!--  <a class="btn btn-sm" id="salva">Salva</a> -->
      <input class="btn btn-primary" type="submit" value="Prosegui">
    </div>
  </div>
</form>