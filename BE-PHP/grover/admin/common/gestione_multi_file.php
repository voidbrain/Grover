<? 
if(!isset($_GET['modulo'])){die('verificare settaggio variabile modulo');}else{$a_modulo=$_GET['modulo'];}
include("../moduli/".$a_modulo."/config.php");

$id_rif = $_GET['id'];
$name = $_GET['name'];
?>
<html>
<head>
<? include($path.'admin/include/top.php'); ?>
<script>
	//settaggi pro modulo
	jsSetting = new Array();
	jsSetting['path'] = '<?=$path?>';
	jsSetting['modulo'] = '<?=$nome_modulo?>';
</script>
</head>
<body class="add_mod">
<div class="pop_content">
    <div class="content_form_galleria">
    
    <fieldset>
	<legend><h2>Gestione <?=$name?> - <?=$soggetti?></h2></legend>
    <div><a href="<?=$path?>admin/moduli/<?=$nome_modulo?>/add_mod.php?id=<?=$id_rif?>" class="icon button">&nbsp;&nbsp; &laquo; Indietro &nbsp;&nbsp;</a></div>
    <div id="uploader" class="uploader">
    	<hr /><br />
        <div class=" ">
            <?php /*?><div>
                 <a class="icon icon57 title_button" href="javascript:$('#file_upload').uploadifyUpload();">&nbsp;&nbsp;&nbsp;Carica immagini selezionate&nbsp;<span></span></a>
            </div> <?php */?>
            <input type="file" class="upload" id="file_upload" name="Filedata" style="margin-top:15px;"/><br />
            <span style="font-size:10px; color:#777">(max 5Mb formato JPG, PNG, GIF)</span><br />
            <br style="clear:both">
            <div id="custom-queue"></div>
        </div>
    </div>
    <br style="clear:both">
    <div id="visualizza_immagini"> </div>
    </fieldset>
    </div>
</div>
<script type="text/javascript">

	function carica (){
		$('#visualizza_immagini').load('<?=$path?>admin/common/load_multi_file.php?modulo='+jsSetting['modulo']+'&id_rif=<?=$id_rif?>&name=<?=$name?>&pat=<?=urlencode($path);?>&cache='+Math.random());
	}
	$(window).load(function(){
		ridi();
	});
	$(function(event) {
		carica();
			$('#file_upload').uploadify({
			  'uploader'       	: '<?=$path?>admin/plugins/uploadify/uploadify.swf',
			  'script'         	: '<?=$path?>admin/common/uploadify.php',
			  'cancelImg'      	: '<?=$path?>admin/plugins/uploadify/cancel.png',
			  'folder'			: 'Non funzionante... vedi sotto.',
			  'multi'          	: true,
			  'auto'           	: true,
			  'wmode'	 		: 'transparent',
			  'fileExt'        	: '*.jpg;*.png;*.gif;',
			  'sizeLimit' 		: 52428800,
			  'fileDesc'       	: 'Image Files (.JPG,.PNG,.GIF)',
			  'queueID'        	: 'custom-queue',
			  'simUploadLimit' 	: 3,
			  'removeCompleted'	: true,
			  'scriptData'     	: {'modulo':jsSetting['modulo'], 'session': '<?=session_id();?>', 'id_rif':'<?=$id_rif?>','nome': '<?=$name?>'},
			  'onSelectOnce'   	: function(event,data) {
				  $('#status-message').text(data.filesSelected + ' files sono stati aggiunti alla coda.');
				},
			  'onAllComplete'  : function(event,data) {
				  $('#status-message').text(data.filesUploaded + ' files caricati, ' + data.errors + ' errori.');
				  carica();
				}
			});		
	});
</script>
</body>
</html>