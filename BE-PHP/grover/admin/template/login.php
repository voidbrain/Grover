<?php include(PHPPATHADMIN . 'inc/head.php'); ?>

<!-- 
<div class="jumbotron masthead">
  <div class="container">
     <a href="<?=PATH?>">
      <? if(file_exists(PHPPATH.$config['admin']['url_logo'])){ ?>
        
        <img src="<?=PATH.$config['admin']['url_logo']?>" title="Area amministrativa">

      <? }else{ ?>

        <h1>Area amministrativa</h1>

      <? } ?>
    </a>
  </div>
</div> 
-->

<div class="container">

  <div class="row">
    <div class="login-box">

      <h2>Entra nell'area riservata</h2>

      <form class="form-horizontal" action="<?=PATHADMIN?>" method="post">
        <?php 
          $t = time();
        ?>
        <input type="hidden" name="t" value="<?=$t?>">
        <input type="hidden" name="k" value="<?=md5($t.$config['user']['token'])?>">
        <input type="hidden" name="in_login" value="1">

        <fieldset>
          <div class="control-group <?=$user->feedback_class?>">
            <label class="control-label" for="username">Nome utente:</label>
            <div class="controls">
            <input class="input-large col-xs-12" name="username" value="<?=$_POST['username']?>" id="username" type="text" placeholder="Nome utente" autocapitalize="off" autocorrect="off"/>
            </div>
          </div>
          <div class="control-group <?=$user->feedback_class?>">
            <label class="control-label" for="password">Password:</label>
            <div class="controls">
              <input class="input-large col-xs-12" name="password" value="<?=$_POST['password']?>" id="password" type="password" placeholder="Password"/>
            </div>
          </div>

          <div class="clearfix"></div>
          
          <label class="ricorda" for="ricorda"><input type="checkbox" id="ricorda" /> Ricordami</label>
          
          <div class="clearfix"></div>
          
          <input type="submit" class="btn btn-primary col-xs-12" value="Entra">
        </fieldset> 

      </form>
      <hr>
      <?php if ($user->feedback): ?>
        <span class="help-inline alert alert-<?=$user->feedback_class?>"><?=$user->feedback?></span>
      <?php endif ?>
    </div>
  </div><!--/row-->

</div>

<?php include(PHPPATHADMIN . 'inc/footer.php'); ?>