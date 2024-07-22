<header class="navbar">
    <div class="container">
        
        <button data-target=".sidebar-nav.nav-collapse" data-toggle="collapse" type="button" class="navbar-toggle collapsed">
              <span class="icon-bar"></span>
              <span class="icon-bar"></span>
              <span class="icon-bar"></span>
        </button>

        <a class="hidden-xs open" id="main-menu-toggle"><i class="fa fa-bars"></i></a>

        <a href="<?=PATH?>" class="navbar-brand col-lg-2 col-sm-1 col-xs-12">
            
            <? if(file_exists(PHPPATH.$config['admin']['url_logo'])){ ?>
              
              <img src="<?=PATH.$config['admin']['url_logo']?>" title="Area amministrativa" style='max-height:30px'>

            <? }else{ ?>

              <span class="visible-lg">Area Amministrativa</span><span class="visible-xs visible-sm visible-md">Admin</span>

            <? } ?>
        </a>


        <div class="nav-no-collapse header-nav">
            <ul class="nav navbar-nav pull-right">
                <?  
                //Se l'utente è loggato
                if($user->check_perms('*')){ ?>
                    <!-- start: User Dropdown -->
                    <li class="dropdown">
                        <a href="index.html#" data-toggle="dropdown" class="btn account dropdown-toggle">
                            <div class="avatar">
                                <i class="fa fa-user"></i>
                            </div>
                            <div class="user">
                                <span class="hello">Benvenuto!</span>
                                <span class="name"><?=$user_info->nome?></span>
                            </div>
                        </a>
                        <ul class="dropdown-menu">
                            <li class="dropdown-menu-title">
                                
                            </li>
                            <!-- 
                                <li><a href="index.html#"><i class="fa fa-user"></i> Profile</a></li>
                                <li><a href="index.html#"><i class="fa fa-cog"></i> Settings</a></li>
                                <li><a href="index.html#"><i class="fa fa-envelope"></i> Messages</a></li>
                            -->
                            <li><a href="?logout=1"><i class="fa fa-power-off"></i> Esci</a></li>
                        </ul>
                    </li>
                    <!-- end: User Dropdown -->
                <?php } ?>
            </ul>
        </div>
    </div>
</header>

<div id="loadPage">
    <i class="fa fa-spin fa-spinner"></i> Caricamento...
</div>