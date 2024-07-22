<?php
ob_start()
?><? 
$id_rif = ($_POST['id']) ? $_POST['id'] : $requestURI[3];

include(PHPPATHADMIN . 'inc/head.php'); 

//Verifico se è stato effettuato un post di qualche tipo
if($_POST){

	$_POST = unMagicQuotify($_POST);
	
	//Ottengo lista dei campi dalla tabella in database e imposto il result con solo i parametri utili
	$table_fields = $db->list_fields($tabella['main']);

	//creo result in modo che le chiavi e le voci in tabella corrispondano
	foreach ($_POST as $key => $value) {

		if(in_array($key, $table_fields)){

			$result[$key] = $value;

		}

	}

	//se presente la colonna posizione imposto automaticamente di default i valori a + 1 in caso di aggiunta elemento
	if(in_array('posizione',$table_fields)&&$_POST['action']=='aggiungi'){

		$db->set('posizione', 'posizione+1', FALSE)->update($tabella['main']);

	}

	//resetto la chiave id dal result
	unset($result['id']);

	//includo il file di sincronizzazione 
	if(file_exists(PHPPATHADMIN . 'moduli/' . MODULO . '/sync.php')){

		include(PHPPATHADMIN . 'moduli/' . MODULO . '/sync.php');

	}

}

if($id_rif){
	//Vedo se esiste una classe modulo ed eventualmente la sua funzione get_item
	if(method_exists('Modulo','get_item')){
		$item = $modulo->get_item($id_rif);
	}else{
		$item = $db->where('id',$id_rif)->get($tabella['main'])->row();
	}

	if ($item){

		$titolo = 'Modifica '. $soggetto;
		$action = 'modifica';
		$action_title = 'Salva';

	}else{

		$titolo = 'Aggiungi '.$soggetto;
		$action = 'aggiungi';
		$action_title = 'Salva e continua';

	}

}else{

	$titolo = 'Aggiungi '.$soggetto;
	$action = 'aggiungi';
	$action_title = 'Salva e continua';

}
?>
<div class="add_mod">
	<div class="pop_content container">
		<fieldset>
			<legend><?=$titolo?></legend>
			<br>
			<form method='post' action='?id=<?=$id_rif?>' enctype='multipart/form-data' class=" validator add_mod_form" >
				<? if($feedback): ?>
					<div class="alert alert-<?=$feedback_class?>">
						<?=$feedback?>
				    </div>
				<? endif; ?>

				<input type='hidden' name='action' value='<?=$action?>' />
				<input type='hidden' name='id' value='<?=$id_rif?>' />	

				<?
					//FORM SPECIALI DEDICATI AI SINGOLI MODULI
					if(file_exists(PHPPATHADMIN . 'moduli/' . MODULO . '/add_mod.php')){

						include PHPPATHADMIN . 'moduli/' . MODULO . '/add_mod.php';

					}else{

						echo 'Pagina non trovata';

					}
				?>

				<br>
				<div class="btn-group pull-right">
					
					<?php if ($action != 'aggiungi' && is_object($modulo) && $modulo->perms('aggiunta')): ?>
					    <a href="<?=PATHADMIN.MODULO?>/add_mod" class="btn "> Nuovo <i class="fa fa-plus"></i></a>
					<?php endif ?>

					<button class="btn btn-primary ">  <?=$action_title?> <i class="fa fa-save"></i> </button>
				</div>

				<br><br>
				
				<? if($feedback): ?>
					<div class="alert alert-<?=$feedback_class?>">
						<?=$feedback?>
				    </div>
				<? endif; ?>
			</form>
		</fieldset>
	</div>
</div>
<? include(PHPPATHADMIN . 'inc/footer.php'); ?>
<?php
ob_end_flush();
?>