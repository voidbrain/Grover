					<?php if ($pagina=="comunicazione") {?>
					<h3>Comunicazione</h3>
					<ul class="depth_2">
                        <li><a href="<?=PATHHREF?>news<? if($macro){ echo "/".$macro->permalink; }?>" class="<?=$macro->permalink?> <?= ($sottopagina=="news")? "active " : "" ;?>">News</a></li>
                        <!-- <li><a href="<?=PATHHREF?>comunicati-stampa<? if($macro){ echo "/".$macro->permalink; }?>" class="<?=$macro->permalink?> <?= ($sottopagina=="comunicati-stampa")? "active " : "" ;?>">Comunicati Stampa</a></li> -->
                   		<li><a href="<?=PATHHREF?>pubblicazioni<? if($macro){ echo "/".$macro->permalink; }?>" class="<?=$macro->permalink?> <?= ($sottopagina=="pubblicazioni")? "active " : "" ;?>">Pubblicazioni</a></li>
                   		<li><a href="<?=PATHHREF?>eventi<? if($macro){ echo "/".$macro->permalink; }?>" class="<?=$macro->permalink?> <?= ($sottopagina=="eventi")? "active " : "" ;?>">Eventi</a></li>
                   		<li><a href="<?=PATHHREF?>dicono_di_noi<? if($macro){ echo "/".$macro->permalink; }?>" class="<?=$macro->permalink?> <?= ($sottopagina=="dicono_di_noi")? "active " : "" ;?>">Dicono di noi</a></li>
                   	</ul>                    
                    <? } ?>