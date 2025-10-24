import { Response } from 'express';

// ============================================================================
// Types
// ============================================================================

type ProgressStageStatus = 'pending' | 'active' | 'complete' | 'error';

interface ProgressStage {
  id: number;
  name: string;
  status: ProgressStageStatus;
  message: string;
  subProgress?: number;
}

interface ProgressUpdate {
  status: 'uploading' | 'complete' | 'error';
  overallPercent: number;
  stages: ProgressStage[];
}

// ============================================================================
// Upload Progress Service
// Manages SSE connections for real-time upload progress
// ============================================================================

class UploadProgressService {
  private connections: Map<string, Response> = new Map();
  private progressData: Map<string, ProgressUpdate> = new Map();

  /**
   * Register a new SSE connection for an upload
   */
  registerConnection(uploadId: string, res: Response): void {
    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Store connection
    this.connections.set(uploadId, res);

    // Initialize progress data
    this.progressData.set(uploadId, {
      status: 'uploading',
      overallPercent: 0,
      stages: [
        { id: 1, name: 'Parse Script', status: 'pending', message: 'Pending' },
        { id: 2, name: 'AI Analysis', status: 'pending', message: 'Pending', subProgress: 0 },
        { id: 3, name: 'Portraits', status: 'pending', message: 'Pending', subProgress: 0 },
        { id: 4, name: 'Save Database', status: 'pending', message: 'Pending' },
      ],
    });

    console.log(`[UploadProgress] Registered connection for upload: ${uploadId}`);

    // Keep connection alive with heartbeat
    const heartbeat = setInterval(() => {
      if (this.connections.has(uploadId)) {
        res.write(': heartbeat\n\n');
      } else {
        clearInterval(heartbeat);
      }
    }, 15000);

    // Cleanup on disconnect
    res.on('close', () => {
      clearInterval(heartbeat);
      this.removeConnection(uploadId);
    });
  }

  /**
   * Update progress for a specific stage
   */
  updateStage(
    uploadId: string,
    stageId: number,
    status: ProgressStageStatus,
    message: string,
    subProgress?: number
  ): void {
    const progress = this.progressData.get(uploadId);
    if (!progress) return;

    // Update stage
    const stage = progress.stages.find((s) => s.id === stageId);
    if (stage) {
      stage.status = status;
      stage.message = message;
      if (subProgress !== undefined) {
        stage.subProgress = subProgress;
      }
    }

    // Calculate overall progress
    const stageWeights = [10, 40, 40, 10]; // Parse, Analysis, Portraits, Save
    let totalProgress = 0;
    progress.stages.forEach((s, i) => {
      if (s.status === 'complete') {
        totalProgress += stageWeights[i];
      } else if (s.status === 'active' && s.subProgress !== undefined) {
        totalProgress += stageWeights[i] * (s.subProgress / 100);
      }
    });
    progress.overallPercent = totalProgress;

    // Emit update
    this.emit(uploadId, progress);
  }

  /**
   * Mark upload as complete
   */
  complete(uploadId: string): void {
    const progress = this.progressData.get(uploadId);
    if (!progress) return;

    progress.status = 'complete';
    progress.overallPercent = 100;
    progress.stages.forEach((s) => {
      if (s.status !== 'complete') {
        s.status = 'complete';
        s.message = 'Complete';
      }
    });

    this.emit(uploadId, progress);

    // Close connection after a short delay
    setTimeout(() => {
      this.removeConnection(uploadId);
    }, 1000);
  }

  /**
   * Mark upload as failed
   */
  error(uploadId: string, errorMessage: string): void {
    const progress = this.progressData.get(uploadId);
    if (!progress) return;

    progress.status = 'error';

    // Mark active stage as error
    const activeStage = progress.stages.find((s) => s.status === 'active');
    if (activeStage) {
      activeStage.status = 'error';
      activeStage.message = errorMessage;
    }

    this.emit(uploadId, progress);

    // Close connection after a short delay
    setTimeout(() => {
      this.removeConnection(uploadId);
    }, 1000);
  }

  /**
   * Emit SSE event to client
   */
  private emit(uploadId: string, data: ProgressUpdate): void {
    const res = this.connections.get(uploadId);
    if (!res) return;

    try {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    } catch (error) {
      console.error(`[UploadProgress] Error emitting to ${uploadId}:`, error);
      this.removeConnection(uploadId);
    }
  }

  /**
   * Remove connection and cleanup
   */
  private removeConnection(uploadId: string): void {
    const res = this.connections.get(uploadId);
    if (res) {
      try {
        res.end();
      } catch (error) {
        // Ignore errors on close
      }
    }
    this.connections.delete(uploadId);
    this.progressData.delete(uploadId);
    console.log(`[UploadProgress] Removed connection for upload: ${uploadId}`);
  }
}

// Export singleton instance
export const uploadProgressService = new UploadProgressService();
