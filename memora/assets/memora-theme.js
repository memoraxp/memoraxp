(() => {
  const themeStorageKey = "memora-manager-theme";
  const lightThemeValue = "light";

  const readSavedTheme = () => {
    try {
      return window.localStorage.getItem(themeStorageKey);
    } catch (error) {
      return "";
    }
  };

  const persistTheme = (theme) => {
    try {
      window.localStorage.setItem(themeStorageKey, theme === lightThemeValue ? lightThemeValue : "dark");
    } catch (error) {
      // Theme preference is progressive enhancement; the UI still works without storage.
    }
  };

  const applyTheme = (theme) => {
    const isLight = theme === lightThemeValue;
    document.documentElement.dataset.managerTheme = isLight ? lightThemeValue : "dark";
    if (document.body) document.body.dataset.theme = isLight ? lightThemeValue : "dark";
    document.querySelectorAll("[data-manager-theme-toggle]").forEach((toggle) => {
      toggle.checked = isLight;
      toggle.setAttribute("aria-checked", String(isLight));
    });
  };

  applyTheme(readSavedTheme());

  document.addEventListener("DOMContentLoaded", () => {
    applyTheme(readSavedTheme());
    document.querySelectorAll("[data-manager-theme-toggle]").forEach((toggle) => {
      toggle.addEventListener("change", () => {
        const theme = toggle.checked ? lightThemeValue : "dark";
        applyTheme(theme);
        persistTheme(theme);
      });
    });
  });
})();