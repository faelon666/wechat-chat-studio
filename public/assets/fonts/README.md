# 字体来源与使用

`assets/fonts/PingFangUI-SC.ttf.br.001` 和 `.002`（项目源码字体的 Brotli 压缩包）和此目录的网页字体从 [ACT-02/PingFangUI-VF](https://github.com/ACT-02/PingFangUI-VF) 的 `21.4d1e1` 发布文件中提取简体中文字体，并缩减为常用字符集（含英文和数字）。页面的编辑区与手机预览统一使用这款字体。原项目说明该字体仅供学习、研究与非商业使用；再次分发时请保留本来源说明。

首屏预加载 `PingFangUI-SC-core.woff2`（界面和示例消息的字符）；`PingFangUI-SC.woff2` 包含其余常用字符，仅在用户输入需要时加载。两个文件由同一字体生成，字符范围互不重叠。运行 `python scripts/build-font-subsets.py` 可以在修改界面文案后重建首屏字库。脚本依赖 `fonttools` 和 `brotli`。

本项目不再加载 SF Pro 或 Inter。浏览器只会在字体文件未包含某个字符时使用系统后备字体。

自定义消息如包含两份子集之外的汉字，会回退到设备可用的中文系统字体。
