# API Documentation

## Table of Contents
1. [API Endpoints](#api-endpoints)
2. [UI Components](#ui-components)
3. [Custom Hooks](#custom-hooks)
4. [Utility Functions](#utility-functions)
5. [Data Sources](#data-sources)
6. [Page Components](#page-components)
7. [Theme System](#theme-system)

## API Endpoints

### Data Source API

#### GET `/api/data-source/[name]`

Retrieves data from a specified data source with date filtering and caching.

**Parameters:**
- `name` (string): Data source name (e.g., "AdjustCohortData")
- `startDate` (string): Start date in format YYYYMMDD
- `endDate` (string): End date in format YYYYMMDD

**Response:**
```json
[
  {
    "date": "2024-01-01",
    "country_code": "US",
    "channel": "facebook",
    "campaign_name": "Campaign Name",
    "cost": 1000,
    "install": 100,
    "REV_D0": 50,
    "REV_D3": 150,
    "REV_D7": 250,
    "REV_D30": 500,
    "app_fullname": "App Name"
  }
]
```

**Error Responses:**
- `400`: Missing startDate or endDate
- `404`: Data source not found
- `500`: Internal server error

**Features:**
- 5-minute in-memory caching
- BigQuery integration
- Parameterized queries for security
- Error handling with detailed messages

**Example Usage:**
```javascript
const response = await fetch('/api/data-source/AdjustCohortData?startDate=20240101&endDate=20240131');
const data = await response.json();
```

## UI Components

### Core Components

#### Button
A versatile button component with multiple variants and sizes.

**Props:**
```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  asChild?: boolean
}
```

**Usage:**
```jsx
<Button variant="default" size="lg">
  Click me
</Button>

<Button variant="outline" size="sm">
  Secondary action
</Button>

<Button variant="ghost" size="icon">
  <Icon className="h-4 w-4" />
</Button>
```

#### Card
A flexible card component for displaying content with header, body, and footer.

**Components:**
- `Card`: Main container
- `CardHeader`: Header section
- `CardTitle`: Title within header
- `CardDescription`: Description text
- `CardContent`: Main content area
- `CardFooter`: Footer section

**Usage:**
```jsx
<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Card content goes here</p>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

#### Form Components
Comprehensive form handling with react-hook-form integration.

**Components:**
- `Form`: Form provider wrapper
- `FormField`: Field wrapper with validation
- `FormItem`: Individual form item container
- `FormLabel`: Accessible form label
- `FormControl`: Form input control
- `FormDescription`: Help text
- `FormMessage`: Error message display

**Usage:**
```jsx
<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)}>
    <FormField
      control={form.control}
      name="username"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Username</FormLabel>
          <FormControl>
            <Input placeholder="Enter username" {...field} />
          </FormControl>
          <FormDescription>Your unique username</FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  </form>
</Form>
```

#### Input
Standard input component with consistent styling.

**Props:**
```typescript
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  // Inherits all standard HTML input props
}
```

**Usage:**
```jsx
<Input 
  type="email" 
  placeholder="Enter your email" 
  value={email}
  onChange={(e) => setEmail(e.target.value)}
/>
```

#### Select
Dropdown select component with search and multi-selection capabilities.

**Components:**
- `Select`: Main select container
- `SelectTrigger`: Trigger button
- `SelectValue`: Selected value display
- `SelectContent`: Options container
- `SelectItem`: Individual option

**Usage:**
```jsx
<Select value={value} onValueChange={setValue}>
  <SelectTrigger>
    <SelectValue placeholder="Select option" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
    <SelectItem value="option2">Option 2</SelectItem>
  </SelectContent>
</Select>
```

#### Textarea
Multi-line text input component.

**Props:**
```typescript
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  // Inherits all standard HTML textarea props
}
```

**Usage:**
```jsx
<Textarea 
  placeholder="Enter your message"
  value={message}
  onChange={(e) => setMessage(e.target.value)}
  rows={4}
/>
```

#### Dialog
Modal dialog component for overlays and forms.

**Components:**
- `Dialog`: Main dialog container
- `DialogTrigger`: Trigger button
- `DialogContent`: Modal content
- `DialogHeader`: Dialog header
- `DialogTitle`: Dialog title
- `DialogDescription`: Dialog description
- `DialogFooter`: Dialog footer
- `DialogClose`: Close button

**Usage:**
```jsx
<Dialog>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
      <DialogDescription>Dialog description</DialogDescription>
    </DialogHeader>
    <p>Dialog content</p>
    <DialogFooter>
      <Button>Save</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

#### Sidebar
Comprehensive sidebar navigation component with collapsible functionality.

**Components:**
- `SidebarProvider`: Context provider for sidebar state
- `Sidebar`: Main sidebar container
- `SidebarHeader`: Header section
- `SidebarContent`: Main content area
- `SidebarFooter`: Footer section
- `SidebarMenu`: Navigation menu
- `SidebarMenuItem`: Individual menu item
- `SidebarTrigger`: Toggle button

**Props:**
```typescript
interface SidebarProps {
  side?: 'left' | 'right'
  variant?: 'sidebar' | 'floating' | 'inset'
  collapsible?: 'offcanvas' | 'icon' | 'none'
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
}
```

**Usage:**
```jsx
<SidebarProvider>
  <Sidebar>
    <SidebarHeader>
      <h2>Navigation</h2>
    </SidebarHeader>
    <SidebarContent>
      <SidebarMenu>
        <SidebarMenuItem>
          <a href="/dashboard">Dashboard</a>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <a href="/tasks">Tasks</a>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarContent>
  </Sidebar>
  <main>
    <SidebarTrigger />
    {/* Main content */}
  </main>
</SidebarProvider>
```

### Custom Components

#### TaskDetailModal
Comprehensive task management modal with subtasks, comments, and metadata.

**Props:**
```typescript
interface TaskDetailModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  task?: Task
}
```

**Features:**
- Task title editing
- Description management
- Subtask creation and tracking
- Comment system with formatting
- Custom fields (budget, approver, department, complexity)
- Project assignment
- Priority and label management
- Date and deadline tracking
- Rich metadata editing

**Usage:**
```jsx
<TaskDetailModal
  open={isModalOpen}
  onOpenChange={setIsModalOpen}
  task={selectedTask}
/>
```

#### ThemeProvider
Theme management component providing dark/light mode functionality.

**Props:**
```typescript
interface ThemeProviderProps {
  children: React.ReactNode
  attribute?: 'class' | 'data-theme'
  defaultTheme?: 'light' | 'dark' | 'system'
  enableSystem?: boolean
  disableTransitionOnChange?: boolean
}
```

**Usage:**
```jsx
<ThemeProvider
  attribute="class"
  defaultTheme="system"
  enableSystem
  disableTransitionOnChange
>
  {children}
</ThemeProvider>
```

## Custom Hooks

### useIsMobile
Hook for detecting mobile breakpoints and responsive behavior.

**Returns:**
```typescript
function useIsMobile(): boolean
```

**Usage:**
```jsx
const isMobile = useIsMobile()

return (
  <div className={isMobile ? 'mobile-layout' : 'desktop-layout'}>
    {/* Content */}
  </div>
)
```

**Features:**
- Listens to window resize events
- Uses 768px breakpoint
- Returns undefined during SSR to prevent hydration mismatches
- Automatically updates on window resize

### useToast
Hook for displaying toast notifications with queue management.

**Returns:**
```typescript
interface UseToastReturn {
  toast: (props: ToastProps) => {
    id: string
    dismiss: () => void
    update: (props: ToastProps) => void
  }
  dismiss: (toastId?: string) => void
  toasts: ToasterToast[]
}
```

**Usage:**
```jsx
const { toast } = useToast()

const showToast = () => {
  toast({
    title: "Success",
    description: "Operation completed successfully",
    variant: "default"
  })
}

// With custom action
toast({
  title: "Error",
  description: "Something went wrong",
  variant: "destructive",
  action: <Button onClick={retry}>Retry</Button>
})
```

**Features:**
- Queue management (limit: 1 toast)
- Auto-dismiss functionality
- Toast variants (default, destructive)
- Custom actions support
- Update and dismiss methods

### useSidebar
Hook for managing sidebar state and behavior.

**Returns:**
```typescript
interface SidebarContext {
  state: 'expanded' | 'collapsed'
  open: boolean
  setOpen: (open: boolean) => void
  openMobile: boolean
  setOpenMobile: (open: boolean) => void
  isMobile: boolean
  toggleSidebar: () => void
}
```

**Usage:**
```jsx
const { open, toggleSidebar, isMobile } = useSidebar()

return (
  <button onClick={toggleSidebar}>
    {open ? 'Close' : 'Open'} Sidebar
  </button>
)
```

## Utility Functions

### cn (Class Names)
Utility function for merging Tailwind CSS classes with conflict resolution.

**Signature:**
```typescript
function cn(...inputs: ClassValue[]): string
```

**Usage:**
```jsx
const buttonClass = cn(
  'px-4 py-2 rounded',
  variant === 'primary' && 'bg-blue-500 text-white',
  variant === 'secondary' && 'bg-gray-200 text-gray-900',
  disabled && 'opacity-50 cursor-not-allowed',
  className
)
```

**Features:**
- Merges multiple class strings
- Resolves Tailwind conflicts (e.g., `bg-red-500` overrides `bg-blue-500`)
- Handles conditional classes
- Supports arrays and objects

## Data Sources

### AdjustCohortData
BigQuery data source for mobile app cohort analysis.

**Configuration:**
```typescript
{
  source: 'bigquery',
  queryFile: './query.sql',
  dimensions: [
    'app_fullname', 'channel', 'country_code',
    'campaign_name', 'date', 'mmp'
  ],
  metrics: [
    'cost', 'imps_D0', 'install', 'RATIO_REVD30_REVD3',
    'retained_users_D0', 'retained_users_D1', 'retained_users_D3',
    'retained_users_D7', 'retained_users_D30',
    'REV_D0', 'REV_D3', 'REV_D7', 'REV_D30',
    'REV_D60', 'REV_D90', 'REV_D120'
  ]
}
```

**Query Parameters:**
- `@DS_START_DATE`: Start date filter
- `@DS_END_DATE`: End date filter

**Data Schema:**
```sql
-- Key metrics available:
-- Revenue metrics: REV_D0, REV_D3, REV_D7, REV_D30, REV_D60, REV_D90, REV_D120
-- Retention metrics: retained_users_D0, retained_users_D1, retained_users_D3, retained_users_D7, retained_users_D30
-- Performance metrics: cost, install, imps_D0, RATIO_REVD30_REVD3
-- Dimensions: app_fullname, channel, country_code, campaign_name, date, mmp
```

## Page Components

### WorkspaceDashboard
Main dashboard component with navigation and overview cards.

**Features:**
- Collapsible sidebar with primary and secondary navigation
- Mobile-responsive design
- Quick action buttons for common tasks
- Activity feed display
- Team overview statistics
- Keyboard shortcuts support

**Navigation Structure:**
```javascript
const primaryIcons = [
  { id: "home", icon: Home, label: "Home" },
  { id: "reports", icon: BarChart3, label: "Reports" },
  { id: "tasks", icon: CheckSquare, label: "Tasks" },
  { id: "requests", icon: FileText, label: "Requests" },
  { id: "goals", icon: Target, label: "Goals" },
  { id: "notifications", icon: Bell, label: "Notifications" },
  { id: "workflow", icon: GitBranch, label: "Workflow" },
  { id: "settings", icon: Settings, label: "Settings" }
]
```

**Usage:**
```jsx
<WorkspaceDashboard />
```

### Application Routes
The application includes several route structures:

#### `/` - Dashboard
Main workspace dashboard with navigation and overview

#### `/tasks` - Task Management
Task listing and management interface

#### `/reports` - Analytics
Data visualization and reporting interface

#### `/workflow-editor` - Workflow Management
Visual workflow editor for process automation

#### `/login` - Authentication
User authentication interface

#### `/signup` - Registration
User registration interface

#### `/forgot-password` - Password Recovery
Password reset interface

## Theme System

### Theme Configuration
The application uses next-themes for theme management with the following configuration:

```jsx
<ThemeProvider
  attribute="class"
  defaultTheme="light"
  enableSystem
  disableTransitionOnChange
>
  {children}
</ThemeProvider>
```

### CSS Variables
Theme colors are defined as CSS variables in `globals.css`:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
  --primary-foreground: 210 40% 98%;
  /* ... more theme variables */
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  /* ... dark theme variables */
}
```

### Tailwind Configuration
Theme integration with Tailwind CSS is configured in `tailwind.config.ts`:

```typescript
module.exports = {
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        // ... more color definitions
      }
    }
  }
}
```

## Error Handling

### API Error Responses
All API endpoints return consistent error responses:

```typescript
interface ErrorResponse {
  error: string
  details?: string
}
```

### Client-Side Error Handling
Components include error boundaries and graceful fallbacks:

```jsx
// Toast notifications for user feedback
const { toast } = useToast()

const handleError = (error: Error) => {
  toast({
    title: "Error",
    description: error.message,
    variant: "destructive"
  })
}
```

## Performance Considerations

### Caching Strategy
- API responses cached for 5 minutes
- React Query integration for client-side caching
- Static asset optimization

### Code Splitting
- Dynamic imports for large components
- Route-based code splitting
- Lazy loading for modal components

### Optimization Features
- Image optimization with Next.js
- Bundle analysis and optimization
- Tree shaking for unused code elimination

## Security

### API Security
- Parameterized queries to prevent SQL injection
- Environment variable configuration for sensitive data
- CORS configuration for API endpoints

### Authentication
- JWT token-based authentication
- Protected routes with middleware
- Session management

## Development Guidelines

### Component Development
1. Use TypeScript for type safety
2. Implement proper error boundaries
3. Include accessibility features (ARIA labels, keyboard navigation)
4. Follow responsive design patterns
5. Use the established design system

### API Development
1. Implement proper error handling
2. Use parameterized queries
3. Include request validation
4. Implement caching strategies
5. Document all endpoints

### Testing
- Unit tests for utility functions
- Integration tests for API endpoints
- Component testing with React Testing Library
- E2E tests for critical user flows

This documentation provides comprehensive coverage of all public APIs, functions, and components in the workspace. Each section includes usage examples, type definitions, and best practices for implementation.