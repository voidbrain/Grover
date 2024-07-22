<div id="custom_toolbar" class="form-inline">
    <?php 
/*
    // Tipo
    $tipologie = $modulo->get_tipologie_utenti();

    $elenco_tipologie[] = 'Tutte';

    foreach ($tipologie as $tipologia) {
       $elenco_tipologie[$tipologia->id] = trim($tipologia->titolo);
    }

    echo '<label>di tipologia</label>';
    echo form_dropdown('tipologia', $elenco_tipologie, 0, 'class="filtri" data-collum="'.json_encode(array(2)).'" data-equal="1" ');*/
    ?>
</div>

<?php if ($modulo->perms('aggiunta')): ?>
    <a class="btn btn-sm" href='<?=PATHADMIN?><?=MODULO?>/main/main_add_mod'>
       <i class="fa fa-plus"></i> Aggiungi <?=$soggetto?>
    </a>
<?php endif ?>

<br><br>
<table class="table table-striped table-bordered " id="orderTableServer">
	<thead>
		<tr>
      <th>Nome</th>
      <th>Tipologia</th>
      <th class=" col-sm-1">Status</th>
			<th class=" col-sm-3 no_order action"></th>
		</tr>
	</thead>
	<tbody>
   	</tbody>
</table>
