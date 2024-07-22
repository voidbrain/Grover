<div class="row">
    <div class="progress progress-striped active">
    	<div class="bar" style="width: 0%;"></div>
    </div>
</div>

<div class="count_invio"></div>
<br>
<div class="info_send_box ">
	Si consiglia di non chiudere questa pagina prima della fine dell'invio della newsletter. Qualora la pagina venisse chiusa la newsletter può essere riprese in un secondo momento.<br>
<strong>IMPORTANTE:</strong> Non possono essere aperte due sessioni di invio newsletter simultaneamente.
</div>
<!-- <div id="stop_play" class="active btn">
	<i class="icon icon-pause"></i>
	<span>Pausa</span>
</div>
 -->
<form action="" method="POST" id="step" class="form-horizontal">
	<input type="hidden" name="fine" value="1">
</form>

<script>
	jsModuloSetting['lista_indirizzi'] = new Array();
	jsModuloSetting['ask'] = '<?=($modulo->status_newsletter($modulo->get_session("id"))) ? "Continua invio newsletter" : "Invia newsletter"?> a <?=count($modulo->extract_send_email_list())?> utenti?';

	<?php foreach ($modulo->extract_send_email_list() as $email => $setting): ?>
		var email = new Array();
		email['email'] = '<?=addslashes($email)?>';
		email['status'] = '<?=$setting['status']?>';
		jsModuloSetting['lista_indirizzi'].push(email)
	<?php endforeach ?>
</script>