# SmartSheet Pro - Frontend

A modern React frontend for SmartSheet Pro, built with TypeScript, Tailwind CSS, and React Query.

## 🚀 Quick Start

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment**:
   ```bash
   cp .env.example .env
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Open in browser**:
   Navigate to `http://localhost:3000`

## 🏗️ Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Query** - Server state management
- **Zustand** - Client state management
- **React Router** - Navigation
- **React Hook Form** - Form handling
- **Zod** - Validation
- **Recharts** - Data visualization
- **Lucide React** - Icons

## 📁 Project Structure

```
src/
├── api/           # API client and endpoints
├── components/    # Reusable components
│   ├── ui/        # Base UI components
│   ├── layout/    # Layout components
│   ├── auth/      # Authentication components
│   ├── datasets/  # Dataset-specific components
│   ├── reconciliation/ # Reconciliation components
│   ├── bulk/      # Bulk operations components
│   └── reports/   # Report components
├── hooks/         # Custom React hooks
├── pages/         # Page components
├── store/         # Zustand stores
├── types/         # TypeScript type definitions
├── utils/         # Utility functions
└── App.tsx        # Main app component
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🎨 UI Components

The project includes a comprehensive set of reusable UI components:

- **Button** - Various styles and sizes
- **Input** - Form inputs with validation
- **Select** - Dropdown selections
- **Modal** - Dialog overlays
- **Card** - Content containers
- **Badge** - Status indicators
- **Tabs** - Tabbed navigation
- **Pagination** - Data pagination
- **Spinner** - Loading indicators

## 📊 Features

### Authentication
- User registration and login
- JWT token management
- Protected routes
- Automatic token refresh

### Dataset Management
- File upload (CSV, Excel, JSON, TSV)
- Schema detection and display
- Data grid with pagination
- Version history and rollback
- Data cleanup operations

### Data Reconciliation
- Dataset comparison wizard
- Key column mapping
- Fuzzy matching support
- Results visualization
- Export capabilities

### Bulk Operations
- Visual rule builder
- Conditional logic (AND/OR)
- Preview before execution
- Saved rules library
- Operation history with undo

### Reports
- Drag-and-drop report builder
- Multiple chart types
- Summary statistics
- PDF/Excel generation
- Template system

## 🔌 API Integration

The frontend integrates with the Django REST API backend:

- **Base URL**: `http://localhost:8000/api`
- **Authentication**: JWT tokens
- **Error Handling**: Automatic retry and user feedback
- **Caching**: React Query for efficient data fetching

## 🎯 State Management

- **Server State**: React Query for API data
- **Client State**: Zustand for UI state
- **Form State**: React Hook Form for forms
- **Authentication**: Zustand store with localStorage persistence

## 🔒 Security

- JWT token storage in localStorage
- Automatic token refresh
- Protected route components
- Input validation with Zod schemas
- XSS protection through React

## 📱 Responsive Design

- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Collapsible sidebar on mobile
- Touch-friendly interactions

## 🎨 Styling

- **Tailwind CSS** for utility-first styling
- **Custom color palette** with primary, success, warning, error variants
- **Dark mode ready** (can be implemented)
- **Consistent spacing** and typography
- **Hover and focus states** for accessibility

## 🧪 Development

### Code Organization
- Feature-based folder structure
- Consistent naming conventions
- TypeScript for type safety
- Custom hooks for reusable logic

### Best Practices
- Component composition over inheritance
- Props interface definitions
- Error boundaries for error handling
- Loading states for better UX
- Optimistic updates where appropriate

## 🚀 Deployment

1. **Build the project**:
   ```bash
   npm run build
   ```

2. **Deploy the `dist` folder** to your hosting service

3. **Configure environment variables** for production API URL

## 🔧 Configuration

### Environment Variables
- `VITE_API_URL` - Backend API base URL

### Vite Configuration
- Proxy setup for API calls during development
- Build optimization settings
- Source map generation

### Tailwind Configuration
- Custom color palette
- Extended spacing and sizing
- Custom animations and transitions

## 📈 Performance

- **Code splitting** with React.lazy
- **Image optimization** with proper formats
- **Bundle analysis** with Vite
- **Caching strategies** with React Query
- **Lazy loading** for large datasets

## 🤝 Contributing

1. Follow the existing code style
2. Use TypeScript for all new code
3. Add proper error handling
4. Include loading states
5. Test on multiple screen sizes
6. Update documentation as needed

## 📄 License

This project is part of the SmartSheet Pro application suite.