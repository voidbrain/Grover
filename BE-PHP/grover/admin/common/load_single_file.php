<? 
$id_rif = $_GET['id_rif'];
$name = $_GET['name'];
$root_upload = (isset($file_info[$name]['admin']['root_upload'])) ? $file_info[$name]['admin']['root_upload'] : $config['admin'][MODULO]['root_upload'];

//Conferma cancellazione
$confirm = ($file_info[$name]['admin']['confirm']) ? 'askConfirm"' : '';

if($file_info[$name]['admin']['type'] == 'file'){

?>
<ul id="test-list"><?
		//echo PHPPATH.$root_upload;
		if($name!=""){
			$search = $id_rif.'_'.$name.'_';
		}else{
			$search = $id_rif.'_';
		}
		$nome_file = found_file(PHPPATH.$root_upload,$search);
		if($nome_file != ""){
			$targetFile_thumb = PATH.$root_upload.$nome_file;
			if(file_exists(PHPPATH.'img/admin/icons/'.estensione($targetFile_thumb).'.png')){
				$icon = PATH.'img/admin/icons/'.estensione($targetFile_thumb).'.png';
			}else{
				$icon = PATH.'img/admin/icons/arrow_down_grey.png'; 
			}
		?>
         <li id="listItem_<?= $id_rif.$name; ?>" class="box">
            <span class="cnt_img"><a href="<?=$targetFile_thumb?>" target="_blank"><img class="thumb_img" src='<?=$icon?>' /></a></span>
            <span class='info'>
                <div class="btn_up">
                    <a data-id_rif=<?= $id_rif ?> data-name_rif='<?= $name ?>' title="Cancella" class="btn  del_file <?=$confirm?>" ><i class="icon icon-trash "></i> Cancella</a>
                    <span class="result" id="result_<?=$id_rif.$name;?>"></span>
                </div>
            </span>
        </li>
	<? } ?>
</ul>
<?
}else{
?>
<ul id="test-list"><?
		$nome_file_thumb = found_file(PHPPATH.$root_upload,$id_rif.'_'.$name.'_admin');
		$targetFile_thumb = PATH.$root_upload.$nome_file_thumb;
		if($nome_file_thumb){
		?>
        <li id="listItem_<?= $id_rif.$name; ?>" class="box">
            <span class="cnt_img"><img class="thumb_img" src='<?= $targetFile_thumb.'?asd='.rand(); ?>' /></span>
            <span class='info'>
                <div class="btn_up">
                    <a data-id_rif=<?= $id_rif ?> data-name_rif='<?= $name ?>' title="Cancella" class="btn  del_file <?=$confirm?>" ><i class="icon icon-trash "></i> Cancella</a>
                    <span class="result" id="result_<?=$id_rif.$name;?>"></span>
                </div>
            </span>
        </li>
	<? }else{ ?>
    
    <? } ?>
</ul>     
<? } ?>
