<br>
<?
$passo = 5;

$modulo->init($passo);

$laststeps = $modulo->able($passo);

//Verifico compatibilit&agrave; con il passo ricercato
if( ! $modulo->verifysteps($passo)){
    die('Invio di prova non disponibile');
}

$modulo->invia_test($_POST); 
?>
<div class="container">
  <form action="" method="POST" id="step" class=" validator form-horizontal">
      <input type="hidden" name="save" value="0">

      <div class="row">
          <div class="col-sm-8">
            <div class="well">
              <h4>Invia mail di prova</h4>
              
              <?php if ($modulo->feedback): ?>
                  <br>
                  <div class="alert alert-<?=$modulo->feedbackClass?>">
                      <?=$modulo->feedback?>
                  </div>
              <?php endif ?>
	        		
              <?=simple_add_modd_input('email_test','E-mail di test',$_POST['email_test'],'class="form-control validate[required, custom[email]] form-control"')?>
        			
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