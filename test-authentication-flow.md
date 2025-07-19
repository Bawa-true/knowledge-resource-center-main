# Authentication Flow Test Guide

## ✅ **How Authentication Works with New Tables**

### **1. Registration Process**
When a user registers through the form:

```typescript
// User fills out the registration form with:
const registrationData = {
  name: "John Doe",
  email: "john@example.com", 
  password: "securepassword",
  role: "Lecturer",
  staff_pin: "12345"
};

// The signUp function is called with metadata:
const result = await signUp(email, password, {
  options: { data: { name, role, staff_pin: staffPin } }
});
```

### **2. Database Trigger Activation**
The `handle_new_user()` trigger automatically fires and creates entries in BOTH tables:

**Users Table Entry:**
```sql
INSERT INTO public.users (id, email, name, role, status)
VALUES (
  'user-uuid-here',
  'john@example.com',
  'John Doe',
  'Lecturer', 
  'active'
);
```

**Profiles Table Entry:**
```sql
INSERT INTO public.profiles (user_id, full_name, role, email, staff_pin)
VALUES (
  'user-uuid-here',
  'John Doe',
  'Lecturer',
  'john@example.com',
  '12345'
);
```

### **3. Verification Queries**
After registration, you can verify the data was created correctly:

```sql
-- Check users table
SELECT * FROM public.users WHERE email = 'john@example.com';

-- Check profiles table  
SELECT * FROM public.profiles WHERE email = 'john@example.com';

-- Join both tables to see complete user data
SELECT 
  u.id,
  u.email,
  u.name,
  u.role,
  u.status,
  p.full_name,
  p.staff_pin,
  u.created_at,
  p.created_at as profile_created_at
FROM public.users u
JOIN public.profiles p ON u.id = p.user_id
WHERE u.email = 'john@example.com';
```

## 🧪 **Testing Steps**

### **Step 1: Run the Reset Script**
1. Go to Supabase Dashboard → SQL Editor
2. Copy and paste the entire `reset-users-tables.sql` content
3. Run the script
4. Verify you see the success messages

### **Step 2: Test Registration**
1. Go to your app's registration page
2. Fill out the form with test data:
   - Name: "Test User"
   - Email: "test@example.com"
   - Password: "password123"
   - Role: "Lecturer"
   - Staff PIN: "TEST123"
3. Submit the registration

### **Step 3: Verify Database Entries**
Run these queries in Supabase SQL Editor:

```sql
-- Check if user was created in auth.users
SELECT id, email, raw_user_meta_data FROM auth.users WHERE email = 'test@example.com';

-- Check if user was created in public.users
SELECT * FROM public.users WHERE email = 'test@example.com';

-- Check if profile was created in public.profiles
SELECT * FROM public.profiles WHERE email = 'test@example.com';

-- Verify the relationship
SELECT 
  u.id as user_id,
  u.email,
  u.name,
  u.role,
  p.id as profile_id,
  p.full_name,
  p.staff_pin,
  p.role as profile_role
FROM public.users u
JOIN public.profiles p ON u.id = p.user_id
WHERE u.email = 'test@example.com';
```

## ✅ **Expected Results**

After successful registration, you should see:

1. **auth.users table**: User account with metadata
2. **public.users table**: User record with basic info
3. **public.profiles table**: Profile record with detailed info
4. **Both records linked** by the same user ID
5. **All metadata properly extracted** from registration form

## 🔧 **Troubleshooting**

### **If tables aren't created:**
- Make sure you ran the reset script completely
- Check for any SQL errors in the Supabase logs

### **If trigger isn't working:**
- Verify the trigger function exists: `SELECT * FROM information_schema.routines WHERE routine_name = 'handle_new_user';`
- Verify the trigger exists: `SELECT * FROM information_schema.triggers WHERE trigger_name = 'on_auth_user_created';`

### **If data isn't appearing:**
- Check the user metadata in auth.users: `SELECT raw_user_meta_data FROM auth.users WHERE email = 'test@example.com';`
- Verify the trigger function is extracting metadata correctly

## 🎯 **Success Indicators**

✅ **Registration completes without errors**  
✅ **User appears in auth.users with metadata**  
✅ **User record created in public.users**  
✅ **Profile record created in public.profiles**  
✅ **Both records have matching user_id**  
✅ **All form data properly stored**  
✅ **Admin panel shows both user and profile data** 