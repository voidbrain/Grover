<?php
/*
 * jQuery File Upload Plugin PHP Example 5.14
 * https://github.com/blueimp/jQuery-File-Upload
 *
 * Copyright 2010, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */

error_reporting(E_ALL | E_STRICT);


$options = array(
	"upload_dir" => PHPPATH . 'files/tmp/',
	"upload_url" => PATH . 'files/tmp/'
);


$upload_handler = new UploadHandler($options);