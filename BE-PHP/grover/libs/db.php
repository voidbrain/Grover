<?php

$db['default']['hostname'] = MYSQL_HOST;
$db['default']['username'] = MYSQL_USER;
$db['default']['password'] = MYSQL_PASS;
$db['default']['database'] = MYSQL_DB;
$db['default']['dbdriver'] = 'mysqli';


/* DOCUMENTOPIA.COM
******************************************************************************************
* This software is provided "as is", without warranty of any kind, express or implied,
* including but not limited to the warranties of merchantability, fitness for a particular
* purpose and noninfringement. In no event shall Documentopia.com LLC be liable for any
* claim, damages or other liability, whether in an action of contract, tort or otherwise,
* arising from, out of or in connection with Documentopia.com LLC or the use or other
* dealings with Documentopia.com LLC.
*
* Licensed under Creative Commons
* Attribution-ShareAlike 3.0
* http://creativecommons.org/licenses/by-sa/3.0/
*
* @link http://www.documentopia.com/licensing
*
* @author David Dula <coding@documentopia.com>
* @copyright - 2012 - Documentopia.com
******************************************************************************************
*/

define('DB_DEBUG', TRUE);
define('DB_LOAD_FORGE', TRUE);

// This should be the base path to the database folder
if ( ! defined('BASEPATH')) {
	define('BASEPATH', pathinfo(__FILE__, PATHINFO_DIRNAME).'/');
	}

function get_instance() {
    global $db;
    static $item = NULL;
    
    if ($item === NULL) {
        $item = new stdClass();
    }
    
    if (isset($db)) {
        $item->db = $db;
        return ($item);
    } else {
        return (NULL);
    }
}

function log_message($level = 'error', $message, $php_error = FALSE) {
    if (DB_DEBUG && $level == 'error') echo $message . "\n";
}

function show_error($message, $status_code = 500, $heading = 'An Error Was Encountered') {
    if (DB_DEBUG) echo $message . "\n";
}

require_once (BASEPATH . 'database/DB.php');

// Create The DB var
$db = DB($db['default']);

if (DB_LOAD_FORGE) {
    
    require_once (BASEPATH . 'database/DB_forge.php');
    require_once (BASEPATH . 'database/DB_utility.php');
    require_once (BASEPATH . 'database/drivers/' . $db->dbdriver . '/' . $db->dbdriver . '_utility.php');
    require_once (BASEPATH . 'database/drivers/' . $db->dbdriver . '/' . $db->dbdriver . '_forge.php');
    $class = 'CI_DB_' . $db->dbdriver . '_forge';
    $dbforge = new $class();
    
}
