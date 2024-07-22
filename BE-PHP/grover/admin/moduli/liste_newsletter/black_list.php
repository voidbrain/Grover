<?php 

if ($_POST) {
    $modulo->insertBan($_POST);
}

$items = $modulo->getBanned();

?>

<h3>Lista utenti esclusi dalla newsletter</h3>

<div id="custom_toolbar" class="form-inline">
</div>

<form action="" class="form-horizontal validator" method="POST" >
    <div class="row">

        <div class="col-md-7">
            <br>
            <br>
            <a class="btn pull-left" href='<?=PATHADMIN?>liste_newsletter'>
               <i class="fa fa-arrow-left "></i> Torna a liste newsletter
            </a>
        </div>

        <div class="col-md-5">
            <div class="well  well-small">
                <strong>Inserisci manualmente una mail:</strong>
                <br>
                E-mail:    
                <input type="text" class="form-control validate[required,custom[email]]" value="<?=$item->email?>" placeholder="e-mail" id="email" name="email"><br />
                <input type="submit" class="btn btn-primary" value="Aggiungi">
                <?php if ($modulo->feedback): ?>
                    <div class="alert alert-<?=$modulo->feedback_class?>"><?=$modulo->feedback?></div>
                <?php endif ?>
            </div>
        </div>
    </div>
</form>

<table class="table table-striped table-bordered " id="orderTable">
	<thead>
		<tr>
            <th>Email</th>
            <th>Data inserimento</th>
			<th class="no_order action"></th>
		</tr>
	</thead>
	<tbody>
		<?php
        foreach ($items as $item){

            ?>

            <tr id="listItem_<?=$item->id?>" class=" depth_1 <?=$row_class?> ">
                <td><?=$item->email?></td>
                <td><?=format_data_ora($item->data_inserimento)?></td>
                <td>
                    <div class="btn-group pull-right">
                        <!-- CANCELLA OGGETTO (aggiungere data-table e data-id) -->
                        <a href='#' class="btn cancella btn-sm btn-danger" data-table="<?=$tabella['liste_newsletter']['black_list']?>" data-id="<?=$item->id?>" data-ask="Rimuovere utente da lista ban?" title="cancella" >
                            <i class="fa fa-trash-o"></i> rimuovi
                        </a>  
                    </div>               
                </td>
            </tr>    

		<? } ?>
   	</tbody>
</table>