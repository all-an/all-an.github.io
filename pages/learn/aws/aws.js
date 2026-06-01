// Each entry: short name, full name, category key, category label, folder url, one-line description.
const DATA = [
  // Compute
  {n:"EC2", s:"Elastic Compute Cloud", cat:"compute", cl:"Compute", url:"001-ec2/", d:"Resizable virtual machines in the cloud."},
  {n:"Lambda", s:"AWS Lambda", cat:"compute", cl:"Compute", url:"002-lambda/", d:"Run code without provisioning servers (functions-as-a-service)."},
  {n:"ECS", s:"Elastic Container Service", cat:"compute", cl:"Compute", url:"003-ecs/", d:"AWS-native container orchestration."},
  {n:"EKS", s:"Elastic Kubernetes Service", cat:"compute", cl:"Compute", url:"004-eks/", d:"Managed Kubernetes control plane."},
  {n:"Fargate", s:"AWS Fargate", cat:"compute", cl:"Compute", url:"005-fargate/", d:"Serverless compute for ECS and EKS containers."},
  {n:"Lightsail", s:"Amazon Lightsail", cat:"compute", cl:"Compute", url:"006-lightsail/", d:"Simple pre-priced VPS for small workloads."},
  {n:"Beanstalk", s:"Elastic Beanstalk", cat:"compute", cl:"Compute", url:"007-elastic-beanstalk/", d:"PaaS that deploys app code onto managed EC2."},
  {n:"Batch", s:"AWS Batch", cat:"compute", cl:"Compute", url:"008-batch/", d:"Batch job scheduling at scale."},
  {n:"App Runner", s:"AWS App Runner", cat:"compute", cl:"Compute", url:"009-app-runner/", d:"Fully managed container app deployment from source or image."},
  {n:"Outposts", s:"AWS Outposts", cat:"compute", cl:"Compute", url:"010-outposts/", d:"Run AWS services on hardware in your own data center."},

  // Storage
  {n:"S3", s:"Simple Storage Service", cat:"storage", cl:"Storage", url:"011-s3/", d:"Object storage with virtually unlimited capacity."},
  {n:"EBS", s:"Elastic Block Store", cat:"storage", cl:"Storage", url:"012-ebs/", d:"Persistent block storage volumes for EC2."},
  {n:"EFS", s:"Elastic File System", cat:"storage", cl:"Storage", url:"013-efs/", d:"Elastic managed NFS file system."},
  {n:"FSx", s:"Amazon FSx", cat:"storage", cl:"Storage", url:"014-fsx/", d:"Managed file systems (Windows, Lustre, NetApp ONTAP, OpenZFS)."},
  {n:"Glacier", s:"S3 Glacier", cat:"storage", cl:"Storage", url:"015-s3-glacier/", d:"Low-cost archival storage with minutes-to-hours retrieval."},
  {n:"Storage Gateway", s:"AWS Storage Gateway", cat:"storage", cl:"Storage", url:"016-storage-gateway/", d:"On-prem appliance that fronts S3/EBS as local storage."},
  {n:"Backup", s:"AWS Backup", cat:"storage", cl:"Storage", url:"017-backup/", d:"Centralized backup across AWS services."},
  {n:"Snow", s:"AWS Snow Family", cat:"storage", cl:"Storage", url:"018-snow-family/", d:"Physical devices for offline data transfer (Snowcone, Snowball, Snowmobile)."},
  {n:"DataSync", s:"AWS DataSync", cat:"storage", cl:"Storage", url:"019-datasync/", d:"Online data transfer to and from AWS."},
  {n:"Transfer", s:"AWS Transfer Family", cat:"storage", cl:"Storage", url:"020-transfer-family/", d:"Managed SFTP / FTPS / FTP into S3 and EFS."},
  {n:"DRS", s:"Elastic Disaster Recovery", cat:"storage", cl:"Storage", url:"021-elastic-disaster-recovery/", d:"Server-level disaster recovery (formerly CloudEndure)."},

  // Database
  {n:"RDS", s:"Relational Database Service", cat:"database", cl:"Database", url:"022-rds/", d:"Managed relational databases (MySQL, Postgres, MariaDB, Oracle, SQL Server)."},
  {n:"Aurora", s:"Amazon Aurora", cat:"database", cl:"Database", url:"023-aurora/", d:"High-performance cloud-native MySQL / Postgres engine."},
  {n:"DynamoDB", s:"Amazon DynamoDB", cat:"database", cl:"Database", url:"024-dynamodb/", d:"Managed key-value and document NoSQL database."},
  {n:"ElastiCache", s:"Amazon ElastiCache", cat:"database", cl:"Database", url:"025-elasticache/", d:"Managed in-memory cache (Redis, Memcached)."},
  {n:"MemoryDB", s:"Amazon MemoryDB", cat:"database", cl:"Database", url:"026-memorydb/", d:"Durable Redis-compatible in-memory database."},
  {n:"Neptune", s:"Amazon Neptune", cat:"database", cl:"Database", url:"027-neptune/", d:"Managed graph database (Gremlin, SPARQL)."},
  {n:"DocumentDB", s:"Amazon DocumentDB", cat:"database", cl:"Database", url:"028-documentdb/", d:"MongoDB-compatible document database."},
  {n:"Keyspaces", s:"Amazon Keyspaces", cat:"database", cl:"Database", url:"029-keyspaces/", d:"Managed Apache Cassandra-compatible store."},
  {n:"Timestream", s:"Amazon Timestream", cat:"database", cl:"Database", url:"030-timestream/", d:"Purpose-built time-series database."},
  {n:"QLDB", s:"Quantum Ledger Database", cat:"database", cl:"Database", url:"031-qldb/", d:"Append-only ledger with cryptographic verifiability."},
  {n:"Redshift", s:"Amazon Redshift", cat:"database", cl:"Database", url:"032-redshift/", d:"Managed petabyte-scale analytics data warehouse."},

  // Networking & Content Delivery
  {n:"VPC", s:"Virtual Private Cloud", cat:"network", cl:"Networking", url:"033-vpc/", d:"Isolated virtual networks inside AWS."},
  {n:"CloudFront", s:"Amazon CloudFront", cat:"network", cl:"Networking", url:"034-cloudfront/", d:"Global CDN with edge caching."},
  {n:"Route 53", s:"Amazon Route 53", cat:"network", cl:"Networking", url:"035-route-53/", d:"Managed DNS and domain registration."},
  {n:"API Gateway", s:"Amazon API Gateway", cat:"network", cl:"Networking", url:"036-api-gateway/", d:"Managed REST, HTTP, and WebSocket APIs."},
  {n:"Direct Connect", s:"AWS Direct Connect", cat:"network", cl:"Networking", url:"037-direct-connect/", d:"Dedicated private line into AWS."},
  {n:"App Mesh", s:"AWS App Mesh", cat:"network", cl:"Networking", url:"038-app-mesh/", d:"Envoy-based service mesh for microservices."},
  {n:"Global Accelerator", s:"AWS Global Accelerator", cat:"network", cl:"Networking", url:"039-global-accelerator/", d:"Anycast static IPs routing to the optimal endpoint."},
  {n:"Transit Gateway", s:"AWS Transit Gateway", cat:"network", cl:"Networking", url:"040-transit-gateway/", d:"Hub-and-spoke router for VPCs and on-prem."},
  {n:"Cloud Map", s:"AWS Cloud Map", cat:"network", cl:"Networking", url:"041-cloud-map/", d:"Service discovery for cloud resources."},
  {n:"PrivateLink", s:"AWS PrivateLink", cat:"network", cl:"Networking", url:"042-privatelink/", d:"Private VPC endpoints to AWS services and SaaS."},
  {n:"Network Firewall", s:"AWS Network Firewall", cat:"network", cl:"Networking", url:"043-network-firewall/", d:"Managed stateful firewall for VPCs."},
  {n:"ELB", s:"Elastic Load Balancing", cat:"network", cl:"Networking", url:"044-elastic-load-balancing/", d:"L4 / L7 load balancers (ALB, NLB, GWLB)."},
  {n:"VPC Lattice", s:"Amazon VPC Lattice", cat:"network", cl:"Networking", url:"045-vpc-lattice/", d:"Application networking across VPCs and accounts."},

  // Security, Identity & Compliance
  {n:"IAM", s:"Identity and Access Management", cat:"security", cl:"Security", url:"046-iam/", d:"Users, roles, and policies for AWS access."},
  {n:"Identity Center", s:"IAM Identity Center", cat:"security", cl:"Security", url:"047-iam-identity-center/", d:"SSO across AWS accounts and SaaS apps (formerly AWS SSO)."},
  {n:"Cognito", s:"Amazon Cognito", cat:"security", cl:"Security", url:"048-cognito/", d:"User pools and identity federation for apps."},
  {n:"KMS", s:"Key Management Service", cat:"security", cl:"Security", url:"049-kms/", d:"Managed encryption keys, integrates with most AWS services."},
  {n:"Secrets Manager", s:"AWS Secrets Manager", cat:"security", cl:"Security", url:"050-secrets-manager/", d:"Secret storage with rotation hooks."},
  {n:"ACM", s:"AWS Certificate Manager", cat:"security", cl:"Security", url:"051-certificate-manager/", d:"Free public and private TLS certificates."},
  {n:"Shield", s:"AWS Shield", cat:"security", cl:"Security", url:"052-shield/", d:"Managed DDoS protection."},
  {n:"WAF", s:"AWS WAF", cat:"security", cl:"Security", url:"053-waf/", d:"Web app firewall for CloudFront, ALB, and API Gateway."},
  {n:"GuardDuty", s:"Amazon GuardDuty", cat:"security", cl:"Security", url:"054-guardduty/", d:"ML-based threat detection across AWS logs."},
  {n:"Inspector", s:"Amazon Inspector", cat:"security", cl:"Security", url:"055-inspector/", d:"Vulnerability scanner for EC2, ECR images, and Lambda."},
  {n:"Macie", s:"Amazon Macie", cat:"security", cl:"Security", url:"056-macie/", d:"Discovers and classifies sensitive data in S3."},
  {n:"Detective", s:"Amazon Detective", cat:"security", cl:"Security", url:"057-detective/", d:"Investigates security findings using graph analysis."},
  {n:"Security Hub", s:"AWS Security Hub", cat:"security", cl:"Security", url:"058-security-hub/", d:"Aggregates security findings across services."},
  {n:"Audit Manager", s:"AWS Audit Manager", cat:"security", cl:"Security", url:"059-audit-manager/", d:"Continuous compliance evidence collection."},
  {n:"Firewall Manager", s:"AWS Firewall Manager", cat:"security", cl:"Security", url:"060-firewall-manager/", d:"Centrally manage WAF, Shield, and Network Firewall."},
  {n:"Artifact", s:"AWS Artifact", cat:"security", cl:"Security", url:"061-artifact/", d:"Self-serve compliance reports (SOC, ISO, PCI, etc.)."},
  {n:"CloudHSM", s:"AWS CloudHSM", cat:"security", cl:"Security", url:"062-cloudhsm/", d:"Dedicated hardware security modules."},
  {n:"Directory Service", s:"AWS Directory Service", cat:"security", cl:"Security", url:"063-directory-service/", d:"Managed Microsoft Active Directory."},
  {n:"Verified Access", s:"AWS Verified Access", cat:"security", cl:"Security", url:"064-verified-access/", d:"VPN-less app access with identity-aware policies."},
  {n:"Verified Permissions", s:"Amazon Verified Permissions", cat:"security", cl:"Security", url:"065-verified-permissions/", d:"Fine-grained authorization with the Cedar policy language."},
  {n:"RAM", s:"Resource Access Manager", cat:"security", cl:"Security", url:"066-resource-access-manager/", d:"Share resources across AWS accounts."},

  // Management & Governance
  {n:"CloudWatch", s:"Amazon CloudWatch", cat:"mgmt", cl:"Management", url:"067-cloudwatch/", d:"Metrics, logs, alarms, and dashboards."},
  {n:"CloudTrail", s:"AWS CloudTrail", cat:"mgmt", cl:"Management", url:"068-cloudtrail/", d:"Audit log of every AWS API call."},
  {n:"Config", s:"AWS Config", cat:"mgmt", cl:"Management", url:"069-config/", d:"Records resource configuration history and compliance."},
  {n:"CloudFormation", s:"AWS CloudFormation", cat:"mgmt", cl:"Management", url:"070-cloudformation/", d:"Infrastructure as code via JSON / YAML templates."},
  {n:"SSM", s:"Systems Manager", cat:"mgmt", cl:"Management", url:"071-systems-manager/", d:"Patch, run commands, parameter store, session manager."},
  {n:"Organizations", s:"AWS Organizations", cat:"mgmt", cl:"Management", url:"072-organizations/", d:"Multi-account management and service control policies."},
  {n:"Control Tower", s:"AWS Control Tower", cat:"mgmt", cl:"Management", url:"073-control-tower/", d:"Landing-zone setup for multi-account AWS."},
  {n:"Trusted Advisor", s:"AWS Trusted Advisor", cat:"mgmt", cl:"Management", url:"074-trusted-advisor/", d:"Cost, security, and performance recommendations."},
  {n:"Service Catalog", s:"AWS Service Catalog", cat:"mgmt", cl:"Management", url:"075-service-catalog/", d:"Curated catalogs of pre-approved IaC products."},
  {n:"License Manager", s:"AWS License Manager", cat:"mgmt", cl:"Management", url:"076-license-manager/", d:"Track BYOL software licenses."},
  {n:"Compute Optimizer", s:"AWS Compute Optimizer", cat:"mgmt", cl:"Management", url:"077-compute-optimizer/", d:"ML-driven right-sizing recommendations."},
  {n:"Health", s:"AWS Health Dashboard", cat:"mgmt", cl:"Management", url:"078-health-dashboard/", d:"Account-personalized service health events."},
  {n:"Resource Groups", s:"AWS Resource Groups", cat:"mgmt", cl:"Management", url:"079-resource-groups/", d:"Group resources by tags for bulk operations."},
  {n:"Proton", s:"AWS Proton", cat:"mgmt", cl:"Management", url:"080-proton/", d:"Self-service IaC templates for platform teams."},
  {n:"Chatbot", s:"AWS Chatbot", cat:"mgmt", cl:"Management", url:"081-chatbot/", d:"Pipe alerts to Slack, Teams, and Chime."},
  {n:"Managed Grafana", s:"Amazon Managed Grafana", cat:"mgmt", cl:"Management", url:"082-managed-grafana/", d:"Fully managed Grafana service."},
  {n:"Managed Prometheus", s:"Amazon Managed Service for Prometheus", cat:"mgmt", cl:"Management", url:"083-managed-prometheus/", d:"Managed Prometheus-compatible time-series database."},

  // Developer Tools
  {n:"CodeCommit", s:"AWS CodeCommit", cat:"devtools", cl:"Dev Tools", url:"084-codecommit/", d:"Managed git repositories."},
  {n:"CodeBuild", s:"AWS CodeBuild", cat:"devtools", cl:"Dev Tools", url:"085-codebuild/", d:"Managed CI build runners."},
  {n:"CodeDeploy", s:"AWS CodeDeploy", cat:"devtools", cl:"Dev Tools", url:"086-codedeploy/", d:"Automated deployments to EC2, ECS, and Lambda."},
  {n:"CodePipeline", s:"AWS CodePipeline", cat:"devtools", cl:"Dev Tools", url:"087-codepipeline/", d:"Build / test / deploy pipeline orchestration."},
  {n:"CodeArtifact", s:"AWS CodeArtifact", cat:"devtools", cl:"Dev Tools", url:"088-codeartifact/", d:"Managed package repositories (npm, Maven, PyPI, NuGet)."},
  {n:"CodeGuru", s:"Amazon CodeGuru", cat:"devtools", cl:"Dev Tools", url:"089-codeguru/", d:"Automated code review and runtime profiling."},
  {n:"Cloud9", s:"AWS Cloud9", cat:"devtools", cl:"Dev Tools", url:"090-cloud9/", d:"Browser-based IDE backed by EC2."},
  {n:"CloudShell", s:"AWS CloudShell", cat:"devtools", cl:"Dev Tools", url:"091-cloudshell/", d:"Pre-authenticated shell in the AWS Console."},
  {n:"X-Ray", s:"AWS X-Ray", cat:"devtools", cl:"Dev Tools", url:"092-x-ray/", d:"Distributed tracing for serverless and microservices."},
  {n:"CodeWhisperer", s:"Amazon CodeWhisperer", cat:"devtools", cl:"Dev Tools", url:"093-codewhisperer/", d:"AI code completion in IDEs (now part of Amazon Q)."},
  {n:"App Composer", s:"AWS Application Composer", cat:"devtools", cl:"Dev Tools", url:"094-application-composer/", d:"Visual designer for serverless apps."},

  // Analytics
  {n:"Athena", s:"Amazon Athena", cat:"analytics", cl:"Analytics", url:"095-athena/", d:"Serverless SQL queries against data in S3."},
  {n:"EMR", s:"Elastic MapReduce", cat:"analytics", cl:"Analytics", url:"096-emr/", d:"Managed Spark, Hadoop, Hive, and Presto clusters."},
  {n:"OpenSearch", s:"Amazon OpenSearch Service", cat:"analytics", cl:"Analytics", url:"097-opensearch-service/", d:"Managed OpenSearch / Elasticsearch."},
  {n:"Kinesis", s:"Amazon Kinesis", cat:"analytics", cl:"Analytics", url:"098-kinesis/", d:"Real-time streaming data (Streams, Firehose, Analytics, Video)."},
  {n:"MSK", s:"Managed Streaming for Kafka", cat:"analytics", cl:"Analytics", url:"099-msk/", d:"Managed Apache Kafka clusters."},
  {n:"QuickSight", s:"Amazon QuickSight", cat:"analytics", cl:"Analytics", url:"100-quicksight/", d:"Cloud BI dashboards."},
  {n:"Glue", s:"AWS Glue", cat:"analytics", cl:"Analytics", url:"101-glue/", d:"Serverless ETL and data catalog."},
  {n:"Lake Formation", s:"AWS Lake Formation", cat:"analytics", cl:"Analytics", url:"102-lake-formation/", d:"Build and govern data lakes on S3."},
  {n:"Data Exchange", s:"AWS Data Exchange", cat:"analytics", cl:"Analytics", url:"103-data-exchange/", d:"Marketplace for third-party datasets."},
  {n:"FinSpace", s:"Amazon FinSpace", cat:"analytics", cl:"Analytics", url:"104-finspace/", d:"Data and analytics for financial services."},
  {n:"Clean Rooms", s:"AWS Clean Rooms", cat:"analytics", cl:"Analytics", url:"105-clean-rooms/", d:"Collaborate on datasets without sharing raw data."},
  {n:"DataZone", s:"Amazon DataZone", cat:"analytics", cl:"Analytics", url:"106-datazone/", d:"Data governance and discovery across the organization."},

  // Application Integration
  {n:"SQS", s:"Simple Queue Service", cat:"integration", cl:"Integration", url:"107-sqs/", d:"Managed message queues."},
  {n:"SNS", s:"Simple Notification Service", cat:"integration", cl:"Integration", url:"108-sns/", d:"Pub/sub messaging and mobile push notifications."},
  {n:"SES", s:"Simple Email Service", cat:"integration", cl:"Integration", url:"109-ses/", d:"Bulk and transactional email."},
  {n:"EventBridge", s:"Amazon EventBridge", cat:"integration", cl:"Integration", url:"110-eventbridge/", d:"Serverless event bus with SaaS integrations."},
  {n:"Step Functions", s:"AWS Step Functions", cat:"integration", cl:"Integration", url:"111-step-functions/", d:"State-machine orchestration for workflows."},
  {n:"MQ", s:"Amazon MQ", cat:"integration", cl:"Integration", url:"112-mq/", d:"Managed ActiveMQ and RabbitMQ brokers."},
  {n:"AppFlow", s:"Amazon AppFlow", cat:"integration", cl:"Integration", url:"113-appflow/", d:"No-code SaaS data integrations."},
  {n:"AppSync", s:"AWS AppSync", cat:"integration", cl:"Integration", url:"114-appsync/", d:"Managed GraphQL APIs."},
  {n:"Pinpoint", s:"Amazon Pinpoint", cat:"integration", cl:"Integration", url:"115-pinpoint/", d:"Multi-channel customer engagement (push, email, SMS)."},

  // Containers
  {n:"ECR", s:"Elastic Container Registry", cat:"containers", cl:"Containers", url:"116-ecr/", d:"Managed container image registry."},
  {n:"App2Container", s:"AWS App2Container", cat:"containers", cl:"Containers", url:"117-app2container/", d:"Converts running .NET / Java apps into containers."},
  {n:"Copilot", s:"AWS Copilot CLI", cat:"containers", cl:"Containers", url:"118-copilot/", d:"CLI to provision and deploy containerized apps to ECS / Fargate."},

  // Migration & Transfer
  {n:"DMS", s:"Database Migration Service", cat:"migration", cl:"Migration", url:"119-dms/", d:"Continuous database migration and replication."},
  {n:"Migration Hub", s:"AWS Migration Hub", cat:"migration", cl:"Migration", url:"120-migration-hub/", d:"Single dashboard for migration progress across tools."},
  {n:"MGN", s:"Application Migration Service", cat:"migration", cl:"Migration", url:"121-application-migration-service/", d:"Lift-and-shift server migration."},
  {n:"ADS", s:"Application Discovery Service", cat:"migration", cl:"Migration", url:"122-application-discovery-service/", d:"Inventory and dependency mapping of on-prem servers."},
  {n:"Mainframe", s:"AWS Mainframe Modernization", cat:"migration", cl:"Migration", url:"123-mainframe-modernization/", d:"Migrate and run mainframe apps on AWS."},

  // Machine Learning
  {n:"SageMaker", s:"Amazon SageMaker", cat:"ml", cl:"ML / AI", url:"124-sagemaker/", d:"End-to-end ML platform: train, deploy, MLOps."},
  {n:"Bedrock", s:"Amazon Bedrock", cat:"ml", cl:"ML / AI", url:"125-bedrock/", d:"API access to foundation models (Claude, Llama, Mistral, …)."},
  {n:"Q", s:"Amazon Q", cat:"ml", cl:"ML / AI", url:"126-q/", d:"GenAI assistant for AWS and your business data."},
  {n:"Comprehend", s:"Amazon Comprehend", cat:"ml", cl:"ML / AI", url:"127-comprehend/", d:"NLP service: entities, sentiment, classification."},
  {n:"Rekognition", s:"Amazon Rekognition", cat:"ml", cl:"ML / AI", url:"128-rekognition/", d:"Image and video analysis."},
  {n:"Textract", s:"Amazon Textract", cat:"ml", cl:"ML / AI", url:"129-textract/", d:"Extracts text, tables, and forms from documents."},
  {n:"Transcribe", s:"Amazon Transcribe", cat:"ml", cl:"ML / AI", url:"130-transcribe/", d:"Speech-to-text."},
  {n:"Translate", s:"Amazon Translate", cat:"ml", cl:"ML / AI", url:"131-translate/", d:"Neural machine translation."},
  {n:"Polly", s:"Amazon Polly", cat:"ml", cl:"ML / AI", url:"132-polly/", d:"Text-to-speech."},
  {n:"Lex", s:"Amazon Lex", cat:"ml", cl:"ML / AI", url:"133-lex/", d:"Conversational chatbots (powers Alexa)."},
  {n:"Personalize", s:"Amazon Personalize", cat:"ml", cl:"ML / AI", url:"134-personalize/", d:"Real-time personalized recommendations."},
  {n:"Forecast", s:"Amazon Forecast", cat:"ml", cl:"ML / AI", url:"135-forecast/", d:"Time-series forecasting service."},
  {n:"Fraud Detector", s:"Amazon Fraud Detector", cat:"ml", cl:"ML / AI", url:"136-fraud-detector/", d:"ML-based online fraud detection."},
  {n:"Kendra", s:"Amazon Kendra", cat:"ml", cl:"ML / AI", url:"137-kendra/", d:"Enterprise search with ML ranking."},
  {n:"A2I", s:"Augmented AI", cat:"ml", cl:"ML / AI", url:"138-augmented-ai/", d:"Human review workflows for ML predictions."},
  {n:"HealthLake", s:"Amazon HealthLake", cat:"ml", cl:"ML / AI", url:"139-healthlake/", d:"FHIR-based health data store with ML insights."},

  // IoT
  {n:"IoT Core", s:"AWS IoT Core", cat:"iot", cl:"IoT", url:"140-iot-core/", d:"MQTT / HTTPS broker connecting devices to AWS."},
  {n:"Greengrass", s:"AWS IoT Greengrass", cat:"iot", cl:"IoT", url:"141-iot-greengrass/", d:"Run Lambda and ML at the edge."},
  {n:"IoT Analytics", s:"AWS IoT Analytics", cat:"iot", cl:"IoT", url:"142-iot-analytics/", d:"Storage and analytics for IoT data."},
  {n:"Device Defender", s:"AWS IoT Device Defender", cat:"iot", cl:"IoT", url:"143-iot-device-defender/", d:"Audit and monitor IoT security posture."},
  {n:"Device Management", s:"AWS IoT Device Management", cat:"iot", cl:"IoT", url:"144-iot-device-management/", d:"Onboard, organize, and update device fleets."},
  {n:"IoT Events", s:"AWS IoT Events", cat:"iot", cl:"IoT", url:"145-iot-events/", d:"Detect and respond to events from IoT sensors."},
  {n:"FleetWise", s:"AWS IoT FleetWise", cat:"iot", cl:"IoT", url:"146-iot-fleetwise/", d:"Collect and standardize vehicle data."},
  {n:"SiteWise", s:"AWS IoT SiteWise", cat:"iot", cl:"IoT", url:"147-iot-sitewise/", d:"Industrial equipment data collection."},
  {n:"TwinMaker", s:"AWS IoT TwinMaker", cat:"iot", cl:"IoT", url:"148-iot-twinmaker/", d:"Build digital twins of physical systems."},
  {n:"FreeRTOS", s:"Amazon FreeRTOS", cat:"iot", cl:"IoT", url:"149-freertos/", d:"Open-source microcontroller RTOS."},

  // Media Services
  {n:"Elastic Transcoder", s:"Amazon Elastic Transcoder", cat:"media", cl:"Media", url:"150-elastic-transcoder/", d:"Media file transcoding (legacy)."},
  {n:"MediaConvert", s:"AWS Elemental MediaConvert", cat:"media", cl:"Media", url:"151-mediaconvert/", d:"File-based video transcoding."},
  {n:"MediaLive", s:"AWS Elemental MediaLive", cat:"media", cl:"Media", url:"152-medialive/", d:"Live video encoding."},
  {n:"MediaPackage", s:"AWS Elemental MediaPackage", cat:"media", cl:"Media", url:"153-mediapackage/", d:"Video packaging and origin."},
  {n:"MediaStore", s:"AWS Elemental MediaStore", cat:"media", cl:"Media", url:"154-mediastore/", d:"Optimized object storage for media."},
  {n:"MediaTailor", s:"AWS Elemental MediaTailor", cat:"media", cl:"Media", url:"155-mediatailor/", d:"Personalized ad insertion in video."},
  {n:"MediaConnect", s:"AWS Elemental MediaConnect", cat:"media", cl:"Media", url:"156-mediaconnect/", d:"Live video transport."},
  {n:"IVS", s:"Amazon Interactive Video Service", cat:"media", cl:"Media", url:"157-interactive-video-service/", d:"Low-latency live streaming."},
  {n:"Nimble Studio", s:"Amazon Nimble Studio", cat:"media", cl:"Media", url:"158-nimble-studio/", d:"Virtual production studio in the cloud."},

  // End User Computing & Business Apps
  {n:"WorkSpaces", s:"Amazon WorkSpaces", cat:"euc", cl:"End User", url:"159-workspaces/", d:"Managed cloud desktops."},
  {n:"AppStream", s:"Amazon AppStream 2.0", cat:"euc", cl:"End User", url:"160-appstream/", d:"Stream desktop applications from AWS."},
  {n:"WorkMail", s:"Amazon WorkMail", cat:"euc", cl:"End User", url:"161-workmail/", d:"Managed business email and calendaring."},
  {n:"WorkDocs", s:"Amazon WorkDocs", cat:"euc", cl:"End User", url:"162-workdocs/", d:"Document storage and collaboration."},
  {n:"Chime", s:"Amazon Chime", cat:"euc", cl:"End User", url:"163-chime/", d:"Meetings, voice, video (SDK and consumer app)."},
  {n:"Connect", s:"Amazon Connect", cat:"euc", cl:"End User", url:"164-connect/", d:"Cloud contact center."},
  {n:"Wickr", s:"AWS Wickr", cat:"euc", cl:"End User", url:"165-wickr/", d:"End-to-end encrypted messaging."},
  {n:"Supply Chain", s:"AWS Supply Chain", cat:"euc", cl:"End User", url:"166-supply-chain/", d:"Cloud-native supply chain visibility."},

  // Frontend Web & Mobile
  {n:"Amplify", s:"AWS Amplify", cat:"frontend", cl:"Frontend", url:"167-amplify/", d:"Full-stack web / mobile framework and hosting."},
  {n:"Device Farm", s:"AWS Device Farm", cat:"frontend", cl:"Frontend", url:"168-device-farm/", d:"Test on real mobile / web devices in the cloud."},
  {n:"Location", s:"Amazon Location Service", cat:"frontend", cl:"Frontend", url:"169-location-service/", d:"Maps, geocoding, and routing."},

  // Game Tech
  {n:"GameLift", s:"Amazon GameLift", cat:"game", cl:"Game Tech", url:"170-gamelift/", d:"Dedicated game server hosting."},

  // Robotics
  {n:"RoboMaker", s:"AWS RoboMaker", cat:"robotics", cl:"Robotics", url:"171-robomaker/", d:"Cloud robotics simulation and deployment (ROS)."},

  // Satellite
  {n:"Ground Station", s:"AWS Ground Station", cat:"satellite", cl:"Satellite", url:"172-ground-station/", d:"Satellite-as-a-service ground stations."},

  // Quantum
  {n:"Braket", s:"Amazon Braket", cat:"quantum", cl:"Quantum", url:"173-braket/", d:"Quantum computing service across multiple hardware vendors."},

  // Blockchain
  {n:"Managed Blockchain", s:"Amazon Managed Blockchain", cat:"blockchain", cl:"Blockchain", url:"174-managed-blockchain/", d:"Managed Hyperledger Fabric and Ethereum networks."},
];

// Maps a category key to its chip color class.
const catClass = {
  compute:"cat-compute", storage:"cat-storage", database:"cat-database", network:"cat-network",
  security:"cat-security", mgmt:"cat-mgmt", devtools:"cat-devtools", analytics:"cat-analytics",
  integration:"cat-integration", containers:"cat-containers", migration:"cat-migration", ml:"cat-ml",
  iot:"cat-iot", media:"cat-media", euc:"cat-euc", frontend:"cat-frontend",
  game:"cat-game", robotics:"cat-robotics", satellite:"cat-satellite", quantum:"cat-quantum",
  blockchain:"cat-blockchain",
};

// Navigates to a service's detail page.
function openService(url) {
  location.href = url;
}

// Filters DATA by the search box and category dropdown, then paints the table.
function render() {
  const q = document.getElementById('search').value.toLowerCase();
  const cat = document.getElementById('catFilter').value;
  let rows = DATA;
  if (cat) rows = rows.filter(d => d.cat === cat);
  if (q) rows = rows.filter(d => (d.n + d.s + d.cl + d.d).toLowerCase().includes(q));
  document.getElementById('count').textContent = rows.length + ' services';
  document.getElementById('noResults').style.display = rows.length ? 'none' : 'block';
  document.getElementById('tbody').innerHTML = rows.map((d, i) => `
    <tr${d.url ? ` class="clickable" onclick="openService('${d.url}')"` : ''}>
      <td><span class="idx">${i + 1}</span></td>
      <td><span class="code">${d.n}</span></td>
      <td><div class="service">${d.url ? `<a href="${d.url}" onclick="event.stopPropagation()">${d.s}</a>` : d.s}</div></td>
      <td><span class="cat ${catClass[d.cat]}">${d.cl}</span></td>
      <td><span class="desc">${d.d}</span></td>
    </tr>`).join('');
}

// Re-render on every search keystroke or category change.
document.getElementById('search').addEventListener('input', render);
document.getElementById('catFilter').addEventListener('change', render);
render();
