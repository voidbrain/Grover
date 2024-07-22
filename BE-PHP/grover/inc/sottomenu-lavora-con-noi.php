					<?php if ($pagina=="lavora-con-noi") {?>
					<h3>LAVORA CON NOI</h3>
					<ul class="depth_2">
                        <li><a href="<?=PATHHREF?>lavora-con-noi<? if($macro){ echo "/".$macro->permalink; }?>" class="<?=$macro->permalink?> <?= ($sottopagina=="lavora")? "active " : "" ;?>">Lavora con noi</a></li>
                        <li><a href="<?=PATHHREF?>posizioni-aperte<? if($macro){ echo "/".$macro->permalink; }?>" class="<?=$macro->permalink?> <?= ($sottopagina=="posizioni")? "active " : "" ;?>">Posizioni Aperte</a></li>
                   		<li><a href="<?=PATHHREF?>candidature-spontanee<? if($macro){ echo "/".$macro->permalink; }?>" class="<?=$macro->permalink?> <?= ($sottopagina=="candidature")? "active " : "" ;?>">Candidature spontanee</a></li>
                   		
                   	</ul>                    
                    <? } ?>