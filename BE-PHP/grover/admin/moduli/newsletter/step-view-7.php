<div class="well">
	<h4>Intestazione messaggio</h4>
	<div class="">
		<span class="">
			<strong>Oggetto: </strong> 
		</span>
		<span class="">
			<?=$modulo->get_session('oggetto')?> 
		</span>
	</div>
	<div class="">
		<span class="">
			<strong>A: </strong> 
		</span>
		<span class="">
			<?php 
			$dest = $modulo->extract_grouplist_info();
			foreach ($dest as $item): 

				$titolo = ($old_tipo_title != $item['tipo_title']) ? $item['tipo_title'].':' : '';
				$old_tipo_title = $item['tipo_title'];

				?>
				<?php if ($titolo != ""): ?>
					<strong><?=$titolo?></strong>
				<?php endif ?>

				<em><?=$item['titolo']?> (<?=$item['count']?>); </em>

			<?php endforeach ?>
		</span>
	</div>
	<div class="">
		<span class="">
			<strong>e-mail Mittente: </strong> 
		</span>
		<span class="">
			<?=$modulo->get_session('emailMit')?>
		</span>
	</div>
	<div class="">
		<span class="">
			<strong>Nome mittente: </strong> 
		</span>
		<span class="">
			<?=$modulo->get_session('nomeMit')?>
		</span>
	</div>
	<div class="">
		<span class="">
			<strong>e-mail Riposta: </strong> 
		</span>
		<span class="">
			<?=$modulo->get_session('ritorna')?>
		</span>
	</div>
	 <hr>
	<div class="">
		<span class="">
			
			<?php 
			$user = $modulo->extract_userlist_info();
			
			$count['inviate'] = 0;
			$count['lette'] = 0;
			$count['totali'] = 0;
			
			foreach ($user as $k => $v) {
				$count['totali'] ++;
				$count['inviate'] = ($v['status'] == 1) ? ($count['inviate'] + 1) : $count['inviate'];
				$count['lette'] = ($v['stat']['letta'] == 1) ? ($count['lette'] + 1) : $count['lette'];
			}
			?>
			
			<div>
				<div>
					<div class="col-md-12"><strong>RIEPILOGO INVIO:</strong></div>
					<div class="col-md-2">
						
						Inviate: <strong style='font-size:16px;'><?php echo $count['inviate'] ?></strong> / <?php echo $count['totali'] ?><br>
						<script>
						var datainviate = [
							{ label: "Inviate", data: <?=$count['inviate']?> },
							{ label: "Non inviate", data: <?=$count['totali']-$count['inviate']?> },    
					    ];
						</script>
						<div id="piechartinviate" style="height:150px"></div>
					</div>
					<div class="col-md-2">
						Lette: <strong style='font-size:16px;'><?php echo $count['lette'] ?></strong>  / <?php echo $count['totali'] ?><br>
						<script>
						var datalette = [
							{ label: "Lette", data: <?=$count['lette']?> },
							{ label: "Non lette", data: <?=$count['totali']-$count['lette']?> },    
					    ];
						</script>
						<div id="piechartlette" style="height:150px"></div>
					</div>

					<div class="col-md-2">
						<? 
						$c_desk=0;
						$c_mob=0;
						foreach ($user as $k => $v) {
							if($v['stat']['letta']=="1"){
								$useragent=$v['stat']['refer'];
								if(preg_match('/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i',$useragent)||preg_match('/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i',substr($useragent,0,4))){
									$c_mob++;
								}else{
									$c_desk++;
								}
							}
						}
						?>
						Piattaforma: <i class="fa fa-desktop fared"></i> <strong><?=$c_desk?></strong>&nbsp;&nbsp;&nbsp;&nbsp;<i class="fa fa-mobile fablue"></i> <strong><?=$c_mob?></strong><br>


						<script>

						var dataplatform = [
							{ label: "Destop", data: <?=$c_desk?> },
							{ label: "Mobile", data: <?=$c_mob?> },    
					    ];
						</script>
						<div id="piechartplatform" style="height:150px"></div>
					</div>
				</div>
				
				
			</div>
		</span>
		
		<br style="clear:both">
	</div> <br />
	<span class="clear">
			<a href="#" class="showList btn btn-default"><em>Vedi lista e-mail</em></a>
			<?php 
			//$user = $modulo->extract_userlist_info();
			 ?>
			<div class="hide" id="listMessage">
				<br>
				<ul>
				<?php 
				foreach ((array)$user as $email => $v): 
					?>
					<li class="col-md-4">
						<?=$email?>
						<em>(<?
							switch ($v['status']) {
								case 1:
									echo "Inviata";
									break;
								case 2:
									echo "Errore";
									break;
								case 3:
									echo "Errore formato email";
									break;	
								default:
									echo "n/d";
									break;
							}
							?>)</em>

							<?php if ($v['stat']['letta'] == 1): ?>
								<strong>[Letta]</strong>
							<?php endif ?>
					</li>
				<?php endforeach ?>
				</ul>
			</div>

			<div class="box-content">
				
				
			</div>

		</span>
</div>
<div class="well">
	<h4>Messaggio</h4>
	<a class="btn btn-inverse" href="<?=PATHADMIN?><?=MODULO?>/step-anteprima/<?=$passo?>/<?=$modulo->get_session('id')?>" target="_blank">Vedi Messaggio</a>
</div>
<div class="clearfix">
	<div class="btn-group pull-right">
	  	<a class="btn btn-sm btn-primary" href="<?=PATHADMIN?><?=MODULO?>">Chiudi</a>
	</div>
</div>	