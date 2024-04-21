export const generateActivationCode = (length, characters)  => {
    const result = [];
    const charset = characters || "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()";
    const charsetLength = charset.length;
  
    for (let i = 0; i < length; i++) {
      result.push(charset.charAt(Math.floor(Math.random() * charsetLength)));
    }
  
    return result.join("");
  }