<? 

$BannedList = $modulo->getBannedList();
if($requestURI[4]){
	$lista = $modulo->get_item($requestURI[4]); 
	$iscritti = $modulo->get_iscritti_lista($lista, TRUE);
}
?>
<?php if ($_GET['parent']): ?>
	<input type="hidden" name="parent" value="<?=$_GET['parent']?>">
<?php endif ?>

<div class="row">
    <div class="col-md-8">
    	<?=simple_add_modd_input('titolo','Titolo',$item->titolo, 'class="form-control validate[required] span6"')?>
	</div>
</div>
<div class="row">
    <div class="col-md-12">
    	<div class="control-group">
			<label class="control-label" for="tipologia">Note:</label>
			<div class="controls">
				<textarea name="note" class="col-md-10"><?=$item->note?></textarea>
			</div>
		</div>
	</div>
</div>

<hr>

<?php if ($item && ! $item->special): ?>

<div class="btn-group pull-right">
    
    <?php if ($lista && ! $lista->special): ?>

       <a class="btn btn-sm btn-info opengestioneLista" href='#'>
           <i class="fa fa-list"></i> Gestisci liste email
        </a>   
    
    <?php endif; ?>

        
    <a class="btn btn-sm btn-inverse" href='<?=PATHADMIN.MODULO?>/main/black_list'>
       <i class="fa fa-ban-circle"></i> Black List
    </a>

</div>

<br>
<br>

<?php if ($lista && ! $lista->special): ?>

    <div class="gestioneLista <?if(!$_POST['insertSingleAssoc']&& !$_POST['insertMultiAssoc']){?>hide<?}?>">
            
        <ul class="nav nav-tabs" id="myTab">
            
            <li class="active"><a href="#inserSingle">Inserimento singolo</a></li>
            <li><a href="#insertMulti">Inserimento multiplo</a></li>
            <li><a href="#importCSV">Importazione CSV</a></li>
        </ul>
         
        <div class="tab-content">
            <div class="tab-pane " id="importCSV">
                <div class="row">
                    <div class="well">

                        <div class='offset1 span5'>
                            <strong>Importa una nuova lista iscritti</strong>
                            <span class='info'>(Max 20Mb)</span><br />
                            <input type='file' class='uplyList' id='allegato' name='Filedata' data-id_list='<?=$lista->id?>'/>
                            <div id='custom-queue' class='row'> </div>
                        </div>
                        <div class='span5'>
                            <strong>Esporta l'attuale lista</strong> 
                            <em>(<?=count($iscritti)?> Iscritti presenti)</em>
                            <br>
                            <a href="<?=PATHADMIN?><?=MODULO?>/esporta_csv/<?=$lista->id?>" target="_blank" class="btn btn-inverse"> <i class="icon-download-alt icon"></i> ESPORTA</a>
                        </div>
                        
                        <br style="clear:both">
                    </div>
                </div>
                <div class="alert alert-danger">
                    <strong>ATTENZIONE! </strong>
                    <br>
                     <ul style="padding-left:20px;">
                        <li>Importare file in formato <strong>.CSV</strong></li>
                        <li>Per la generazione del file .CSV utilizzare come separatore di campo il carattere "<strong>;</strong>".</li>
                        <li>Verranno lette e importante tutte le mail valide presenti nella prima colonna del CSV e i nominativi della seconda. Tutti i restanti campi saranno ignorati.</li>
                        <li>Ogni volta che si esegue un'importazione verr&agrave; effettuato un'aggiornamento totale della  lista. Tutti i contatti esistenti verranno cancellati e importati i nuovi.          Per effettuare aggiornamenti delle liste, si consiglia quindi di esportare la lista attuale, aggiornarla e quindi importarla nuovamente.</li>
                    </ul>
                </div>
            </div>
            <div class="tab-pane active" id="inserSingle">

                <form action="" class="form-horizontal validator" method="POST" >

                    <input type="hidden" name="insertSingleAssoc" value="1"> 
                    <input type="hidden" name="id_list" value="<?php echo $lista->id ?>"> 

                    <div class="well">

                        <strong>Inserisci manualmente un iscritto:</strong>
                        <br>
                        <div class="col-md-5">
                            <label class="col-md-4 paddingtop10" for="email">E-mail:</label>    
                            <input class="col-md-8" type="text" class="form-control validate[required,custom[email]]" value="" placeholder="e-mail" id="email" name="email"> 
                        </div>
                        <div class="col-md-5">
                            <label class="col-md-4 paddingtop10" for="soggetto">Soggetto:</label>        
                            <input class="col-md-8" type="text" class="form-control" value="" placeholder="soggetto" id="soggetto" name="soggetto">
                        </div>
                        <div class="col-md-2"><input type="submit" class="btn btn-primary" value="Aggiungi"></div>
                        <br class="clear">
                    </div>

                </form> 

            </div>
            <div class="tab-pane" id="insertMulti">
                <form action="" class="validator" method="POST" >

                    <input type="hidden" name="id_list" value="<?php echo $lista->id ?>"> 
                    <input type="hidden" name="insertMultiAssoc" value="1"> 

                    <div class="well">

                        <strong>Inserisci manualmente una lista di iscritti:</strong>
                        <div class="col-md-12">
                            <div class="form-group">
                                <div class="control-label">
                                    <label for="lista_email" class="control-label">Lista E-mail:</label>
                                </div>
                                <div class="controls">
                                    <textarea name="lista_email" class="textarea"></textarea>
                                </div>
                            </div>
                        <br class="clear" />
                        <div class="col-md-2"><input type="submit" class="btn btn-primary" value="Aggiungi"></div>
                        <br class="clear" /><br />
                    </div>

                    <div class="alert alert-danger">
                        <strong>ATTENZIONE! </strong>
                        <br>
                         <ul style="padding-left:20px;">
                            <li>Comporre la lista scrivendo una e-mail per riga.</li>
                            <li>A differenza dell'importazione tramite .CSV, l'importazione andr&agrave; ad integrare la lista attuale.</li>
                        </ul>
                    </div>

                </form> 
            </div>
        </div>

        <hr>

    </div>

<?php endif; ?>
<br>



<table class="table table-striped table-bordered " id="orderTable">
    <thead>
        <tr>
            <th>E-mail</th>
            <th>Soggetto</th>
            <th>Data inserimento</th>
            <th>Data modifica</th>
            
            <?php if($lista->special == 0): ?>

                <th class="no_order action"></th>
                
            <?php endif; ?>
        </tr>
    </thead>
    <tbody>
        <?
        if (is_array($iscritti)) {
            foreach ($iscritti as $iscritto){

                $row_class = (in_array($iscritto['email'], $BannedList)) ? 'alert-danger' : '';
                $row_title = (in_array($iscritto['email'], $BannedList)) ? 'Utente in black list' : '';

                ?>
                <tr id="listItem_<?=$iscritto['id']?>" class="<?=$row_class?>" title="<?=$row_title?>">
                    <td>
                        <?=$iscritto['email']?>
                    </td>
                    <td>
                        <?=$iscritto['soggetto']?>
                    </td>
                    <td>
                        <?=format_data_ora($iscritto['data_inserimento'])?>
                    </td>
                    <td>
                        <?=format_data_ora($iscritto['data_modifica'])?>
                    </td>
                    <?php if($lista->special == 0): ?>
                        <td>
                            <div class="btn-group pull-right">

                                <a href='#' class="btn  btn-sm btn-danger cancella_assoc" data-id_list="<?=$lista->id?>" data-id_rif="<?=$iscritto['id']?>">
                                    <i class="fa fa-trash-o"></i> rimuovi
                                </a>  

                            </div>               
                        </td>
                    <?php endif ?>
                </tr>    
        <?  } 
        }
        ?>
    </tbody>
</table>

<?php endif ?>