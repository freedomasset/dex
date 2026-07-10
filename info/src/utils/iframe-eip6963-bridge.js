/**
 * EIP-6963 Bridge for Cross-Origin iframes
 *
 * 这个脚本需要放在父窗口（包含 iframe 的页面）中
 * 用于在跨域 iframe 中转发 EIP-6963 事件
 *
 * 使用方法：
 * 1. 将这个脚本添加到父窗口的 HTML 中
 * 2. 确保 iframe 的 src 指向你的 DEX 应用
 * 3. 脚本会自动处理 EIP-6963 事件的转发
 */

;(function () {
  'use strict'

  // 存储已检测到的 EIP-6963 提供者
  const detectedProviders = new Map()

  /**
   * 监听来自 iframe 的 EIP-6963 请求
   */
  window.addEventListener('message', function (event) {
    // 安全检查：在生产环境中应该验证 event.origin
    // if (event.origin !== 'https://your-dex-domain.com') return;

    const data = event.data

    // 处理来自 iframe 的 EIP-6963 请求
    if (data && data.type === 'eip6963:requestProvider' && data.source === 'chainbox-connector') {
      // 立即发送已检测到的所有 ChainBox 提供者
      sendProvidersToIframe(event.source)

      // 如果还没有检测到，请求提供者
      if (detectedProviders.size === 0) {
        requestProviders()
      }
    }
  })

  /**
   * 监听 EIP-6963 提供者公告
   */
  window.addEventListener('eip6963:announceProvider', function (event) {
    const { info, provider } = event.detail

    // 检查是否是 ChainBox
    if (info.name.toLowerCase().includes('chainbox') || provider.isChainBox) {
      const providerId = info.uuid || info.name
      detectedProviders.set(providerId, { info, provider })

      // 立即转发给所有 iframe
      broadcastProviderToIframes({ info, provider })
    }
  })

  /**
   * 请求 EIP-6963 提供者
   */
  function requestProviders() {
    window.dispatchEvent(new Event('eip6963:requestProvider'))
  }

  /**
   * 将提供者信息发送给指定的 iframe
   */
  function sendProvidersToIframe(targetWindow) {
    detectedProviders.forEach(({ info, provider }) => {
      try {
        targetWindow.postMessage(
          {
            type: 'eip6963:announceProvider',
            source: 'chainbox-parent',
            detail: {
              info: {
                uuid: info.uuid,
                name: info.name,
                icon: info.icon,
                rdns: info.rdns,
              },
              // 注意：provider 对象无法通过 postMessage 直接传递
              // 需要 iframe 通过其他方式访问（见下面的替代方案）
            },
          },
          '*' // 在生产环境中应该指定具体的 origin
        )
      } catch (error) {
        console.error('Failed to send provider to iframe:', error)
      }
    })
  }

  /**
   * 广播提供者信息给所有 iframe
   */
  function broadcastProviderToIframes(providerData) {
    // 获取所有 iframe
    const iframes = document.querySelectorAll('iframe')

    iframes.forEach((iframe) => {
      try {
        iframe.contentWindow.postMessage(
          {
            type: 'eip6963:announceProvider',
            source: 'chainbox-parent',
            detail: providerData,
          },
          '*' // 在生产环境中应该指定具体的 origin
        )
      } catch (error) {
        console.error('Failed to broadcast provider to iframe:', error)
      }
    })
  }

  /**
   * 初始化：立即请求提供者
   */
  requestProviders()

  // 当检测到 provider 后，设置事件转发
  const originalListener = window.addEventListener
  window.addEventListener('eip6963:announceProvider', function (event) {
    setTimeout(setupEventForwarding, 100) // 延迟设置以确保 provider 已注册
  })

  /**
   * 定期检查新的 iframe 并发送提供者信息
   */
  setInterval(function () {
    const iframes = document.querySelectorAll('iframe')
    iframes.forEach((iframe) => {
      try {
        // 检查 iframe 是否已加载
        if (iframe.contentWindow) {
          sendProvidersToIframe(iframe.contentWindow)
        }
      } catch (error) {
        // 跨域 iframe，忽略错误
      }
    })
  }, 1000) // 每秒检查一次

  console.log('EIP-6963 Bridge initialized for ChainBox')
})()
