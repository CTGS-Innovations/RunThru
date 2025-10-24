/**
 * VoicePresetService
 * Manages voice presets for character voice assignment
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { VoicePreset } from '../models/types';

class VoicePresetService {
  private presets: VoicePreset[] = [];

  constructor() {
    this.loadPresets();
  }

  /**
   * Load voice presets from config file
   */
  private loadPresets(): void {
    try {
      const configPath = join(__dirname, '../config/voice-presets.json');
      const data = readFileSync(configPath, 'utf-8');
      this.presets = JSON.parse(data);
      console.log(`✅ Loaded ${this.presets.length} voice presets`);
    } catch (error) {
      console.error('❌ Failed to load voice presets:', error);
      this.presets = [];
    }
  }

  /**
   * Get all voice presets
   */
  getAllPresets(): VoicePreset[] {
    return this.presets;
  }

  /**
   * Get a specific preset by ID
   */
  getPresetById(id: string): VoicePreset | null {
    const preset = this.presets.find(p => p.id === id);
    return preset || null;
  }

  /**
   * Validate if a preset ID exists
   */
  isValidPresetId(id: string): boolean {
    return this.presets.some(p => p.id === id);
  }

  /**
   * Get a random preset (for auto-assignment)
   */
  getRandomPreset(): VoicePreset {
    const randomIndex = Math.floor(Math.random() * this.presets.length);
    return this.presets[randomIndex];
  }
}

// Export singleton instance
export const voicePresetService = new VoicePresetService();
