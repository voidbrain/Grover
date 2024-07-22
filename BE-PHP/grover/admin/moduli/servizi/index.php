<?php if ($modulo->perms('aggiunta')): ?>
    <a class="btn btn-sm btn-primary" href='<?=PATHADMIN?><?=MODULO?>/main/main_add_mod'>
       <i class="fa fa-plus"></i> Aggiungi <?=$soggetto?>
    </a>
<?php endif ?>
<div id="custom_toolbar">
</div>
<br><br>
<table class="table table-striped table-bordered " id="orderTableServer">
	<thead>
		<tr>
	      <th>Titolo</th>
	      
	      
	      <th class=" col-sm-3 no_order action"></th> 
		</tr>
	</thead>
	<tbody>
   	</tbody>
</table>