# TaskFlow EKS Deployment - Manual Commands

# 1. Verify Prerequisites
echo "Verifying prerequisites..."
kubectl cluster-info
aws sts get-caller-identity

# 2. Get AWS Account Details
export AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
export AWS_REGION=$(aws configure get region)
echo "AWS Account: $AWS_ACCOUNT_ID | Region: $AWS_REGION"

# 3. Update Deployment Files with ECR URLs
echo "Updating deployment files..."
sed -i.bak "s|taskflow/|$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/taskflow/|g" infrastructure/k8s/deployments/user-deployment.yml
sed -i.bak "s|taskflow/|$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/taskflow/|g" infrastructure/k8s/deployments/task-deployment.yml
sed -i.bak "s|taskflow/|$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/taskflow/|g" infrastructure/k8s/deployments/analytics-deployment.yml
sed -i.bak "s|taskflow/|$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/taskflow/|g" infrastructure/k8s/deployments/notification-deployment.yml
sed -i.bak "s|taskflow/|$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/taskflow/|g" infrastructure/k8s/deployments/frontend-deployment.yml

# 4. Create Namespace
kubectl apply -f infrastructure/k8s/namespaces/taskflow-namespace.yml 

# 5. Deploy ConfigMaps and Secrets (if any)
kubectl apply -f infrastructure/k8s/configmaps/ || echo "No configmaps found"
kubectl apply -f infrastructure/k8s/secrets/ || echo "No secrets found"

# 6. Deploy Postgres and Redis
echo "Deploying postgres and redis..."
kubectl apply -f infrastructure/k8s/postgres-redis/

# 7. Deploy Services
echo "Deploying services..."
kubectl apply -f infrastructure/k8s/services/

# 8. Deploy Applications
echo "Deploying applications..."
kubectl apply -f infrastructure/k8s/deployments/

# 9. Wait for Deployments to be Ready
echo "Waiting for deployments to be ready..."
kubectl wait --for=condition=available --timeout=300s deployment/user-service -n taskflow
kubectl wait --for=condition=available --timeout=300s deployment/task-service -n taskflow
kubectl wait --for=condition=available --timeout=300s deployment/analytics-service -n taskflow
kubectl wait --for=condition=available --timeout=300s deployment/notification-service -n taskflow
kubectl wait --for=condition=available --timeout=300s deployment/frontend -n taskflow

# 10. Deploy Ingress
echo "Deploying ingress..."
kubectl apply -f infrastructure/k8s/ingress/ -n taskflow

# 11. Wait for LoadBalancer and Get Ingress URL
echo "Waiting for LoadBalancer provisioning..."
for i in {1..20}; do
    INGRESS_HOST=$(kubectl get ingress taskflow-ingress -n taskflow -o jsonpath='{.status.loadBalancer.ingress[0].hostname}' 2>/dev/null)
    if [ -n "$INGRESS_HOST" ]; then
        break
    fi
    echo "Waiting 15s for LoadBalancer... ($i/20)"
    sleep 15
done

# 12. Check for IP if hostname not found
if [ -z "$INGRESS_HOST" ]; then
    INGRESS_HOST=$(kubectl get ingress taskflow-ingress -n taskflow -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
fi

# 13. Display Results
if [ -n "$INGRESS_HOST" ]; then
    echo "================================"
    echo "Deployment Complete!"
    echo "================================"
    echo "Application URL: http://$INGRESS_HOST"
    echo ""
    echo "Add this to your /etc/hosts file:"
    echo "$INGRESS_HOST taskflow.local"
    echo ""
    echo "Then access your application at: http://taskflow.local"
else
    echo "Warning: Could not get ingress IP/hostname"
    echo "Check manually with: kubectl get ingress -n taskflow"
fi

# 14. Status Check Commands
echo ""
echo "Status Check Commands:"
echo "kubectl get pods -n taskflow"
echo "kubectl get services -n taskflow"
echo "kubectl get ingress -n taskflow"

# 15. Restore Original Files
echo "Restoring original deployment files..."
mv infrastructure/k8s/deployments/user-deployment.yml.bak infrastructure/k8s/deployments/user-deployment.yml 2>/dev/null || true
mv infrastructure/k8s/deployments/task-deployment.yml.bak infrastructure/k8s/deployments/task-deployment.yml 2>/dev/null || true
mv infrastructure/k8s/deployments/analytics-deployment.yml.bak infrastructure/k8s/deployments/analytics-deployment.yml 2>/dev/null || true
mv infrastructure/k8s/deployments/notification-deployment.yml.bak infrastructure/k8s/deployments/notification-deployment.yml 2>/dev/null || true
mv infrastructure/k8s/deployments/frontend-deployment.yml.bak infrastructure/k8s/deployments/frontend-deployment.yml 2>/dev/null || true

echo "Deployment process completed!"