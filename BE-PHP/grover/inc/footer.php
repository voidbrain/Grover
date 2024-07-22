
	<!-- FOOTER -->
	<div class="footer">
		<div class="container">
			<div class="row">
				<div class="col-sm-3">
					<div class="footer-label">
					<a href="<?=PATHHREF?>p/partners">
						<img  style="margin-left:20px;" src="<?=PATH?>img/icona_partners.png" alt=""> <h5 style="margin-left:20px;"> PARTNERS</h5>
					</a>
					</div>

				</div>

				<div class="col-sm-3">
					<div class="footer-label">
					<a href="<?=PATHHREF?>contatti">
					<img  style="margin-left:20px;" src="<?=PATH?>img/icona_dovesiamo.png" alt=""><h5 style="margin-left:20px;">DOVE SIAMO</h5>
					</a>
					</div>
				</div>

				<div class="col-sm-6">
					<div class="footer-label text-center">
					<h5 class=>ISCRIVITI ALLA NEWSLETTER</h5>
					<form action="<?=PATHHREF?>newsletter" method="POST">
	                  <input type="text" name="email" placeholder="Inserisci la tua e-mail">  <button type="submit" class='btn btn-celeste'>ISCRIVITI</button>

	                </form>
					</div>

				</div>
			</div>
		</div>
	</div>

	<!-- FOOTER -->
	<footer>

		<div class="container">
			<div class='row'>
			<div class="footer-widget2 footer-links col-sm-3 col-xs-6">

				<ul>
					<li><a href="<?=PATHHREF?>p/ospedale/numeri-telefonici">Numeri Telefonici</a></li>
					<li><a href="<?=PATHHREF?>p/servizi/modalitno-di-pagamento">Modalità di pagamento</a></li>
					<li><a href="<?=PATHHREF?>modulistica/">Modulistica</a></li>
				</ul>
			</div>

			<div class="footer-widget2 footer-links col-sm-3  col-xs-6">
				<ul>
					<li><a href="<?=PATHHREF?>p/servizi/urp-ufficio-relazioni-con-il-pubblico-">URP - per il pubblico</a></li>
					<li><a href="<?=PATHHREF?>p/servizi/il-poliambulatorio">Poliambulatorio</a></li>
					<li><a href="<?=PATHHREF?>p/reparti/area-medica-day-hospital">Day Hospital</a></li>
				</ul>
			</div>

			<div class="footer-widget2 footer-links col-sm-3 col-xs-12">
				<ul>

					<li class='text-center'>
					<a href="<?=PATHHREF?>files/modulistica/2_modulo_Carta-servizi-Luglio-2017.pdf" style='font-size:18px;'>
						<img src="<?=PATH?>img/icona_carta.png" alt="" style='height:40px;margin-bottom:10px;'><br> CARTA DEI SERVIZI
					</a>
					</li>
				</ul>
			</div>

			<div class="footer-widget2 col-sm-3 col-xs-12">

					<ul>
					<li><a href="tel:0422428260">
						<img src="<?=PATH?>img/numero_telefono_bianco.png" class='img-responsive' style='max-height:80px;' alt="">
					</a></li>
				</ul>

				</div>
			</div>
		</div>

		<div class="footer-bottom">
			<div class="container">
				<div class="row">
				<div class="col-md-4 col-sm-12">

					<p class="btm">&copy; <?=date("Y");?> <?= $config['name']?> - P.Iva <?= $config['piva']?></p>
				</div>
				<div class="col-md-3 col-sm-5">
					<p class="btm"><a href="<?=PATHHREF?>privacy-policy">Privacy</a></p><!--  -
					<a href="#">Mappa del sito</a> -->

				</div>
				<div class="col-md-3 col-sm-2">
					<br>

				</div>
				<div class="col-md-2  col-sm-5">
					<ul class="footer-social">
						<li><a href="https://www.facebook.com/sancamillotreviso" target="blank" class="fa fa-facebook"></a></li>
						<li><a href="https://twitter.com/SanCamilloTv" target="blank" class="fa fa-twitter"></a></li>
						<!-- <li><a href="#" class="fa fa-rss"></a></li>
						<li><a href="#" class="fa fa-delicious"></a></li>
						<li><a href="#" class="fa fa-linkedin"></a></li>
						<li><a href="#" class="fa fa-flickr"></a></li>
						<li><a href="#" class="fa fa-skype"></a></li>
						<li><a href="#" class="fa fa-envelope"></a></li> -->
						<li class="ftop"><a href="#"><i class="fa fa-angle-up"></i></a></li>
					</ul>
				</div>
			</div>

			</div>
		</div>
	</footer>
	<!-- FOOTER -->

</div> <!-- div.body apre nell'header -->



		<!-- JS DEL LAYOUT -->


		<!--[if lt IE 9]>
		    <script src="//ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min.js"></script>
		<![endif]-->
		<!--[if gte IE 9]><!-->
		    <script type="text/javascript" src="<?=PATH?>js/jquery.js"></script>
			<script type="text/javascript" src="<?=PATH?>js/jquery-migrate-1.2.1.js"></script>
		<!--<![endif]-->
		<script src="<?=PATH?>js/jquery.ui.datepicker-it.js"></script>
		<script src="<?=PATH?>js/bootstrap-datepicker.js"></script>

		<!-- <script src="<?=PATH?>js/jquery-1.10.2.js"></script> -->
		<script src="<?=PATH?>js/rs-plugin/js/jquery.themepunch.plugins.min.js"></script>
		<script src="<?=PATH?>js/rs-plugin/js/jquery.themepunch.revolution.min.js"></script>
		<script src="<?=PATH?>js/rs-plugin/rs.home.js"></script>
		<script src="<?=PATH?>js/bootstrap.js"></script>
		<script src="<?=PATH?>js/owl-carousel/owl.carousel.min.js"></script>
		<script src="<?=PATH?>js/jquery.appear.js"></script>
		<script src="<?=PATH?>js/jquery-ui.js"></script>
		<script src="<?=PATH?>js/elevatezoom/jquery.elevatezoom.js"></script>
		<script src="<?=PATH?>js/fancybox/jquery.fancybox-1.3.4.js"></script>
		<script src="<?=PATH?>js/jflickrfeed.min.js"></script>
		<script src="<?=PATH?>js/jquery.mixitup.min.js"></script>
		<script src="<?=PATH?>js/rlaccordion.js"></script>
		<script src="<?=PATH?>js/flexslider/jquery.flexslider.js"></script>
		<script src="<?=PATH?>js/jquery.li-scroller.1.0.js" type="text/javascript"></script>
		<? if ($pagina=="contattis") { ?>
			<script src="https://maps.googleapis.com/maps/api/js?v=3.exp&sensor=false"></script>
			<script src="<?=PATH?>js/gmaps.js"></script>
			<?}?>
		<script src="<?=PATH?>js/fancySelect.js"></script>

		<script>
			function showhide() {
		       var div = document.getElementById("cssmenu");
					if (div.style.display !== "block") {
				    div.style.display = "block";
				}
				else {
				    div.style.display = "none";
				}
			 }
		</script>
		<?php
		// =================================================
		// CARICAMENTO  file  del modulo MODULI
		// =================================================

		foreach ($config['modules'] as $module) {
			if (is_file(PHPPATH . $config['module_base_path'] . $module . '/script.js')) {
			?>
				<script src="<?=PATH . $config['module_base_path'] . $module ?>/script.js" type="text/javascript"></script>
			<?
			}
		}
		?>



<script src="<?=PATH?>js/cookiechoices.js"></script>


      <script>//<![CDATA[
        document.addEventListener('DOMContentLoaded', function(event) {
            cookieChoices.showCookieConsentBar('<strong>Questo sito web utilizza i cookie per assicurarti la migliore esperienza di navigazione</strong>.<br> Chiudendo questo banner, o interagendo con questo sito web, acconsenti all\'uso dei cookie. Per maggiori informazioni vai alla pagina Cookie Policy.',
                'Chiudi', 'Maggiori Informazioni',
                         '<?=PATHHREF?>privacy-policy');
          });
        //]]></script>


		<script type="text/javascript" src="<?=PATH?>js/main.js"></script>
    </body>
</html>
