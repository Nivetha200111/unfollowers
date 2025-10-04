# Follower Manager Web App

A comprehensive web application for managing social media followers with intelligent filtering and bulk removal tools. Built with React, TypeScript, and Vercel serverless functions.

## Features

- **Multi-Platform Support**: Twitter/X, Instagram, and GitHub integration
- **Intelligent Filtering**: Filter followers by mutual status, popularity, bot detection, and more
- **Bulk Operations**: Select and remove multiple followers at once
- **Bot Detection**: Advanced algorithms to identify and filter out bot accounts
- **Activity History**: Track all removal activities with detailed logs
- **Responsive Design**: Mobile-first design with dark/light mode support
- **Real-time Analytics**: Visualize follower trends and removal statistics

## Tech Stack

### Frontend
- React 18+ with TypeScript
- Tailwind CSS for styling
- Radix UI components
- React Hook Form for form handling
- Zustand for state management
- React Router for navigation

### Backend
- Vercel Serverless Functions
- Node.js with TypeScript
- Supabase for database and authentication
- JWT authentication
- OAuth 2.0 integration

### Database
- Supabase (PostgreSQL) for primary data storage
- Redis for caching and rate limiting (optional)

## Getting Started

### Prerequisites

- Node.js 18+ 
- Supabase account and project
- Redis (optional, for caching)
- Twitter OAuth credentials

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd follower-manager
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp env.example .env.local
```

4. Configure your environment variables in `.env.local`:
   - Supabase URL and anon key
   - Twitter OAuth credentials
   - JWT secret
   - Encryption key

5. Set up the Supabase database:
   - Create a new Supabase project
   - Run the SQL schema from `supabase/schema.sql` in your Supabase SQL editor
   - Get your project URL and anon key from the Supabase dashboard

6. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

## Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically on every push

### Environment Variables for Production

Set these in your Vercel dashboard:

- `REACT_APP_SUPABASE_URL`: Your Supabase project URL
- `REACT_APP_SUPABASE_ANON_KEY`: Your Supabase anon key
- `KV_URL`: Redis connection string (optional)
- `JWT_SECRET`: Strong secret for JWT tokens
- `ENCRYPTION_KEY`: Key for encrypting sensitive data
- `TWITTER_CLIENT_ID`: Your Twitter OAuth client ID
- `TWITTER_CLIENT_SECRET`: Your Twitter OAuth client secret

## Usage

### Authentication

1. Select your platform (Twitter, Instagram, or GitHub)
2. Enter your username
3. Complete OAuth flow
4. Start managing your followers

### Filtering Followers

- **Non-mutual**: Show only followers who don't follow you back
- **Popularity**: Filter by minimum follower count
- **Bot Detection**: Automatically identify suspected bot accounts
- **Verification**: Show only verified accounts
- **Privacy**: Filter by account privacy settings

### Bulk Removal

1. Apply filters to find target followers
2. Select followers using checkboxes
3. Choose removal reason
4. Confirm and execute removal

## API Endpoints

### Authentication
- `POST /api/auth/login` - Initiate OAuth flow
- `POST /api/auth/callback` - Handle OAuth callback
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user

### Followers
- `GET /api/followers` - Get paginated followers
- `POST /api/followers/analyze` - Analyze followers with filters
- `DELETE /api/followers/remove` - Remove selected followers
- `GET /api/followers/history` - Get removal history

### User
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/settings` - Update user settings
- `GET /api/user/settings` - Get user settings

## Security

- JWT-based authentication
- Encrypted token storage
- Rate limiting on API endpoints
- Input validation and sanitization
- CORS protection
- Secure OAuth flow

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please open an issue on GitHub or contact the development team.

## Roadmap

- [ ] Advanced analytics dashboard
- [ ] Scheduled removal operations
- [ ] Export functionality
- [ ] Mobile app
- [ ] Additional platform support
- [ ] Machine learning improvements for bot detection
