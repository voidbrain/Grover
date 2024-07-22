<? 
$id_rif = $_GET['id_rif'];
$name = $_GET['name'];
$root_upload = $config['admin'][MODULO]['root_upload'];

//Conferma cancellazione
$confirm = ($file_info[$name]['admin']['confirm']) ? 'askConfirm"' : '';

?>

<br style="clear:both" />

<? if(isset($file_info[$name]['admin']['caratteristiche'])){ ?>
	<form action="#" id="caratteristiche" method="post" data-table="<?=$tabella['file']?>" data-name="<?=$name?>" data-id_rif="<?=$id_rif?>">
<? } ?>

	<ul id="test-list" class="sorting_files" data-rif="id_rif" data-id_rif="<?=$id_rif?>" data-table ="<?=$tabella['file']?>">
	<?
	$files = $db->order_by('posizione')->where('id_rif',$id_rif)->where('name',$name)->get($tabella['file'])->result();
	foreach ($files as $file) {
		?>
	      <li id="listItem_<?=$file->id.$name?>" class="box">
	            <?
				if($file_info[$name]['admin']['type'] == 'file'){
					  $nome_file = found_file(PHPPATH.$root_upload,$id_rif.'_'.$file->id.'_'.$name.'_'); 
					  if($nome_file != ""){ //verifico presenza del file
						  $targetFile_thumb = PATH.$root_upload.$nome_file;
					  if(file_exists(PHPPATH.'/img/admin/icons/'.estensione($targetFile_thumb).'.png')){ //verifico se è presente un'icona relativa all'estensione del file
							  $icon = PATH.'img/admin/icons/'.estensione($targetFile_thumb).'.png';
						  }else{
							  $icon = PATH.'img/admin/icons/arrow_down_grey.png'; 
						  }
					  ?>
						  <span class="cnt_img"><a href="<?=$targetFile_thumb?>" target="_blank"><img class="thumb_img" src='<?=$icon?>' /></a></span>
						  
				  <? }
				}else{ 
					$nome_file_thumb = found_file(PHPPATH.$root_upload,$id_rif.'_'.$file->id.'_'.$name.'_admin');
					$targetFile_thumb = PATH.$root_upload.$nome_file_thumb;
					if($nome_file_thumb){ //verifico presenza del file di anteprima
	        		?>
	                	<span class="cnt_img"><img class="thumb_img" src='<?=$targetFile_thumb?>' /></span>
	        <?		} 
				} 
			?>
	        <span class='info'>
				<?
	            if(isset($file_info[$name]['admin']['caratteristiche'])){
	                ?>
	                <span class="cararteristiche">
	                    <input type="hidden" name="id[<?=$file->id?>]" value="<?=$file->id?>" />
	                    <?
	                    $car = $file_info[$name]['admin']['caratteristiche'];
						$fileCar = json_decode($file->caratteristiche,TRUE);
	                    foreach ($car as $c => $v){
	                    ?>	
	                    	<label class="info"><?=$v?>:
	                        <input title="<?=$fileCar[$c]?>" class="" type="text" name="caratteristiche[<?=$file->id?>][<?=$c?>]" placeholder="<?=$c?>" data-table="<?=$tabella['file']?>"  data-name ="<?=$name?>" value="<?=$fileCar[$c]?>"></label>
	                    <? } ?> 
	                </span>
	            <? } ?>
	            <div class="btn_up">
	                
		            <a data-id_rif=<?= $id_rif ?> data-name_rif='<?= $name ?>' data-id='<?=$file->id?>' title="Cancella" class="btn btn-small del_file <?=$confirm?>"><i class="icon icon-trash "></i> Cancella</a>
		        </div>
	        </span>
	        
	    </li>
	 	<? } ?>
	</ul>   

<? if(isset($file_info[$name]['admin']['caratteristiche'])){ ?>
</form>
<? } ?>