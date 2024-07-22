<br>
<?
$passo = 5;

$modulo->init($passo);

$laststeps = $modulo->able($passo);

//Verifico compatibilità con il passo ricercato
if(!$modulo->verifysteps($passo)){
    die('Invio di prova non disponibile');
}

; 
$modulo->invia_test($_POST); 
?>
<?php if ($modulo->feedback): ?>
    <br>
    <div class="alert alert-<?=$modulo->feedbackClass?>">
        <?=$modulo->feedback?>
    </div>
<?php endif ?>
<br>
<div class="container">
	<form action="" method="POST" id="step" class=" validator form-horizontal">
	  	<input type="hidden" name="save" value="0">

	  	<div class="row">
      		<div class="span8">
      			<div class="well">
      				<h4>Invia mail di prova</h4>
	        		<?=simple_add_modd_input('email_test','E-mail di test',$_POST['email_test'],'class="validate[required, custom[email]] span6"')?>
        			<br style="clear:both" />
        			<hr>
        			<div class="clearfix">
	        		  	<div class="btn-group pull-right">
	        		  		<input class="btn btn-primary" type="submit" value="Invia">
	        		  	</div>
        			</div>
      			</div>
    		</div>
	  	</div>	  	
	</form>
</div>