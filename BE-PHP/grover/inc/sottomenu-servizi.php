					<?php if ($pagina=="servizi") {?>
						
					
					<div class="sottomenu">
                        <a class="<?= ($sottopagina=="offerta") ? "active " : "" ;?>" href="<?=PATHHREF?>servizi-la-nostra-offerta">La nostra offerta</a>
                        <a class="<?= ($sottopagina=="usura") ? "active " : "" ;?>" href="<?=PATHHREF?>usura-bancaria">Usura Bancaria</a>
                        <a class="<?= ($sottopagina=="anatocismo") ? "active " : "" ;?>" href="<?=PATHHREF?>anatocismo-bancario">Anatocismo</a>
                        <a class="<?= ($sottopagina=="anomalie") ? "active " : "" ;?>" href="<?=PATHHREF?>anomalie-contratti-bancari">Anomalie contratti bancari</a>
                        <a class="<?= ($sottopagina=="debiti") ? "active " : "" ;?>" href="<?=PATHHREF?>gestione-debiti-bancari">Gestione debiti bancari</a>
                        <a class="<?= ($sottopagina=="recupero") ? "active " : "" ;?>" href="<?=PATHHREF?>servizio-recupero-crediti">Recupero Crediti</a>
                    </div>
                    <a href="<?=PATHHREF?>contatti"><img src="<?=PATH?>img/box-contatti.jpg" alt=""></a>


                    <?php } else { ?>

						<a href="<?=PATHHREF?>contatti"><img src="<?=PATH?>img/box-contatti.jpg" alt=""></a>
                    <?php } ?>



