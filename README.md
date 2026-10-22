# 微信聊天模拟器

React + TypeScript + Tailwind CSS 制作的 iOS 风格微信界面与聊天截图编辑器。包含聊天列表、会话、通讯录、发现、个人资料页面；支持人物头像与昵称、九种消息类型、拖动排序、暗色模式、自动保存和 PNG 导出。

手机预览按 iPhone 15 Pro Max 的 430 × 932 逻辑屏幕绘制，顶部与底部安全区域分别为 59px 和 34px。设备层的尺寸统一定义在 `src/design/deviceTokens.ts`。预览可切换 50%、75%、100% 显示比例，默认 100%；逻辑画布尺寸不随显示比例变化。普通截图导出为 1290 × 2796 PNG；长截图会随聊天内容向下延伸。

外观设置可修改状态栏时间、返回角标、网络标识和电量。右侧预览顶部可切换页面，也可以点手机内的标签栏和聊天条目。红包、视频通话等消息按微信截图的气泡和卡片比例绘制。编辑区和手机预览统一使用 [ACT-02/PingFangUI-VF](https://github.com/ACT-02/PingFangUI-VF) 来源的字体：`assets/fonts/PingFangUI-SC.ttf.br.001` 和 `.002` 是可解压的源码字体，网页优先加载 327 KB 的 `public/assets/fonts/PingFangUI-SC-core.woff2`；来源与使用限制见 `public/assets/fonts/README.md`。

## 本地运行

需要 Node.js 22.13 或更高版本。

```bash
npm install
npm run dev
```

打开终端显示的本地地址即可使用。

## 视觉对比调试页

在本地或已部署网站地址后添加 `/compare`。左侧显示同一浏览器内保存的微信模拟器，右侧可上传或拖入参考截图。打开 Overlay 模式可将参考图覆盖在模拟器上，用滑块调节 0–100% 透明度；还可分别显示安全区域、组件边界和 430 × 932 pt 标尺。参考图片只在当前页面内使用，刷新后需要重新上传。调试页不会修改聊天记录。

## 项目结构

- `src/components/EditorPanel.tsx`：人物、消息与外观编辑
- `src/components/ChatPreview.tsx`：微信聊天区域
- `src/components/IosApp.tsx`：多页面 iOS 界面与导航
- `src/components/MessageBubble.tsx`：各类消息气泡
- `src/components/PhoneFrame.tsx`：iPhone 外框
- `src/components/IPhone15ProMaxCanvas.tsx`：设备外框、灵动岛、应用视口与 Home Indicator 的组合
- `src/components/device/StatusBar.tsx`：iOS 状态栏
- `src/components/device/DeviceScaleControl.tsx`：设备显示比例切换
- `src/design/deviceTokens.ts`：430 × 932 画布与安全区尺寸
- `src/hooks/useChatStore.ts`：聊天状态和 localStorage 保存
- `src/store/`：类型和初始示例
- `src/styles/studio.css`：布局与视觉样式
- `src/styles/phone.css`：iPhone 与微信聊天界面样式
- `src/styles/ios-app.css`：聊天列表、通讯录、发现、个人资料及字体样式
- `src/compare/CompareView.tsx`：独立的截图对比调试页
- `src/compare/compare.css`：仅作用于调试页的工具样式
- `compare/index.html`：调试页独立入口

数据只保存在当前浏览器。导出使用浏览器中的渲染结果，不会上传聊天内容。

## 隐私与示例数据

仓库只包含虚构联系人、通用示意头像和样例消息，不包含个人聊天记录、私人头像或参考截图。用户编辑的数据保存在自己的浏览器 `localStorage` 中；下载的图片由浏览器本地生成。发布或分享自己生成的截图前，请自行检查其中的内容。
