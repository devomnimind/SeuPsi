import { VectorService } from '../services/VectorService';

(async () => {
  try {
    const results = await VectorService.search('meditação');
    console.log('Vector search results:', results);
  } catch (error) {
    console.error('Error during Vector search:', error);
  }
})();
