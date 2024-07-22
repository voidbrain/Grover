<?php
ob_start();
?>
<? include(PHPPATHADMIN . 'inc/head.php'); ?>

<? include(PHPPATHADMIN . 'inc/header.php'); ?>


<div class="container mainContainer">

  <div class="row">
    <div class="col-lg-2 col-sm-1" id="sidebar-left">
      <? include(PHPPATHADMIN . 'inc/nav.php'); ?>
    </div>
    <div id="content" class="col-lg-10 col-sm-11">

      <?php if (isset($config['admin'][MODULO]['title'])): ?>
        <div class="box">
            <div class="box-header">
                <h2><?=$config['admin'][MODULO]['title']?></h2>
            </div>
        </div>
      <?php endif ?>
      

      <?
        //verifico presenza di pagina di terzo livello all'interno del modulo per l'apertura all'interno del template main
        if(($requestURI[3] == 'main_add_mod'||$requestURI[3] == 'main_gestione_multi_file'||$requestURI[3] == 'filtered_add_mod') && file_exists(PHPPATHADMIN . 'template/' . $requestURI[3] . '.php')){

          include PHPPATHADMIN . 'template/' . $requestURI[3] . '.php';

        } else if(file_exists(PHPPATHADMIN . 'moduli/' . MODULO . '/' . $requestURI[3] . '.php')){

          include PHPPATHADMIN . 'moduli/' . MODULO . '/' . $requestURI[3] . '.php';


        } else if (file_exists(PHPPATHADMIN . 'moduli/' . MODULO . '/index.php')){

  				include PHPPATHADMIN . 'moduli/' . MODULO . '/index.php';

  			}else{

  				echo 'Pagina non trovata';

  			}
      ?>

    </div>
  </div>
</div>

<!--SISTEMA FEEDBACK-->
<div id="feedback" class="">
  <!--Contenuto in javascript dei vari feeback del sito -->
</div>
<!--FINE FEEDBACK-->

<!--MODAL POP UP-->
    <div class="modal <?=(!$mobile_detect->isMobile()) ? 'fade' : '' ?>" id="mymodal">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
                    <h3 class="modal-title"><!-- Contenuto da JS --></h3>
                </div>
                <div class="modal-body">
                    <p><!-- Contenuto da JS --></p>
                </div>
                <div class="modal-footer">
                </div>
            </div>
        </div>
    </div>
</div>
<!--FINE MODAL-->



<footer>
    <span class="pull-left ">
        <?=$config['name']?> | Area amministrativa. <br /><br />
    </span>
    <span class="pull-right "> 
    </span>
    <div class="btn-group btn-group-sm pull-right">
        <!-- MODIFICA OGGETTO (Fancybox) -->
        <a href="mailto:<?=$config["email"]?>?subject=Assistenza <?=$config['name']?> - Utente: <?=$user_info->nome?>" class="btn btn-sm btn-primary" title="Assistenza">
            <i class="fa fa-envelope-o"></i> <span class="hidden-sm">Assistenza</span>
        </a>     
     
    </div>
</footer>


  

<?php include(PHPPATHADMIN . 'inc/footer.php'); ?>
<?php
ob_end_flush();
?>