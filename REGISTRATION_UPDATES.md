# Registration System Updates

## Overview
The registration system has been updated to automatically create user entries in both the `users` and `profiles` tables when a new user registers.

## Database Schema Changes

### Users Table
The `users` table has been simplified to contain:
- `id` (UUID) - References auth.users(id)
- `email` (TEXT) - User's email address
- `name` (TEXT) - User's display name
- `role` (TEXT) - User's role (no longer restricted to specific values)
- `avatar_url` (TEXT) - Optional avatar URL
- `status` (TEXT) - User status (active, inactive, suspended)
- `join_date` (TIMESTAMP) - When user joined
- `last_login` (TIMESTAMP) - Last login time
- `is_logged_in` (BOOLEAN) - Current login status
- `created_at` (TIMESTAMP) - Record creation time
- `updated_at` (TIMESTAMP) - Record update time

### Profiles Table (New)
A new `profiles` table has been created with:
- `id` (UUID) - Primary key
- `user_id` (UUID) - References users(id)
- `full_name` (TEXT) - User's full name
- `staff_pin` (TEXT) - Optional staff PIN
- `role` (TEXT) - User's role
- `email` (TEXT) - User's email
- `created_at` (TIMESTAMP) - Record creation time
- `updated_at` (TIMESTAMP) - Record update time

## Registration Flow

### 1. User Registration
When a user registers through the registration form:
1. User fills out: name, email, password, role, and optional staff PIN
2. Supabase auth creates the user account
3. Database trigger `handle_new_user()` automatically creates entries in both tables
4. The trigger uses user metadata to populate the initial data

### 2. Database Trigger
The `handle_new_user()` trigger function:
- Creates a user entry in the `users` table
- Creates a profile entry in the `profiles` table
- Uses metadata from the registration form to populate fields
- Sets default values for missing fields

### 3. Profile Creation
The `createProfile()` function in the frontend:
- Updates the user entry with additional details
- Creates a profile entry if it doesn't exist
- Handles any additional profile-specific data

## Admin Interface Updates

The AdminUsers component has been updated to:
- Display both user and profile information
- Allow editing of both user and profile data
- Search across both user and profile fields
- Show additional columns for full name and staff PIN

## API Functions

### useUserProfile Hook
New functions added:
- `getUserProfile(userId)` - Fetch profile data for a user
- `updateUserProfile(userId, updates)` - Update profile data

## Migration Notes

If you have existing data:
1. Run the updated schema to create the profiles table
2. Existing users will need profile entries created manually or through a migration script
3. The trigger will only work for new registrations

## Usage Example

```typescript
// Registration form data
const registrationData = {
  name: "John Doe",
  email: "john@example.com",
  role: "Lecturer",
  staff_pin: "12345"
};

// This will automatically create entries in both tables
const result = await signUp(email, password, {
  options: { data: registrationData }
});
``` 