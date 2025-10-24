import axios from 'axios';
import { config } from '../config/env';

export interface TTSRequest {
  text: string;
  character: string;
  engine: string;
  voiceId: string;
  emotion: {
    intensity: number;
    valence: string;
  };
}

export class TTSClientService {
  private baseURL: string;

  constructor() {
    this.baseURL = config.ttsServiceUrl;
  }

  /**
   * Generate audio for a single line
   */
  async synthesize(request: TTSRequest): Promise<Buffer> {
    try {
      // Convert camelCase to snake_case for Python API
      const pythonRequest = {
        text: request.text,
        character: request.character,
        engine: request.engine,
        voice_id: request.voiceId,  // Convert voiceId → voice_id
        emotion: request.emotion
      };

      const response = await axios.post(`${this.baseURL}/synthesize`, pythonRequest, {
        responseType: 'arraybuffer',
        timeout: 30000,
      });

      return Buffer.from(response.data);
    } catch (error) {
      throw new Error(`TTS synthesis failed: ${error}`);
    }
  }

  /**
   * List available voices
   */
  async listVoices(engine: string): Promise<any[]> {
    try {
      const response = await axios.get(`${this.baseURL}/voices`, {
        params: { engine },
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to list voices: ${error}`);
    }
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<any> {
    try {
      const response = await axios.get(`${this.baseURL}/health`);
      return response.data;
    } catch (error) {
      throw new Error(`TTS service health check failed: ${error}`);
    }
  }
}
