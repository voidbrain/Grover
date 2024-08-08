const tf = require('@tensorflow/tfjs-node');
const fs = require('fs');

// Define the model
const model = tf.sequential();
model.add(tf.layers.dense({inputShape: [4], units: 10, activation: 'relu'}));
model.add(tf.layers.dense({units: 10, activation: 'relu'}));
model.add(tf.layers.dense({units: 10, activation: 'relu'}));
model.add(tf.layers.dense({units: 5}));  // Output: fertilizer1, fertilizer2, fertilizer3, pH lower, water
model.compile({
  optimizer: tf.train.adam(),
  loss: 'meanSquaredError'
});

// Load training data
const rawData = fs.readFileSync('./data/history.json');
const trainingData = JSON.parse(rawData);

const inputs = trainingData.map(d => [d.waterLevel, d.plantAge, d.desiredEC, d.desiredPH]);
const labels = trainingData.map(d => [d.fertilizer1, d.fertilizer2, d.fertilizer3, d.phLower, d.water]);

const inputTensor = tf.tensor2d(inputs);
const labelTensor = tf.tensor2d(labels);

// Train the model
async function trainModel() {
  await model.fit(inputTensor, labelTensor, {
    epochs: 50,
    batchSize: 32,
    shuffle: true
  });
  console.log('Training complete');
  // Save the model
  await model.save('file://./data/history-model');
}

trainModel();
