// Category pricing configuration for simplified inventory system

const categoryConfig = {
  "Men's Trousers": {
    icon: "User",
    prices: [700, 850, 900, 950],
    markup: 300
  },
  "Ladies Trousers": {
    icon: "User",
    prices: [700, 850, 800, 900],
    markup: 300
  },
  "Boys Trouser": {
    icon: "Baby",
    prices: [550, 600, 700, 750],
    markup: 250
  },
  "Girls Trouser": {
    icon: "Baby",
    prices: [550, 570, 600, 650],
    markup: 250
  },
  "Shorts": {
    icon: "Sun",
    prices: [550, 600, 750, 200],
    markup: 250
  },
  "T-Shirts": {
    icon: "Shirt",
    prices: [420, 430, 600, 550],
    markup: 200
  },
  "T-Shirt Boys": {
    icon: "Shirt",
    prices: [320, 500, 450],
    markup: 150
  },
  "T-Shirt Girls": {
    icon: "Shirt",
    prices: [330, 350],
    markup: 150
  },
  "Socks": {
    icon: "Circle",
    prices: [400, 500],
    markup: 200
  },
  "Vests": {
    icon: "Shirt",
    prices: [320, 450],
    markup: 150
  },
  "Jackets Men": {
    icon: "Wind",
    prices: [900, 1000, 1200, 1300, 1600],
    markup: 500
  },
  "Jackets Ladies": {
    icon: "Wind",
    prices: [1100, 1200, 1000],
    markup: 500
  },
  "Jackets Kids": {
    icon: "Wind",
    prices: [750, 850, 900],
    markup: 400
  }
};

// Get all categories
const getCategories = () => Object.keys(categoryConfig);

// Get prices for a category
const getCategoryPrices = (category) => {
  return categoryConfig[category]?.prices || [];
};

// Get icon for a category
const getCategoryIcon = (category) => {
  return categoryConfig[category]?.icon || "Package";
};

// Get default markup for a category
const getCategoryMarkup = (category) => {
  return categoryConfig[category]?.markup || 300;
};

// Validate buying price for category
const isValidBuyingPrice = (category, price) => {
  const prices = categoryConfig[category]?.prices || [];
  return prices.includes(Number(price));
};

// Calculate selling price
const calculateSellingPrice = (buyingPrice, markup) => {
  return buyingPrice + (markup || 300);
};

module.exports = {
  categoryConfig,
  getCategories,
  getCategoryPrices,
  getCategoryIcon,
  getCategoryMarkup,
  isValidBuyingPrice,
  calculateSellingPrice
};
