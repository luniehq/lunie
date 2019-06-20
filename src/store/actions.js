export const createSeed = () => {
  return new Promise(resolve => {
    chrome.runtime.sendMessage({ type: 'GET_SEED' }, function(response) {
      resolve(response);
    });
  });
};
