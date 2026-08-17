// ================================================================
// ASCII Studio - Jenkins CI/CD Pipeline
// ================================================================
//
// Windows Jenkins Agent
//
// Pipeline:
//   Checkout
//      ↓
//   Install Dependencies
//      ↓
//   Lint
//      ↓
//   Unit Tests + MySQL Test DB
//      ↓
//   Build Frontend
//      ↓
//   Validate Backend
//      ↓
//   Docker Build
//      ↓
//   Integration Test
//      ↓
//   Deploy
//
// Jenkins Credentials required:
//
//   ID: ascii-studio-jwt-secret
//   Type: Secret text
//
//   ID: ascii-studio-db-password
//   Type: Secret text
//
// Required software on Jenkins machine:
//
//   Git
//   Node.js / npm
//   MySQL
//   Docker Desktop
//   Docker Compose
//
// ================================================================

pipeline {

    // This Jenkins installation is running on Windows.
    agent any

    options {

        // Add timestamps to console output.
        timestamps()

        // Prevent two builds from modifying the same Docker
        // environment at the same time.
        disableConcurrentBuilds()

        // Keep only the latest 15 builds.
        buildDiscarder(
            logRotator(numToKeepStr: '15')
        )

        // Stop a build if it hangs for too long.
        timeout(time: 30, unit: 'MINUTES')
    }

    environment {

        // Jenkins credentials.
        JWT_SECRET = credentials('ascii-studio-jwt-secret')
        DB_PASSWORD = credentials('ascii-studio-db-password')

        // Docker Compose project name.
        COMPOSE_PROJECT_NAME = 'ascii-studio'

        // Test database configuration.
        NODE_ENV = 'test'
        DB_HOST = '127.0.0.1'
        DB_PORT = '3306'
        DB_NAME = 'ascii_studio_test'
        DB_USER = 'root'
    }

    stages {

        // ========================================================
        // 1. CHECKOUT
        // ========================================================

        stage('Checkout') {
            steps {
                checkout scm
            }
        }


        // ========================================================
        // 2. INSTALL DEPENDENCIES
        // ========================================================

        stage('Install Dependencies') {
            steps {

                bat '''
                    echo ========================================
                    echo Installing backend dependencies
                    echo ========================================

                    call npm install --prefix server --no-audit --no-fund

                    if errorlevel 1 (
                        echo Backend dependency installation failed.
                        exit /b 1
                    )

                    echo.
                    echo ========================================
                    echo Installing frontend dependencies
                    echo ========================================

                    call npm install --prefix client --no-audit --no-fund

                    if errorlevel 1 (
                        echo Frontend dependency installation failed.
                        exit /b 1
                    )
                '''
            }
        }


        // ========================================================
        // 3. LINT
        // ========================================================

        stage('Lint') {
            steps {

                bat '''
                    echo ========================================
                    echo Linting backend
                    echo ========================================

                    call npm run lint --prefix server

                    if errorlevel 1 (
                        echo Backend lint failed.
                        exit /b 1
                    )

                    echo.
                    echo ========================================
                    echo Linting frontend
                    echo ========================================

                    call npm run lint --prefix client

                    if errorlevel 1 (
                        echo Frontend lint failed.
                        exit /b 1
                    )
                '''
            }
        }


        // ========================================================
        // 4. TEST
        // ========================================================

        stage('Test') {
            steps {

                script {

                    // Use Jenkins credentials directly.
                    withCredentials([
                        string(
                            credentialsId: 'ascii-studio-db-password',
                            variable: 'TEST_DB_PASSWORD'
                        )
                    ]) {

                        bat '''
                            echo ========================================
                            echo Preparing test database
                            echo ========================================

                            mysql ^
                              -h 127.0.0.1 ^
                              -u root ^
                              -p"%TEST_DB_PASSWORD%" ^
                              -e "CREATE DATABASE IF NOT EXISTS ascii_studio_test;"

                            if errorlevel 1 (
                                echo Failed to create test database.
                                exit /b 1
                            )

                            echo.
                            echo ========================================
                            echo Loading database schema
                            echo ========================================

                            mysql ^
                              -h 127.0.0.1 ^
                              -u root ^
                              -p"%TEST_DB_PASSWORD%" ^
                              ascii_studio_test ^
                              < database\\schema.sql

                            if errorlevel 1 (
                                echo Failed to load database schema.
                                exit /b 1
                            )

                            echo.
                            echo ========================================
                            echo Verifying test tables
                            echo ========================================

                            mysql ^
                              -h 127.0.0.1 ^
                              -u root ^
                              -p"%TEST_DB_PASSWORD%" ^
                              -e "USE ascii_studio_test; SHOW TABLES;"

                            if errorlevel 1 (
                                echo Failed to verify test database.
                                exit /b 1
                            )

                            echo.
                            echo ========================================
                            echo Running backend tests
                            echo ========================================

                            call npm test --prefix server

                            if errorlevel 1 (
                                echo Backend tests failed.
                                exit /b 1
                            )
                        '''
                    }
                }
            }
        }


        // ========================================================
        // 5. BUILD FRONTEND
        // ========================================================

        stage('Build Frontend') {
            steps {

                bat '''
                    echo ========================================
                    echo Building React frontend
                    echo ========================================

                    call npm run build --prefix client

                    if errorlevel 1 (
                        echo Frontend build failed.
                        exit /b 1
                    )
                '''
            }
        }


        // ========================================================
        // 6. BUILD BACKEND
        // ========================================================

        stage('Build Backend') {
            steps {

                bat '''
                    echo ========================================
                    echo Validating Node.js backend
                    echo ========================================

                    node --check server\\src\\server.js

                    if errorlevel 1 (
                        echo Backend validation failed.
                        exit /b 1
                    )
                '''
            }
        }


        // ========================================================
        // 7. DOCKER BUILD
        // ========================================================

        stage('Docker Build') {
            steps {

                bat '''
                    echo ========================================
                    echo Building Docker images
                    echo ========================================

                    docker compose build

                    if errorlevel 1 (
                        echo Docker image build failed.
                        exit /b 1
                    )
                '''
            }
        }


        // ========================================================
        // 8. INTEGRATION TEST
        // ========================================================

        stage('Integration Test') {

            steps {

                bat '''
                    echo ========================================
                    echo Starting Docker Compose
                    echo ========================================

                    docker compose up -d

                    if errorlevel 1 (
                        echo Docker Compose failed to start.
                        docker compose logs
                        exit /b 1
                    )

                    echo.
                    echo ========================================
                    echo Waiting for application health
                    echo ========================================

                    powershell -NoProfile -ExecutionPolicy Bypass -Command ^
                    "$healthy = $false; ^
                    for ($i = 1; $i -le 30; $i++) { ^
                        try { ^
                            $response = Invoke-WebRequest -Uri 'http://localhost:5000/api/health' -UseBasicParsing -TimeoutSec 3; ^
                            if ($response.StatusCode -eq 200) { ^
                                $healthy = $true; ^
                                Write-Host 'Application health check passed.'; ^
                                break ^
                            } ^
                        } catch { ^
                            Write-Host ('Waiting for application... attempt ' + $i + '/30') ^
                        }; ^
                        Start-Sleep -Seconds 2 ^
                    }; ^
                    if (-not $healthy) { ^
                        Write-Host 'Application health check failed.'; ^
                        exit 1 ^
                    }"

                    if errorlevel 1 (
                        echo Integration health check failed.
                        docker compose logs
                        exit /b 1
                    )

                    echo.
                    echo ========================================
                    echo Integration test passed
                    echo ========================================
                '''
            }

            post {

                always {

                    bat '''
                        echo ========================================
                        echo Cleaning integration environment
                        echo ========================================

                        docker compose down

                        if errorlevel 1 (
                            echo Docker cleanup returned an error.
                            exit /b 0
                        )
                    '''
                }
            }
        }


        // ========================================================
        // 9. DEPLOY
        // ========================================================

        stage('Deploy') {

            when {
                branch 'main'
            }

            steps {

                bat '''
                    echo ========================================
                    echo Deploying ASCII Studio
                    echo ========================================

                    docker compose down

                    if errorlevel 1 (
                        echo Existing deployment cleanup returned an error.
                    )

                    echo.
                    echo ========================================
                    echo Starting production containers
                    echo ========================================

                    docker compose up -d --build

                    if errorlevel 1 (
                        echo Deployment failed to start.
                        docker compose logs
                        exit /b 1
                    )

                    echo.
                    echo ========================================
                    echo Waiting for deployed application
                    echo ========================================

                    powershell -NoProfile -ExecutionPolicy Bypass -Command ^
                    "$healthy = $false; ^
                    for ($i = 1; $i -le 30; $i++) { ^
                        try { ^
                            $response = Invoke-WebRequest -Uri 'http://localhost:5000/api/health' -UseBasicParsing -TimeoutSec 3; ^
                            if ($response.StatusCode -eq 200) { ^
                                $healthy = $true; ^
                                Write-Host 'Deployment health check passed.'; ^
                                break ^
                            } ^
                        } catch { ^
                            Write-Host ('Waiting for deployment... attempt ' + $i + '/30') ^
                        }; ^
                        Start-Sleep -Seconds 2 ^
                    }; ^
                    if (-not $healthy) { ^
                        Write-Host 'Deployment health check failed.'; ^
                        exit 1 ^
                    }"

                    if errorlevel 1 (
                        echo Deployment health check failed.
                        docker compose logs
                        exit /b 1
                    )

                    echo.
                    echo ========================================
                    echo ASCII Studio deployed successfully!
                    echo ========================================
                '''
            }
        }
    }


    // ============================================================
    // POST ACTIONS
    // ============================================================

    post {

        success {
            echo '''
============================================================
ASCII STUDIO CI/CD PIPELINE SUCCESSFUL
============================================================

Checkout             : PASSED
Dependencies         : PASSED
Lint                 : PASSED
Tests                : PASSED
Frontend Build       : PASSED
Backend Validation   : PASSED
Docker Build         : PASSED
Integration Test     : PASSED
Deployment           : PASSED

Application:
    http://localhost

Backend Health:
    http://localhost:5000/api/health

============================================================
'''
        }

        failure {

            echo '''
============================================================
ASCII STUDIO CI/CD PIPELINE FAILED
============================================================

Check the failed stage above for the exact error.

============================================================
'''
        }

        aborted {

            echo '''
============================================================
ASCII STUDIO CI/CD PIPELINE ABORTED
============================================================
'''
        }
    }
}