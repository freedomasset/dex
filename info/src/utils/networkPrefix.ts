import { NetworkInfo } from 'constants/networks'

export function networkPrefix(activeNewtork: NetworkInfo) {
  // 所有网络都使用路径前缀，这样刷新页面时可以正确识别网络
  const prefix = '/' + activeNewtork.route.toLocaleLowerCase() + '/'
  return prefix
}
