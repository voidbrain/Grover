<div class="row">
    <div class="progress progress-striped active">
    	<div class="progress-bar" style="width: 0%;"></div>
    </div>
</div>

<div class="count_invio"></div>
<br>
<div class="info_send_box ">
	N.B.: NON CHIUDERE questa pagina prima della fine dell'invio della newsletter.<br>
	Se la pagina viene chiusa, le email non ancora inviare potranno essere spedite in un secondo momento dalla pagina iniziale del menu "Newsletter".<br><br>
<strong>IMPORTANTE:</strong> Può essere inviata solo una newsletter alla volta!
</div>
<!-- <div id="stop_play" class="active btn">
	<i class="fa fa-pause"></i>
	<span>Pausa</span>
</div>
 -->
<form action="" method="POST" id="step" class="form-horizontal">
	<input type="hidden" name="fine" value="1">
</form>

<script>
	jsModuloSetting['lista_indirizzi'] = new Array();
	jsModuloSetting['ask'] = '<?=($modulo->status_newsletter($modulo->get_session("id"))) ? "Continua invio newsletter" : "Invia newsletter"?> a <?=count($modulo->extract_send_email_list())?> email?';

	<?php foreach ($modulo->extract_send_email_list() as $email => $setting): ?>
		var email = new Array();
		email['email'] = '<?=addslashes($email)?>';
		email['status'] = '<?=$setting['status']?>';
		jsModuloSetting['lista_indirizzi'].push(email)
	<?php endforeach ?>
</script>