# UI Style Library

本项目内置 4 套可切换界面风格，用 `body[data-theme]` 控制。

## 主题

| 主题 | key | 适用场景 |
| --- | --- | --- |
| 紧凑桌面工具 | `desktop` | 本地工具、管理小程序、转换器、批处理页面 |
| 现代数据工作台 | `workbench` | 数据录入、表格预览、SaaS 后台、运营控制台 |
| macOS 本地工具 | `macos` | 轻量本地 App、个人效率工具、视觉更柔和的表单工具 |
| 政企蓝白 | `gov` | 办公系统、招投标工具、政企风后台、稳重型数据页面 |

## 复用方式

核心结构：

```html
<body data-theme="desktop">
  <main class="page">
    <header class="topbar"></header>
    <section class="workspace">
      <aside class="panel input-panel"></aside>
      <section class="main-stack"></section>
    </section>
    <section class="panel inspector"></section>
  </main>
</body>
```

核心变量在 `static/style.css` 顶部：

```css
body[data-theme="desktop"] {
  --bg: #eef1f5;
  --surface: #ffffff;
  --accent: #2563eb;
  --radius: 6px;
  --panel-padding: 16px;
}
```

新增项目优先复用这些层级：

- `.page`：页面宽度和外边距
- `.topbar`：标题、状态、主题切换
- `.workspace`：主要双栏工作区
- `.panel`：统一面板容器
- `.section-head`：区块标题和操作按钮
- `.table-wrap`：内部滚动表格容器
- `.message`：成功 / 错误状态提示

## 约束

- 大量数据必须在 `.table-wrap` 内部滚动，不允许撑高整页。
- 文件上传、输入、选择、按钮必须使用统一控件样式。
- 主题只通过变量和少量 `body[data-theme]` 差异实现，不复制整份 CSS。
