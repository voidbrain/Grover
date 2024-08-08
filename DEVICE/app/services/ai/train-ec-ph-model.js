const tf = require('@tensorflow/tfjs-node');
const fs = require('fs');

// Define the model
const ecPhModel = tf.sequential();
ecPhModel.add(tf.layers.dense({inputShape: [1], units: 10, activation: 'relu'}));
ecPhModel.add(tf.layers.dense({units: 10, activation: 'relu'}));
ecPhModel.add(tf.layers.dense({units: 2}));  // Output: desiredEC, desiredPH
ecPhModel.compile({
  optimizer: tf.train.adam(),
  loss: 'meanSquaredError'
});

// Load training data
const rawData = fs.readFileSync('data/ec-ph-levels.json');
const trainingData = JSON.parse(rawData);

const inputs = trainingData.map(d => [d.plantAge]);
const labels = trainingData.map(d => [d.desiredEC, d.desiredPH]);

const inputTensor = tf.tensor2d(inputs);
const labelTensor = tf.tensor2d(labels);

// Train the model
async function trainEcPhModel() {
  await ecPhModel.fit(inputTensor, labelTensor, {
    epochs: 50,
    batchSize: 32,
    shuffle: true
  });
  console.log('EC and PH model training complete');
  // Save the model
  await ecPhModel.save('file://./data/ec-ph-levels');
}

trainEcPhModel();
