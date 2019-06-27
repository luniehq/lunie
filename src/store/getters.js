export const session = state => ({
  insecureMode: true,
  accounts: state.accounts,
});
export const route = state => state.route;
export const signRequest = state => state.signRequest;
