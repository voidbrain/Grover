<!DOCTYPE html>
<!--[if IEMobile 7 ]><html class="no-js iem7" manifest="default.appcache?v=1"><![endif]-->
<!--[if lt IE 7 ]><html class="no-js ie6" lang="en"><![endif]-->
<!--[if (IE 7)&!(IEMobile) ]><html class="no-js ie7" lang="en"><![endif]-->
<!--[if lte IE 8]><html class="no-js ie8" lang="en"><![endif]-->
<!--[if (gte IE 9)|(gt IEMobile 7)|!(IE)]><!--><!--<html class="no-js" manifest="default.appcache?v=1" lang="en">--><html class="no-js" lang="it"><!--<![endif]-->
<head>
	<meta charset="UTF-8">
    <title><?=$titolo_test?> <?=$config['name']?>  <?=$title?>  <?=$mtitle?> </title>

    <meta name='keywords' content="<?=$mkeyword?>" />
    <meta name='description' content="<?=$mdescription?>" />
    <meta http-equiv="Content-Type" content="text/html; charset=ISO-8859-1"/>

    <meta name="HandheldFriendly" content="True"/>
	<meta name="MobileOptimized" content="320"/>
	<meta name="viewport" content="width=device-width, target-densitydpi=160dpi, initial-scale=1"/>

	<link rel="stylesheet" href="<?=PATH?>style/datepicker.css">

    <!-- Custom Google Web Font -->
    <link href='http://fonts.googleapis.com/css?family=Cousine:400,400italic,700,700italic' rel='stylesheet' type='text/css'>
    <link href='http://fonts.googleapis.com/css?family=Roboto+Condensed:400,300,300italic,400italic,700,700italic' rel='stylesheet' type='text/css'>
    <link href='http://fonts.googleapis.com/css?family=Merriweather+Sans:400,300italic,300,400italic,700,700italic,800,800italic' rel='stylesheet' type='text/css'>
    <link href='http://fonts.googleapis.com/css?family=Roboto:400,300,300italic,400italic,700,800,700italic' rel='stylesheet' type='text/css'>

	<link href='http://ajax.googleapis.com/ajax/libs/jqueryui/1.8.14/themes/smoothness/jquery-ui.css' rel='stylesheet' type='text/css'>




    <!--[if lt IE 9]>
            <script src="http://html5shim.googlecode.com/svn/trunk/html5.js"></script>
            <script src="<?=PATH?>js/respond.min.js" type="text/javascript"></script>
    <![endif]-->

    <!--Favicons -->
    <link href="<?=PATH?>img/icon/apple-touch-icon-144.png" sizes="144x144" rel="apple-touch-icon-precomposed">
    <link href="<?=PATH?>img/icon/apple-touch-icon-114.png" sizes="114x114" rel="apple-touch-icon-precomposed">
    <link href="<?=PATH?>img/icon/apple-touch-icon-72.png" sizes="72x72" rel="apple-touch-icon-precomposed">
    <link href="<?=PATH?>img/icon/apple-touch-icon-57.png" rel="apple-touch-icon-precomposed">
    <link href="<?=PATH?>img/icon/favicon.png" rel="shortcut icon">
   <!-- CSS -->
    <link href="<?=PATH?>style/bootstrap.css" rel="stylesheet">
    <link href="<?=PATH?>font-awesome/css/font-awesome.min.css" rel="stylesheet">
    <link href="<?=PATH?>style/style.css" rel="stylesheet">
    <link href="<?=PATH?>js/owl-carousel/owl.carousel.css" rel="stylesheet">
    <link href="<?=PATH?>js/owl-carousel/owl.theme.css" rel="stylesheet">
    <link href="<?=PATH?>js/rs-plugin/css/settings.css" rel="stylesheet" />
    <link href="<?=PATH?>style/fancySelect.css" rel="stylesheet">

    <link href="<?=PATH?>style/responsive.css" rel="stylesheet">
    <link href="<?=PATH?>style/responsive-custom.css" rel="stylesheet">

    <link href="<?=PATH?>style/set1.css" rel="stylesheet">



        <!-- HTML5 shim and Respond.js IE8 support of HTML5 elements and media queries -->
        <!--[if lt IE 9]>
          <script type='text/javascript' src="http://html5shiv.googlecode.com/svn/trunk/html5.js"></script>
          <script type='text/javascript' src="//cdnjs.cloudflare.com/ajax/libs/respond.js/1.4.2/respond.js"></script>
        <![endif]-->


    <!-- <script src="<?=PATH?>style/html5shiv-printshiv.js"></script> -->

     <!--[if lte IE 8]>
        <script src="<?=PATH?>js/excanvas.js"></script>
    <![endif]-->



    <!--iOS -->
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <link rel="apple-touch-startup-image" href="<?=PATH?>img/splash.png">

    <!--Microsoft-->
    <meta http-equiv="cleartype" content="on">
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">

    <!--[if lt IE 10]>
		<script type="text/javascript" src="<?=PATH?>style/PIE.js"></script>
	<![endif]-->


    <script>
        //SETTAGGI JS GLOBALI
        jsSetting = new Array();
        jsSetting['path'] = '<?=PATH?>';
        jsSetting['comune'] = '<?=$_SESSION["session_comune"]?>';
        jsSetting['comune_zona'] = '<?=$_SESSION["session_zona"]?>';

    </script>


    <style>

    </style>
    <? if(ENVIRONMENT == 'production' && $config['analytics'] != 'UA-XXXXX-X' && $config['analytics'] != '') : ?>

    <script>
  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

  ga('create', '<?=$config['analytics']?>', 'auto');
  ga('send', 'pageview');

</script>

    <? endif; ?>

</head>

<body id="index2" class="home2">
