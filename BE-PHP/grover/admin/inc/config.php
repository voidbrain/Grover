<?php


	define('PATHADMIN', PATH . $requestURI[0].'/');
	
	# VERSIONE
	$config['admin']['version'] = "1.0.1"; //Utile per svuotare la cache dei file (e in più perchè fa figo)..

	//NEW
	$config['admin']['moduli_menu'] = array( 


		'Pagine' => array(
			'dest' => 'pages', 
			'icon' => 'fa-star-o',
			'moduli' => array('pages')
		),
		'Reparti' => array(
			'dest' => 'reparti',
			'icon' => 'fa-building', 
			'moduli' => array('reparti')
			),
		'Servizi' => array(
			'dest' => 'servizi',
			'icon' => 'fa-cubes', 
			'moduli' => array('servizi')
			),
		'News' => array(
			'dest' => 'news',
			'icon' => 'fa-calendar', 
			'moduli' => array('news')
			),
		'Modulistica' => array(
			'dest' => 'modulistica',
			'icon' => 'fa-hdd-o', 
			'moduli' => array('modulistica')
			),
		'Newsletter ' => array(
			'moduli' => array('newsletter','liste_newsletter','template_newsletter'),
			'dest' 	=> '#',
			'icon' => 'fa-envelope',
			'subpage' => array(
				'Newsletter' => array('icon' => ' fa-envelope-o', 'dest' => 'newsletter', 'moduli' => array('newsletter')),
				'Liste Destinatari'  => array('icon' => ' fa-list-alt', 'dest' => 'liste_newsletter', 'moduli' => array('liste_newsletter')),
				'Template'  => array('icon' => ' fa-file-text-o', 'dest' => 'template_newsletter', 'moduli' => array('template_newsletter'))
				// 'Rubrica'  => array('dest' => 'rubrica', 'moduli' => array('rubrica'))
			)
		),
		'Utenti Admin' => array(
			'dest' => 'utenti', 
			'icon' => 'fa-user',
			'moduli' => array('utenti')
		),
		'Tipologie' => array(
			'dest' => 'tipologie_utenti', 
			'icon' => 'fa-gears',
			'moduli' => array('tipologie_utenti')
		)			
	);

	
	$config['admin']['moduli_list'] = array();

	foreach ($config['admin']['moduli_menu'] as $v) {
		if (is_array($v['moduli'])) {
		    $config['admin']['moduli_list'] = array_unique(array_merge($config['admin']['moduli_list'],$v['moduli']));
		}

		if ($v['subpage']) {
			foreach ($v['subpage'] as $sv) {
				$config['admin']['moduli_list'] = array_unique(array_merge($config['admin']['moduli_list'],$sv['moduli']));
			}
		}
	}


	//impostare logo (se presente comparirà in alto nel sito)
	$config['admin']['url_logo'] = 'img/logotestata.gif';

	# LOG
	$config['admin']['log'] = FALSE; //Abilita i long nel sito
	$config['admin']['log_table'] = $config['db_pfx'].'log'; //Tabella file log 

	//Utenti Admin
	#$config['admin']['tab_utenti_admin'] = $config['db_pfx'].'utenti_admin';
	#$config['admin']['tab_utenti_admin_tipologia'] = $config['db_pfx'].'tipologie_utenti_admin';
	#$config['admin']['pfx_session'] = "as_"; //Prefisso sessione/cookie
	#$config['admin']['crypt_pass'] = FALSE;


?>