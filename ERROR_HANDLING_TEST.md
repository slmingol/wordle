# Error Handling Test Guide

## Error Handling Implementation

The application now includes comprehensive error handling with:

1. **Global Error Handlers** - Catches unhandled promise rejections and window errors
2. **Error Boundary Component** - Wraps the main Game component to catch component errors
3. **Error Notifications** - Toast-style notifications for recoverable errors
4. **Error Store** - Centralized error state management
5. **Utility Functions** - tryCatch wrappers and retry logic

## Testing Error Scenarios

### Test 1: Component Error Recovery
To test the ErrorBoundary component:

1. Open browser console
2. In any component, trigger an error in the component lifecycle
3. The ErrorBoundary should display a fallback UI with a retry button
4. Clicking retry should attempt to re-render the component

### Test 2: Global Error Handling
To test global error handlers:

```javascript
// In browser console
throw new Error("Test global error");
```

Expected: Error notification appears in top-right corner

### Test 3: Promise Rejection
To test unhandled promise rejection:

```javascript
// In browser console
Promise.reject(new Error("Test promise rejection"));
```

Expected: Error notification appears with the error message

### Test 4: API Error Handling
To test API error handling:

1. Win or lose a game
2. Click on the word to see the definition
3. If the API fails, you should see an error message instead of the definition
4. Rate limiting: Make more than 10 requests in a minute to trigger rate limiting

### Test 5: localStorage Errors
To test localStorage error handling:

1. Open browser console
2. Disable localStorage (some browsers allow this in privacy mode)
3. Try to save settings or game state
4. Errors should be caught and logged, not crash the app

## Error Severity Levels

- **INFO** (blue) - Informational messages
- **WARNING** (orange) - Recoverable warnings  
- **ERROR** (red) - Errors that may impact functionality
- **FATAL** (red) - Critical errors requiring user action

## Error Recovery

- Errors with severity `info`, `warning`, or `error` auto-dismiss after 10 seconds
- Fatal errors require manual dismissal or page reload
- The retry button in ErrorBoundary allows recovering from component errors

## Files Created

1. `src/errorHandling.ts` - Error store and utilities
2. `src/components/ErrorBoundary.svelte` - Error boundary wrapper
3. `src/components/ErrorNotifications.svelte` - Notification UI

## Integration Points

- `src/main.ts` - Calls `setupGlobalErrorHandlers()` on app initialization
- `src/App.svelte` - Wraps Game component with ErrorBoundary and includes ErrorNotifications
- All localStorage calls use safe wrappers that catch errors
- API calls in Definition.svelte have timeout and rate limiting
