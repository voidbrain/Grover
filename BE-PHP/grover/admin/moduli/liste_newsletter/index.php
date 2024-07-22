<?
$items = $modulo->get_adjacency_items();

?>
<h3><?=$soggetti?></h3>


<a class="btn btn-sm" href='<?=PATHADMIN?><?=MODULO?>/main/main_add_mod'>
    <i class="fa fa-plus"></i> Aggiungi <?=$soggetto?>
</a>

<div class="btn-group pull-right">
    
    <a class="btn btn-sm btn-inverse" href='<?=PATHADMIN.MODULO?>/main/black_list'>
       <i class="fa fa-ban"></i> Black List
    </a>
    
</div>

<br><br>


<div class="sort liste-tree " data-table="<?=$tabella['main']?>" data-livelpag="<?=$n_livelpag?>">
<?

    $depth = -1;
    $flag = false;
    $first = true;
    foreach($items as $item) {
        $ul_classe = '';
        $li_classe = '';

        $depth_r = $item['depth'];
        
        $ul_classe = 'depth_'.$depth_r;
    
        while ($depth_r > $depth) { 
            echo "<ol class='{$ul_classe}'>\n"."<li id='list_{$item['id']}' class='{$li_classe}' >"; 
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

                <!--Modifica-->
                <?php if ( ! $item['special']): ?>

                    <a href='<?=PATHADMIN?><?=MODULO?>/main/main_add_mod/<?=$item['id']?>?parent=<?=$item['parent']?>' class=" btn btn-sm" title="modifica"> 
                        <i class="fa fa-edit"></i> Modifica
                    </a>
                    <a href='<?=PATHADMIN?><?=MODULO?>/main/main_add_mod?parent=<?=$item['id']?>' class="aggiungi btn btn-sm" title="modifica"> 
                        <i class="fa fa-plus"></i> Aggiungi sottolista
                    </a>

                <?php endif ?>

                <a href='<?=PATHADMIN?><?=MODULO?>/main/lista_iscritti/<?=$item['id']?>/<?=$item['key']?>?parent=<?=$item['parent']?>' class=" btn btn-sm btn-primary" title="iscritti"> 
                    <i class="fa fa-list"></i> Iscritti
                </a>

                <?php if ( ! $item['special']): ?>
                    
                    <!-- CANCELLA OGGETTO (aggiungere data-table e data-id) -->
                    <a href='#' class="btn cancella_n btn-sm btn-danger" data-table="<?=$tabella['main']?>" data-id="<?=$item['id']?>" data-ask="<?=$richiesta_canc?>" title="  cancella" >
                        <i class="fa fa-trash-o"></i> 
                    </a> 

                <?php endif ?>

            </span>
            <h5><?=$item['titolo']?>
            <? $count_list = count($modulo->get_iscritti_lista($item['id'], FALSE, $item['key'])); echo "(" . $count_list . ")"; ?>
            </h5>
        </div>
        <?
        $flag = true;
    
    }
    while ($depth-- > -1) { echo "</li>\n", "</ol>\n"; }
?>  
</div>