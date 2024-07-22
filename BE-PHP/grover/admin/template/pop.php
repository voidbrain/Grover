<?php
ob_start()
?><? 
$requestPAGE = $requestURI[3];

include(PHPPATHADMIN . 'inc/head.php'); 

	if(file_exists(PHPPATHADMIN . 'moduli/' . MODULO . '/' . $requestURI[3] . '.php')){

		include PHPPATHADMIN . 'moduli/' . MODULO . '/' . $requestURI[3] . '.php';
	
		} else if (file_exists(PHPPATHADMIN . 'moduli/' . MODULO . '/pop.php')){

		include PHPPATHADMIN . 'moduli/' . MODULO . '/pop.php';

	}else{

		echo 'Pagina non trovata';

	}

include(PHPPATHADMIN . 'inc/footer.php'); ?>
<?php
ob_end_flush();
?>