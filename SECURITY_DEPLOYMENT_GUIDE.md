# Security & Deployment Guide

## 🔒 Security Implementation

### 1. **Input Validation & Sanitization** ✅

#### Validation Middleware (`backend/src/middleware/validation.ts`)
**Lines of Code**: ~700

**Features**:
- ✅ Comprehensive validation using `express-validator`
- ✅ HTML sanitization with `sanitize-html`
- ✅ SQL injection prevention
- ✅ XSS attack prevention
- ✅ MongoDB ID validation
- ✅ GeoJSON coordinates validation
- ✅ File upload validation

**Validators Implemented**:
- `validateCreateProject` - Project creation
- `validateUpdateProject` - Project updates
- `validateFileUpload` - File upload security
- `validateSingleTreeCalculation` - Carbon calculations
- `validateForestCalculation` - Forest calculations
- `validateRegister` - User registration
- `validateLogin` - User login
- `validateMintCredit` - Blockchain minting
- `validateCreateListing` - Marketplace listings
- `validatePagination` - Query parameters
- `validateAdminOverride` - Admin actions

**Security Middleware**:
- `preventSQLInjection()` - Blocks SQL injection attempts
- `preventXSS()` - Blocks XSS attempts
- `sanitizeInputs()` - Sanitizes all inputs recursively

**Usage Example**:
```typescript
router.post('/projects',
  authenticate,
  validateCreateProject,
  handleValidationErrors,
  sanitizeInputs,
  preventSQLInjection,
  preventXSS,
  createProjectHandler
);
```

---

### 2. **Smart Contract Security Audit** ✅

#### Security Features in Smart Contracts

**CarbonCreditNFT.sol**:
- ✅ OpenZeppelin security standards
- ✅ Access control (admin, verifier roles)
- ✅ Reentrancy protection
- ✅ Safe math operations
- ✅ Pausable in emergencies
- ✅ Non-upgradeable (immutable logic)

**CarbonRegistry.sol**:
- ✅ Role-based access control
- ✅ State validation checks
- ✅ Event logging for transparency
- ✅ Input validation
- ✅ Safe credit issuance

**CarbonMarketplace.sol**:
- ✅ Escrow mechanism
- ✅ Payment validation
- ✅ Bid verification
- ✅ Auction time checks
- ✅ Safe ERC-20 transfers

#### Automated Security Testing

**Slither Analysis** (CI/CD):
```yaml
- name: Run Slither Security Analysis
  uses: crytic/slither-action@v0.3.0
  with:
    target: 'contracts/'
```

**Mythril Analysis** (CI/CD):
```yaml
- name: Run Mythril Security Analysis
  uses: consensys/mythril-action@v1
  with:
    target: 'contracts/*.sol'
```

---

### 3. **API Endpoint Protection** ✅

#### Authentication & Authorization

**JWT Authentication**:
```typescript
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  jwt.verify(token, process.env.JWT_SECRET);
  // Attach user to request
};
```

**Role-Based Access Control**:
```typescript
const requireRole = (roles: string[]) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    next();
  };
};
```

#### Rate Limiting

**Global Rate Limit**:
```typescript
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // 100 requests per window
});
```

**API-Specific Limits**:
- Upload endpoints: 20 requests/hour
- AI processing: 10 requests/hour
- Authentication: 5 requests/minute

#### CORS Configuration

```typescript
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

#### Security Headers (Helmet.js)

```typescript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
```

---

### 4. **Environment Variable Management** ✅

#### Production Environment (.env.production)

```env
# Application
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://oceara.com

# Database (use secrets management)
MONGODB_URI=${MONGODB_URI}
REDIS_URL=${REDIS_URL}

# JWT (rotate regularly)
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRES_IN=7d

# Session
SESSION_SECRET=${SESSION_SECRET}

# OAuth
GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}

# Blockchain (use AWS Secrets Manager)
PRIVATE_KEY=${PRIVATE_KEY}
ETHEREUM_RPC_URL=${ETHEREUM_RPC_URL}

# Cloud Storage (use IAM roles)
AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}

# API Keys (rotate monthly)
GOOGLE_MAPS_API_KEY=${GOOGLE_MAPS_API_KEY}
NEXT_PUBLIC_MAPBOX_TOKEN=${NEXT_PUBLIC_MAPBOX_TOKEN}
PINATA_API_KEY=${PINATA_API_KEY}
```

#### Secrets Management

**AWS Secrets Manager**:
```bash
# Store secret
aws secretsmanager create-secret \
  --name oceara/production/jwt-secret \
  --secret-string "your-secret-here"

# Retrieve in application
const secret = await secretsManager.getSecretValue({
  SecretId: 'oceara/production/jwt-secret'
}).promise();
```

**Kubernetes Secrets**:
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: oceara-secrets
type: Opaque
data:
  jwt-secret: <base64-encoded>
  mongodb-uri: <base64-encoded>
```

---

## 🐳 Docker Containerization

### 1. **Multi-Stage Dockerfiles** ✅

#### Backend Dockerfile (`Dockerfile.backend`)

**Security Features**:
- ✅ Multi-stage build (smaller image)
- ✅ Non-root user (`nodejs:1001`)
- ✅ Security updates (`apk upgrade`)
- ✅ Read-only filesystem
- ✅ Health checks
- ✅ Signal handling (`dumb-init`)
- ✅ Production dependencies only

**Size**: ~150MB (optimized)

#### Frontend Dockerfile (`Dockerfile.frontend`)

**Security Features**:
- ✅ Multi-stage build
- ✅ Non-root user (`nextjs:1001`)
- ✅ Standalone build
- ✅ Static asset optimization
- ✅ Health checks

**Size**: ~200MB (optimized)

### 2. **Docker Compose Configuration** ✅

**Security Enhancements**:
```yaml
security_opt:
  - no-new-privileges:true
read_only: true
tmpfs:
  - /tmp
```

**Health Checks**:
```yaml
healthcheck:
  test: ["CMD", "node", "-e", "..."]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

**Dependency Management**:
```yaml
depends_on:
  mongodb:
    condition: service_healthy
  redis:
    condition: service_started
```

---

## 🚀 CI/CD Pipeline

### 1. **GitHub Actions Workflow** ✅

**File**: `.github/workflows/ci-cd.yml`

**Pipeline Stages**:

#### Stage 1: Security Audit
- npm audit (backend + frontend)
- Snyk security scan
- Dependency vulnerability check

#### Stage 2: Lint & Format
- ESLint (backend + frontend)
- TypeScript type checking
- Code style validation

#### Stage 3: Backend Tests
- Unit tests with coverage
- Integration tests
- MongoDB + Redis services
- Coverage upload to Codecov

#### Stage 4: Frontend Tests
- Component tests
- E2E tests (optional)
- Coverage reporting

#### Stage 5: Smart Contract Audit
- Slither static analysis
- Mythril security audit
- Gas optimization check

#### Stage 6: Docker Build
- Multi-arch builds
- Layer caching
- docker-compose validation
- Image security scan

#### Stage 7: Deploy Staging (develop branch)
- Build and push images
- SSH to staging server
- Rolling deployment
- Smoke tests

#### Stage 8: Deploy Production (main branch)
- Manual approval required
- Build and push to GHCR
- Blue-green deployment
- Health check verification
- Rollback on failure
- Slack notification

---

## 📊 Monitoring & Logging

### 1. **Prometheus Monitoring** ✅

**Metrics Collected**:
- HTTP request rate and duration
- API endpoint performance
- Database connection pool
- Redis cache hit rate
- Container CPU/memory
- Custom business metrics

**Configuration**: `monitoring/prometheus.yml`

### 2. **Alert Rules** ✅

**Critical Alerts**:
- Service down (> 2 minutes)
- High API error rate (> 5%)
- Disk space low (< 10%)
- Blockchain transaction failures

**Warning Alerts**:
- High response time (> 2s)
- High memory usage (> 90%)
- High CPU usage (> 80%)
- MongoDB connection issues

**Configuration**: `monitoring/alert_rules.yml`

### 3. **Grafana Dashboards** ✅

**Dashboards**:
- System overview
- API performance
- Database metrics
- Blockchain transactions
- User activity
- Error rates and logs

**Access**: https://monitoring.oceara.com/grafana

### 4. **Centralized Logging** ✅

**Winston Logger**:
```typescript
logger.info('Request', {
  requestId: req.requestId,
  method: req.method,
  url: req.url,
  userId: req.user?.id
});
```

**Log Levels**:
- `error` - Critical errors
- `warn` - Warnings
- `info` - General info
- `debug` - Debug info (dev only)

**Log Aggregation**:
- ELK Stack (Elasticsearch, Logstash, Kibana)
- Retention: 30 days

---

## 🔧 Deployment Process

### 1. **Local Development**

```bash
# Clone repository
git clone https://github.com/oceara/oceara-fullstack.git
cd oceara-fullstack

# Install dependencies
npm run install:all

# Setup environment
cp .env.example .env
# Fill in environment variables

# Start development
npm run dev
```

### 2. **Staging Deployment**

```bash
# Build and test
docker-compose -f docker-compose.staging.yml build

# Deploy to staging
docker-compose -f docker-compose.staging.yml up -d

# Run smoke tests
npm run test:smoke

# Check logs
docker-compose logs -f
```

### 3. **Production Deployment**

**Prerequisites**:
1. SSL certificates configured
2. Environment variables in secrets manager
3. Database backups automated
4. DNS configured

**Deployment Steps**:
```bash
# Pull latest images
docker-compose pull

# Backup database
npm run backup:db

# Deploy with zero downtime
docker-compose up -d --no-deps --build backend
docker-compose up -d --no-deps --build frontend

# Verify health
curl https://oceara.com/health

# Monitor logs
docker-compose logs -f --tail=100
```

**Rollback**:
```bash
# Rollback to previous version
docker-compose down
docker-compose up -d --no-deps oceara-backend:previous
docker-compose up -d --no-deps oceara-frontend:previous
```

### 4. **Blue-Green Deployment**

```bash
# Deploy to green environment
docker-compose -f docker-compose.green.yml up -d

# Run health checks
./scripts/health-check.sh green

# Switch traffic
./scripts/switch-traffic.sh green

# Monitor metrics
./scripts/monitor-deployment.sh

# Rollback if needed
./scripts/switch-traffic.sh blue
```

---

## 📋 Security Checklist

### Pre-Deployment Security Audit

- [ ] All dependencies updated
- [ ] Security vulnerabilities fixed
- [ ] Environment variables secured
- [ ] SSL certificates valid
- [ ] Firewall rules configured
- [ ] Rate limiting enabled
- [ ] CORS properly configured
- [ ] Input validation implemented
- [ ] SQL injection prevention active
- [ ] XSS prevention active
- [ ] CSRF protection enabled
- [ ] Authentication tested
- [ ] Authorization tested
- [ ] Smart contracts audited
- [ ] API endpoints secured
- [ ] Logs sanitized (no sensitive data)
- [ ] Monitoring alerts configured
- [ ] Backup strategy tested
- [ ] Disaster recovery plan documented
- [ ] Security headers configured

### Post-Deployment Verification

- [ ] All services healthy
- [ ] SSL/TLS working
- [ ] Authentication working
- [ ] API rate limits working
- [ ] Monitoring dashboards accessible
- [ ] Alerts triggering correctly
- [ ] Logs being collected
- [ ] Backups running
- [ ] Health checks passing
- [ ] Performance within SLAs

---

## 🔐 Security Best Practices

### 1. **Principle of Least Privilege**
- Use non-root users in containers
- Restrict database permissions
- Limit API key scopes
- Use read-only filesystems

### 2. **Defense in Depth**
- Multiple layers of security
- WAF (Web Application Firewall)
- DDoS protection
- Intrusion detection

### 3. **Regular Updates**
- Weekly dependency updates
- Monthly security patches
- Quarterly security audits
- Annual penetration testing

### 4. **Incident Response**
- Security incident playbook
- Automated alerting
- Log retention for forensics
- Backup and recovery tested

### 5. **Compliance**
- GDPR compliance (data protection)
- SOC 2 Type II (security controls)
- CCPA compliance (privacy)
- ISO 27001 (information security)

---

## 📞 Support & Maintenance

### Monitoring Access
- **Prometheus**: https://monitoring.oceara.com/prometheus
- **Grafana**: https://monitoring.oceara.com/grafana
- **Logs**: `docker-compose logs -f`

### Emergency Contacts
- **DevOps**: devops@oceara.com
- **Security**: security@oceara.com
- **On-call**: +1-xxx-xxx-xxxx

### Documentation
- API Docs: https://api.oceara.com/docs
- Security Policy: SECURITY.md
- Incident Response: INCIDENT_RESPONSE.md

---

**Status**: Production Ready ✅  
**Last Security Audit**: January 2025  
**Next Review**: April 2025
