<?php 
if ($_POST) {
    $modulo->insertBan($_POST);
}

 ?>

<h3>Lista utenti esclusi dalla newsletter</h3>

<div id="custom_toolbar" class="form-inline">

</div>

<form action="" class="form-horizontal validator" method="POST" >
    <div class="span4">
        E-mail: <input type="text" class="span2 validate[required,custom[email]]" value="<?=$item->email?>" placeholder="e-mail" id="email" name="email">
        <input type="submit" class="btn btn-primary" value="Aggiungi">
    </div>
    <div class="span4">
        <?php if ($modulo->feedback): ?>
            <div class="alert alert-<?=$modulo->feedback_class?>"><?=$modulo->feedback?></div>
        <?php endif ?>
    </div>
</form>

<a class="btn pull-right" href='<?=PATHADMIN?>liste_newsletter'>
   <i class="icon icon-envelope-alt"></i> Liste destinatari
</a>
    
<br><br>

<table class="table table-striped table-bordered " id="orderTable">
	<thead>
		<tr>
            <th>Email</th>
            <th>Data inserimento</th>
			<th class="no_order action"></th>
		</tr>
	</thead>
	<tbody>
		<?

        $items = $db->get($tabella['black_list'])->result();

        foreach ($items as $item){

            ?>

            <tr id="listItem_<?=$item->id?>" class=" depth_1 <?=$row_class?> ">
                <td><?=$item->email?></td>
                <td><?=format_data_ora($item->data_inserimento)?></td>
                <td>
                    <div class="btn-group pull-right">
                        <!-- CANCELLA OGGETTO (aggiungere data-table e data-id) -->
                        <a href='#' class="btn cancella btn-small btn-danger" data-table="<?=$tabella['black_list']?>" data-id="<?=$item->id?>" data-ask="Cancellare utente da lista ban?" title="cancella" >
                            <i class="icon icon-remove"></i> <div class="visible-desktop">rimuovi</div>
                        </a>  
                    </div>               
                </td>
            </tr>    

		<? } ?>
   	</tbody>
</table>