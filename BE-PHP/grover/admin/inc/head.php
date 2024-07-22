<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
        <title><?=$config['name']?> | <?=(isset($modules[MODULO]['title'])) ? $modules[MODULO]['title'] : ''?> - Area amministrativa</title>
        <meta name="description" content="">
        <meta name="viewport" content="width=device-width">


        <link rel="shortcut icon" href="<?=PATH?>img/favicon.ico" type="image/x-icon">
        <link rel="icon" href="<?=PATH?>img/favicon.ico" type="image/x-icon">
        
        <!--
            <link rel="stylesheet/less" type="text/css" href="<?=PATH?>style/admin.style.less">
            <script src="<?=PATH?>js/vendor/less.min.js" type="text/javascript"></script>
        -->
        <link href="<?=PATH?>style/style.min.css" rel="stylesheet">
        <link href="<?=PATH?>style/retina.min.css" rel="stylesheet">
        <link rel="stylesheet" type="text/css" href="<?=PATH?>style/admin.style.css?v=<?=$config['admin']['version']?>">
        
        <!-- end: CSS -->
        <script src="<?=PATH?>js/vendor/modernizr-2.6.1-respond-1.1.0.min.js?v=<?=$config['admin']['version']?>"></script>
    </head>
    <body>
        <div id="wrapper">