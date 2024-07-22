<div class="body"> <!-- chiude nel footer -->

<header>
    <div class="header mb10">
      <div class="container">

        <!-- LOGO -->
        <div class="logo">
          <h1><a href="<?=PATHHREF?>"><img src="<?=PATH?>img/logo.png" alt="" class='img-responsive'/></a></h1>
        </div>
        
        <!-- MENU -->
        <div class="nav_wrap no320">
          <nav>
            <ul>
              <?php 

              $depth = 0;
              $flag = false;
              $first = true;

              $subpages_menu = $pages->get_adjacency_items();

              foreach($subpages_menu as $item) {

                $breadcrumb_ck = $pages->build_breadcrumb($item['id']);
                
                if ( ! $breadcrumb_ck) {
                  continue;
                }
                foreach ($breadcrumb_ck as $bread_page) {
                  if($bread_page->menuvisible <> 1 || $bread_page->abilitato <> 1){
                    continue 2;
                  }
                }

               $depth_r = $item['depth'];

               $ul_classe = 'depth_'.$depth_r;

               if ($depth_r == 0) {
                $li_classe = 'dropdown_menu';
               }

               if ($first) {
                 echo "<li id='list_{$item['id']}' class='interna  {$li_classe}' >"; 
               }

               while ($depth_r > $depth) { 
                   echo "<ul class='d_menu {$ul_classe}'><i class='fa fa-caret-up'></i>\n"."<li id='list_{$item['id']}' class='interna' >"; 
                   $flag = false; 
                   $depth++; 
               }
               while ($depth_r < $depth) { 
                   echo "</li>\n", "</ul>\n"; 
                   $depth--; 
               }
               if ($flag) { 
                   echo "</li>\n", "<li id='list_{$item['id']}' class='interna {$li_classe}'>"; 
                   $flag = false; 
               }

               #verifica originale di Loris
               #$requestURI[1 + $offsetURI] == $item['permalink'] || $requestURI[0 + $offsetURI] . '/' . $requestURI[1 + $offsetURI] == $item['permalink']

               #verifica per stampare 'active sul link'
               #$requestURI[1 + $offsetURI] == $item['permalink'] || $requestURI[0 + $offsetURI] . '/' . $requestURI[1 + $offsetURI] == $item['permalink'] || ($requestURI[0 + $offsetURI]!="p" && $offsetURI]:$requestURI[1 + $offsetURI] == $item['permalink'])
               
               ?>
                 <a href="<?=PATHHREF . $pages->build_url($item['id'], $macro)?>" class="<?=($requestURI[1 + $offsetURI] == $item['permalink'] || $requestURI[0 + $offsetURI] . '/' . $requestURI[1 + $offsetURI] == $item['permalink'] || ($requestURI[0 + $offsetURI]!="p" && $requestURI[0 + $offsetURI] == $item['permalink'])) ? 'active' : ''?>"><?=$item['titolo']?></a> 
               <?
               $flag = true;
               $first = false;
              }

              while ($depth-- > 0) { echo "</li>\n", "</ul>\n"; }
            ?> 
  
            <!-- <li class=''><a class="<?=($pagina=='comunicazione') ? 'active' : '' ?>" href="<?=PATHHREF.'news/' . $macro->permalink?>">news </a></li>  -->
            <li class="menu-search">
              <form class="search" action="<?=PATHHREF?>ricerca" method="GET">
                <input type="search" name="key" placeholder="<?=lang($lng,'Cerca nel sito','Search')?>"/>
              </form>
            </li>
          </ul>

          
          </nav>
        </div>
      </div>
    </div>

    <!-- MOBILE MENU -->
    <div class="mobi-menu">
      <ul class="index2-menu">
        <li><a onclick="showhide()"><i class="fa fa-align-justify"></i></a></li>
        <li>
           <form class="search" action="<?=PATHHREF?>ricerca" method="GET">
                  <input type="search" placeholder="<?=lang($lng,'Cerca nel sito','Search')?>"/>
                </form>
        </li>
      </ul>
      <div id='cssmenu'>

        <ul>
          <?php 

          $depth = 0;
          $flag = false;
          $first = true;

          $subpages_menu = $pages->get_adjacency_items();

          foreach($subpages_menu as $item) {

            $breadcrumb_ck = $pages->build_breadcrumb($item['id']);
            
            if ( ! $breadcrumb_ck) {
              continue;
            }
            foreach ($breadcrumb_ck as $bread_page) {
              if($bread_page->menuvisible <> 1 || $bread_page->abilitato <> 1){
                continue 2;
              }
            }

           $depth_r = $item['depth'];

           $ul_classe = 'depth_'.$depth_r;

           if ($depth_r == 0) {
            $li_classe = 'has-sub';
           }

           if ($first) {
             echo "<li id='list_{$item['id']}' class='interna  {$li_classe}' >"; 
           }

           while ($depth_r > $depth) { 
               echo "<ul class='sub-nav {$ul_classe}'>\n"."<li id='list_{$item['id']}' class='interna' >"; 
               $flag = false; 
               $depth++; 
           }
           while ($depth_r < $depth) { 
               echo "</li>\n", "</ul>\n"; 
               $depth--; 
           }
           if ($flag) { 
               echo "</li>\n", "<li id='list_{$item['id']}' class='interna {$li_classe}'>"; 
               $flag = false; 
           }

           ?>
             <a href="<?=PATHHREF . $pages->build_url($item['id'], $macro)?>" class="<?=($requestURI[1 + $offsetURI] == $item['permalink'] || $requestURI[0 + $offsetURI] . '/' . $requestURI[1 + $offsetURI] == $item['permalink']) ? 'active' : ''?>"><?=$item['titolo']?></a> 
           <?
           $flag = true;
           $first = false;
          }

          while ($depth-- > 1) { echo "</li>\n", "</ul>\n"; }
        ?> 
          
          <!--<li><a href='contact.html'><span>Contact</span></a></li>-->
        </ul>
      </div>
    </div>
  </header>
