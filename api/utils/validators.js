/**
 * Validation utilities for authentication
 */

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid email format
 */
const validateEmail = (email) => {
  const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return emailRegex.test(String(email).toLowerCase());
};

/**
 * Validate phone number format (supports multiple formats)
 * Accepts: 1234567890, 123-456-7890, (123) 456-7890, +1234567890, +1-234-567-8900
 * @param {string} phone - Phone number to validate
 * @returns {object} - { isValid: boolean, formatted: string }
 */
const validatePhone = (phone) => {
  if (!phone) return { isValid: false, formatted: null, error: "Phone number is required" };
  
  // Remove all non-digit characters except leading +
  const cleaned = phone.replace(/\D/g, "");
  
  // Should be 10 digits (US) or 11+ (international with country code)
  if (cleaned.length < 10 || cleaned.length > 15) {
    return { isValid: false, formatted: null, error: "Phone number must be between 10 and 15 digits" };
  }
  
  // Check if it starts with 1 for US numbers (11 digits total)
  if (cleaned.length === 11 && !cleaned.startsWith("1")) {
    return { isValid: false, formatted: null, error: "Invalid phone number format" };
  }
  
  // Check if it's a valid 10-digit US number
  if (cleaned.length === 10) {
    // First digit should not be 0 or 1
    if (cleaned[0] === "0" || cleaned[0] === "1") {
      return { isValid: false, formatted: null, error: "Invalid phone number format" };
    }
  }
  
  return { 
    isValid: true, 
    formatted: cleaned, // Store normalized format (digits only)
    original: phone 
  };
};

/**
 * Validate password strength
 * Requirements: min 8 chars, uppercase, lowercase, number, special char
 * @param {string} password - Password to validate
 * @returns {object} - { isValid: boolean, errors: array }
 */
const validatePassword = (password) => {
  const errors = [];
  
  if (!password) {
    return { isValid: false, errors: ["Password is required"] };
  }
  
  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter (A-Z)");
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter (a-z)");
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number (0-9)");
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push("Password must contain at least one special character (!@#$%^&*...)");
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate registration input
 * @param {object} data - Registration data { email, password, confirmPassword, phone, name }
 * @returns {object} - { isValid: boolean, errors: object }
 */
const validateRegistrationInput = (data) => {
  const errors = {};
  
  // Email validation
  if (!data.email) {
    errors.email = "Email is required";
  } else if (!validateEmail(data.email)) {
    errors.email = "Please enter a valid email address";
  }
  
  // Password validation
  const passwordValidation = validatePassword(data.password);
  if (!passwordValidation.isValid) {
    errors.password = passwordValidation.errors;
  }
  
  // Confirm password validation
  if (!data.confirmPassword) {
    errors.confirmPassword = "Please confirm your password";
  } else if (data.password !== data.confirmPassword) {
    errors.confirmPassword = "Passwords do not match";
  }
  
  // Phone validation
  if (!data.phone) {
    errors.phone = "Phone number is required";
  } else {
    const phoneValidation = validatePhone(data.phone);
    if (!phoneValidation.isValid) {
      errors.phone = phoneValidation.error;
    }
  }
  
  // Name validation
  if (!data.name || data.name.trim() === "") {
    errors.name = "Name is required";
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate login input
 * @param {object} data - Login data { email, password }
 * @returns {object} - { isValid: boolean, errors: object }
 */
const validateLoginInput = (data) => {
  const errors = {};
  
  // Email validation
  if (!data.email) {
    errors.email = "Email is required";
  } else if (!validateEmail(data.email)) {
    errors.email = "Please enter a valid email address";
  }
  
  // Password validation
  if (!data.password) {
    errors.password = "Password is required";
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

module.exports = {
  validateEmail,
  validatePhone,
  validatePassword,
  validateRegistrationInput,
  validateLoginInput
};
