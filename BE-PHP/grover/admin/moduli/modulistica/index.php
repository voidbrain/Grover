<?php 

$sezioni_list = $config['sezioni'];

?>

<div class="modulistica">

    <?php foreach ($config['sezioni_modulistica'] as $k => $sezione): ?>
        
        <h4 class="box-subtitle"><?php echo $sezione ?>       
            <a class="btn btn-sm btn-primary pull-right fancymedium" href='<?=PATHADMIN?><?=MODULO?>/add_mod?sezione_id=<?=$k?>'>
                <i class="fa fa-plus"></i> Aggiungi <?=$soggetto?>
            </a>
        </h4>

        <ul class="simple_sorting" data-table="<?=$tabella['main']?>">

            <?php 
                $items = $c_modulistica->get_items($k);
                
                $page_set = 0;
                foreach ($items as $item): ?>

                <?php if ( $page_set != $item->page_id): ?>

                    </ul>

                    <h4>
                        <?
                        if($item->page_id){
                            $breadcrumb = $pages->build_breadcrumb($item->page_id);
                            $sep = '';
                        ?>
                            <div class="breadcrumb">
                                <?php 
                                $count = 0;
                                if (is_array($breadcrumb)) :
                                foreach (array_reverse($breadcrumb) as $bread): 
                                    $count ++;
                                    if ($count == 1) {
                                        //continue;
                                    }
                                    if ($count == 2) {
                                        $bread->titolo = strtoupper($bread->titolo);
                                    }
                                    ?>
                                    <?php echo $sep . $bread->titolo ?>
                                <?php $sep = ' &gt; '; 
                                endforeach;
                                endif ?>
                            </div>
                        <? } ?>
                    </h4>
                    <ul class="simple_sorting" data-table="<?=$tabella['main']?>">

                <?php $page_set = $item->page_id; endif ?>
                
                <li id="listItem_<?=$item->id?>" class="col-sm-3">

                    <div class="well">
                        
                        <h4>  
                            <div class="btn-group pull-right">
                                <a href='<?=PATHADMIN?><?=MODULO?>/add_mod/<?=$item->id?>' class="btn btn-sm btn-primary fancymedium" title="modifica">
                                    <i class="fa fa-edit"></i>
                                </a> 
                                <a href='#' class="cancella btn btn-sm btn-danger" data-table="<?=$tabella['main']?>" data-id="<?=$item->id?>" data-ask="<?=$richiesta_canc?>" title="cancella">
                                    <i class="fa fa-trash-o"></i> 
                                </a>      
                            </div>

                            <a class="fa fa-arrows handle btn btn-sm pull-left" title="sposta" href="#"></a>

                            

                            <?=$item->titolo?>
                            
                        </h4>

                    </div>

                </li>     

            <?php endforeach ?>

        </ul>
        
        <br style="clear:both">

    <?php endforeach ?>

</div>

<br style="clear:both">