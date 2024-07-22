<h3>Tipologia di utenti</h3>

<? if($perms->tipologie_utenti('aggiunta',$item)): ?>
<a class="btn btn-sm" href='<?=PATHADMIN?><?=MODULO?>/main/main_add_mod'>
    <i class="fa fa-plus"></i> Aggiungi <?=$soggetto?>
</a>
<? endif; ?>

<br><br>

<table class="table table-striped table-bordered "  id="orderTable">
	<thead>
		<tr>
			<th>Tipologia</th>
			<th class=" no_order action"></th>
		</tr>
	</thead>
	<tbody>
		<?

        $items = $db->order_by("id", "asc")->get($tabella['main'])->result();

        foreach ($items as $item){

            //solo i super user posso vedere i super user
            if(!$perms->tipologie_utenti('vedi',$item)){
                continue;
            }

            $row_class = "";

            ?>
            <tr id="listItem_<?=$item->id?>" class=" depth_1 <?=$row_class?>">
                <td><?=$item->titolo?></td>
                <td>
                    <div class="btn-group pull-right">
                        <!-- MODIFICA OGGETTO (Fancybox) -->
                        <? 
                        //limiti modifica
                        if($perms->tipologie_utenti('modifica',$item)){
                        ?> 
                            <a href='<?=PATHADMIN?><?=MODULO?>/main/main_add_mod/<?=$item->id?>' class=" btn btn-sm btn-primary" title="modifica">
                                <i class='fa fa-edit'></i> <span class='hidden-sm hidden-xs'>Modifica</span>
                            </a> 
                        <? } ?>
                        <? 
                        //limiti cancellazione
                        if($perms->tipologie_utenti('cancellazione',$item)){
                        ?>
                                <!-- CANCELLA OGGETTO (aggiungere data-table e data-id) -->
                            <a href='#' class="cancella btn btn-sm btn-danger" data-table="<?=$tabella['main']?>" data-id="<?=$item->id?>" data-ask="<?=$richiesta_canc?>" title="cancella">
                                <i class='fa fa-trash-o'></i> 
                            </a>      
                        <? } ?>
                    </div>
                </td>
            </tr>    
		<? } ?>
   	</tbody>
</table>