import tf  from '@tensorflow/tfjs-node';
import path from 'path';
import { fileURLToPath } from 'url';

export class AiService {
  
  fertilizerModel;
  ecPhModel;
  constructor(
    ) {
      this.init();
    }
    
    async init(){
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = path.dirname(__filename);
      const rootDir = __dirname.replace(path.join('services', 'ai'), '');

      this.fertilizerModel = await tf.loadLayersModel('file://' + rootDir + '/data/ai/history-model/model.json');
      this.ecPhModel = await tf.loadLayersModel('file://' + rootDir + '/data/ai/history-model/model.json');
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

    predictEcPh(req) {
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
    
  }
  
  export default AiService;
