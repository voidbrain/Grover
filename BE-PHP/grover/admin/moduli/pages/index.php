<?php

$items = $modulo->get_adjacency_items();
?>

<h3><?=$soggetti?></h3>

<a class="btn btn-sm" href='<?=PATHADMIN?><?=MODULO?>/main/main_add_mod'>
    <i class="fa fa-plus"></i> Aggiungi <?=$soggetto?>
</a>


<br><br>

<div class="sort nestedSortable " data-table="<?=$tabella['main']?>" data-livelpag="<?=$n_livelpag?>">

<?php 

    $depth = -1;
    $flag = false;
    $first = true;

    foreach($items as $item) {
        $ul_classe = '';
        $li_classe = '';

        $depth_r = $item['depth'];
        
        $ul_classe = 'depth_'.$depth_r;

        $style = ($depth_r >= 1) ? 'style="display:none"' : '';
    
        while ($depth_r > $depth) { 
            echo "<ol class='{$ul_classe}' {$style}>\n"."<li id='list_{$item['id']}' class='{$li_classe}' >"; 
            $flag = false; 
            $depth++; 
        }
        while ($depth_r < $depth) { 
            echo "</li>\n", "</ol>\n"; 
            $depth--; 
        }
        if ($flag) { 
            echo "</li>\n", "<li id='list_{$item['id']}' class='{$li_classe}'>"; 
            $flag = false; 
        }
        ?>
        <div>  
            <span class="btn-group pull-right">
                
                <?php if ($item['modificabile'] == 1 || $perms->super()): ?>
                    <!--Modifica-->
                    <a href='<?=PATHADMIN?><?=MODULO?>/main/main_add_mod?parent=<?=$item['id']?>' class="aggiungi btn btn-success" title="aggiungi sottopagina"> 
                        <i class="fa fa-plus"></i>
                    </a>
                    <a href='<?=PATHADMIN?><?=MODULO?>/main/main_add_mod/<?=$item['id']?>?parent=<?=$item['parent']?>' class=" btn btn-primary" title="modifica"> 
                        <i class="fa fa-edit"></i>
                    </a>
                    

                    <!-- CANCELLA OGGETTO (aggiungere data-table e data-id) -->
                    <a href='#' class="btn cancella_n btn-danger" data-table="<?=$tabella['main']?>" data-id="<?=$item['id']?>" data-ask="<?=$richiesta_canc?>" title="  cancella" >
                        <i class="fa fa-trash-o"></i> 
                    </a> 
                <?php elseif($item['modificabile'] == 2): ?>

                    <a href='<?=PATHADMIN?><?=MODULO?>/main/main_add_mod/<?=$item['id']?>?parent=<?=$item['parent']?>' class=" btn btn-primary" title="modifica"> 
                        <i class="fa fa-edit"></i>
                    </a>

                <?php endif; ?>

            </span>

            <div class="btn-group pull-left">
            
                <?php if ($item['modificabile'] == 1 || $perms->super()): ?>
                     <!--Ordina-->
                    <a class="btn handle btn-sm" title="sposta">
                        <i class="fa fa-arrows"></i>
                    </a>
                <?php endif ?>

                 <!--Slide-->
                <a class="togleSlide btn btn-sm " data-id="<?=$item['id']?>" <?=($depth_r <= $n_livelpag) ? '' : 'style="display:none"'?>>
                    <i class="fa fa-caret-right"></i>
                </a>
            </div>

            <h5>
                <?=$item['titolo']?>  
                <?php if ($modulo->get_page($item['page_content_id'])): ?>
                   <i class="fa fa-link"></i>
                <?php endif ?>
            </h5>
        </div>
        <?
        $flag = true;
    
    }
    while ($depth-- > -1) { echo "</li>\n", "</ol>\n"; }
?>  
</div>