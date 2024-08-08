import tf  from '@tensorflow/tfjs-node';
const fs = require('fs');
import path from 'path';
import { fileURLToPath } from 'url';

export class AiService {
  
  fertilizerModel;
  ecPhModel;


  /** Train */
  ecPhModelTrain
  dosesModelTrain
  inputTensor
  labelTensor
  rootDir


  constructor(
    ) {
      this.init();
    }
    
    async init(){
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = path.dirname(__filename);
      this.rootDir = __dirname.replace(path.join('app', 'services', 'ai'), '');

      this.fertilizerModel = await tf.loadLayersModel('file://' + this.rootDir + '/data/ai/history-model/model.json');
      this.ecPhModel = await tf.loadLayersModel('file://' +this. rootDir + '/data/ai/history-model/model.json');
      console.log('Models loaded');
    }

    getDoses(req) {
      try {
        const { waterLevel, plantAge, desiredEC, desiredPH } = req;
    
        if (waterLevel === undefined || plantAge === undefined || desiredEC === undefined || desiredPH === undefined) {
          return ({ error: 'Missing parameters' });
        }
    
        const inputTensor = tf.tensor2d([[waterLevel, plantAge, desiredEC, desiredPH]]);
        const prediction = this.fertilizerModel.predict(inputTensor);
        const result = prediction.arraySync();
    
        return {
          fertilizer1: result[0][0],
          fertilizer2: result[0][1],
          fertilizer3: result[0][2],
          phLower: result[0][3],
          water: result[0][4]
        };
      } catch (error) {
        console.error(error);
        return { error: 'An error occurred while making prediction' };
      }
    }

    getEcPh(req) {
      try {
        const { plantAge } = req;
    
        if (plantAge === undefined) {
          return { error: 'Missing plantAge parameter' };
        }
    
        const inputTensor = tf.tensor2d([[plantAge]]);
        const prediction = this.ecPhModel.predict(inputTensor);
        const result = prediction.arraySync();
    
        return {
          desiredEC: result[0][0],
          desiredPH: result[0][1]
        };
      } catch (error) {
        console.error(error);
        return { error: 'An error occurred while making prediction' };
      }
    }

    defineEcPhModel(){
      this.ecPhModelTrain = tf.sequential();
      this.ecPhModelTrain.add(tf.layers.dense({inputShape: [1], units: 10, activation: 'relu'}));
      this.ecPhModelTrain.add(tf.layers.dense({units: 10, activation: 'relu'}));
      this.ecPhModelTrain.add(tf.layers.dense({units: 2}));  // Output: desiredEC, desiredPH
      this.ecPhModelTrain.compile({
        optimizer: tf.train.adam(),
        loss: 'meanSquaredError'
      });

      // Load training data
      const rawData = fs.readFileSync('../../../data/ec-ph-levels.json');
      const trainingData = JSON.parse(rawData);

      const inputs = trainingData.map(d => [d.plantAge]);
      const labels = trainingData.map(d => [d.desiredEC, d.desiredPH]);

      this.inputTensor = tf.tensor2d(inputs);
      this.labelTensor = tf.tensor2d(labels);
    }

    // Train the model
  async trainEcPhModel() {
    await this.ecPhModelTrain.fit(this.inputTensor, this.labelTensor, {
      epochs: 50,
      batchSize: 32,
      shuffle: true
    });
    console.log('EC and PH model training complete');
    // Save the model
    await this.ecPhModelTrain.save('file://' + this.rootDir + '/data/ec-ph-levels');
  }

  defineDosesModel(){
    // Define the model
    const dosesModelTrain = tf.sequential();
    dosesModelTrain.add(tf.layers.dense({inputShape: [4], units: 10, activation: 'relu'}));
    dosesModelTrain.add(tf.layers.dense({units: 10, activation: 'relu'}));
    dosesModelTrain.add(tf.layers.dense({units: 10, activation: 'relu'}));
    dosesModelTrain.add(tf.layers.dense({units: 5}));  // Output: fertilizer1, fertilizer2, fertilizer3, pH lower, water
    dosesModelTrain.compile({
      optimizer: tf.train.adam(),
      loss: 'meanSquaredError'
    });

    // Load training data
    const rawData = fs.readFileSync('../../../data/history.json');
    const trainingData = JSON.parse(rawData);

    const inputs = trainingData.map(d => [d.waterLevel, d.plantAge, d.desiredEC, d.desiredPH]);
    const labels = trainingData.map(d => [d.fertilizer1, d.fertilizer2, d.fertilizer3, d.phLower, d.water]);

    const inputTensor = tf.tensor2d(inputs);
    const labelTensor = tf.tensor2d(labels);
  }

  async trainDosesModel() {
    await this.dosesModelTrain.fit(this.inputTensor, this.labelTensor, {
      epochs: 50,
      batchSize: 32,
      shuffle: true
    });
    console.log('Training complete');
    // Save the model
    await this.dosesModelTrain.save('file://' + this.rootDir + '/data/history-model');
  }
}

  export default AiService;
