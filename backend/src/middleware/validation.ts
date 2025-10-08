/**
 * Input Validation and Sanitization Middleware
 * Comprehensive validation for all API inputs
 */

import { Request, Response, NextFunction } from 'express';
import { body, param, query, validationResult, ValidationChain } from 'express-validator';
import sanitizeHtml from 'sanitize-html';
import { logger } from '../utils/logger';

/**
 * Validation error handler
 */
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    logger.warn('Validation errors:', { errors: errors.array(), path: req.path });
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.type === 'field' ? (err as any).path : 'unknown',
        message: err.msg
      }))
    });
  }
  
  next();
};

/**
 * Sanitize string inputs
 */
export const sanitizeString = (value: string): string => {
  return sanitizeHtml(value, {
    allowedTags: [],
    allowedAttributes: {}
  }).trim();
};

/**
 * Sanitize object recursively
 */
export const sanitizeObject = (obj: any): any => {
  if (typeof obj === 'string') {
    return sanitizeString(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }
  
  if (obj && typeof obj === 'object') {
    const sanitized: any = {};
    for (const key in obj) {
      sanitized[key] = sanitizeObject(obj[key]);
    }
    return sanitized;
  }
  
  return obj;
};

/**
 * Sanitization middleware
 */
export const sanitizeInputs = (req: Request, res: Response, next: NextFunction) => {
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }
  
  if (req.params) {
    req.params = sanitizeObject(req.params);
  }
  
  next();
};

// ========== Project Validation ==========

export const validateCreateProject: ValidationChain[] = [
  body('name')
    .trim()
    .notEmpty().withMessage('Project name is required')
    .isLength({ min: 3, max: 200 }).withMessage('Project name must be 3-200 characters')
    .matches(/^[a-zA-Z0-9\s\-\_]+$/).withMessage('Project name contains invalid characters'),
  
  body('description')
    .trim()
    .notEmpty().withMessage('Description is required')
    .isLength({ min: 10, max: 2000 }).withMessage('Description must be 10-2000 characters'),
  
  body('projectType')
    .isIn(['restoration', 'conservation', 'afforestation', 'protection'])
    .withMessage('Invalid project type'),
  
  body('location.coordinates')
    .isArray({ min: 2, max: 2 }).withMessage('Coordinates must be [longitude, latitude]'),
  
  body('location.coordinates.*')
    .isFloat().withMessage('Coordinates must be numbers'),
  
  body('area.total')
    .isFloat({ min: 0.01, max: 1000000 }).withMessage('Area must be between 0.01 and 1,000,000 hectares'),
  
  body('country')
    .trim()
    .notEmpty().withMessage('Country is required')
    .isLength({ min: 2, max: 100 }).withMessage('Invalid country name'),
  
  body('ecosystemType')
    .isIn(['mangrove', 'wetland', 'seagrass', 'salt_marsh', 'mixed'])
    .withMessage('Invalid ecosystem type'),
  
  body('carbonData.estimatedSequestration')
    .isFloat({ min: 0 }).withMessage('Estimated sequestration must be positive'),
  
  body('vegetationData.totalTrees')
    .isInt({ min: 1 }).withMessage('Total trees must be at least 1')
];

export const validateUpdateProject: ValidationChain[] = [
  param('id').isMongoId().withMessage('Invalid project ID'),
  
  body('name')
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 }).withMessage('Project name must be 3-200 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 2000 }).withMessage('Description must be 10-2000 characters'),
  
  body('area.total')
    .optional()
    .isFloat({ min: 0.01 }).withMessage('Area must be positive')
];

// ========== Upload Validation ==========

export const validateFileUpload = (req: Request, res: Response, next: NextFunction) => {
  if (!req.file && !req.files) {
    return res.status(400).json({
      success: false,
      message: 'No file uploaded'
    });
  }
  
  const files = req.files as Express.Multer.File[] || [req.file as Express.Multer.File];
  
  // Validate file types
  const allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/tiff',
    'image/gif',
    'application/pdf',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv',
    'application/json',
    'application/vnd.google-earth.kml+xml',
    'application/zip'
  ];
  
  for (const file of files) {
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: `File type ${file.mimetype} not allowed`
      });
    }
    
    // Validate file size (100MB max)
    if (file.size > 100 * 1024 * 1024) {
      return res.status(400).json({
        success: false,
        message: 'File size exceeds 100MB limit'
      });
    }
  }
  
  next();
};

export const validateProjectId: ValidationChain[] = [
  body('projectId')
    .optional()
    .isMongoId().withMessage('Invalid project ID')
];

// ========== Carbon Calculation Validation ==========

export const validateSingleTreeCalculation: ValidationChain[] = [
  body('speciesType')
    .trim()
    .notEmpty().withMessage('Species type is required')
    .isIn([
      'rhizophora_mucronata',
      'rhizophora_apiculata',
      'avicennia_marina',
      'avicennia_officinalis',
      'bruguiera_gymnorrhiza',
      'sonneratia_alba',
      'mixed_species'
    ]).withMessage('Invalid species type'),
  
  body('dbh')
    .isFloat({ min: 0.1, max: 200 }).withMessage('DBH must be between 0.1 and 200 cm'),
  
  body('height')
    .isFloat({ min: 0.1, max: 50 }).withMessage('Height must be between 0.1 and 50 meters'),
  
  body('crownRadius')
    .optional()
    .isFloat({ min: 0, max: 20 }).withMessage('Crown radius must be between 0 and 20 meters'),
  
  body('age')
    .optional()
    .isInt({ min: 1, max: 200 }).withMessage('Age must be between 1 and 200 years'),
  
  body('healthScore')
    .optional()
    .isFloat({ min: 0, max: 100 }).withMessage('Health score must be between 0 and 100')
];

export const validateForestCalculation: ValidationChain[] = [
  body('trees')
    .isArray({ min: 1 }).withMessage('Trees array must contain at least 1 tree'),
  
  body('trees.*.speciesType')
    .trim()
    .notEmpty().withMessage('Each tree must have a species type'),
  
  body('trees.*.dbh')
    .isFloat({ min: 0.1, max: 200 }).withMessage('DBH must be between 0.1 and 200 cm'),
  
  body('trees.*.height')
    .isFloat({ min: 0.1, max: 50 }).withMessage('Height must be between 0.1 and 50 meters'),
  
  body('areaHectares')
    .isFloat({ min: 0.01, max: 1000000 }).withMessage('Area must be between 0.01 and 1,000,000 hectares')
];

// ========== User Validation ==========

export const validateRegister: ValidationChain[] = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters')
    .matches(/^[a-zA-Z\s]+$/).withMessage('Name can only contain letters and spaces'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain uppercase, lowercase, number, and special character'),
  
  body('role')
    .isIn(['landowner', 'buyer', 'admin']).withMessage('Invalid role')
];

export const validateLogin: ValidationChain[] = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Password is required')
];

// ========== Blockchain Validation ==========

export const validateMintCredit: ValidationChain[] = [
  body('projectId')
    .isMongoId().withMessage('Invalid project ID'),
  
  body('amount')
    .isFloat({ min: 0.01 }).withMessage('Amount must be positive'),
  
  body('metadata')
    .optional()
    .isObject().withMessage('Metadata must be an object')
];

export const validateCreateListing: ValidationChain[] = [
  body('tokenId')
    .notEmpty().withMessage('Token ID is required'),
  
  body('listingType')
    .isIn(['fixed_price', 'auction']).withMessage('Invalid listing type'),
  
  body('price')
    .notEmpty().withMessage('Price is required')
    .matches(/^\d+$/).withMessage('Price must be a valid wei amount')
];

// ========== Query Validation ==========

export const validatePagination: ValidationChain[] = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer')
    .toInt(),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
    .toInt()
];

export const validateSortOrder: ValidationChain[] = [
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc')
];

// ========== Admin Validation ==========

export const validateAdminOverride: ValidationChain[] = [
  body('calculationId')
    .notEmpty().withMessage('Calculation ID is required'),
  
  body('overrides')
    .isObject().withMessage('Overrides must be an object'),
  
  body('reason')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Reason must be max 500 characters')
];

// ========== MongoDB ID Validation ==========

export const validateMongoId = (paramName: string = 'id'): ValidationChain[] => [
  param(paramName).isMongoId().withMessage(`Invalid ${paramName}`)
];

// ========== Custom Validators ==========

export const isValidCoordinates = (value: any): boolean => {
  if (!Array.isArray(value) || value.length !== 2) {
    return false;
  }
  
  const [lon, lat] = value;
  return (
    typeof lon === 'number' &&
    typeof lat === 'number' &&
    lon >= -180 && lon <= 180 &&
    lat >= -90 && lat <= 90
  );
};

export const isValidGeoJSON = (value: any): boolean => {
  return (
    value &&
    value.type === 'Point' &&
    isValidCoordinates(value.coordinates)
  );
};

// ========== SQL Injection Prevention ==========

export const preventSQLInjection = (req: Request, res: Response, next: NextFunction) => {
  const sqlPatterns = [
    /(\%27)|(\')|(\-\-)|(\%23)|(#)/i,
    /((\%3D)|(=))[^\n]*((\%27)|(\')|(\-\-)|(\%3B)|(;))/i,
    /\w*((\%27)|(\'))((\%6F)|o|(\%4F))((\%72)|r|(\%52))/i,
    /((\%27)|(\'))union/i,
    /exec(\s|\+)+(s|x)p\w+/i
  ];
  
  const checkValue = (value: any): boolean => {
    if (typeof value === 'string') {
      return sqlPatterns.some(pattern => pattern.test(value));
    }
    return false;
  };
  
  const checkObject = (obj: any): boolean => {
    for (const key in obj) {
      if (checkValue(obj[key])) {
        return true;
      }
      if (typeof obj[key] === 'object') {
        if (checkObject(obj[key])) {
          return true;
        }
      }
    }
    return false;
  };
  
  if (
    checkObject(req.body) ||
    checkObject(req.query) ||
    checkObject(req.params)
  ) {
    logger.warn('SQL injection attempt detected', {
      ip: req.ip,
      path: req.path,
      method: req.method
    });
    
    return res.status(400).json({
      success: false,
      message: 'Invalid input detected'
    });
  }
  
  next();
};

// ========== XSS Prevention ==========

export const preventXSS = (req: Request, res: Response, next: NextFunction) => {
  const xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=\s*["']?[^"']*["']?/gi,
    /<iframe/gi,
    /<object/gi,
    /<embed/gi
  ];
  
  const checkValue = (value: any): boolean => {
    if (typeof value === 'string') {
      return xssPatterns.some(pattern => pattern.test(value));
    }
    return false;
  };
  
  const checkObject = (obj: any): boolean => {
    for (const key in obj) {
      if (checkValue(obj[key])) {
        return true;
      }
      if (typeof obj[key] === 'object') {
        if (checkObject(obj[key])) {
          return true;
        }
      }
    }
    return false;
  };
  
  if (
    checkObject(req.body) ||
    checkObject(req.query)
  ) {
    logger.warn('XSS attempt detected', {
      ip: req.ip,
      path: req.path,
      method: req.method
    });
    
    return res.status(400).json({
      success: false,
      message: 'Invalid input detected'
    });
  }
  
  next();
};

export default {
  handleValidationErrors,
  sanitizeInputs,
  sanitizeString,
  sanitizeObject,
  validateCreateProject,
  validateUpdateProject,
  validateFileUpload,
  validateProjectId,
  validateSingleTreeCalculation,
  validateForestCalculation,
  validateRegister,
  validateLogin,
  validateMintCredit,
  validateCreateListing,
  validatePagination,
  validateSortOrder,
  validateAdminOverride,
  validateMongoId,
  preventSQLInjection,
  preventXSS
};
