# Firebase Setup Instructions

## Database Security Rules

To ensure proper security for the No Due System, you need to apply the security rules in `firebase-database-rules.json` to your Firebase Realtime Database.

### How to Apply Security Rules:

1. Go to your Firebase Console
2. Navigate to your project
3. Click on "Realtime Database" in the left sidebar
4. Click on the "Rules" tab
5. Copy the contents of `firebase-database-rules.json` and paste them into the rules editor
6. Click "Publish" to apply the rules

### Security Features:

#### Application Data Security:

- **User Isolation**: Each user can only read/write their own applications under `applications/{uid}/`
- **Authentication Required**: All operations require user authentication
- **Data Validation**: Strict validation rules for all application fields
- **Proper Types**: Ensures correct data types for all fields
- **Status Validation**: Only allows valid status values (pending, in_progress, approved, rejected)

#### User Data Security:

- **Self Access**: Users can read/write their own profile data
- **Admin Access**: Admin users can access all user profiles (for management)
- **Role-Based Access**: Access control based on user roles

### Database Structure:

```
firebase-database/
├── applications/
│   └── {userUid}/
│       └── {applicationId}/
│           ├── studentId: string
│           ├── studentName: string
│           ├── rollNumber: string
│           ├── email: string
│           ├── department: string
│           ├── course: string
│           ├── year: string
│           ├── submissionDate: string
│           ├── status: "pending" | "in_progress" | "approved" | "rejected"
│           ├── progress: object
│           ├── reason?: string
│           ├── collegeName?: string
│           └── documents?: object
└── users/
    └── {userUid}/
        ├── uid: string
        ├── email: string
        ├── role: "student" | "department_officer" | "admin"
        ├── fullName: string
        └── ... other profile fields
```

### Key Benefits:

1. **Data Isolation**: Students can only see their own applications
2. **Scalability**: Firebase handles concurrent access and real-time updates
3. **Security**: Comprehensive validation and access control
4. **Real-time**: Automatic updates when application status changes
5. **Backup**: Firebase provides automatic backups and data persistence

### Important Notes:

- Department officers and admins access all applications through the `getAllApplications()` method which requires proper role verification
- The security rules ensure that even if someone tries to access another user's data directly, they will be denied
- All write operations validate that the `studentId` matches the authenticated user's UID
- Email validation ensures proper email format in applications

### Testing Security:

You can test the security rules using the Firebase Console simulator:

1. Go to Realtime Database → Rules
2. Click "Simulator"
3. Test different scenarios with different user UIDs and data paths
