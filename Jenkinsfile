// ASCII Studio - Jenkins CI/CD Pipeline
//
// Supports Linux/macOS and Windows agents.
//
// Required Jenkins tools/plugins:
// - Git plugin
// - Credentials plugin
// - NodeJS plugin (optional if Node.js is already installed on the agent)
// - Docker installed and available to the Jenkins agent
//
// Jenkins Credentials required:
// - ascii-studio-jwt-secret
// - ascii-studio-db-password

pipeline {
    agent any

    options {
        timestamps()
        disableConcurrentBuilds()
        buildDiscarder(logRotator(numToKeepStr: '15'))
    }

    environment {
        JWT_SECRET = credentials('ascii-studio-jwt-secret')
        DB_PASSWORD = credentials('ascii-studio-db-password')
        COMPOSE_PROJECT_NAME = 'ascii-studio'
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                script {
                    if (isUnix()) {
                        sh 'npm install --prefix server --no-audit --no-fund'
                        sh 'npm install --prefix client --no-audit --no-fund'
                    } else {
                        bat 'npm install --prefix server --no-audit --no-fund'
                        bat 'npm install --prefix client --no-audit --no-fund'
                    }
                }
            }
        }

        stage('Lint') {
            steps {
                script {
                    if (isUnix()) {
                        sh 'npm run lint --prefix server'
                        sh 'npm run lint --prefix client'
                    } else {
                        bat 'npm run lint --prefix server'
                        bat 'npm run lint --prefix client'
                    }
                }
            }
        }

        stage('Test') {
            environment {
                NODE_ENV = 'test'
                DB_HOST = '127.0.0.1'
                DB_PORT = '3306'
                DB_NAME = 'ascii_studio_test'
                DB_USER = 'root'
            }

            steps {
                script {
                    if (isUnix()) {

                        sh '''
                            mysql -h 127.0.0.1 -u root -p"$DB_PASSWORD" \
                              -e "CREATE DATABASE IF NOT EXISTS ascii_studio_test;"

                            mysql -h 127.0.0.1 -u root -p"$DB_PASSWORD" \
                              ascii_studio_test < database/schema.sql
                        '''

                        sh 'npm test --prefix server'

                    } else {

                        bat '''
                            mysql -h 127.0.0.1 -u root -p"%DB_PASSWORD%" ^
                              -e "CREATE DATABASE IF NOT EXISTS ascii_studio_test;"

                            mysql -h 127.0.0.1 -u root -p"%DB_PASSWORD%" ^
                              ascii_studio_test < database\\schema.sql
                        '''

                        bat 'npm test --prefix server'
                    }
                }
            }
        }

        stage('Build Frontend') {
            steps {
                script {
                    if (isUnix()) {
                        sh 'npm run build --prefix client'
                    } else {
                        bat 'npm run build --prefix client'
                    }
                }
            }
        }

        stage('Build Backend') {
            steps {
                script {
                    if (isUnix()) {
                        sh 'node --check server/src/server.js'
                    } else {
                        bat 'node --check server\\src\\server.js'
                    }
                }
            }
        }

        stage('Docker Build') {
            steps {
                script {
                    if (isUnix()) {
                        sh 'docker compose build'
                    } else {
                        bat 'docker compose build'
                    }
                }
            }
        }

        stage('Integration Test (Docker Compose + Smoke Test)') {
            steps {
                script {
                    if (isUnix()) {

                        sh 'docker compose up -d'
                        sh 'sleep 15'

                        sh '''
                            curl -f http://localhost:5000/api/health \
                            || (docker compose logs && exit 1)
                        '''

                    } else {

                        bat 'docker compose up -d'
                        bat 'timeout /t 15 /nobreak'

                        bat '''
                            curl -f http://localhost:5000/api/health
                            if errorlevel 1 (
                                docker compose logs
                                exit /b 1
                            )
                        '''
                    }
                }
            }

            post {
                always {
                    // Jenkins is running on a Windows agent in this setup.
                    bat 'docker compose down || exit 0'
                }
            }
        }

        stage('Deploy') {
            when {
                branch 'main'
            }

            steps {
                script {
                    if (isUnix()) {

                        sh '''
                            docker compose down
                            docker compose up -d --build
                            sleep 15
                            curl -f http://localhost:5000/api/health
                        '''

                    } else {

                        bat '''
                            docker compose down
                            docker compose up -d --build
                            timeout /t 15 /nobreak
                            curl -f http://localhost:5000/api/health

                            if errorlevel 1 (
                                docker compose logs
                                exit /b 1
                            )
                        '''
                    }
                }
            }
        }
    }

    post {
        success {
            echo 'Pipeline completed successfully.'
        }

        failure {
            echo 'Pipeline failed - see stage logs above for the cause.'
        }

        always {
            // Windows Jenkins agent cleanup
            bat 'docker compose down || exit 0'
        }
    }
}