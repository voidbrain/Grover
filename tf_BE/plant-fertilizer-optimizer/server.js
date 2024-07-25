const express = require('express');
const tf = require('@tensorflow/tfjs-node');
const app = express();
const port = 3000;

app.use(express.json());

// Load the models
let fertilizerModel;
let ecPhModel;
(async () => {
  fertilizerModel = await tf.loadLayersModel('file://./data/history-model/model.json');
  ecPhModel = await tf.loadLayersModel('file://./data/ec-ph-levels/model.json');
  console.log('Models loaded');
})();

// Endpoint to calculate optimal amounts

/**
 * 
    curl -X POST http://localhost:3000/predict \
    -H "Content-Type: application/json" \
    -d '{"waterLevel": 1.0, "plantAge": 30, "desiredEC": 1.5, "desiredPH": 6.0}'
 * 
 */
app.post('/predict', async (req, res) => {
  try {
    const { waterLevel, plantAge, desiredEC, desiredPH } = req.body;

    if (waterLevel === undefined || plantAge === undefined || desiredEC === undefined || desiredPH === undefined) {
      return res.status(400).json({ error: 'Missing parameters' });
    }

    const inputTensor = tf.tensor2d([[waterLevel, plantAge, desiredEC, desiredPH]]);
    const prediction = fertilizerModel.predict(inputTensor);
    const result = prediction.arraySync();

    res.json({
      fertilizer1: result[0][0],
      fertilizer2: result[0][1],
      fertilizer3: result[0][2],
      phLower: result[0][3],
      water: result[0][4]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while making prediction' });
  }
});

// Endpoint to calculate desired EC and pH
/**
    curl -X POST http://localhost:3000/predict-ec-ph \
    -H "Content-Type: application/json" \
    -d '{"plantAge": 25}'
 */
app.post('/predict-ec-ph', async (req, res) => {
  try {
    const { plantAge } = req.body;

    if (plantAge === undefined) {
      return res.status(400).json({ error: 'Missing plantAge parameter' });
    }

    const inputTensor = tf.tensor2d([[plantAge]]);
    const prediction = ecPhModel.predict(inputTensor);
    const result = prediction.arraySync();

    res.json({
      desiredEC: result[0][0],
      desiredPH: result[0][1]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while making prediction' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
