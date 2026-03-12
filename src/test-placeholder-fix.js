// Test file to demonstrate the placeholder fix
// This shows the before and after of the placeholder issue

// BEFORE (WRONG) - This would cause the React warning:
const wrongPlaceholder = (param) => {
  return (
    <input
      placeholder={param.placeholder}  // ❌ Could be boolean true/false
      // This would cause: Warning: Received `true` for a non-boolean attribute `placeholder`
    />
  );
};

// AFTER (FIXED) - This ensures placeholder is always a string:
const fixedPlaceholder = (param) => {
  return (
    <input
      placeholder={
        typeof param.placeholder === 'string' 
          ? param.placeholder 
          : `Enter ${param.label?.toLowerCase() || param.name}...`
      }  // ✅ Always a string
    />
  );
};

// Example test cases:
const testCases = [
  // Case 1: String placeholder (works fine)
  { name: 'email', label: 'Email', placeholder: 'Enter email address...' },
  
  // Case 2: Boolean placeholder (would cause warning before fix)
  { name: 'phone', label: 'Phone', placeholder: true },
  
  // Case 3: No placeholder (needs fallback)
  { name: 'age', label: 'Age' },
  
  // Case 4: Undefined placeholder
  { name: 'name', label: 'Name', placeholder: undefined }
];

// Test results after fix:
testCases.forEach(param => {
  const placeholder = typeof param.placeholder === 'string' 
    ? param.placeholder 
    : `Enter ${param.label?.toLowerCase() || param.name}...`;
  
  console.log(`${param.name}: "${placeholder}"`);
});

// Expected output:
// email: "Enter email address..."
// phone: "Enter phone..."
// age: "Enter age..."
// name: "Enter name..."

export { fixedPlaceholder };