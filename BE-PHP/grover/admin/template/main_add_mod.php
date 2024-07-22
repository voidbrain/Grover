<?php

$id_rif = ($_POST['id']) ? $_POST['id'] : $requestURI[4];

//Verifico se è stato effettuato un post di qualche tipo
if($_POST){

	$_POST = unMagicQuotify($_POST);
	
	if(method_exists('Modulo','sync')){
		$modulo->sync($id_rif);
		$feedback_class = $modulo->feedback_class;
		$feedback = $modulo->feedback;
		$id_rif = $modulo->sync_id;

	}else{

		//Ottengo lista dei campi dalla tabella in database e imposto il result con solo i parametri utili
		$table_fields = $db->list_fields($tabella['main']);

		//creo result in modo che le chiavi e le voci in tabella corrispondano
		foreach ($_POST as $key => $value) {

			if(in_array($key, $table_fields)){

				$result[$key] = $value;

			}

		}

		$result = pulisci($result);

		//se presente la colonna posizione imposto automaticamente di default i valori a + 1 in caso di aggiunta elemento
		if(in_array('posizione',$table_fields) && $_POST['action']=='aggiungi'){

			$db->set('posizione', 'posizione+1', FALSE)->update($tabella['main']);

		}

		//resetto la chiave id dal result
		unset($result['id']);

		//includo il file di sincronizzazione 
		if(file_exists(PHPPATHADMIN . 'moduli/' . MODULO . '/sync.php')){

			include(PHPPATHADMIN . 'moduli/' . MODULO . '/sync.php');

		}
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
<form method='post' action='?id=<?=$id_rif?>' enctype='multipart/form-data' class=" validator add_mod_form noEscape" >
	
	<div class="main_add_mod">
		<div class=" ">
			<fieldset>
				<legend><?=$titolo?></legend>

				<br>
				
				<div class="row">
					<div class="col-sm-12">
						<a class="btn btn-sm btn-inverse" href="<?=PATHADMIN.MODULO?>"> <i class="fa fa-arrow-left"></i> Torna a <?=$soggetti?>
						</a>

						<button class="btn btn-primary pull-right">  <?=$action_title?> <i class="fa fa-save"></i> </button>
					</div>
				</div>

				<br>

				<? if($feedback): ?>
					<div class="feedback_add_mod alert alert-<?=$feedback_class?>">
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
				<button class="btn btn-primary pull-right">  <?=$action_title?> <i class="fa fa-save"></i> </button>
				<br><br>
				
				<? if($feedback): ?>
					<div class="feedback_add_mod alert alert-<?=$feedback_class?>">
						<?=$feedback?>
				    </div>
				<? endif; ?>
			</fieldset>
		</div>
	</div>
</form>