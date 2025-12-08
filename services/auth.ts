export const auth = {
  login: (password: string): Promise<boolean> => {
    // Simulating network request for authentication
    return new Promise((resolve) => {
      setTimeout(() => {
        if (password === 'admin' || password === '1234') {
          localStorage.setItem('hs_auth', 'true');
          resolve(true);
        } else {
          resolve(false);
        }
      }, 800);
    });
  },
  
  logout: () => {
    localStorage.removeItem('hs_auth');
  },
  
  isAuthenticated: () => {
    return localStorage.getItem('hs_auth') === 'true';
  }
};