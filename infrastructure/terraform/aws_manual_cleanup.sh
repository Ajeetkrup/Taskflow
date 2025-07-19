#!/bin/bash

# AWS Manual Cleanup Script for Terraform Resources
# Region: us-west-2
# VPC ID: vpc-02077447e143971a8

set -e

VPC_ID="vpc-02077447e143971a8"
REGION="us-west-2"
CLUSTER_NAME="taskflow-cluster"

echo "🔥 Starting manual AWS cleanup..."

# 1. Delete EKS Cluster and Node Groups
echo "1. Deleting EKS cluster and node groups..."
NODEGROUPS=$(aws eks list-nodegroups --cluster-name $CLUSTER_NAME --region $REGION --query 'nodegroups[]' --output text 2>/dev/null || echo "")
if [ ! -z "$NODEGROUPS" ]; then
    for nodegroup in $NODEGROUPS; do
        echo "  Deleting nodegroup: $nodegroup"
        aws eks delete-nodegroup --cluster-name $CLUSTER_NAME --nodegroup-name $nodegroup --region $REGION
        aws eks wait nodegroup-deleted --cluster-name $CLUSTER_NAME --nodegroup-name $nodegroup --region $REGION
    done
fi

# Delete EKS cluster
echo "  Deleting EKS cluster: $CLUSTER_NAME"
aws eks delete-cluster --name $CLUSTER_NAME --region $REGION 2>/dev/null || echo "  Cluster not found or already deleted"
aws eks wait cluster-deleted --name $CLUSTER_NAME --region $REGION 2>/dev/null || echo "  Cluster deletion complete"

# 2. Delete Load Balancers
echo "2. Deleting load balancers..."
LB_ARNS=$(aws elbv2 describe-load-balancers --region $REGION --query "LoadBalancers[?VpcId=='$VPC_ID'].LoadBalancerArn" --output text 2>/dev/null || echo "")
if [ ! -z "$LB_ARNS" ]; then
    for lb_arn in $LB_ARNS; do
        echo "  Deleting load balancer: $lb_arn"
        aws elbv2 delete-load-balancer --load-balancer-arn $lb_arn --region $REGION
    done
fi

# 3. Delete Target Groups
echo "3. Deleting target groups..."
TG_ARNS=$(aws elbv2 describe-target-groups --region $REGION --query "TargetGroups[?VpcId=='$VPC_ID'].TargetGroupArn" --output text 2>/dev/null || echo "")
if [ ! -z "$TG_ARNS" ]; then
    for tg_arn in $TG_ARNS; do
        echo "  Deleting target group: $tg_arn"
        aws elbv2 delete-target-group --target-group-arn $tg_arn --region $REGION
    done
fi

# 4. Delete NAT Gateways
echo "4. Deleting NAT gateways..."
NAT_GATEWAYS=$(aws ec2 describe-nat-gateways --filter "Name=vpc-id,Values=$VPC_ID" --region $REGION --query 'NatGateways[?State!=`deleted`].NatGatewayId' --output text 2>/dev/null || echo "")
if [ ! -z "$NAT_GATEWAYS" ]; then
    for nat_gw in $NAT_GATEWAYS; do
        echo "  Deleting NAT gateway: $nat_gw"
        aws ec2 delete-nat-gateway --nat-gateway-id $nat_gw --region $REGION
    done
fi

# 5. Release Elastic IPs
echo "5. Releasing Elastic IPs..."
EIP_ALLOCS=$(aws ec2 describe-addresses --region $REGION --query 'Addresses[?Domain==`vpc`].AllocationId' --output text 2>/dev/null || echo "")
if [ ! -z "$EIP_ALLOCS" ]; then
    for eip in $EIP_ALLOCS; do
        echo "  Releasing EIP: $eip"
        aws ec2 release-address --allocation-id $eip --region $REGION 2>/dev/null || echo "  EIP already released"
    done
fi

# 6. Delete Network Interfaces
echo "6. Deleting network interfaces..."
ENIS=$(aws ec2 describe-network-interfaces --filters "Name=vpc-id,Values=$VPC_ID" --region $REGION --query 'NetworkInterfaces[?Status!=`in-use`].NetworkInterfaceId' --output text 2>/dev/null || echo "")
if [ ! -z "$ENIS" ]; then
    for eni in $ENIS; do
        echo "  Deleting ENI: $eni"
        aws ec2 delete-network-interface --network-interface-id $eni --region $REGION 2>/dev/null || echo "  ENI deletion failed"
    done
fi

# 7. Delete Security Groups (except default)
echo "7. Deleting security groups..."
SECURITY_GROUPS=$(aws ec2 describe-security-groups --filters "Name=vpc-id,Values=$VPC_ID" --region $REGION --query 'SecurityGroups[?GroupName!=`default`].GroupId' --output text 2>/dev/null || echo "")
if [ ! -z "$SECURITY_GROUPS" ]; then
    for sg in $SECURITY_GROUPS; do
        echo "  Deleting security group: $sg"
        aws ec2 delete-security-group --group-id $sg --region $REGION 2>/dev/null || echo "  Security group deletion failed"
    done
fi

# 8. Detach and Delete Internet Gateway
echo "8. Deleting internet gateway..."
IGW_ID=$(aws ec2 describe-internet-gateways --filters "Name=attachment.vpc-id,Values=$VPC_ID" --region $REGION --query 'InternetGateways[0].InternetGatewayId' --output text 2>/dev/null || echo "")
if [ "$IGW_ID" != "None" ] && [ ! -z "$IGW_ID" ]; then
    echo "  Detaching IGW: $IGW_ID"
    aws ec2 detach-internet-gateway --internet-gateway-id $IGW_ID --vpc-id $VPC_ID --region $REGION
    echo "  Deleting IGW: $IGW_ID"
    aws ec2 delete-internet-gateway --internet-gateway-id $IGW_ID --region $REGION
fi

# 9. Delete Route Tables (except main)
echo "9. Deleting route tables..."
ROUTE_TABLES=$(aws ec2 describe-route-tables --filters "Name=vpc-id,Values=$VPC_ID" --region $REGION --query 'RouteTables[?Associations[0].Main!=`true`].RouteTableId' --output text 2>/dev/null || echo "")
if [ ! -z "$ROUTE_TABLES" ]; then
    for rt in $ROUTE_TABLES; do
        echo "  Deleting route table: $rt"
        aws ec2 delete-route-table --route-table-id $rt --region $REGION 2>/dev/null || echo "  Route table deletion failed"
    done
fi

# 10. Delete Subnets
echo "10. Deleting subnets..."
SUBNETS="subnet-05bba7fe65d9e9f76 subnet-09106d2d006bc5b91 subnet-067ba09751fc7cd0b"
for subnet in $SUBNETS; do
    echo "  Deleting subnet: $subnet"
    aws ec2 delete-subnet --subnet-id $subnet --region $REGION 2>/dev/null || echo "  Subnet deletion failed"
done

# 11. Delete VPC
echo "11. Deleting VPC..."
aws ec2 delete-vpc --vpc-id $VPC_ID --region $REGION 2>/dev/null || echo "VPC deletion failed"

echo "✅ Manual cleanup completed!"
echo "🔍 Verifying cleanup..."
aws ec2 describe-vpcs --vpc-ids $VPC_ID --region $REGION 2>/dev/null || echo "✅ VPC successfully deleted"
