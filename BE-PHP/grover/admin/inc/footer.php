        <script type="text/javascript">
            //SETTAGGI PRO MODULO
            jsSetting = new Array();
         	jsSetting['path'] = '<?=PATH?>';
         	jsSetting['pathadmin'] = '<?=PATHADMIN?>';
         	jsSetting['modulo'] = '<?=MODULO?>';
         	jsSetting['superuser'] = <?=($perms->superuser()) ? 'true' : 'false' ?>;
        	jsSetting['session_id'] = '<?=session_id();?>';
        	jsSetting['session_name'] = '<?=session_name();?>';
        </script>




        <!-- ============== -->
        <!-- 	 TEMPLATE   -->
        <!-- ============== -->
		
		<!-- start: JavaScript-->
		<!--[if !IE]>-->

				<script src="<?=PATH?>js/admin-js/jquery-2.1.1.min.js"></script>

		<!--<![endif]-->

		<!--[if IE]>
		
			<script src="<?=PATH?>js/admin-js/jquery-1.10.2.min.js"></script>


		<![endif]-->

		<!--[if !IE]>-->

			<script type="text/javascript">
				window.jQuery || document.write("<script src='<?=PATH?>js/admin-js/jquery-2.1.1.min.js'>"+"<"+"/script>");
			</script>

		<!--<![endif]-->

		<!--[if IE]>
		
			<script type="text/javascript">
		 	window.jQuery || document.write("<script src='<?=PATH?>js/admin-js/jquery-1.10.2.min.js'>"+"<"+"/script>");
			</script>
			
		<![endif]-->
		<script src="<?=PATH?>js/admin-js/jquery-migrate-1.2.1.min.js"></script>
		<script src="<?=PATH?>js/admin-js/bootstrap.min.js"></script>

		<!-- page scripts -->
		<script src="<?=PATH?>js/admin-js/jquery-ui-1.10.3.min.js"></script>
	 	<script type="text/ javascript" src="<?=PATH?>js/admin-js/ui/i18n/jquery.ui.datepicker-it.js"></script>
		<script src="<?=PATH?>js/admin-js/jquery.ui.touch-punch.min.js"></script>
		<script src="<?=PATH?>js/admin-js/jquery.sparkline.min.js"></script>
		<script src="<?=PATH?>js/admin-js/fullcalendar.min.js"></script>
		<!--[if lte IE 8]><script language="javascript" type="text/javascript" src="<?=PATH?>js/excanvas.min.js"></script><![endif]-->
		<script src="<?=PATH?>js/admin-js/jquery.flot.min.js"></script>
		<script src="<?=PATH?>js/admin-js/jquery.flot.pie.min.js"></script>
		<script src="<?=PATH?>js/admin-js/jquery.flot.stack.min.js"></script>
		<script src="<?=PATH?>js/admin-js/jquery.flot.resize.min.js"></script>
		<script src="<?=PATH?>js/admin-js/jquery.flot.time.min.js"></script>
		<script src="<?=PATH?>js/admin-js/jquery.autosize.min.js"></script>
		<script src="<?=PATH?>js/admin-js/jquery.placeholder.min.js"></script>
		
		<!--<script src="<?=PATH?>js/admin-js/d3.min.js"></script>
		<script src="<?=PATH?>js/admin-js/xcharts.min.js"></script>
		<script src="<?=PATH?>js/admin-js/pages/charts-xcharts.js"></script>-->
		<!-- theme scripts -->
		<script src="<?=PATH?>js/admin-js/custom.min.js"></script>
		<script src="<?=PATH?>js/admin-js/core.min.js"></script>
		
		<!-- inline scripts related to this page -->
		<script src="<?=PATH?>js/admin-js/pages/index.js"></script>


		<!-- ============== -->
		<!-- ALTRE LIBRERIE -->
		<!-- ============== -->

		<!--Librerie aggiuntive-->
		<script type="text/javascript" src="<?=PATH?>js/jquery.easing-1.3.pack.js?v=<?=$config['admin']['version']?>"></script>    
		<script type="text/javascript" src="<?=PATH?>js/jquery.mousewheel-3.0.4.pack.js?v=<?=$config['admin']['version']?>"></script> 		

		<!-- Ordinamento annidato-->
		<!-- <script src="<?=PATH?>js/plugins/nestedSortable/jquery.ui.nestedSortable.js?v=<?=$config['admin']['version']?>"></script>
		-->
		<!--Fancybox-->
		<script type="text/javascript" src="<?=PATH?>js/plugins/fancybox/jquery.fancybox.js?v=<?=$config['admin']['version']?>"></script> 
		<link href="<?=PATH?>js/plugins/fancybox/jquery.fancybox.css?v=<?=$config['admin']['version']?>" type="text/css" rel="stylesheet" />

		<!--Ajax upload-->
		<!--<script type="text/javascript" src="<?=PATH?>js/plugins/ajaxupload/ajaxupload.3.5.js?v=<?=$config['admin']['version']?>" ></script>-->

		<!--List nav upload-->
		<!-- <script type="text/javascript" src="<?=PATH?>js/plugins/listsort/list.min.js?v=<?=$config['admin']['version']?>" ></script>
		<script type="text/javascript" src="<?=PATH?>js/plugins/listsort/list.paging.js?v=<?=$config['admin']['version']?>" ></script> -->

		<!--dataTable-->
		<script type="text/javascript" src="<?=PATH?>js/plugins/DataTables/js/jquery.dataTables.min.js?v=<?=$config['admin']['version']?>" ></script>
		<!-- <link rel='stylesheet' type='text/css' href='<?=PATH?>js/plugins/DataTables/css/demo_page.css?v=<?=$config['admin']['version']?>' />    
		<link rel='stylesheet' type='text/css' href='<?=PATH?>js/plugins/DataTables/css/demo_table.css?v=<?=$config['admin']['version']?>' />  -->

		<!--tokeninput-->
		<script type="text/javascript" src="<?=PATH?>js/plugins/tokeninput/src/jquery.tokeninput.js?v=<?=$config['admin']['version']?>" ></script>
		<link rel='stylesheet' type='text/css' href='<?=PATH?>js/plugins/tokeninput/styles/token-input.css?v=<?=$config['admin']['version']?>' /> 
		<link rel='stylesheet' type='text/css' href='<?=PATH?>js/plugins/tokeninput/styles/token-input-facebook.css?v=<?=$config['admin']['version']?>' />

		<!--Responsive table -->
		<!-- <link rel="stylesheet" type='text/css' href="<?=PATH?>js/plugins/responsive-table/responsive-tables.css?v=<?=$config['admin']['version']?>">
		<script type="text/javascript" src="<?=PATH?>js/plugins/responsive-table/responsive-tables.js?v=<?=$config['admin']['version']?>"></script> -->

		<!-- Colorpicker -->
		<!-- <link rel="stylesheet" type='text/css' href="<?=PATH?>js/plugins/colorpicker/css/colorpicker.css?v=<?=$config['admin']['version']?>">
		<script type="text/javascript" src="<?=PATH?>js/plugins/colorpicker/js/bootstrap-colorpicker.js?v=<?=$config['admin']['version']?>"></script>-->

		<!--Tiny mce - editor testuale-->
		<!--<script type="text/javascript" src="<?=PATH?>js/plugins/tinymce/jquery.tinymce.min.js?v=<?=$config['admin']['version']?>"></script>-->
		<script type="text/javascript" src="<?=PATH?>js/plugins/tinymce/tinymce.min.js?v=<?=$config['admin']['version']?>"></script>

		<!-- jCarousel -->
		<!-- <script type="text/javascript" src="<?=PATH?>js/plugins/jcarousellite/jcarousellite.js"></script> -->

		<!--Validazione form-->
		<script src="<?=PATH?>js/plugins/validator/js/languages/jquery.validationEngine-<?=lang($lng,'it','en')?>.js?v=<?=$config['admin']['version']?>" type="text/javascript"></script>
		<script src="<?=PATH?>js/plugins/validator/js/jquery.validationEngine.js?v=<?=$config['admin']['version']?>" type="text/javascript"></script>
 		<link type="text/css" rel="stylesheet" href="<?=PATH?>js/plugins/validator/css/validationEngine.jquery.css?v=<?=$config['admin']['version']?>">
		
		
		<!--agenda-->
		<!-- 
			<link href='<?=PATH?>js/plugins/fullcalendar/fullcalendar.css?v=<?=$config['admin']['version']?>' rel='stylesheet' />
			<link href='<?=PATH?>js/plugins/fullcalendar/fullcalendar.print.css?v=<?=$config['admin']['version']?>' rel='stylesheet' media='print' />
			<script src='<?=PATH?>js/plugins/fullcalendar/fullcalendar.min.js?v=<?=$config['admin']['version']?>'></script> 
		-->

		<!--Ordinamento annidato-->
		<script src="<?=PATH?>js/plugins/nestedSortable/jquery.ui.nestedSortable.js"></script>
		
		<!-- infinite-scroll -->
		<script type="text/javascript" src="<?=PATH?>js/plugins/infinite-scroll/jquery.infinite-scroll.min.js"></script>
		<!-- Isotope -->
		<!--<link rel="stylesheet" href="<?=PATH?>js/plugins/isotope/css/style.css" type="text/css" media="screen" />
		<script type="text/javascript" src="<?=PATH?>js/plugins/isotope/jquery.isotope.min.js"></script>-->

		
		<!-- Selectize -->
		<!--<link type='text/css' rel='stylesheet' href='<?=PATH?>js/plugins/Selectize/css/selectize.bootstrap3.css' /> 
		<script type="text/javascript" src="<?=PATH?>js/plugins/Selectize/js/standalone/selectize.min.js" ></script> -->


		<!-- Ajax/flash upload -->
		<script type="text/javascript" src="<?=PATH?>js/plugins/uploadify/jquery.uploadify.min.js?v=<?=$config['admin']['version']?>"></script>
		<link rel='stylesheet' href='<?=PATH?>js/plugins/uploadify/uploadify.css?v=<?=$config['admin']['version']?>' type='text/css' />

		<!-- Ajax/HTML5 upload -->
		<script type="text/javascript" src="<?=PATH?>js/plugins/uploadifive/jquery.uploadifive.min.js?v=<?=$config['admin']['version']?>"></script>
		<link rel='stylesheet' href='<?=PATH?>js/plugins/uploadifive/uploadifive.css?v=<?=$config['admin']['version']?>' type='text/css' />



        <!--JAVASCRIPT BASE AREA AMMINISTRATIVA -->
        <script src="<?=PATHADMIN?>js/main.js?v=<?=$config['admin']['version']?>"></script>

        <!--JAVASCRIPT BASE PER MODULO -->
        <?php
        //Verifico presenza di un javascript personalizzato per il modulo
			if(file_exists(PHPPATHADMIN. 'moduli/' . MODULO . '/script.js')){
			?>
				 <script src="<?=PATHADMIN?>moduli/<?=MODULO?>/script.js?v=<?=$config['admin']['version']?>"></script>
			<?
			}
		?>
		</div>
    </body>
</html>