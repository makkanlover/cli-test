const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');

const ProcessManager = require('./process-manager');
const libraryConfig = require('./library-config');
const ScreenshotManager = require('./screenshot-manager');
const logger = require('./logger');
const errorHandler = require('./error-handler');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3000;
const processManager = new ProcessManager();
const screenshotManager = new ScreenshotManager();

app.use(cors());
app.use(express.json());
app.use(logger.requestLogger());
app.use(express.static(path.join(__dirname, '../frontend')));
app.use('/sample/photos', express.static(path.join(__dirname, '../sample/photos')));

// Set SVG MIME type
app.use('/sample/photos', (req, res, next) => {
  if (req.path.endsWith('.svg')) {
    res.setHeader('Content-Type', 'image/svg+xml');
  }
  next();
});

app.get('/api/libraries', errorHandler.asyncWrapper(async (req, res) => {
  logger.info('Libraries requested');
  const libraries = libraryConfig.getLibraries();
  res.json(libraries);
}));

app.post('/api/select-library', errorHandler.asyncWrapper(async (req, res) => {
  const { libraryId } = req.body;
  
  if (!libraryId) {
    throw errorHandler.createError(
      errorHandler.errorTypes.VALIDATION_ERROR,
      'Library ID is required',
      400
    );
  }
  
  logger.info('Library selection requested', { libraryId });
  
  const library = libraryConfig.getLibrary(libraryId);
  if (!library) {
    throw errorHandler.createError(
      errorHandler.errorTypes.NOT_FOUND,
      'Library not found',
      404,
      { requestedLibrary: libraryId }
    );
  }
  
  processManager.selectLibrary(libraryId);
  
  logger.info('Library selected successfully', { libraryId, libraryName: library.name });
  res.json({ success: true, library });
}));

app.post('/api/execute-command', errorHandler.asyncWrapper(async (req, res) => {
  const { command } = req.body;
  
  if (!command || typeof command !== 'string' || command.trim() === '') {
    throw errorHandler.createError(
      errorHandler.errorTypes.VALIDATION_ERROR,
      'Command is required and must be a non-empty string',
      400
    );
  }
  
  logger.info('Command execution requested', { command });
  
  try {
    const result = await processManager.executeCommand(command.trim());
    
    if (result.success) {
      logger.info('Command executed successfully', { command, hasOutput: !!result.output });
    } else {
      logger.warn('Command execution failed', { command, error: result.error });
    }
    
    res.json(result);
  } catch (error) {
    logger.error('Command execution error', { command, error: error.message });
    const processError = errorHandler.handleProcessError(error, { command });
    res.status(500).json(processError);
  }
}));

app.get('/api/screenshots', errorHandler.asyncWrapper(async (req, res) => {
  logger.info('Screenshots requested');
  const screenshots = screenshotManager.getScreenshots();
  logger.info('Screenshots retrieved', { count: screenshots.length });
  res.json(screenshots);
}));

app.post('/api/capture-screenshot', errorHandler.asyncWrapper(async (req, res) => {
  const { libraryId, url } = req.body;
  
  if (!libraryId) {
    throw errorHandler.createError(
      errorHandler.errorTypes.VALIDATION_ERROR,
      'Library ID is required',
      400
    );
  }
  
  logger.info('Screenshot capture requested', { libraryId, url });
  const result = await screenshotManager.captureScreenshot(libraryId, url);
  res.json(result);
}));

app.get('/api/build-status', errorHandler.asyncWrapper(async (req, res) => {
  logger.info('Build status requested');
  const buildStatus = processManager.getAllBuildStatus();
  res.json(buildStatus);
}));

app.post('/api/rebuild', errorHandler.asyncWrapper(async (req, res) => {
  const { libraryId } = req.body;
  
  if (!libraryId) {
    throw errorHandler.createError(
      errorHandler.errorTypes.VALIDATION_ERROR,
      'Library ID is required',
      400
    );
  }
  
  logger.info('Rebuild requested', { libraryId });
  const result = await processManager.rebuildLibrary(libraryId);
  res.json(result);
}));

io.use(logger.socketLogger());

io.on('connection', (socket) => {
  socket.on('error', errorHandler.handleSocketError(socket));
  
  socket.on('execute-command', async (data) => {
    try {
      if (!data || !data.command) {
        throw new Error('Command is required');
      }
      
      logger.info('Socket command execution', { socketId: socket.id, command: data.command });
      const result = await processManager.executeCommand(data.command);
      socket.emit('command-result', result);
    } catch (error) {
      logger.error('Socket command error', { socketId: socket.id, error: error.message });
      const processError = errorHandler.handleProcessError(error, { command: data?.command });
      socket.emit('command-result', processError);
    }
  });

  socket.on('select-library', (data) => {
    try {
      if (!data || !data.libraryId) {
        throw new Error('Library ID is required');
      }
      
      logger.info('Socket library selection', { socketId: socket.id, libraryId: data.libraryId });
      processManager.selectLibrary(data.libraryId);
      socket.emit('library-selected', { success: true });
    } catch (error) {
      logger.error('Socket library selection error', { socketId: socket.id, error: error.message });
      socket.emit('library-selected', { 
        success: false, 
        error: errorHandler.getUserFriendlyMessage({
          type: errorHandler.errorTypes.LIBRARY_ERROR,
          message: error.message
        }),
        suggestion: errorHandler.getErrorSuggestion(errorHandler.errorTypes.LIBRARY_ERROR)
      });
    }
  });
});

// Error handling middleware (must be last)
app.use(errorHandler.handleError());

// 404 handler
app.use((req, res) => {
  logger.warn('Route not found', { url: req.url, method: req.method });
  res.status(404).json({
    success: false,
    error: 'ルートが見つかりません',
    suggestion: 'URLを確認してください'
  });
});

server.listen(PORT, () => {
  logger.info(`Server started successfully on port ${PORT}`);
});

process.on('SIGINT', () => {
  logger.info('Shutdown signal received, cleaning up...');
  processManager.cleanup();
  screenshotManager.cleanup();
  logger.cleanup();
  server.close(() => {
    logger.info('Server shut down gracefully');
    process.exit(0);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', { error: error.message, stack: error.stack });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection', { reason, promise });
  process.exit(1);
});