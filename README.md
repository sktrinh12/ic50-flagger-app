# Geomean Flagger

### Commands:

#### Frontend:

- `docker build -t frontend -f Dockerfile.prod .`
- `docker tag frontend:latest $(cat ~/Documents/security_files/aws-console).dkr.ecr.us-west-2.amazonaws.com/geomean-flagger-frontend`
- `ecrpush geomean-flagger-frontend`
- `kubectl rollout restart deploy/frontend-deploy -n gmean-flag`

#### Backend:

- `docker build -t backend -f Dockerfile .`
- `docker tag backend:latest $(cat ~/Documents/security_files/aws-console).dkr.ecr.us-west-2.amazonaws.com/geomean-flagger-backend`
- `ecrpush geomean-flagger-backend`
- `kubectl rollout restart deploy/backend-deploy -n gmean-flag`

### Additional Commands:

- `helm install k8sapp-geomean-flagger-backend . --set service.namespace=gmean-flag --set service.port=8000 --set service.targetPort=8000 --set nameOverride=backend --set fullnameOverride=backend --set namespace=gmean-flag --set image.repository=$(cat ~/Documents/security_files/aws-console).dkr.ecr.us-west-2.amazonaws.com/geomean-flagger-backend --set image.tag=latest --set containers.name=fastapi --set containers.ports.containerPort=8000 --set app=geomean`
- `helm install k8sapp-geomean-flagger-frontend . --set service.namespace=gmean-flag --set service.port=3000 --set service.targetPort=3000 --set nameOverride=frontend --set fullnameOverride=frontend --set namespace=gmean-flag --set image.repository=$(cat ~/Documents/security_files/aws-console).dkr.ecr.us-west-2.amazonaws.com/geomean-flagger-frontend --set image.tag=latest --set containers.name=react --set containers.ports.containerPort=3000 --set app=geomean`
- `helm upgrade k8sapp-geomean-flagger-backend . --reuse-values --set service.annotations."service\.beta\.kubernetes\.io/aws-load-balancer-type"="external" --set service.annotations."service\.beta\.kubernetes\.io/aws-load-balancer-nlb-target-type"="ip" --set service.annotations."service\.beta\.kubernetes\.io/aws-load-balancer-scheme"="internet-facing" --set service.type=LoadBalancer` \*if you want to update some values
- you can use `--dry-run` and/or `--debug` and/or `--disable-openapi-validation` to ensure the chart works

## Local build and run

- To locally run the application run the following simple commands. Ensure you have `python 3` and `npm` installed.
- Also ensure to export the environmental variables. Check the `Jenkinsfile` to
  determine what are the environmental variables.

```
# open a new terminal
cd /path/to/backend
python main.py

# in separate terminal
cd /path/to/frontend
npm run start
```
