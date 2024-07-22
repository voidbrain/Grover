<h3>Template Newsletter</h3>

<div id="custom_toolbar" class="form-inline">

</div>
<a class="btn btn-small" href='<?=PATHADMIN?><?=MODULO?>/main/main_add_mod'>
   <i class="icon icon-plus"></i> Crea <?=$soggetto?>
</a>


<br><br>
<table class="table table-striped table-bordered " id="orderTable">
	<thead>
		<tr>
            <th class="no_order"></th>
            <th>Nome</th>
            <th>Piccola descrizione</th>
            <!-- <th>Corpo</th> -->
			<th class="no_order action"></th>
		</tr>
	</thead>
	<tbody>
				<?
	        $items = $db->get($tabella['template'])->result();
		

        foreach ($items as $item){
?>
              <tr id="listItem_<?=$item->id?>" class=" depth_1 <?=$row_class?> ">
                <td>
                 <?  
                    $nome_file_thumb = found_file($config['admin'][MODULO]['root_upload'] ,$item->id.'_copertina_admin');
                    $targetFile_thumb = $config['admin'][MODULO]['root_upload'].$nome_file_thumb;
                    if($nome_file_thumb){ ?>
                        <img class="iconimage" src="<?=PATH.$targetFile_thumb?>" />                        
                <? }  ?>
                    
                </td>
                <td><?=$item->name?></td>
                <td><?=$item->descrizione?></td>
                <td>
                    <div class="btn-group pull-right">
                        <!-- <a href="#" class="btn btn-small">
                            <i class="icon icon-eye-open"></i> Scheda
                        </a> -->
                        <? 
                        //limiti modifica
                        if($modulo->perms('modifica',$item)){
                          

                            switch ($status) {
                                 
                                default:
                                    ?>
                                    <a href='<?=PATHADMIN?><?=MODULO?>/main/main_add_mod/<?=$item->id?>' class="btn btn-small " title="modifica" >
                                        <i class="icon icon-edit"></i> <div class="visible-desktop">Modifica</div>
                                    </a>
                                    <?
                                    break;
                            }
                        ?>
                            


                        <? } ?>
                        <? 
                        //limiti cancellazione
                        if($modulo->perms('cancellazione',$item)){
                        ?>
                            <!-- CANCELLA OGGETTO (aggiungere data-table e data-id) -->
                            <a href='#' class="btn cancella btn-small btn-danger" data-table="<?=$tabella['main']?>" data-id="<?=$item->id?>" data-ask="<?=$richiesta_canc?>" title="cancella" >
                                <i class="icon icon-remove"></i> <div class="visible-desktop">rimuovi</div>
                            </a>  
                        <? } ?>   
                    </div>               
                </td>
            </tr>    
		<? } ?>
   	</tbody>
</table>