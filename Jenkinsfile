apps = ['frontend', 'backend']
pipeline {
    agent { 
        kubernetes{
            inheritFrom 'jenkins-slave'
        }
    }
    environment{
        AWSID = credentials('AWSID')
        GITHUB_PAT = credentials('github-kinnate-secret-text')
        DOCKER_PSW = credentials('DOCKER_PASSWORD')
        ORACLE_HOST = 'dotoradb.fount'
        ORACLE_PORT = 1521
        ORACLE_SID = credentials('ORACLE_SID')
        ORACLE_USER = credentials('ORACLE_USER')
        ORACLE_PASS = credentials('ORACLE_PASS')
        REDIS_PASSWD = credentials('REDIS_PASSWD')
        DOCKER_CONFIG = "${WORKSPACE}/docker.config"
        ENV = 'PROD'
        NAMESPACE = 'gmeanflag'
        APP_NAME = 'geomean-ic50-flagger'
        AWS_PAGER = ''
    }

    stages {
        stage('docker login') {
            steps {
                script {
                    withCredentials([aws(credentialsId: 'awscredentials', region: 'us-west-2')]) {
                    sh '''
                        aws ecr get-login-password \
                        --region us-west-2 \
                        | docker login --username AWS \
                        --password-stdin $AWSID.dkr.ecr.us-west-2.amazonaws.com
                       '''
                    }
                }
            }
        }
        
        stage('s3 bucket download') {
            steps {
            withAWS(credentials:'awscredentials', region: 'us-west-2') {
                s3Download(file: 'instantclient-basiclite-linux.x64-12.2.0.1.0.zip', bucket: 'fount-data', path: 'DevOps/instantclient-basiclite-linux.x64-12.2.0.1.0.zip')
                s3Download(file: 'instantclient-sdk-linux.x64-12.2.0.1.0.zip', bucket: 'fount-data', path: 'DevOps/instantclient-sdk-linux.x64-12.2.0.1.0.zip')
            }
            }
        }

        
        stage('docker build backend') {
            steps{
               sh( label: 'Docker Build Backend', script:
               '''
                #!/bin/bash
                set -x
                docker build \
                --no-cache --network=host --build-arg ORACLE_HOST=${ORACLE_HOST} --build-arg ENV=${ENV} \
                --build-arg ORACLE_PORT=${ORACLE_PORT} --build-arg ORACLE_SID=${ORACLE_SID} --build-arg ORACLE_USER=${ORACLE_USER} \
                --build-arg ORACLE_PASS=${ORACLE_PASS} --build-arg DB_TYPE=PROD --build-arg REDIS_PASSWD=${REDIS_PASSWD} \
                --build-arg REDIS_HOST=redis.kinnate -t ${AWSID}.dkr.ecr.us-west-2.amazonaws.com/geomean-flagger-backend:latest \
                -f ${WORKSPACE}/${APP_NAME}/backend/Dockerfile.prod .
                ''', returnStdout: true
                )
                
            }
        }
        
        stage('docker build frontend') {
            when { expression { params.BUILD_FRONTEND.toString().toLowerCase() == 'true' }
            }
            steps{
                sh( label: 'Docker Build Frontend', script:
                '''
                #!/bin/bash
                set -x
                docker build \
                --no-cache --network=host \
                --build-arg REACT_APP_BACKEND_URL=http://geomean.backend.kinnate:8000 \
                --build-arg REACT_APP_FRONTEND_URL=http://geomean.frontend.kinnate \
                -t $AWSID.dkr.ecr.us-west-2.amazonaws.com/geomean-flagger-frontend:latest \
                -f $WORKSPACE/${APP_NAME}/frontend/Dockerfile.prod .
                ''', returnStdout: true
                )
            }
        }
        
    
        stage('docker push to ecr') {
            steps {
                if (BUILD_FRONTEND) {
                    sh(label: 'ECR docker push frontend', script:
                    '''
                    docker push $AWSID.dkr.ecr.us-west-2.amazonaws.com/geomean-flagger-frontend:latest
                    ''', returnStdout: true
                    )
                }
                sh(label: 'ECR docker push backend', script:
                '''
                docker push $AWSID.dkr.ecr.us-west-2.amazonaws.com/geomean-flagger-backend:latest
                ''', returnStdout: true
                )
            }
        }
        
        stage('deploy') {
                agent {
                    kubernetes {
                      yaml '''
                        apiVersion: v1
                        kind: Pod
                        spec:
                          containers:
                          - name: helm
                            image: alpine/helm:3.11.1
                            command:
                            - cat
                            tty: true
                        '''
                        }
            }
            steps{
                container('helm') {
                sh script: '''
                #!/bin/bash
                cd $WORKSPACE
                curl -LO https://storage.googleapis.com/kubernetes-release/release/\$(curl -s https://storage.googleapis.com/kubernetes-release/release/stable.txt)/bin/linux/amd64/kubectl
                chmod +x ./kubectl
                if ./kubectl get namespace $NAMESPACE > /dev/null 2>&1; then
                  echo "Namespace $NAMESPACE already exists"
                  ./kubectl rollout restart deploy/geomean-flagger-backend-deploy -n $NAMESPACE
                  sleep 5
                  if $BUILD_FRONTEND;  then
                      ./kubectl rollout restart deploy/geomean-flagger-frontend-deploy -n $NAMESPACE
                  else
                     echo "Skipping frontend rollout"
                  fi
                else
                  echo "Namespace $NAMESPACE does not exist; deploy using helm"
                  ./kubectl create ns $NAMESPACE
                  git clone https://github.com/sktrinh12/helm-basic-app-chart.git
                  cd helm-basic-app-chart
                  helm install k8sapp-geomean-flagger-backend . --set service.namespace=$NAMESPACE \
                  --set service.port=8000 --set service.targetPort=8000 --set nameOverride=geomean-flagger-backend \
                  --set fullnameOverride=geomean-flagger-backend --set namespace=${NAMESPACE} \
                  --set image.repository=${AWSID}.dkr.ecr.us-west-2.amazonaws.com/geomean-flagger-backend \
                  --set image.tag=latest --set containers.name=fastapi \
                  --set containers.ports.containerPort=8000 --set app=geomean \
                  --set terminationGracePeriodSeconds=10 --set service.type=LoadBalancer
                  sleep 2
                  if $BUILD_FRONTEND;  then
                      helm install k8sapp-geomean-flagger-frontend . --set service.namespace=$NAMESPACE \
                      --set service.port=80 --set service.targetPort=80 --set nameOverride=geomean-flagger-frontend \
                      --set fullnameOverride=geomean-flagger-frontend --set namespace=${NAMESPACE} \
                      --set image.repository=${AWSID}.dkr.ecr.us-west-2.amazonaws.com/geomean-flagger-frontend \
                      --set image.tag=latest --set containers.name=react \
                      --set containers.ports.containerPort=80 --set app=geomean \
                      --set terminationGracePeriodSeconds=10 --set service.type=LoadBalancer
                  else
                     echo "Skipping frontend helm build"
                  fi
                fi
                '''

            }
        }
    }
    
    stage ('purge ecr untagged images') {
            steps {
                withCredentials([aws(credentialsId: 'awscredentials', region: 'us-west-2')]) {
                    loop_ecr_purge(apps)
                }
            }
        }
        
    
    }
}

def loop_ecr_purge(list) {
    for (int i = 0; i < list.size(); i++) {
        sh """aws ecr list-images \
        --repository-name geomean-flagger-${list[i]} \
        --filter 'tagStatus=UNTAGGED' \
        --query 'imageIds[].imageDigest' \
        --output json \
        | jq -r '.[]' \
        | xargs -I{} aws ecr batch-delete-image \
        --repository-name geomean-flagger-${list[i]} \
        --image-ids imageDigest={} 
        """
        sh 'sleep 3'
    }
}
