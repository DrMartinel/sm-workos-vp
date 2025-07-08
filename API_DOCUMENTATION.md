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

## Data Source Architecture

The data source system is designed for maximum flexibility and extensibility, allowing developers to easily add new data sources like MySQL or Google Sheets without altering the core API logic. This is achieved through a "convention over configuration" approach.

### Core Components

1.  **Dynamic API Endpoint (`/api/data-source/[name]/route.ts`)**: This single endpoint acts as a gateway for all data source requests. The `[name]` parameter in the URL corresponds to the specific data source to be queried (e.g., `AdjustCohortData`).

2.  **Data Source Directory (`/data-sources/[name]`)**: Each data source has its own dedicated directory. The directory name must exactly match the `[name]` parameter used in the API call.

3.  **Definition File (`definition.ts`)**: Inside each data source directory, a `definition.ts` file must exist. This file exports a default object that defines the data source's metadata, primarily:
    - `source`: The type of the data source (e.g., `'bigquery'`, `'mysql'`).
    - `queryFile`: The name of the file containing the SQL query.

4.  **Query File (`query.sql`)**: This file contains the raw SQL query. It uses placeholders like `@DS_START_DATE` and `@DS_END_DATE`, which are safely replaced with parameterized values by the API.

### Execution Flow Example

When a request is made to `/api/data-source/AdjustCohortData?startDate=20240101&endDate=20240131`:

1.  **Cache Check**: The API first checks an in-memory cache for a matching request. If valid cached data exists, it's returned immediately.
2.  **Load Definition**: If no cache is found, the API dynamically imports `/data-sources/AdjustCohortData/definition.ts`.
3.  **Read Query**: It reads the query from the file specified in `queryFile` (e.g., `query.sql`).
4.  **Execute Query**: The `runQueryBySource` function is called. Based on the `source` property (`'bigquery'`), it initializes the appropriate client, replaces placeholders with secure parameters, and executes the query.
5.  **Cache and Respond**: The results are cleaned, stored in the cache for future requests, and returned to the client as JSON.

### How to Add a New Data Source (e.g., MySQL)

1.  **Update the API**: In `/api/data-source/[name]/route.ts`, add a new `case` to the `runQueryBySource` function to handle the `'mysql'` source type. This involves adding logic to connect to MySQL and execute the query.

    ```typescript
    // Inside runQueryBySource function in route.ts
    switch (sourceType) {
        case 'bigquery':
            // ... existing BigQuery logic
            break;
        case 'mysql':
            // Add new logic to connect to MySQL and run the query
            // const mysql = initializeMySqlClient();
            // const [rows] = await mysql.query(query, params);
            // return rows;
        // ...
    }
    ```

2.  **Create New Directory**: Create a new folder, e.g., `/data-sources/MySqlSalesReport/`.

3.  **Add Definition and Query Files**:
    - Inside the new directory, create a `definition.ts` file:
      ```typescript
      export default {
        source: 'mysql', // Specify the new source type
        queryFile: 'sales_query.sql'
      };
      ```
    - Create the corresponding `sales_query.sql` file with the MySQL query.

That's it! The API will now be able to serve data from your new MySQL source.

## Data Aggregation and Calculation Principles

To ensure data accuracy and consistency, especially in analytics and reporting, it is crucial to follow a strict principle when handling aggregated data.

### The Golden Rule: Aggregate First, Calculate Second

You **must not** average pre-calculated metrics (like taking the average of a list of ROAS percentages). The correct method is to **aggregate the raw, additive components first**, and then perform the calculation on the aggregated totals.

### Additive vs. Calculated Metrics

It's important to distinguish between two types of metrics:

-   **Additive Metrics**: These are raw values that can be summed up across different dimensions without losing their meaning.
    -   **Examples**: `cost`, `installs`, `REV_D0`, `REV_D3`, `retained_users_D1`.

-   **Calculated Metrics**: These are metrics derived from other metrics, often as ratios or percentages. They **cannot** be directly summed or averaged.
    -   **Examples**: `CPI` (Cost Per Install), `ROAS` (Return On Ad Spend), `Retention Rate`, `CTR` (Click-Through Rate).

### Why Averaging Calculated Metrics is Wrong

Consider two campaigns:
-   **Campaign A**: Cost $10, ROAS 150%
-   **Campaign B**: Cost $1,000, ROAS 50%

**Incorrect Method (Averaging ROAS):**
`(150% + 50%) / 2 = 100%`
This result is misleading because it ignores the vastly different scales (costs) of the campaigns.

### The Correct Approach: Aggregating Raw Components

1.  **Aggregate (SUM) the raw components:**
    -   First, find out the revenue for each campaign:
        -   Campaign A Revenue = $10 * 150% = $15
        -   Campaign B Revenue = $1,000 * 50% = $500
    -   Sum the costs and revenues:
        -   `Total Cost` = $10 + $1,000 = $1,010
        -   `Total Revenue` = $15 + $500 = $515

2.  **Calculate the final metric from the aggregated totals:**
    -   `Aggregated ROAS` = (`Total Revenue` / `Total Cost`) * 100 = (`$515 / $1,010`) * 100 ≈ **51%**

This 51% figure accurately reflects the overall performance, properly weighted by cost.

### Handling Complex Weighted Averages

For metrics that are themselves ratios (e.g., `RATIO_REVD30_REVD3`), you must calculate a weighted average. The weight should be the denominator of the original ratio.

-   `aggregated_ratio` = SUM(`denominator` * `ratio`) / SUM(`denominator`)

For `RATIO_REVD30_REVD3`, the denominator is `REV_D3`. So the formula is:
-   `aggregated_ratio_revd30_revd3` = SUM(`REV_D3` * `RATIO_REVD30_REVD3`) / SUM(`REV_D3`)

The final `eROAS D30` is then calculated using this aggregated ratio and other aggregated components.

### Implementation Examples

#### SQL (Recommended)

Performing aggregation directly in the database is the most efficient method.

```sql
SELECT
    channel,
    SUM(cost) AS total_cost,
    SUM(installs) AS total_installs,
    SUM(rev_d3) AS total_rev_d3,
    -- Calculate the numerator for the weighted average
    SUM(rev_d3 * ratio_revd30_revd3) AS weighted_ratio_numerator
FROM
    your_table
GROUP BY
    channel;
```
You can then use these aggregated values in the backend or frontend to calculate the final metrics.

#### JavaScript (Client-side)

If you have raw, un-aggregated data on the client, use `Array.prototype.reduce()` to aggregate before calculating.

```javascript
const rawData = [/* ... array of campaign data ... */];

const aggregated = rawData.reduce((acc, row) => {
    acc.total_cost += row.cost || 0;
    acc.total_rev_d3 += row.REV_D3 || 0;
    acc.weighted_ratio_numerator += (row.REV_D3 || 0) * (row.RATIO_REVD30_REVD3 || 0);
    // ... sum other additive metrics ...
    return acc;
}, {
    total_cost: 0,
    total_rev_d3: 0,
    weighted_ratio_numerator: 0,
    // ... initialize other metrics ...
});

// Now, calculate the final metrics from the aggregated object
const aggregated_ratio = aggregated.weighted_ratio_numerator / aggregated.total_rev_d3;
const aggregated_eRoas_d30 = (aggregated.total_rev_d3 * aggregated_ratio) / aggregated.total_cost * 100;
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