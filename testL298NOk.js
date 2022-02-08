'use strict';
import L298N from 'pigpio-l298n';

// enableA,in1,in2,enableB,in3,in4
let l298n = new L298N(14,15,18, 21,20,16);
l298n.setSpeed(l298n.NO1,100); // 20%
l298n.forward(l298n.NO1);
l298n.setSpeed(l298n.NO2,100); // 20%
l298n.forward(l298n.NO2);
// l298n.backward(l298n.NO1)

setTimeout(() => {
  l298n.stop(l298n.NO1);
  l298n.stop(l298n.NO2);
  console.log('done');
}, 2000); 

