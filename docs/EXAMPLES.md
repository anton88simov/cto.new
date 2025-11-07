# Usage Examples

## Getting Started

### 1. First Launch

After starting the application:

1. Click on ⚙️ **Settings** button
2. Configure your settings:
   ```
   Project Path: /home/user/my-project
   AI API URL: http://localhost:8000
   API Key: sk-your-key-here
   Default Model: gpt-3.5-turbo
   ```
3. Click **Save**
4. The file tree will load your project

### 2. Opening and Editing Files

1. Navigate the file tree on the left
2. Click on any file to open it in the editor
3. Edit the file - changes are auto-saved
4. Use keyboard shortcuts:
   - `Ctrl+S` / `Cmd+S` - Save
   - `Ctrl+F` / `Cmd+F` - Find
   - `Ctrl+H` / `Cmd+H` - Find and Replace

## AI Interaction Examples

### Example 1: Generate a React Component

**Prompt:**
```
Create a React component called UserProfile that displays:
- User avatar (image)
- Name (h2)
- Email (paragraph)
- Bio (paragraph)

Props: user object with { avatar, name, email, bio }
Style: Use flexbox, modern design
```

**AI Response:**
```typescript
import React from 'react';

interface User {
  avatar: string;
  name: string;
  email: string;
  bio: string;
}

interface UserProfileProps {
  user: User;
}

const UserProfile: React.FC<UserProfileProps> = ({ user }) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '20px',
      maxWidth: '400px',
      margin: '0 auto',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    }}>
      <img 
        src={user.avatar} 
        alt={user.name}
        style={{
          width: '100px',
          height: '100px',
          borderRadius: '50%',
          marginBottom: '16px'
        }}
      />
      <h2 style={{ margin: '8px 0' }}>{user.name}</h2>
      <p style={{ color: '#666', margin: '4px 0' }}>{user.email}</p>
      <p style={{ textAlign: 'center', marginTop: '16px' }}>{user.bio}</p>
    </div>
  );
};

export default UserProfile;
```

### Example 2: Refactor Code

**Prompt:**
```
Refactor this code to use async/await instead of promises:

function fetchUsers() {
  return fetch('/api/users')
    .then(response => response.json())
    .then(data => {
      console.log(data);
      return data;
    })
    .catch(error => {
      console.error(error);
      throw error;
    });
}
```

**AI Response:**
```typescript
async function fetchUsers() {
  try {
    const response = await fetch('/api/users');
    const data = await response.json();
    console.log(data);
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
```

### Example 3: Bug Fix

**Prompt:**
```
This code has a bug - the counter doesn't update:

const Counter = () => {
  const [count, setCount] = useState(0);
  
  const increment = () => {
    setCount(count + 1);
    setCount(count + 1);
    setCount(count + 1);
  };
  
  return <button onClick={increment}>{count}</button>;
};

Why doesn't it increase by 3?
```

**AI Response:**
```
The issue is that React state updates are batched and use the value at the time of render. When you call setCount(count + 1) three times, they all use the same 'count' value.

Fix using the functional update form:

const Counter = () => {
  const [count, setCount] = useState(0);
  
  const increment = () => {
    setCount(prev => prev + 1);
    setCount(prev => prev + 1);
    setCount(prev => prev + 1);
  };
  
  return <button onClick={increment}>{count}</button>;
};

Now the counter will correctly increase by 3 each click.
```

### Example 4: Generate Tests

**Prompt:**
```
Write Jest tests for this function:

function calculateDiscount(price: number, percentage: number): number {
  if (price < 0 || percentage < 0 || percentage > 100) {
    throw new Error('Invalid input');
  }
  return price * (1 - percentage / 100);
}
```

**AI Response:**
```typescript
import { calculateDiscount } from './discount';

describe('calculateDiscount', () => {
  it('should calculate discount correctly', () => {
    expect(calculateDiscount(100, 10)).toBe(90);
    expect(calculateDiscount(50, 20)).toBe(40);
    expect(calculateDiscount(200, 50)).toBe(100);
  });

  it('should handle 0% discount', () => {
    expect(calculateDiscount(100, 0)).toBe(100);
  });

  it('should handle 100% discount', () => {
    expect(calculateDiscount(100, 100)).toBe(0);
  });

  it('should throw error for negative price', () => {
    expect(() => calculateDiscount(-10, 20)).toThrow('Invalid input');
  });

  it('should throw error for negative percentage', () => {
    expect(() => calculateDiscount(100, -5)).toThrow('Invalid input');
  });

  it('should throw error for percentage > 100', () => {
    expect(() => calculateDiscount(100, 150)).toThrow('Invalid input');
  });
});
```

### Example 5: Code Review

**Prompt:**
```
Review this code and suggest improvements:

function getUserData(id) {
  var user = null;
  $.ajax({
    url: '/api/users/' + id,
    async: false,
    success: function(data) {
      user = data;
    }
  });
  return user;
}
```

**AI Response:**
```
Issues found:
1. Uses synchronous AJAX (async: false) - blocks UI
2. Uses var instead of const/let
3. Uses jQuery when modern fetch is available
4. No error handling
5. String concatenation instead of template literals

Improved version:

async function getUserData(id: string): Promise<User> {
  try {
    const response = await fetch(`/api/users/${id}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const user = await response.json();
    return user;
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw error;
  }
}

Changes:
- Async/await for non-blocking code
- Modern fetch API
- Proper error handling
- TypeScript types
- Template literals
```

## Terminal Examples

### Example 1: Project Setup

```bash
# Create new React project
npx create-react-app my-app
cd my-app

# Install dependencies
npm install axios react-router-dom

# Start development server
npm start
```

### Example 2: Git Operations

```bash
# Initialize git
git init

# Add files
git add .

# Commit
git commit -m "Initial commit"

# Add remote
git remote add origin https://github.com/user/repo.git

# Push
git push -u origin main
```

### Example 3: Build and Deploy

```bash
# Build for production
npm run build

# Run tests
npm test

# Check bundle size
npm run analyze
```

## Advanced Workflows

### Workflow 1: Feature Development

1. **Create feature branch**
   ```bash
   git checkout -b feature/user-auth
   ```

2. **Ask AI to generate boilerplate**
   ```
   Generate authentication service with:
   - login(email, password)
   - logout()
   - register(userData)
   - getCurrentUser()
   Use axios and localStorage for token
   ```

3. **Implement the feature**
   - Edit generated code
   - Add error handling
   - Style components

4. **Generate tests**
   ```
   Write tests for the AuthService
   ```

5. **Run tests**
   ```bash
   npm test
   ```

6. **Commit and push**
   ```bash
   git add .
   git commit -m "Add authentication service"
   git push origin feature/user-auth
   ```

### Workflow 2: Bug Fixing

1. **Find the bug in terminal**
   ```bash
   npm test
   # Test fails: UserService.test.js
   ```

2. **Ask AI to analyze**
   ```
   The test "should fetch users" is failing.
   Here's the test output: [paste error]
   Analyze the UserService and find the issue.
   ```

3. **Apply AI suggestion**
   - Review the fix
   - Apply to code
   - Test again

4. **Verify fix**
   ```bash
   npm test
   ```

### Workflow 3: Code Migration

1. **Select old code**
   - Open legacy file
   - Select all code

2. **Ask AI to migrate**
   ```
   Convert this JavaScript class component to 
   TypeScript functional component with hooks
   ```

3. **Review changes**
   - Check types
   - Verify logic
   - Test functionality

4. **Update tests**
   ```
   Update the test file to match the new component
   ```

## Keyboard Shortcuts

### Editor
- `Ctrl/Cmd + S` - Save file
- `Ctrl/Cmd + F` - Find
- `Ctrl/Cmd + H` - Replace
- `Ctrl/Cmd + /` - Toggle comment
- `Alt + Up/Down` - Move line up/down
- `Ctrl/Cmd + D` - Select next occurrence
- `Ctrl/Cmd + Shift + K` - Delete line

### Terminal
- `Ctrl + C` - Interrupt process
- `Ctrl + L` - Clear screen
- `Up/Down` - Command history
- `Tab` - Auto-complete
- `Ctrl + R` - Reverse search

### AI Panel
- `Enter` - Send message (with Shift+Enter for new line)
- `Esc` - Close panel

## Tips and Tricks

### Tip 1: Context is Key
When asking AI for help, provide context:
```
Bad:  "Fix this"
Good: "This React component has a memory leak. 
       The useEffect is missing cleanup. Fix it."
```

### Tip 2: Be Specific
```
Bad:  "Make it better"
Good: "Refactor this to use TypeScript generics 
       and add JSDoc comments"
```

### Tip 3: Iterative Development
```
1. "Generate basic user form"
2. "Add validation to the form"
3. "Add submit handler with API call"
4. "Add error handling and loading states"
```

### Tip 4: Use Terminal Output
```
1. Run command in terminal
2. If errors occur, copy output
3. Ask AI: "Fix these build errors: [paste output]"
```

### Tip 5: Index Your Project
Before complex AI queries:
1. Settings → Project Path
2. AI will have better context
3. More accurate suggestions

## Common Patterns

### Pattern 1: Component + Test
```
1. "Generate ProductCard component"
2. "Generate tests for ProductCard"
3. Edit both files
4. Run tests
```

### Pattern 2: API + Types
```
1. "Generate TypeScript types for this API response: [JSON]"
2. "Generate API service using these types"
3. "Add error handling and retry logic"
```

### Pattern 3: Refactor + Document
```
1. "Refactor this function to be more readable"
2. "Add JSDoc documentation"
3. "Extract helper functions"
```

## Troubleshooting Examples

### Problem: AI Not Responding

**Check:**
1. Settings → AI API URL is correct
2. API Key is valid
3. Backend logs: `Check terminal running backend`
4. Network: `curl http://localhost:8000/health`

### Problem: Terminal Not Working

**Check:**
1. WebSocket connection in browser console
2. Backend running on port 3001
3. Firewall not blocking WebSocket

### Problem: Files Not Loading

**Check:**
1. Project path in settings
2. File permissions: `ls -la /path/to/project`
3. Backend logs for errors
