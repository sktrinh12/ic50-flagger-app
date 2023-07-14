# Geomean Flagger

### Introduction:

FastAPI + ReactJS app that displays geomean and individual IC50 values for biochemical and cellular data. Samples can be flagged to either include or exclude from the geomean calculation. The calculation involves this simple aggregate:

```sql
ROUND( POWER(10,
               AVG( LOG(10, t3.ic50) ) OVER(PARTITION BY
                    t3.CRO,
                    t3.ASSAY_TYPE,
                    t3.COMPOUND_ID,
                    t3.TARGET,
                    t3.VARIANT,
                    t3.COFACTORS,
                    t3.flag
                )) * TO_NUMBER('1.0e+09'), 1) AS GEOMEAN
```

The samples are partitioned by these fields. Users want to be able to pick and choose which samples from which experiments they can include or exclude from this aggregate calculation a separate application was developed to achieve this result.

### Commands:

The app is initially deployed manually using console (Helm) and then using Jenkins CI tool for future changes. The GitHub repo has a web-hook attached and will build upon git pushes.
Add ECR repository: `aws ecr create-repository --repository-name ${NAME_OF_APP} --image-scanning-configuration scanOnPush=true`

#### Frontend:

- `docker build -t frontend -f Dockerfile.prod .`
- `docker tag frontend:latest $(cat ~/Documents/security_files/aws-console).dkr.ecr.us-west-2.amazonaws.com/geomean-flagger-frontend`
- `ecrpush geomean-flagger-frontend`
- `kubectl rollout restart deploy/frontend-deploy -n gmean-flag`

#### Backend:

The backend consists of a fastapi python application that writes a dynamic string to pass as a SQL query and execute using the Oracle_cx library.

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

### Update sql datasource

The biochemical & cellular geomean SQL statement is extracted from http://sql-ds.kinnate
service and formatted properly to render in the app. If changes were made to the SQL
source on the Dotmatics side, use this endpoint to update the SQL:
`http://geomean.backend.kinnate/v1/update_sql_ds`. Restarting the pods will alsoachieve the same result since it will retrieve the SQL on start-up. **Test the sql-datasource service after making changes to the SQL on the DM side**
