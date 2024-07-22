<?php
    $items = $db->get($tabella['main'])->result();
?>

<h3>Storico Newsletter</h3>

<div id="custom_toolbar" class="form-inline">

</div>

<a class="btn btn-sm" href='<?=PATHADMIN?><?=MODULO?>/main/step/start'>
   <i class="fa fa-plus"></i> Crea <?=$soggetto?>
</a>

<br>
<br>

<table class="table table-striped table-bordered " id="orderTable">
	<thead>
		<tr>
            <th>Data</th>
            <th>Stato</th>
            <th>Oggetto</th>
			<th class="no_order action"></th>
		</tr>
	</thead>
	<tbody>
	   <?
        foreach ($items as $item){

            $status = $modulo->status_newsletter($item->id);

            if(!$modulo->perms('vedi',$item)){
                continue;
            }

            switch ($status) {
                case 1:
                    $status_title = 'Sospesa';
                    $row_class = 'alert';
                    break;
                case 2:
                    $status_title = 'Terminata';
                    $row_class = 'success';
                    break;                    
                default:
                    $status_title = 'In costruzione';
                    $row_class = '';
                    break;
            }
          
            ?>
            <tr id="listItem_<?=$item->id?>" class=" depth_1 <?=$row_class?> ">
                <td><span class="table_hidden"><?=$item->data_creazione?></span><?=format_data_ora($item->data_creazione)?></td>
                <td><?=$status_title?></td>
                <td><?=$item->oggetto?></td>
                <td>
                    <div class="btn-group pull-right">
                        <!-- <a href="#" class="btn btn-sm">
                            <i class="fa fa-eye-open"></i> Scheda
                        </a> -->
                        <? 
                        //limiti modifica
                        if($modulo->perms('modifica',$item)){

                            switch ($status) {
                                case 1:
                                    ?>
                                    <a href='<?=PATHADMIN?><?=MODULO?>/main/step/id/<?=$item->id?>' class="btn btn-sm" title="Continua invio" >
                                        <i class="fa fa-external-link"></i> Continua invio
                                    </a>
                                    <?
                                    break;    
                                case 2:
                                    ?>
                                    <a href='<?=PATHADMIN?><?=MODULO?>/main/step/id/<?=$item->id?>' class="btn btn-sm" title="Continua invio" >
                                        <i class="fa fa-eye"></i> Vedi newsletter
                                    </a>
                                    <a href='<?=PATHADMIN?><?=MODULO?>/main/reinvia/id/<?=$item->id?>' class="btn btn-sm btn-info" title="" >
                                        <i class="fa fa-reply-all"></i> <span class="">Reinvia</span>
                                    </a>  
                                    <?
                                    break;    
                                default:
                                    ?>
                                    <a href='<?=PATHADMIN?><?=MODULO?>/main/step/id/<?=$item->id?>' class="btn btn-sm" title="modifica" >
                                        <i class="fa fa-edit"></i> Modifica
                                    </a>
                                    <?
                                    break;
                            }
                        }

                        //limiti cancellazione
                        if($modulo->perms('cancellazione',$item)){
                        ?>
                            <!-- CANCELLA OGGETTO (aggiungere data-table e data-id) -->
                            <a href='#' class="btn cancella btn-sm btn-danger" data-table="<?=$tabella['main']?>" data-id="<?=$item->id?>" data-ask="<?=$richiesta_canc?>" title="cancella" >
                            <i class="fa fa-trash-o"></i> 
                            </a>  
                        <? } ?>   
                    </div>               
                </td>
            </tr>    
		<? } ?>
   	</tbody>
</table>