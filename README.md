# Lush Milk - Milk Delivery Application

## Overview

Lush Milk is a premium milk delivery application that allows customers to purchase fresh milk products through one-time orders or recurring subscriptions. The application features a modern UI, secure payment processing, and a comprehensive admin dashboard.

## Features

- **User Authentication**: Secure login/signup with email and Google Account
- **Product Catalog**: Browse different milk types with detailed information
- **Shopping Cart**: Add products and checkout securely
- **Subscription Management**: Create, pause, and modify recurring milk deliveries
- **Location Validation**: Check if delivery is available in your area
- **Order History**: View past orders and their status
- **Admin Dashboard**: Manage orders, subscriptions, and inventory
- **Error Monitoring**: Comprehensive error tracking and reporting
- **Mobile Responsive**: Fully responsive design works on all devices

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Shadcn UI
- **Backend**: Supabase (PostgreSQL, Authentication, Storage)
- **State Management**: React Context API, React Query
- **Testing**: Vitest
- **CI/CD**: Built-in deployment scripts

## Setup Instructions

### Prerequisites

- Node.js (v18 or newer)
- npm or yarn
- Supabase account and project

### Environment Setup

1. Clone the repository
   ```
   git clone https://github.com/yourusername/lush-milk.git
   cd lush-milk
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_KEY=your_supabase_anon_key
   ```

4. Set up the database
   ```
   npm run db:migrate
   npm run db:seed
   ```

### Running the Application

#### Development Mode
```
npm run dev
```

#### Production Build
```
npm run build:prod
```

#### Testing
```
npm run test
```

## Database Management

- **Apply Migrations**: `npm run db:migrate`
- **Seed Database**: `npm run db:seed`
- **Start Local DB**: `npm run db:start`
- **Check DB Status**: `npm run db:status`
- **Stop Local DB**: `npm run db:stop`

## Production Readiness Checklist

- [x] Environment variable validation
- [x] Error monitoring and reporting
- [x] Secure payment processing
- [x] Input validation and sanitization
- [x] Database migration scripts
- [x] Automated testing
- [x] Production build optimization
- [x] Security checks
- [x] Authentication and authorization

## Security Features

- Row-Level Security (RLS) for database tables
- No hardcoded credentials
- Secure environment variable management
- Data validation before database operations

## Deployment

The application is configured for deployment on any modern hosting platform. For production deployments, ensure:

1. All environment variables are properly set
2. Database migrations are applied
3. Run the security check before deployment:
   ```
   npm run security-check
   ```
4. Build the production version:
   ```
   npm run prepare-release
   ```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Submit a pull request

## License

[MIT License](LICENSE)
