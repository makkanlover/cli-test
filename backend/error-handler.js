const logger = require('./logger');

class ErrorHandler {
    constructor() {
        this.errorTypes = {
            VALIDATION_ERROR: 'VALIDATION_ERROR',
            NOT_FOUND: 'NOT_FOUND', 
            LIBRARY_ERROR: 'LIBRARY_ERROR',
            PROCESS_ERROR: 'PROCESS_ERROR',
            INTERNAL_ERROR: 'INTERNAL_ERROR'
        };
    }

    // Custom error classes
    createError(type, message, statusCode = 500, details = null) {
        const error = new Error(message);
        error.type = type;
        error.statusCode = statusCode;
        error.details = details;
        error.timestamp = new Date().toISOString();
        return error;
    }

    // Express error handling middleware
    handleError() {
        return (error, req, res, next) => {
            // Log the error
            logger.error('Request error', {
                error: error.message,
                type: error.type || 'UNKNOWN',
                stack: error.stack,
                url: req.url,
                method: req.method,
                body: req.body,
                params: req.params
            });

            // Determine status code
            const statusCode = error.statusCode || 500;
            
            // Create user-friendly error response
            const errorResponse = this.formatErrorResponse(error);
            
            res.status(statusCode).json(errorResponse);
        };
    }

    formatErrorResponse(error) {
        const response = {
            success: false,
            error: this.getUserFriendlyMessage(error),
            type: error.type || 'INTERNAL_ERROR',
            timestamp: error.timestamp || new Date().toISOString()
        };

        // Add suggestions based on error type
        if (error.type) {
            response.suggestion = this.getErrorSuggestion(error.type, error);
        }

        // Add details in development mode
        if (process.env.NODE_ENV === 'development') {
            response.details = {
                originalMessage: error.message,
                stack: error.stack,
                ...(error.details && { errorDetails: error.details })
            };
        }

        return response;
    }

    getUserFriendlyMessage(error) {
        const messageMap = {
            [this.errorTypes.VALIDATION_ERROR]: '入力データに問題があります',
            [this.errorTypes.NOT_FOUND]: '要求されたリソースが見つかりません',
            [this.errorTypes.LIBRARY_ERROR]: 'ライブラリの処理中にエラーが発生しました',
            [this.errorTypes.PROCESS_ERROR]: 'コマンドの実行中にエラーが発生しました',
            [this.errorTypes.INTERNAL_ERROR]: '内部エラーが発生しました'
        };

        return messageMap[error.type] || 'エラーが発生しました';
    }

    getErrorSuggestion(type, error) {
        const suggestionMap = {
            [this.errorTypes.VALIDATION_ERROR]: '入力内容を確認してください',
            [this.errorTypes.NOT_FOUND]: 'URLまたはリクエストパラメータを確認してください',
            [this.errorTypes.LIBRARY_ERROR]: 'ライブラリが正しくインストールされているか確認してください',
            [this.errorTypes.PROCESS_ERROR]: 'コマンドの構文を確認してください',
            [this.errorTypes.INTERNAL_ERROR]: 'しばらく時間を置いてから再試行してください'
        };

        return suggestionMap[type] || '問題が続く場合は管理者にお問い合わせください';
    }

    // Socket.io error handler
    handleSocketError(socket) {
        return (error) => {
            logger.error('Socket error', {
                socketId: socket.id,
                error: error.message,
                stack: error.stack
            });

            socket.emit('error', {
                success: false,
                error: 'ソケット通信エラーが発生しました',
                suggestion: '接続を更新してください'
            });
        };
    }

    // Process error handler
    handleProcessError(error, context = {}) {
        logger.error('Process error', {
            error: error.message,
            context,
            stack: error.stack
        });

        return {
            success: false,
            error: this.getUserFriendlyMessage({
                type: this.errorTypes.PROCESS_ERROR,
                message: error.message
            }),
            suggestion: this.getProcessErrorSuggestion(error.message),
            type: this.errorTypes.PROCESS_ERROR
        };
    }

    getProcessErrorSuggestion(errorMessage) {
        if (errorMessage.includes('ENOENT')) {
            return 'コマンドまたはファイルが見つかりません。実行環境が正しく設定されているか確認してください。';
        }
        if (errorMessage.includes('timeout')) {
            return 'コマンドの実行時間が長すぎます。より軽量なコマンドを試してください。';
        }
        if (errorMessage.includes('permission')) {
            return 'ファイルまたはディレクトリのアクセス権限を確認してください。';
        }
        if (errorMessage.includes('not found')) {
            return 'コマンドが見つかりません。ライブラリが正しくインストールされているか確認してください。';
        }
        return 'コマンドの構文を確認してください。';
    }

    // Validation helpers
    validateRequest(schema) {
        return (req, res, next) => {
            const { error, value } = schema.validate(req.body);
            
            if (error) {
                const validationError = this.createError(
                    this.errorTypes.VALIDATION_ERROR,
                    error.details[0].message,
                    400,
                    { validationDetails: error.details }
                );
                return next(validationError);
            }

            req.validatedBody = value;
            next();
        };
    }

    // Async wrapper for route handlers
    asyncWrapper(fn) {
        return (req, res, next) => {
            Promise.resolve(fn(req, res, next)).catch(next);
        };
    }
}

module.exports = new ErrorHandler();