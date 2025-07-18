#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// Development server with hot reload capabilities
class DevServer {
    constructor() {
        this.watchers = [];
        this.serverProcess = null;
    }
    
    log(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        const colors = {
            info: '\x1b[36m',
            success: '\x1b[32m',
            warning: '\x1b[33m',
            error: '\x1b[31m',
            reset: '\x1b[0m'
        };
        console.log(`${colors[type]}[${timestamp}] ${message}${colors.reset}`);
    }
    
    watchFiles() {
        const watchPaths = [
            { path: 'src/js', pattern: /\.js$/ },
            { path: 'css', pattern: /\.css$/ },
            { path: '.', pattern: /index\.html$/ }
        ];
        
        watchPaths.forEach(({ path: watchPath, pattern }) => {
            if (fs.existsSync(watchPath)) {
                const watcher = fs.watch(watchPath, { recursive: true }, (eventType, filename) => {
                    if (filename && pattern.test(filename)) {
                        this.log(`File changed: ${filename}`, 'info');
                        this.rebuild();
                    }
                });
                this.watchers.push(watcher);
            }
        });
    }
    
    async rebuild() {
        this.log('Rebuilding project...', 'warning');
        
        try {
            // Run development build
            const { execSync } = require('child_process');
            execSync('npm run build:dev', { stdio: 'pipe' });
            this.log('Rebuild completed successfully', 'success');
        } catch (error) {
            this.log(`Rebuild failed: ${error.message}`, 'error');
        }
    }
    
    startServer() {
        // Start development server
        this.serverProcess = spawn('npm', ['run', 'serve'], {
            stdio: 'inherit',
            shell: true
        });
        
        this.serverProcess.on('error', (error) => {
            this.log(`Server error: ${error.message}`, 'error');
        });
    }
    
    async start() {
        this.log('🚀 Starting development server...', 'info');
        
        // Initial build
        await this.rebuild();
        
        // Start file watching
        this.watchFiles();
        this.log('👀 Watching for file changes...', 'info');
        
        // Start development server
        this.startServer();
        this.log('🌐 Development server started at http://localhost:3000', 'success');
        
        // Handle graceful shutdown
        process.on('SIGINT', () => {
            this.cleanup();
            process.exit(0);
        });
    }
    
    cleanup() {
        this.log('🧹 Cleaning up...', 'warning');
        
        // Close file watchers
        this.watchers.forEach(watcher => watcher.close());
        
        // Kill server process
        if (this.serverProcess) {
            this.serverProcess.kill();
        }
        
        this.log('👋 Development server stopped', 'info');
    }
}

// Start development server
if (require.main === module) {
    const devServer = new DevServer();
    devServer.start().catch(error => {
        console.error('Failed to start development server:', error);
        process.exit(1);
    });
}

module.exports = DevServer;
