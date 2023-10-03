export const checkPasswordSecurity = (
    password: string
  ): { success: boolean; message: string } => {
    // Define regular expressions to check for character types
    const lowercaseRegex = /[a-z]/;
    const uppercaseRegex = /[A-Z]/;
    const digitRegex = /[0-9]/;
    const specialCharRegex = /[!@#$%^&*()_+{}\[\]:;<>,.?~\\-]/;
    // Check the length of the password
    if (password.length < 8) {
      return {
        success: false,
        message: "Weak: Password must be at least 8 characters long.",
      };
    }
    // Check for lowercase letters
    if (!lowercaseRegex.test(password)) {
      return {
        success: false,
        message: "Weak: Password must include lowercase letters.",
      };
    }
    // Check for uppercase letters
    if (!uppercaseRegex.test(password)) {
      return {
        success: false,
        message: "Weak: Password must include uppercase letters.",
      };
    }
    // Check for digits
    if (!digitRegex.test(password)) {
      return { success: false, message: "Weak: Password must include digits." };
    }
    // Check for special characters
    if (!specialCharRegex.test(password)) {
      return {
        success: false,
        message: "Weak: Password must include special characters.",
      };
    }
    // If all criteria are met, consider it strong
    return { success: true, message: "Strong: Password meets all criteria." };
  };