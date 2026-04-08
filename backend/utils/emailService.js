const nodemailer = require('nodemailer');
const Settings = require('../models/Settings');

// Create transporter
const createTransporter = async () => {
  const settings = await Settings.findOne();
  
  if (!settings || !settings.emailPassword) {
    throw new Error('Email credentials not configured');
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: settings.adminEmail,
      pass: settings.emailPassword
    }
  });
};

// Send Low Stock Alert Email
exports.sendLowStockEmail = async (lowStockItems) => {
  try {
    const settings = await Settings.findOne();
    
    if (!settings || !settings.emailEnabled || !settings.lowStockEmailEnabled) {
      console.log('Low stock emails are disabled');
      return false;
    }

    // Avoid spam - only send once per hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    if (settings.lastLowStockEmailSent && settings.lastLowStockEmailSent > oneHourAgo) {
      console.log('Low stock email already sent recently, skipping');
      return false;
    }

    if (lowStockItems.length === 0) return false;

    const transporter = await createTransporter();

    // Generate HTML email
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #D6C2A1; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .header h1 { margin: 0; color: #2E2E2E; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 10px 10px; }
          .alert-badge { background: #ff6b6b; color: white; padding: 5px 15px; border-radius: 20px; display: inline-block; margin-bottom: 15px; }
          table { width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; }
          th { background: #D6C2A1; color: #2E2E2E; padding: 12px; text-align: left; }
          td { padding: 12px; border-bottom: 1px solid #eee; }
          tr:hover { background: #f5f5f5; }
          .quantity { font-weight: bold; color: #ff6b6b; }
          .footer { text-align: center; margin-top: 20px; color: #999; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⚠️ Low Stock Alert</h1>
            <p>Cecilia Boutique Management System</p>
          </div>
          <div class="content">
            <div class="alert-badge">${lowStockItems.length} Item${lowStockItems.length > 1 ? 's' : ''} Need Restocking</div>
            <p>The following items are running low on stock:</p>
            <table>
              <thead>
                <tr>
                  <th>Item Name</th>
                  <th>Category</th>
                  <th>Quantity Left</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                ${lowStockItems.map(item => `
                  <tr>
                    <td><strong>${item.itemName}</strong></td>
                    <td>${item.category}${item.subcategory ? ` - ${item.subcategory}` : ''}</td>
                    <td class="quantity">${item.quantity} units</td>
                    <td>${new Date().toLocaleDateString()}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            <p style="margin-top: 20px;">Please restock these items to avoid lost sales.</p>
            <div class="footer">
              <p>This is an automated alert from Cecilia Boutique Management System</p>
              <p>${new Date().toLocaleString()}</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: settings.adminEmail,
      to: settings.adminEmail,
      subject: `Low Stock Alert - ${lowStockItems.length} Item${lowStockItems.length > 1 ? 's' : ''} Need Attention`,
      html: htmlContent
    });

    // Update last sent timestamp
    settings.lastLowStockEmailSent = new Date();
    await settings.save();

    console.log('Low stock email sent successfully');
    return true;
  } catch (error) {
    console.error('Error sending low stock email:', error.message);
    return false;
  }
};

// Send Weekly Report Email
exports.sendWeeklyReport = async (reportData) => {
  try {
    const settings = await Settings.findOne();
    
    if (!settings || !settings.emailEnabled || !settings.weeklyReportEnabled) {
      console.log('Weekly report emails are disabled');
      return false;
    }

    const transporter = await createTransporter();

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 700px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #D6C2A1 0%, #B89B72 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .header h1 { margin: 0; color: #2E2E2E; }
          .content { background: #f9f9f9; padding: 30px; }
          .section { background: white; padding: 20px; margin-bottom: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .section h2 { color: #B89B72; margin-top: 0; border-bottom: 2px solid #D6C2A1; padding-bottom: 10px; }
          .stat { display: inline-block; width: 45%; margin: 10px 2%; padding: 15px; background: #f5f5f5; border-radius: 8px; text-align: center; }
          .stat-value { font-size: 24px; font-weight: bold; color: #2E2E2E; }
          .stat-label { font-size: 12px; color: #666; margin-top: 5px; }
          .positive { color: #27ae60; }
          .negative { color: #e74c3c; }
          table { width: 100%; border-collapse: collapse; }
          th { background: #D6C2A1; padding: 10px; text-align: left; }
          td { padding: 10px; border-bottom: 1px solid #eee; }
          .footer { text-align: center; margin-top: 20px; color: #999; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📊 Weekly Business Report</h1>
            <p>Cecilia Boutique Management System</p>
            <p>${reportData.weekStart} - ${reportData.weekEnd}</p>
          </div>
          <div class="content">
            <div class="section">
              <h2>💰 Sales Summary</h2>
              <div class="stat">
                <div class="stat-value">KSh ${reportData.totalSales.toLocaleString()}</div>
                <div class="stat-label">Total Revenue</div>
              </div>
              <div class="stat">
                <div class="stat-value">${reportData.totalTransactions}</div>
                <div class="stat-label">Transactions</div>
              </div>
            </div>

            <div class="section">
              <h2>📈 Profit Summary</h2>
              <div class="stat">
                <div class="stat-value ${reportData.netProfit >= 0 ? 'positive' : 'negative'}">KSh ${reportData.netProfit.toLocaleString()}</div>
                <div class="stat-label">Net Profit</div>
              </div>
              <div class="stat">
                <div class="stat-value">KSh ${reportData.totalProfit.toLocaleString()}</div>
                <div class="stat-label">Gross Profit</div>
              </div>
            </div>

            <div class="section">
              <h2>💸 Expenses</h2>
              <div class="stat">
                <div class="stat-value negative">KSh ${reportData.totalExpenses.toLocaleString()}</div>
                <div class="stat-label">Total Expenses</div>
              </div>
            </div>

            ${reportData.bestSeller ? `
            <div class="section">
              <h2>🏆 Best Seller</h2>
              <p><strong>${reportData.bestSeller.itemName}</strong> - ${reportData.bestSeller.quantity} units sold (KSh ${reportData.bestSeller.revenue.toLocaleString()})</p>
            </div>
            ` : ''}

            ${reportData.lowStockCount > 0 ? `
            <div class="section">
              <h2>⚠️ Low Stock Alert</h2>
              <p><strong>${reportData.lowStockCount} items</strong> are running low on stock. Please review and restock.</p>
            </div>
            ` : ''}

            <div class="footer">
              <p>This is an automated weekly report from Cecilia Boutique Management System</p>
              <p>Generated on ${new Date().toLocaleString()}</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: settings.adminEmail,
      to: settings.adminEmail,
      subject: `Weekly Business Report - ${reportData.weekEnd}`,
      html: htmlContent
    });

    settings.lastWeeklyReportSent = new Date();
    await settings.save();

    console.log('Weekly report sent successfully');
    return true;
  } catch (error) {
    console.error('Error sending weekly report:', error.message);
    return false;
  }
};

// Send Monthly Report Email
exports.sendMonthlyReport = async (reportData) => {
  try {
    const settings = await Settings.findOne();
    
    if (!settings || !settings.emailEnabled || !settings.monthlyReportEnabled) {
      console.log('Monthly report emails are disabled');
      return false;
    }

    const transporter = await createTransporter();

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 700px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #B89B72 0%, #D6C2A1 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .header h1 { margin: 0; color: #2E2E2E; }
          .content { background: #f9f9f9; padding: 30px; }
          .section { background: white; padding: 20px; margin-bottom: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .section h2 { color: #B89B72; margin-top: 0; border-bottom: 2px solid #D6C2A1; padding-bottom: 10px; }
          .stat { display: inline-block; width: 30%; margin: 10px 1.5%; padding: 15px; background: #f5f5f5; border-radius: 8px; text-align: center; }
          .stat-value { font-size: 22px; font-weight: bold; color: #2E2E2E; }
          .stat-label { font-size: 12px; color: #666; margin-top: 5px; }
          .positive { color: #27ae60; }
          .negative { color: #e74c3c; }
          table { width: 100%; border-collapse: collapse; }
          th { background: #D6C2A1; padding: 10px; text-align: left; }
          td { padding: 10px; border-bottom: 1px solid #eee; }
          .growth { font-size: 18px; font-weight: bold; padding: 15px; text-align: center; border-radius: 8px; margin: 10px 0; }
          .growth-up { background: #d4edda; color: #155724; }
          .growth-down { background: #f8d7da; color: #721c24; }
          .footer { text-align: center; margin-top: 20px; color: #999; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📈 Monthly Business Report</h1>
            <p>Cecilia Boutique Management System</p>
            <p>${reportData.month}</p>
          </div>
          <div class="content">
            <div class="section">
              <h2>💰 Monthly Overview</h2>
              <div class="stat">
                <div class="stat-value">KSh ${reportData.totalSales.toLocaleString()}</div>
                <div class="stat-label">Total Sales</div>
              </div>
              <div class="stat">
                <div class="stat-value ${reportData.netProfit >= 0 ? 'positive' : 'negative'}">KSh ${reportData.netProfit.toLocaleString()}</div>
                <div class="stat-label">Net Profit</div>
              </div>
              <div class="stat">
                <div class="stat-value">${reportData.totalTransactions}</div>
                <div class="stat-label">Transactions</div>
              </div>
            </div>

            ${reportData.growthPercentage !== null ? `
            <div class="section">
              <h2>📊 Growth Analysis</h2>
              <div class="growth ${reportData.growthPercentage >= 0 ? 'growth-up' : 'growth-down'}">
                ${reportData.growthPercentage >= 0 ? '↑' : '↓'} ${Math.abs(reportData.growthPercentage)}% ${reportData.growthPercentage >= 0 ? 'growth' : 'decline'} vs last month
              </div>
            </div>
            ` : ''}

            <div class="section">
              <h2>🏆 Top Categories</h2>
              <table>
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Items Sold</th>
                    <th>Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  ${reportData.topCategories.map(cat => `
                    <tr>
                      <td><strong>${cat.category}</strong></td>
                      <td>${cat.quantity}</td>
                      <td>KSh ${cat.revenue.toLocaleString()}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>

            ${reportData.topWorkers && reportData.topWorkers.length > 0 ? `
            <div class="section">
              <h2>👥 Worker Performance</h2>
              <table>
                <thead>
                  <tr>
                    <th>Worker</th>
                    <th>Sales</th>
                    <th>Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  ${reportData.topWorkers.map(worker => `
                    <tr>
                      <td><strong>${worker.name}</strong></td>
                      <td>${worker.salesCount}</td>
                      <td>KSh ${worker.revenue.toLocaleString()}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
            ` : ''}

            <div class="footer">
              <p>This is an automated monthly report from Cecilia Boutique Management System</p>
              <p>Generated on ${new Date().toLocaleString()}</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: settings.adminEmail,
      to: settings.adminEmail,
      subject: `Monthly Business Report - ${reportData.month}`,
      html: htmlContent
    });

    settings.lastMonthlyReportSent = new Date();
    await settings.save();

    console.log('Monthly report sent successfully');
    return true;
  } catch (error) {
    console.error('Error sending monthly report:', error.message);
    return false;
  }
};
