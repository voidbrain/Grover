<?php 
$items = $db->order_by("posizione", "asc")->where("cancellato","0")->get($tabella['main'])->result();
?>

<a class="btn btn-sm" href='<?=PATHADMIN?><?=MODULO?>/main/main_add_mod'>
   <i class="fa fa-plus"></i> Aggiungi <?=$soggetto?>
</a>

<a class="btn btn-sm btn-inverse pull-right" href='<?=PATHADMIN?><?=MODULO?>/main/index_order'>
   <i class="fa fa-random"></i> Ordina <?=$soggetti?>
</a>


<br><br>

<table class="table table-striped table-bordered " id="orderTable">
	<thead>
		<tr>
            <th class="col " title="Abilitato">Attiva</th>
            
            <th>Titolo</th>
            <th>Descrizione</th>
			
            <th>Data</th>
			<th class="col col-sm-2 no_order action"></th>
		</tr>
	</thead>
	<tbody class="sorting" >
		<?
        foreach ($items as $item){
            $row_class = "";
            ?>
            <tr id="listItem_<?=$item->id?>" class=" depth_1 <?=$row_class?>">
                <td>
                    <div class="btn-group pull-right">
                        <a href="" class="btn btn-sm  fa <?=($item->abilitato == 1) ? 'fa-check-square-o checked' : 'fa-square-o' ?> pubblica" data-campo="abilitato" data-id="<?=$item->id?>" data-table="<?=$tabella['main']?>"></a>    
                    </div>
                </td>
                
               
                <td> <?=$item->titolo?> </td>
                <td> <?=TagliaStringa($item->contenuto, 200)?> </td>
                <td> <?=format_data($item->data);?> </td>
                
                <td>
                    <div class="btn-group pull-right">
                        <a href='<?=PATHADMIN?><?=MODULO?>/main/main_add_mod/<?=$item->id?>' class="btn btn-sm btn-primary" title="modifica">
                            <i class="fa fa-edit"></i> Modifica
                        </a> 
                            <!-- CANCELLA OGGETTO (aggiungere data-table e data-id) -->
                        <a href='#' class="cancella btn btn-sm btn-danger" data-table="<?=$tabella['main']?>" data-id="<?=$item->id?>" data-ask="<?=$richiesta_canc?>" title="cancella">
                            <i class="fa fa-trash-o"></i> 
                        </a>      
                    </div>
                </td>
            </tr>    
		<? } ?>
   	</tbody>
</table>