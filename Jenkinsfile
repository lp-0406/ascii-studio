// ASCII Studio - Jenkins CI/CD Pipeline
//
// Works on Linux or Windows agents. Detects the agent OS at runtime
// and switches between `sh` (Linux/macOS) and `bat` (Windows) so the
// same Jenkinsfile runs on either kind of node.
//
// Required Jenkins tools/plugins (see docs/jenkins.md for full setup):
//   - NodeJS plugin (a "NodeJS" tool named "node20" configured in
//     Manage Jenkins > Tools), OR Node.js preinstalled on the agent
//   - Docker installed on the agent (and the agent user has permission
//     to run `docker`/`docker compose`)
//   - Git plugin
//   - Credentials plugin (for JWT_SECRET / DB_PASSWORD, injected via
//     Jenkins Credentials, never hardcoded)
//
// Secrets: JWT_SECRET, DB_PASSWORD, DB_ROOT_PASSWORD are pulled from
// Jenkins credentials at runtime via the `environment` block below.
// Create these as "Secret text" credentials in Jenkins with the IDs
// referenced here before running the pipeline.

pipeline {
    agent any

    options {
        timestamps()
        disableConcurrentBuilds()
        buildDiscarder(logRotator(numToKeepStr: '15'))
    }

    environment {
        // Pulled from Jenkins Credentials Manager - never hardcoded.
        JWT_SECRET     = credentials('ascii-studio-jwt-secret')
        DB_PASSWORD    = credentials('ascii-studio-db-password')
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
                NODE_ENV    = 'test'
                DB_HOST     = 'localhost'
                DB_PORT     = '3306'
                DB_NAME     = 'ascii_studio_test'
                DB_USER     = 'root'
            }
            steps {
                script {
                    if (isUnix()) {
                        sh '''
                            mysql -h 127.0.0.1 -u root -e "CREATE DATABASE IF NOT EXISTS ascii_studio_test;"
                            mysql -h 127.0.0.1 -u root ascii_studio_test < database/schema.sql
                        '''
                        sh 'npm test --prefix server'
                    } else {
                        bat 'mysql -h 127.0.0.1 -u root -e "CREATE DATABASE IF NOT EXISTS ascii_studio_test;"'
                        bat 'mysql -h 127.0.0.1 -u root ascii_studio_test < database\\schema.sql'
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
                // The backend has no separate compile step (plain Node.js),
                // but this stage validates the entrypoint loads cleanly.
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
                            curl -f http://localhost:5000/api/health || (docker compose logs && exit 1)
                        '''
                    } else {
                        bat 'docker compose up -d'
                        bat 'timeout /t 15'
                        bat 'curl -f http://localhost:5000/api/health || (docker compose logs && exit /b 1)'
                    }
                }
            }
            post {
                always {
                    script {
                        if (isUnix()) {
                            sh 'docker compose down'
                        } else {
                            bat 'docker compose down'
                        }
                    }
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
                            timeout /t 15
                            curl -f http://localhost:5000/api/health
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
            script {
                if (isUnix()) {
                    sh 'docker compose down || true'
                } else {
                    bat 'docker compose down || exit 0'
                }
            }
        }
    }
}
