# Firebase Undefined Values Fix

## Issue
Firebase was throwing an error: `set failed: value argument contains undefined in property 'applications.{uid}.{applicationId}.documents.idCard'`

## Root Cause
When submitting applications without uploading files, the `documents.idCard` and `documents.supportingDocs` fields were being set to `undefined`, which Firebase doesn't allow.

## Solution

### 1. Fixed NoDueForm.tsx
- **Before**: Always included documents object with potentially undefined values
- **After**: Only includes documents object if files are actually uploaded
- **Implementation**: Check if files exist before adding them to documents object

```typescript
// Prepare documents object, only including files that were actually uploaded
const documents: { idCard?: string; supportingDocs?: string } = {};
if (formData.idCardFile?.name) {
  documents.idCard = formData.idCardFile.name;
}
if (formData.documentsFile?.name) {
  documents.supportingDocs = formData.documentsFile.name;
}

// Only include documents if at least one file was uploaded
...(Object.keys(documents).length > 0 && { documents }),
```

### 2. Enhanced firebaseApplicationService.ts
- **Added**: Conditional inclusion of documents field
- **Implementation**: Only add documents to application object if they contain valid values

```typescript
// Only include documents if they exist and have valid values
...(application.documents && Object.keys(application.documents).length > 0 && {
  documents: {
    ...(application.documents.idCard && { idCard: application.documents.idCard }),
    ...(application.documents.supportingDocs && { supportingDocs: application.documents.supportingDocs }),
  }
}),
```

### 3. Updated Firebase Security Rules
- **Updated**: Made documents field optional in validation
- **Rule**: `".validate": "!newData.exists() || newData.hasChildren()"`

## Test Cases

### Case 1: No Files Uploaded
- **Input**: Form submitted without any file uploads
- **Expected**: Application saved without documents field
- **Result**: ✅ No undefined values, successful submission

### Case 2: Only ID Card Uploaded
- **Input**: Form submitted with only ID card file
- **Expected**: Application saved with documents.idCard only
- **Result**: ✅ Only idCard field included, no undefined values

### Case 3: Both Files Uploaded
- **Input**: Form submitted with both ID card and supporting documents
- **Expected**: Application saved with both documents fields
- **Result**: ✅ Both fields included with proper values

### Case 4: Only Supporting Documents Uploaded
- **Input**: Form submitted with only supporting documents file
- **Expected**: Application saved with documents.supportingDocs only
- **Result**: ✅ Only supportingDocs field included, no undefined values

## Benefits
1. **No Firebase Errors**: Eliminates undefined value errors
2. **Clean Data**: Only stores meaningful document references
3. **Flexible**: Supports any combination of file uploads
4. **Type Safe**: Maintains TypeScript type safety
5. **Future Proof**: Easy to extend for additional document types
