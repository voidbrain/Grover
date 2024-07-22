<?php 
// ==================================================
// =====  =   PARAMETRI INTESTAZIONE
// ==================================================
 ?> 
<p>
  Inserisci i dati di intestazione della newsletter.
</p>
<form action="" method="POST" id="step" class=" validator form-horizontal">
  <input type="hidden" name="save" value="1">

  <div class="row">
    <div class="col-md-8">
        <?=simple_add_modd_input('oggetto', 'Oggetto', $modulo->get_session('oggetto'), 'class="form-control validate[required] "')?>
    </div>
  </div>
  <div class="row">
      <div class="col-md-8">
        <?=simple_add_modd_input('nomeMit', 'Nome Mittente', $modulo->get_session('nomeMit'), 'class="form-control validate[required] "')?>
    </div>
  </div>
  <div class="row">
      <div class="col-md-8">
        <?=simple_add_modd_input('emailMit', 'Email Mittente', $modulo->get_session('emailMit'), 'class="form-control validate[required, custom[email]] "')?>
    </div>
  </div>
  <div class="row">
      <div class="col-md-8">
        <?=simple_add_modd_input('ritorna', 'Ritorna', $modulo->get_session('ritorna'), 'class="form-control validate[required, custom[email]] "')?>
    </div>
  </div>

  <br style="clear:both" />
  <hr>
  <div class="clearfix">
    <div class="btn-group pull-right">
      <!-- <a class="btn btn-sm" id="salva">Salva</a> -->
      <input class="btn btn-primary" type="submit" value="Prosegui">
    </div>
  </div>
</form>