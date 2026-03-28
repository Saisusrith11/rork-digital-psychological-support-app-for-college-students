import { router } from 'expo-router';

export const navigationUtils = {
  goBack: () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  },
  
  navigateTo: (path: string) => {
    router.push(path);
  },
  
  replaceTo: (path: string) => {
    router.replace(path);
  },
  
  canGoBack: () => {
    return router.canGoBack();
  }
};

export default navigationUtils;