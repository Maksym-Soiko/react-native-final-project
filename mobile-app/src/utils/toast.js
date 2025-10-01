let _handler = null;

export function registerToastHandler(handler) {
  _handler = typeof handler === "function" ? handler : null;
}

export function unregisterToastHandler() {
  _handler = null;
}

export function showToast(message) {
  try {
    if (_handler) {
      _handler(String(message ?? ""));
    } else {
      console.warn("showToast: no handler registered. message:", message);
    }
  } catch (e) {
    console.warn("showToast handler error", e);
  }
}