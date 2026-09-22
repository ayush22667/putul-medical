// localStorage can throw (private mode, blocked storage) — never let that break the page.
export const store = {
  get(key) {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch {
      /* storage unavailable: preference simply isn't remembered */
    }
  },
};

export const KEYS = {
  lang: 'pm_lang',
  promoClosed: 'pm_promo_closed',
  newsletterSeen: 'pm_nl_seen',
};
