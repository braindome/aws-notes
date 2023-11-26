function validateInput(input) {
  if (!Array.isArray(input) || input.length === 0) {
    return {
      success: false,
      message: "Input must be a non-empty list of strings",
    };
  }

  for (const str of input) {
    if (typeof str !== "string") {
      return {
        success: false,
        message: "All elements in the list must be strings",
      };
    }
  }

  return { success: true };
}

module.exports = { validateInput };
