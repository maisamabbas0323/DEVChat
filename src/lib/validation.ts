export function validateApiKey(key: string): string | null {
  if (!key || key.trim().length === 0) return "API key is required";
  if (key.length < 10) return "API key appears too short";
  return null;
}

export function validateModel(model: string): string | null {
  if (!model || model.trim().length === 0) return "Model is required";
  if (!/^[a-zA-Z0-9/_\-.\s]+$/.test(model))
    return "Model ID contains invalid characters";
  return null;
}

export function getErrorMessage(status: number): string {
  const messages: Record<number, string> = {
    401: "Your API key appears to be invalid. Check your API Configuration.",
    403: "Access denied. Your API key may not have permission for this model.",
    404: "The requested model or endpoint was not found.",
    429: "Rate limit exceeded. Please wait a moment and try again.",
    500: "The AI service encountered an internal error. Try again shortly.",
    502: "The AI service is temporarily unavailable. Try again shortly.",
    503: "The AI service is currently overloaded. Try again shortly.",
  };
  return messages[status] ?? `Request failed with status ${status}`;
}
