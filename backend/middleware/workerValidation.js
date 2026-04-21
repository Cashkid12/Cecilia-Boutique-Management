// Worker validation middleware

exports.validateWorker = (req, res, next) => {
  const { name, email, password } = req.body;
  const errors = [];

  // Full Name validation
  if (!name || name.trim().length < 3) {
    errors.push('Full name must be at least 3 characters');
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    errors.push('Valid email is required');
  }

  // Password validation (only for new workers)
  if (!req.params.id) {
    // Creating new worker
    if (!password || password.length < 6) {
      errors.push('Password must be at least 6 characters');
    }
  } else {
    // Updating worker - password optional
    if (password && password.length < 6) {
      errors.push('Password must be at least 6 characters');
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({ 
      message: 'Validation failed',
      errors 
    });
  }

  next();
};
