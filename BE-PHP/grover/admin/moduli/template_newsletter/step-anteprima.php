<?
$passo = (int)$requestURI[3];

if(!$_POST){
  $id = (int)$requestURI[4];
}

$modulo->init($passo, $id);

//Verifico compatibilità con il passo ricercato
if(!$modulo->verifysteps($passo)){
    die('Anteprima non disponibile');
}

echo $modulo->ricomponi_template();
?>