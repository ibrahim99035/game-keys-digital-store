const calculateOrderTotal = (items) => {
  return items.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);
};

const generateOrderNumber = () => {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `EG-${timestamp}-${randomStr}`.toUpperCase();
};

const formatCurrency = (amount, currency = 'EGP') => {
  const formatters = {
    EGP: new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 2
    }),
    USD: new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }),
    EUR: new Intl.NumberFormat('en-EU', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2
    })
  };
  
  return formatters[currency]?.format(amount) || `${amount} ${currency}`;
};

const formatDate = (date, locale = 'ar-EG') => {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date));
};

const generateSlug = (text) => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06FF]+/g, '-') // Handle Arabic characters
    .replace(/^-+|-+$/g, '');
};

const paginate = (page, limit) => {
  const currentPage = parseInt(page) || 1;
  const pageLimit = parseInt(limit) || 10;
  const skip = (currentPage - 1) * pageLimit;
  
  return {
    page: currentPage,
    limit: pageLimit,
    skip
  };
};

const buildPaginationResponse = (data, total, page, limit) => {
  const totalPages = Math.ceil(total / limit);
  const hasNext = page < totalPages;
  const hasPrev = page > 1;
  
  return {
    data,
    pagination: {
      currentPage: page,
      totalPages,
      totalItems: total,
      itemsPerPage: limit,
      hasNext,
      hasPrev,
      nextPage: hasNext ? page + 1 : null,
      prevPage: hasPrev ? page - 1 : null
    }
  };
};

const buildSortOptions = (sortBy, sortOrder) => {
  const validSortFields = ['name', 'price', 'createdAt', 'updatedAt', 'rating'];
  const field = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
  const order = sortOrder === 'asc' ? 1 : -1;
  
  return { [field]: order };
};

const buildSearchQuery = (searchTerm) => {
  if (!searchTerm) return {};
  
  return {
    $or: [
      { name: { $regex: searchTerm, $options: 'i' } },
      { description: { $regex: searchTerm, $options: 'i' } },
      { tags: { $in: [new RegExp(searchTerm, 'i')] } }
    ]
  };
};

const buildFilterQuery = (filters) => {
  const query = {};
  
  if (filters.category) {
    query.category = filters.category;
  }
  
  if (filters.minPrice || filters.maxPrice) {
    query.price = {};
    if (filters.minPrice) query.price.$gte = parseFloat(filters.minPrice);
    if (filters.maxPrice) query.price.$lte = parseFloat(filters.maxPrice);
  }
  
  if (filters.tags) {
    const tags = Array.isArray(filters.tags) ? filters.tags : [filters.tags];
    query.tags = { $in: tags };
  }
  
  if (filters.isActive !== undefined) {
    query.isActive = filters.isActive === 'true';
  }
  
  if (filters.isFeatured !== undefined) {
    query.isFeatured = filters.isFeatured === 'true';
  }
  
  return query;
};

const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

const createError = (message, statusCode = 500) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const getClientIP = (req) => {
  return req.ip || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress ||
         (req.connection.socket ? req.connection.socket.remoteAddress : null);
};

const isValidObjectId = (id) => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

module.exports = {
  calculateOrderTotal,
  generateOrderNumber,
  formatCurrency,
  formatDate,
  generateSlug,
  paginate,
  buildPaginationResponse,
  buildSortOptions,
  buildSearchQuery,
  buildFilterQuery,
  asyncHandler,
  createError,
  getClientIP,
  isValidObjectId
};