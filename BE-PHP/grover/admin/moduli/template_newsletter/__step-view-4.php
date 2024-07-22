<?
$content = json_decode($modulo->get_session('content'), TRUE);
$content = (array)$content;

//Prendo gli elementi dinamici del template
$input_list = $modulo->scomponi_template();
// $modulo->get_session('template') == 1 --> circolari
?>
<form action="" method="POST" id="step" class="validator form-horizontal">
<input type="hidden" name="save" value="1">

<div class="row">
<table width="800" border="0" style="color:#808080; display:block; margin:auto; font-family:'Century Gothic', 'Gill Sans', 'Gill Sans MT', 'Myriad Pro', 'DejaVu Sans Condensed', Helvetica, Arial, sans-serif">
	<tr>
		<td colspan="5"><div style="border-bottom:1px solid #07a479"></div></td>
	</tr>
	<tr>
		<td style="width:160px"></td>
		<td style="width:160px"></td>
		<td style="width:160px"></td>
		<td style="width:160px"></td>
		<td style="width:160px"></td>
	</tr>
	<tr>
		<td colspan="3"><img style="width:350px" src="http://www.farmacietv.it/img/logo.png" /></td>
		<td colspan="2" style="vertical-align:bottom"><span style="font-size:36px; padding-left:60px;"><?= ($modulo->get_session('template') == 1 ? "circolare" : "notiziario");?></span></td>
	</tr>
	<tr>
		<td colspan="3" style="text-align:center">
			<span style="font-family:Cambria, 'Hoefler Text', 'Liberation Serif', Times, 'Times New Roman', serif">Via Cortese 8 - 31100 TREVISO<br>
			Tel. 0422.411642 Fax 0422.412005<br>
			e.mail <a style="color:#808080" href="mailto:associazione@farmacietv.it">associazione@farmacietv.it<br>
			<br>
			</a></span></td>
		<td colspan="2" style="padding-left:60px; font-size:30px; vertical-align:top"><span style="color:#07a479">N.<input style="width:30px" type="text" value="<?=(isset($content["template_title_email_1"])) ? $content["template_title_email_1"] : ""?>" placeholder="" id="template_title_email_1" name="content[template_title_email_1]"></span>/2013</td>
	</tr>
	<tr>
		<td colspan="3" style="background:#<?= ($modulo->get_session('template') == 1 ? "f5f5f5" : "edf9f3");?>"></td>
		<td style="background:#<?= ($modulo->get_session('template') == 1 ? "f5f5f5" : "edf9f3");?>; padding-left:10px">PROT. <input style="width:30px" type="text" value="<?=(isset($content["template_title_email_2"])) ? $content["template_title_email_2"] : ""?>" placeholder="" id="template_title_email_2" name="content[template_title_email_2]">/2013</td>
		<td style="background:#<?= ($modulo->get_session('template') == 1 ? "f5f5f5" : "edf9f3");?>; padding-left:10px">DATA <input style="width:20px" type="text" value="<?=(isset($content["template_title_email_3"])) ? $content["template_title_email_3"] : ""?>" placeholder="" id="template_title_email_3" name="content[template_title_email_3]">.<input type="text" value="<?=(isset($content["template_title_email_4"])) ? $content["template_title_email_4"] : ""?>" style="width:20px" placeholder="" id="template_title_email_4" name="content[template_title_email_4]">.2013</td>
	</tr>
	<tr>
		<td style="vertical-align:top">OGGETTO</td>
		<td style="vertical-align:top" colspan="4"><textarea style="width:620px" name="content[template_content_email_1]" id="template_content_email_1" class=""><?=(isset($content["template_content_email_1"])) ? $content["template_content_email_1"] : $modulo->get_session('oggetto')?></textarea></td>
	</tr>
	<tr>
		<td colspan="5"><div style="border-bottom:10px solid #<?= ($modulo->get_session('template') == 1 ? "f5f5f5" : "edf9f3");?>"></div></td>
	</tr>
	<tr>
		<td colspan="5"><div style="border-bottom:1px solid #07a479"></div></td>
	</tr>
	<tr>
		<td colspan="5"><br><br>
			<textarea style="width:800px" name="content[template_content_email_2]" id="template_content_email_2" class="mceSimpleNewsletter"><?=(isset($content["template_content_email_2"])) ? $content["template_content_email_2"] : ""?></textarea>
		</td>
	</tr>
	<tr>
		<td colspan="5"><br>Cordiali Saluti.<br><br></td>
	</tr>
	<tr>
		<td colspan="2" style="text-align:center">IL SEGRETARIO<br>
		Mimmo D'AGOSTINO</td>
		<td colspan="3" style="text-align:center">IL PRESIDENTE<br>Franco GARIBOLDI MUSCHIETTI</td>
	</tr>
</table>
</div>
  <br style="clear:both" /><br><br>
  
	<label class="control-label span2" for="<?=$item['id']?>">Allegato:</label>
	<div class="controls ">
		<?php echo $admin->addmodHtmlFile($file_info,$modulo->get_session('id'),"pdf"); ?>
	</div>
	 <br style="clear:both" />
  <hr>
  <div class="clearfix">
  	<a href="<?=PATHADMIN?><?=MODULO?>/main/step/<?=($passo-1)?>" class="btn  pull-left"> Indietro </a>
    <div class="btn-group pull-right">
      <!-- <a class="btn btn-small" id="salva">Salva</a> -->
      <input class="btn btn-primary" type="submit" value="Prosegui">
    </div>
  </div>
</form>