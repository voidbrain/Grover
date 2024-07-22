<?
$passo = $requestURI[4];

if(!$_POST){
  $id = (int)$requestURI[5];
}
$modulo->init($passo,$id);

//Se postati file sincronizzo
if($_POST){
    //Se la sincronizazione va a buon fine passo allo step successivo, altrimento rimango qui
    if($modulo->sync($_POST)){
        if($modulo->passo > $passo){
          header('location:'. PATHADMIN . MODULO . '/main/step/' . $modulo->passo); 
        }
    }
}
$laststeps = $modulo->laststeps();
//Verifico compatibilità con il passo ricercato

if(!$modulo->verifysteps($passo)){
    header('location:'.PATHADMIN . MODULO . '/main/step/' . $laststeps);
}

?>

<script type="text/javascript">
  //SETTAGGI PRO MODULO
  jsModuloSetting = new Array();
  jsModuloSetting['passo'] = <?=$passo?>;
</script>

<div class="tabbable tabs-left">
  <ul class="nav nav-tabs">
  	<?php foreach ($config['modulo']['status'] as $key => $value): ?>
  		<li class="<?=($passo == $key) ? 'active' : ''?> <?=($modulo->able($key)) ? '' : 'disabled'?>"><a <?=($modulo->able($key)) ? 'href="'.PATHADMIN . MODULO . '/main/step/' . $key . '"' : ''?>><?=$value?></a></li>
  	<?php endforeach ?>
  </ul>
  <div class="tab-content tab-newsletter">
    <div class="tab-pane active">
      
      <h4><?=$config['modulo']['status'][$passo]?></h4>

      <?php if ($modulo->feedback): ?>
          <br>
          <div class="alert alert-<?=$modulo->feedbackClass?>">
              <?=$modulo->feedback?>
          </div>
      <?php endif ?>

      <div class="steps">
        
         <?

         if(file_exists(PHPPATHADMIN . 'moduli/' . MODULO . '/step-view-'.$passo.'.php')){
             require (PHPPATHADMIN . 'moduli/' . MODULO . '/step-view-'.$passo.'.php');
         }else{
             echo '<p>Nessun risultato trovato.</p>';
         }

         ?> 
      </div>
    </div>
  </div>
</div>