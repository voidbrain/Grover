'use strict';

import driver from 'ds18x20';


const list = driver.list();
console.log(list);
const getL = driver.getAll();
console.log(getL);
