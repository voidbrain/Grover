<p>
  Inserisci i dati di intestazione della newsletter.
</p>
<form action="" method="POST" id="step" class=" validator form-horizontal">
  <input type="hidden" name="save" value="1">

  <div class="row">
    <div class="span8">
        <?=simple_add_modd_input('oggetto','Oggetto',$modulo->get_session('oggetto'),'class="validate[required] span6"')?>
    </div>
  </div>
  <div class="row">
      <div class="span8">
        <?=simple_add_modd_input('nomeMit','Nome Mittente',$modulo->get_session('nomeMit'),'class="validate[required] span6"')?>
    </div>
  </div>
  <div class="row">
      <div class="span8">
        <?=simple_add_modd_input('emailMit','Email Mittente',$modulo->get_session('emailMit'),'class="validate[required, custom[email]] span6"')?>
    </div>
  </div>
  <div class="row">
      <div class="span8">
        <?=simple_add_modd_input('ritorna','Ritorna',$modulo->get_session('ritorna'),'class="validate[required, custom[email]] span6"')?>
    </div>
  </div>

  <br style="clear:both" />
  <hr>
  <div class="clearfix">
    <div class="btn-group pull-right">
      <!-- <a class="btn btn-small" id="salva">Salva</a> -->
      <input class="btn btn-primary" type="submit" value="Prosegui">
    </div>
  </div>
</form>