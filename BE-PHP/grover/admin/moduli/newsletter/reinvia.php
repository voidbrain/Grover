<?php

if ($modulo->rebuild((int)$requestURI[5])){

  header('location:'. PATHADMIN . MODULO . '/main/step/1');

} else {

  header('location:'. PATHADMIN . MODULO );

}